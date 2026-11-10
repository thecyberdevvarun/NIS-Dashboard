import crud from '../utils/crudFactory.js';

export default crud({
  table: 'Contractors', alias: 'k', pk: 'ContractorId',
  fields: ['Name', 'ContactPerson', 'Phone', 'Email', 'Address', 'PanNo', 'LicenseNo', 'IsActive'],
  required: ['Name'],
  selectCols: `k.*, (SELECT COUNT(*) FROM Guards g WHERE g.ContractorId = k.ContractorId AND g.IsActive = 1) AS GuardCount`,
  searchFields: ['k.Name', 'k.ContactPerson', 'k.Phone'],
  filters: { isActive: 'k.IsActive' },
  orderBy: 'k.Name',
});
