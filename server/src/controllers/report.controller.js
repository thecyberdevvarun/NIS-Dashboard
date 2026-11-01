import { query } from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Every active guard with the company / site
 * he is currently posted at.
 */
export const guardDeployment = asyncHandler(async (req, res) => {
  const r = await query(
    `SELECT
       g.GuardCode,
       g.FullName,
       g.Phone,
       g.MonthlySalary,
       k.Name AS Contractor,
       cl.CompanyName,
       s.SiteName,
       cur.Shift,
       cur.StartDate AS DeployedSince

     FROM Guards g

     LEFT JOIN Contractors k
       ON k.ContractorId = g.ContractorId

     OUTER APPLY (
       SELECT TOP 1
         d.SiteId,
         d.Shift,
         d.StartDate
       FROM Deployments d
       WHERE d.GuardId = g.GuardId
         AND d.IsActive = 1
       ORDER BY d.StartDate DESC
     ) cur

     LEFT JOIN Sites s
       ON s.SiteId = cur.SiteId

     LEFT JOIN Clients cl
       ON cl.ClientId = s.ClientId

     WHERE g.IsActive = 1

     ORDER BY
       cl.CompanyName,
       s.SiteName,
       g.FullName`,
  );

  res.json(r.recordset);
});
