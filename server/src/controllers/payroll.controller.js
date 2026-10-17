const { query, withTransaction } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { monthRange, today } = require('../utils/dates');

const OT_MULTIPLIER = 2;       // overtime paid at 2x hourly rate
const PF_RATE = 0.12;          // on earned basic
const ESI_RATE = 0.0075;       // employee share on gross
const ESI_LIMIT = 21000;       // ESI applies only up to this monthly salary
const round = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

exports.list = asyncHandler(async (req, res) => {
  const { month, year, status, search } = req.query;
  if (!month || !year) throw new ApiError(422, 'Month and year are required');
  const where = ['p.PayMonth = @month', 'p.PayYear = @year'];
  const params = { month, year };
  if (status) { where.push('p.Status = @status'); params.status = status; }
  if (search) { where.push('(g.FullName LIKE @search OR g.GuardCode LIKE @search)'); params.search = `%${search}%`; }
  const r = await query(
    `SELECT p.*, g.FullName, g.GuardCode, g.BankName, g.AccountNo, g.IfscCode
     FROM Payments p JOIN Guards g ON g.GuardId = p.GuardId
     WHERE ${where.join(' AND ')} ORDER BY g.FullName`, params);
  const data = r.recordset;
  const sum = (arr) => round(arr.reduce((t, x) => t + Number(x.NetAmount), 0));
  res.json({
    data,
    totals: {
      count: data.length,
      net: sum(data),
      paid: sum(data.filter((x) => x.Status === 'Paid')),
      pending: sum(data.filter((x) => x.Status === 'Pending')),
    },
  });
});

/** Builds / refreshes payroll for a month from attendance. Paid rows are never touched. */
exports.generate = asyncHandler(async (req, res) => {
  const { month, year } = req.body;
  if (!month || !year) throw new ApiError(422, 'Month and year are required');
  const { from, to, daysInMonth } = monthRange(month, year);
  if (from > today()) throw new ApiError(422, 'You cannot generate payroll for a future month');

  const rows = (await query(
    `SELECT g.GuardId, g.MonthlySalary, g.PfApplicable, g.EsiApplicable,
       SUM(CASE WHEN a.Status = 'P' THEN 1 WHEN a.Status = 'HD' THEN 0.5 WHEN a.Status IN ('L','WO') THEN 1 ELSE 0 END) AS PayableDays,
       ISNULL(SUM(a.OtHours), 0) AS OtHours
     FROM Guards g
     JOIN Attendance a ON a.GuardId = g.GuardId AND a.AttDate >= @from AND a.AttDate < @to
     GROUP BY g.GuardId, g.MonthlySalary, g.PfApplicable, g.EsiApplicable`, { from, to })).recordset;
  if (!rows.length) throw new ApiError(400, 'No attendance found for this month. Mark attendance first');

  const existing = (await query('SELECT GuardId, Status, AdvanceDeduction, OtherDeduction FROM Payments WHERE PayMonth = @month AND PayYear = @year', { month, year })).recordset;
  const byGuard = new Map(existing.map((e) => [e.GuardId, e]));
  let created = 0; let updated = 0; let skipped = 0;

  await withTransaction(async (run) => {
    for (const r of rows) {
      const prev = byGuard.get(r.GuardId);
      if (prev && prev.Status === 'Paid') { skipped += 1; continue; }

      const salary = Number(r.MonthlySalary);
      const payable = Math.min(Number(r.PayableDays), daysInMonth);
      const daily = salary / daysInMonth;
      const earned = round(daily * payable);
      const otAmount = round(Number(r.OtHours) * (daily / 8) * OT_MULTIPLIER);
      const gross = round(earned + otAmount);
      const pf = r.PfApplicable ? round(earned * PF_RATE) : 0;
      const esi = r.EsiApplicable && salary <= ESI_LIMIT ? round(gross * ESI_RATE) : 0;
      const advance = prev ? Number(prev.AdvanceDeduction) : 0;
      const other = prev ? Number(prev.OtherDeduction) : 0;
      const net = Math.max(round(gross - pf - esi - advance - other), 0);
      const p = { guardId: r.GuardId, month, year, salary, payable, ot: r.OtHours, earned, otAmount, gross, pf, esi, advance, other, net };

      if (prev) {
        await run(
          `UPDATE Payments SET MonthlySalary=@salary, PayableDays=@payable, OtHours=@ot, EarnedAmount=@earned, OtAmount=@otAmount,
             GrossAmount=@gross, PfAmount=@pf, EsiAmount=@esi, NetAmount=@net
           WHERE GuardId=@guardId AND PayMonth=@month AND PayYear=@year`, p);
        updated += 1;
      } else {
        await run(
          `INSERT INTO Payments (GuardId, PayMonth, PayYear, MonthlySalary, PayableDays, OtHours, EarnedAmount, OtAmount, GrossAmount,
             PfAmount, EsiAmount, AdvanceDeduction, OtherDeduction, NetAmount)
           VALUES (@guardId,@month,@year,@salary,@payable,@ot,@earned,@otAmount,@gross,@pf,@esi,@advance,@other,@net)`, p);
        created += 1;
      }
    }
  });
  res.json({ message: `Payroll ready: ${created} new, ${updated} refreshed${skipped ? `, ${skipped} already paid (unchanged)` : ''}`, created, updated, skipped });
});

exports.updateDeductions = asyncHandler(async (req, res) => {
  const advance = Number(req.body.advanceDeduction) || 0;
  const other = Number(req.body.otherDeduction) || 0;
  if (advance < 0 || other < 0) throw new ApiError(422, 'Deductions cannot be negative');
  const r = await query(
    `UPDATE Payments SET AdvanceDeduction=@advance, OtherDeduction=@other, Remarks=@remarks,
       NetAmount = CASE WHEN GrossAmount-PfAmount-EsiAmount-@advance-@other < 0 THEN 0 ELSE GrossAmount-PfAmount-EsiAmount-@advance-@other END
     OUTPUT INSERTED.*
     WHERE PaymentId=@id AND Status='Pending'`,
    { id: req.params.id, advance, other, remarks: req.body.remarks || null });
  if (!r.recordset[0]) throw new ApiError(400, 'Payment not found or already paid');
  res.json(r.recordset[0]);
});

exports.markPaid = asyncHandler(async (req, res) => {
  const { paidOn, paymentMode, referenceNo } = req.body;
  if (!paymentMode) throw new ApiError(422, 'Payment mode is required');
  const r = await query(
    `UPDATE Payments SET Status='Paid', PaidOn=@paidOn, PaymentMode=@paymentMode, ReferenceNo=@referenceNo
     OUTPUT INSERTED.* WHERE PaymentId=@id AND Status='Pending'`,
    { id: req.params.id, paidOn: paidOn || today(), paymentMode, referenceNo: referenceNo || null });
  if (!r.recordset[0]) throw new ApiError(400, 'Payment not found or already paid');
  res.json(r.recordset[0]);
});
