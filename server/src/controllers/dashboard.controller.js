import { query } from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

export const stats = asyncHandler(async (req, res) => {
  const r = await query(`
    SELECT (SELECT COUNT(*) FROM Guards WHERE IsActive = 1) AS activeGuards,
           (SELECT COUNT(*) FROM Clients WHERE IsActive = 1) AS activeClients,
           (SELECT COUNT(*) FROM Sites WHERE IsActive = 1) AS activeSites,
           (SELECT COUNT(*) FROM Contractors WHERE IsActive = 1) AS contractors,
           (SELECT COUNT(*) FROM Guards g WHERE g.IsActive = 1
              AND NOT EXISTS (SELECT 1 FROM Deployments d WHERE d.GuardId = g.GuardId AND d.IsActive = 1)) AS unassignedGuards;

    SELECT Status, COUNT(*) AS cnt FROM Attendance WHERE AttDate = CAST(SYSDATETIME() AS DATE) GROUP BY Status;

    SELECT COUNT(*) AS total, ISNULL(SUM(NetAmount), 0) AS net,
           ISNULL(SUM(CASE WHEN Status = 'Paid' THEN NetAmount ELSE 0 END), 0) AS paid,
           ISNULL(SUM(CASE WHEN Status = 'Pending' THEN NetAmount ELSE 0 END), 0) AS pending
    FROM Payments WHERE PayMonth = MONTH(SYSDATETIME()) AND PayYear = YEAR(SYSDATETIME());

    SELECT s.SiteId, s.SiteName, cl.CompanyName, s.RequiredGuards, COUNT(d.DeploymentId) AS Deployed
    FROM Sites s JOIN Clients cl ON cl.ClientId = s.ClientId
    LEFT JOIN Deployments d ON d.SiteId = s.SiteId AND d.IsActive = 1
    WHERE s.IsActive = 1 AND cl.IsActive = 1
    GROUP BY s.SiteId, s.SiteName, cl.CompanyName, s.RequiredGuards
    HAVING COUNT(d.DeploymentId) < s.RequiredGuards
    ORDER BY (s.RequiredGuards - COUNT(d.DeploymentId)) DESC;

    SELECT cl.CompanyName, COUNT(d.DeploymentId) AS Guards
    FROM Clients cl LEFT JOIN Sites s ON s.ClientId = cl.ClientId
    LEFT JOIN Deployments d ON d.SiteId = s.SiteId AND d.IsActive = 1
    WHERE cl.IsActive = 1 GROUP BY cl.CompanyName ORDER BY Guards DESC;`);
  const [counts, today, payroll, shortSites, perClient] = r.recordsets;
  const att = { P: 0, A: 0, HD: 0, L: 0, WO: 0 };
  today.forEach((x) => { att[x.Status] = x.cnt; });
  res.json({
    ...counts[0],
    todayAttendance: att,
    todayMarked: today.reduce((t, x) => t + x.cnt, 0),
    payroll: req.user.role === 'Admin' ? payroll[0] : null,
    shortSites,
    guardsPerClient: perClient,
  });
});
