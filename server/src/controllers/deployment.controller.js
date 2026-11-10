import crud from '../utils/crudFactory.js';
import { query, withTransaction } from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

const base = crud({
  table: 'Deployments', alias: 'd', pk: 'DeploymentId', fields: [],
  joins: `JOIN Guards g ON g.GuardId = d.GuardId JOIN Sites s ON s.SiteId = d.SiteId JOIN Clients cl ON cl.ClientId = s.ClientId`,
  selectCols: `d.*, g.FullName, g.GuardCode, g.Phone, s.SiteName, s.ClientId, cl.CompanyName`,
  searchFields: ['g.FullName', 'g.GuardCode', 's.SiteName', 'cl.CompanyName'],
  filters: { isActive: 'd.IsActive', siteId: 'd.SiteId', clientId: 's.ClientId', guardId: 'd.GuardId' },
  orderBy: 'cl.CompanyName, s.SiteName, d.Shift, g.FullName',
});
export const list = base.list;

/** Assign (or transfer) a guard. Any current posting is closed the day before the new one starts. */
export const assign = asyncHandler(async (req, res) => {
  const { guardId, siteId, shift = 'Day', startDate } = req.body;
  if (!guardId || !siteId || !startDate) throw new ApiError(422, 'Guard, site and start date are required');
  if (!['Day', 'Night', 'General'].includes(shift)) throw new ApiError(422, 'Shift must be Day, Night or General');

  const id = await withTransaction(async (run) => {
    const guard = (await run('SELECT IsActive FROM Guards WHERE GuardId = @guardId', { guardId })).recordset[0];
    if (!guard || !guard.IsActive) throw new ApiError(400, 'Guard is not active');
    const site = (await run('SELECT IsActive FROM Sites WHERE SiteId = @siteId', { siteId })).recordset[0];
    if (!site || !site.IsActive) throw new ApiError(400, 'Site is not active');

    await run(
      `UPDATE Deployments SET IsActive = 0,
         EndDate = CASE WHEN StartDate > DATEADD(DAY, -1, @startDate) THEN StartDate ELSE DATEADD(DAY, -1, @startDate) END
       WHERE GuardId = @guardId AND IsActive = 1`, { guardId, startDate });
    const ins = await run(
      `INSERT INTO Deployments (GuardId, SiteId, Shift, StartDate) OUTPUT INSERTED.DeploymentId AS id
       VALUES (@guardId, @siteId, @shift, @startDate)`, { guardId, siteId, shift, startDate });
    return ins.recordset[0].id;
  });
  res.status(201).json(await base.findOne(id));
});

export const end = asyncHandler(async (req, res) => {
  const endDate = req.body.endDate || new Date().toISOString().slice(0, 10);
  const r = await query(
    'UPDATE Deployments SET IsActive = 0, EndDate = @endDate WHERE DeploymentId = @id AND IsActive = 1',
    { id: req.params.id, endDate });
  if (!r.rowsAffected[0]) throw new ApiError(404, 'Active deployment not found');
  res.json({ message: 'Deployment ended' });
});
