import crud from "../utils/crudFactory.js";

const siteController = crud({
  table: "Sites",
  alias: "s",
  pk: "SiteId",

  fields: [
    "ClientId",
    "SiteName",
    "Address",
    "City",
    "SupervisorName",
    "RequiredGuards",
    "IsActive",
  ],

  required: ["ClientId", "SiteName"],

  joins: "JOIN Clients cl ON cl.ClientId = s.ClientId",

  selectCols: `
    s.*,
    cl.CompanyName,
    (
      SELECT COUNT(*)
      FROM Deployments d
      WHERE d.SiteId = s.SiteId
        AND d.IsActive = 1
    ) AS DeployedGuards
  `,

  searchFields: ["s.SiteName", "cl.CompanyName", "s.City"],

  filters: {
    isActive: "s.IsActive",
    clientId: "s.ClientId",
  },

  orderBy: "cl.CompanyName, s.SiteName",
});

export default siteController;
