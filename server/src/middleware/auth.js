import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { query } from '../config/db.js';
import { pagesFor } from '../utils/access.js';

/** Valid token + account still active. Role is read from the DB each time, so role changes apply at once. */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Please log in to continue');
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); } catch { throw new ApiError(401, 'Session expired. Please log in again'); }
  const r = await query('SELECT UserId, FullName, Role, IsActive FROM Users WHERE UserId = @id', { id: payload.userId });
  const u = r.recordset[0];
  if (!u || !u.IsActive) throw new ApiError(401, 'This account is disabled');
  req.user = { userId: u.UserId, role: u.Role, name: u.FullName };
  next();
});

export const restrictTo = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(new ApiError(403, 'You do not have permission to do this'));

/** Allows the request if the user's role can open at least one of the given pages. */
export const pageAccess = (...keys) => asyncHandler(async (req, res, next) => {
  if (req.user.role === 'Admin') return next();
  const pages = await pagesFor(req.user.role);
  if (keys.some((k) => pages.includes(k))) return next();
  throw new ApiError(403, 'You do not have access to this page');
});
