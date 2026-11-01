import { query, withTransaction } from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { monthRange, today } from "../utils/dates.js";

const STATUSES = ["P", "A", "HD", "L", "WO"];

/** Guards posted at a site on a date, with any attendance already marked. */
export const sheet = asyncHandler(async (req, res) => {
  const { date, siteId } = req.query;

  if (!date || !siteId) {
    throw new ApiError(422, "Date and site are required");
  }

  const r = await query(
    `SELECT g.GuardId, g.GuardCode, g.FullName, d.Shift,
            a.Status, ISNULL(a.OtHours, 0) AS OtHours, a.Remarks
     FROM Deployments d
     JOIN Guards g ON g.GuardId = d.GuardId
     LEFT JOIN Attendance a
       ON a.GuardId = g.GuardId AND a.AttDate = @date
     WHERE d.SiteId = @siteId
       AND d.StartDate <= @date
       AND (d.EndDate IS NULL OR d.EndDate >= @date)
       AND g.IsActive = 1
     ORDER BY d.Shift, g.FullName`,
    { date, siteId },
  );

  res.json(r.recordset);
});

export const saveBulk = asyncHandler(async (req, res) => {
  const { date, siteId, records } = req.body;

  if (!date || !siteId || !Array.isArray(records)) {
    throw new ApiError(422, "Date, site and records are required");
  }

  if (date > today()) {
    throw new ApiError(422, "You cannot mark attendance for a future date");
  }

  const rows = records.filter((x) => x.status);

  const bad = rows.find((x) => !STATUSES.includes(x.status));

  if (bad) {
    throw new ApiError(422, `Invalid status "${bad.status}"`);
  }

  if (!rows.length) {
    throw new ApiError(422, "Mark at least one guard before saving");
  }

  const month = Number(date.slice(5, 7));
  const year = Number(date.slice(0, 4));

  const guardIds = rows.map((x) => Number(x.guardId));

  const locked = await query(
    `SELECT COUNT(*) AS n
     FROM Payments
     WHERE PayMonth = @month
       AND PayYear = @year
       AND Status = 'Paid'
       AND GuardId IN (${guardIds.join(",")})`,
    { month, year },
  );

  if (locked.recordset[0].n) {
    throw new ApiError(
      409,
      "Salary for this month is already paid for some guards. Attendance is locked",
    );
  }

  await withTransaction(async (run) => {
    for (const x of rows) {
      await run(
        `MERGE Attendance AS t
         USING (
           SELECT @guardId AS GuardId, @date AS AttDate
         ) AS s
         ON t.GuardId = s.GuardId AND t.AttDate = s.AttDate

         WHEN MATCHED THEN
           UPDATE SET
             SiteId = @siteId,
             Status = @status,
             OtHours = @ot,
             Remarks = @remarks,
             MarkedBy = @user

         WHEN NOT MATCHED THEN
           INSERT (
             GuardId, SiteId, AttDate, Status,
             OtHours, Remarks, MarkedBy
           )
           VALUES (
             @guardId, @siteId, @date, @status,
             @ot, @remarks, @user
           );`,
        {
          guardId: x.guardId,
          siteId,
          date,
          status: x.status,
          ot: Math.min(Math.max(Number(x.otHours) || 0, 0), 24),
          remarks: x.remarks || null,
          user: req.user.userId,
        },
      );
    }
  });

  res.json({
    message: `Attendance saved for ${rows.length} guard(s)`,
  });
});

/** Monthly totals per guard. */
export const summary = asyncHandler(async (req, res) => {
  const { month, year, siteId } = req.query;

  if (!month || !year) {
    throw new ApiError(422, "Month and year are required");
  }

  const { from, to } = monthRange(month, year);

  const r = await query(
    `SELECT
       g.GuardId,
       g.GuardCode,
       g.FullName,

       SUM(CASE WHEN a.Status = 'P' THEN 1 ELSE 0 END) AS Present,
       SUM(CASE WHEN a.Status = 'A' THEN 1 ELSE 0 END) AS Absent,
       SUM(CASE WHEN a.Status = 'HD' THEN 1 ELSE 0 END) AS HalfDay,
       SUM(CASE WHEN a.Status = 'L' THEN 1 ELSE 0 END) AS [Leave],
       SUM(CASE WHEN a.Status = 'WO' THEN 1 ELSE 0 END) AS WeeklyOff,

       ISNULL(SUM(a.OtHours), 0) AS OtHours,

       SUM(
         CASE
           WHEN a.Status = 'P' THEN 1
           WHEN a.Status = 'HD' THEN 0.5
           WHEN a.Status IN ('L', 'WO') THEN 1
           ELSE 0
         END
       ) AS PayableDays

     FROM Guards g

     JOIN Attendance a
       ON a.GuardId = g.GuardId
       AND a.AttDate >= @from
       AND a.AttDate < @to

     WHERE (@siteId IS NULL OR a.SiteId = @siteId)

     GROUP BY g.GuardId, g.GuardCode, g.FullName
     ORDER BY g.FullName`,
    {
      from,
      to,
      siteId: siteId || null,
    },
  );

  res.json(r.recordset);
});
