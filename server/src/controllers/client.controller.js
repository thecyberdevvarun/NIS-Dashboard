const crud = require('../utils/crudFactory');

module.exports = crud({
  table: 'Clients', alias: 'c', pk: 'ClientId',
  fields: ['CompanyName', 'ContactPerson', 'Phone', 'Email', 'Address', 'City', 'GstNo', 'ContractStart', 'ContractEnd', 'IsActive'],
  required: ['CompanyName'],
  selectCols: `c.*,
    (SELECT COUNT(*) FROM Sites s WHERE s.ClientId = c.ClientId AND s.IsActive = 1) AS SiteCount,
    (SELECT COUNT(*) FROM Deployments d JOIN Sites s ON s.SiteId = d.SiteId WHERE s.ClientId = c.ClientId AND d.IsActive = 1) AS GuardCount`,
  searchFields: ['c.CompanyName', 'c.ContactPerson', 'c.Phone', 'c.City'],
  filters: { isActive: 'c.IsActive' },
  orderBy: 'c.CompanyName',
});
