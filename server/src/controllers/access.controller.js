import { query, withTransaction } from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { PAGES, PAGE_KEYS, CONFIGURABLE_ROLES } from '../config/pages.js';

export const get = asyncHandler(async (req, res) => {
  const rows = (await query('SELECT Role, PageKey FROM RolePages')).recordset;
  const matrix = Object.fromEntries(CONFIGURABLE_ROLES.map((r) => [r, rows.filter((x) => x.Role === r).map((x) => x.PageKey)]));
  res.json({ pages: PAGES, roles: CONFIGURABLE_ROLES, matrix });
});

export const save = asyncHandler(async (req, res) => {
  const { matrix } = req.body;
  if (!matrix || typeof matrix !== 'object') throw new ApiError(422, 'Access settings are missing');
  await withTransaction(async (run) => {
    for (const role of CONFIGURABLE_ROLES) {
      const keys = [...new Set((matrix[role] || []).filter((k) => PAGE_KEYS.includes(k)))];
      await run('DELETE FROM RolePages WHERE Role = @role', { role });
      for (const pageKey of keys) await run('INSERT INTO RolePages (Role, PageKey) VALUES (@role, @pageKey)', { role, pageKey });
    }
  });
  res.json({ message: 'Page access saved' });
});
