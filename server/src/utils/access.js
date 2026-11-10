import { query } from '../config/db.js';
import { PAGE_KEYS, ADMIN_PAGES } from '../config/pages.js';

/** Page keys a role may open. Read fresh from the DB so Admin changes apply immediately. */
export const pagesFor = async (role) => {
  if (role === 'Admin') return [...PAGE_KEYS, ...ADMIN_PAGES];
  const r = await query('SELECT PageKey FROM RolePages WHERE Role = @role', { role });
  return r.recordset.map((x) => x.PageKey).filter((k) => PAGE_KEYS.includes(k));
};
