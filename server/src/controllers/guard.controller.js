import crud from '../utils/crudFactory.js';
import { query, withTransaction } from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

const HIDDEN_FOR_NON_ADMIN = ['MonthlySalary', 'BankName', 'AccountNo', 'IfscCode'];
const stripSensitive = (row, req) => {
  if (req.user.role === 'Admin') return row;
  const copy = { ...row };
  HIDDEN_FOR_NON_ADMIN.forEach((k) => delete copy[k]);
  return copy;
};

const base = crud({
  transform: stripSensitive,
  table: 'Guards', alias: 'g', pk: 'GuardId',
  fields: ['FullName', 'FatherName', 'Phone', 'AltPhone', 'Gender', 'DateOfBirth', 'Address', 'AadhaarNo', 'PanNo',
    'BankName', 'AccountNo', 'IfscCode', 'UanNo', 'EsicNo', 'PfApplicable', 'EsiApplicable', 'MonthlySalary',
    'JoiningDate', 'ContractorId', 'EmergencyContactName', 'EmergencyContactPhone', 'IsActive'],
  required: ['FullName', 'Phone'],
  joins: `LEFT JOIN Contractors k ON k.ContractorId = g.ContractorId
    OUTER APPLY (SELECT TOP 1 d.DeploymentId, d.SiteId, d.Shift, d.StartDate FROM Deployments d
                 WHERE d.GuardId = g.GuardId AND d.IsActive = 1 ORDER BY d.StartDate DESC) cur
    LEFT JOIN Sites s ON s.SiteId = cur.SiteId
    LEFT JOIN Clients cl ON cl.ClientId = s.ClientId`,
  selectCols: `g.*, k.Name AS ContractorName, cur.DeploymentId, cur.SiteId, cur.Shift, cur.StartDate AS DeployedSince,
    s.SiteName, cl.CompanyName`,
  searchFields: ['g.FullName', 'g.GuardCode', 'g.Phone', 'g.AadhaarNo', 's.SiteName', 'cl.CompanyName'],
  filters: { isActive: 'g.IsActive', contractorId: 'g.ContractorId', siteId: 'cur.SiteId', clientId: 's.ClientId' },
  orderBy: 'g.FullName',
  extraWhere: (req) => (req.query.unassigned === '1' ? { sql: 'cur.DeploymentId IS NULL AND g.IsActive = 1' } : null),
});

export const list = base.list;
export const update = base.update;

export const create = asyncHandler(async (req, res) => {
  const data = base.pick(req.body);
  base.assertRequired(data, false);
  const id = await base.insert(data);
  await query(`UPDATE Guards SET GuardCode = 'NSG-' + RIGHT('0000' + CAST(GuardId AS VARCHAR(10)), 4) WHERE GuardId = @id`, { id });
  res.status(201).json(await base.findOne(id));
});

export const getOne = asyncHandler(async (req, res) => {
  const guard = await base.findOne(req.params.id);
  if (!guard) throw new ApiError(404, 'Guard not found');
  const history = await query(
    `SELECT d.*, s.SiteName, cl.CompanyName FROM Deployments d
     JOIN Sites s ON s.SiteId = d.SiteId JOIN Clients cl ON cl.ClientId = s.ClientId
     WHERE d.GuardId = @id ORDER BY d.StartDate DESC, d.DeploymentId DESC`, { id: req.params.id });
  const payments = req.user.role === 'Admin'
    ? (await query(
      `SELECT TOP 6 PaymentId, PayMonth, PayYear, PayableDays, GrossAmount, NetAmount, Status, PaidOn
       FROM Payments WHERE GuardId = @id ORDER BY PayYear DESC, PayMonth DESC`, { id: req.params.id })).recordset
    : [];
  res.json({ ...stripSensitive(guard, req), history: history.recordset, payments });
});

// Deactivating a guard also ends the current posting.
export const remove = asyncHandler(async (req, res) => {
  await withTransaction(async (run) => {
    const r = await run('UPDATE Guards SET IsActive = 0 WHERE GuardId = @id', { id: req.params.id });
    if (!r.rowsAffected[0]) throw new ApiError(404, 'Guard not found');
    await run('UPDATE Deployments SET IsActive = 0, EndDate = CAST(SYSDATETIME() AS DATE) WHERE GuardId = @id AND IsActive = 1', { id: req.params.id });
  });
  res.json({ message: 'Guard deactivated' });
});
