import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import paginate from '../utils/pagination.js';
import { ROLES } from '../config/pages.js';

const COLS = 'UserId, FullName, Username, Role, IsActive, CreatedAt';
const findOne = async (id) => (await query(`SELECT ${COLS} FROM Users WHERE UserId = @id`, { id })).recordset[0];

/** Never leave the system without an active Admin, and don't let admins lock themselves out. */
const assertSafeChange = async (req, target, { role, isActive }) => {
  const losingAdmin = target.Role === 'Admin' && target.IsActive && (role !== 'Admin' || isActive === false || isActive === 0);
  if (!losingAdmin) return;
  if (Number(req.params.id) === req.user.userId) throw new ApiError(400, 'You cannot remove your own Admin access or deactivate yourself');
  const n = (await query("SELECT COUNT(*) AS n FROM Users WHERE Role = 'Admin' AND IsActive = 1")).recordset[0].n;
  if (n <= 1) throw new ApiError(400, 'At least one active Admin is required');
};

export const list = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = paginate(req);
  const params = { offset, pageSize, search: `%${req.query.search || ''}%` };
  const where = 'WHERE (FullName LIKE @search OR Username LIKE @search)';
  const total = (await query(`SELECT COUNT(*) AS total FROM Users ${where}`, params)).recordset[0].total;
  const data = (await query(`SELECT ${COLS} FROM Users ${where} ORDER BY IsActive DESC, FullName OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`, params)).recordset;
  res.json({ data, total, page, pageSize });
});

export const create = asyncHandler(async (req, res) => {
  const { FullName, Username, Password, Role } = req.body;
  if (!FullName?.trim() || !Username?.trim()) throw new ApiError(422, 'Name and username are required');
  if (!/^[A-Za-z0-9._-]{3,30}$/.test(Username.trim())) throw new ApiError(422, 'Username: 3-30 letters, numbers, dot, dash or underscore');
  if (!Password || Password.length < 8) throw new ApiError(422, 'Password must be at least 8 characters');
  if (!ROLES.includes(Role)) throw new ApiError(422, 'Choose a valid role');
  const r = await query(
    'INSERT INTO Users (FullName, Username, PasswordHash, Role) OUTPUT INSERTED.UserId AS id VALUES (@FullName, @Username, @hash, @Role)',
    { FullName: FullName.trim(), Username: Username.trim(), hash: await bcrypt.hash(Password, 10), Role });
  res.status(201).json(await findOne(r.recordset[0].id));
});

export const update = asyncHandler(async (req, res) => {
  const target = await findOne(req.params.id);
  if (!target) throw new ApiError(404, 'User not found');
  const FullName = (req.body.FullName ?? target.FullName).trim();
  const Role = req.body.Role ?? target.Role;
  const IsActive = req.body.IsActive ?? target.IsActive;
  if (!FullName) throw new ApiError(422, 'Name is required');
  if (!ROLES.includes(Role)) throw new ApiError(422, 'Choose a valid role');
  await assertSafeChange(req, target, { role: Role, isActive: IsActive });
  await query('UPDATE Users SET FullName = @FullName, Role = @Role, IsActive = @IsActive WHERE UserId = @id', { id: req.params.id, FullName, Role, IsActive });
  res.json(await findOne(req.params.id));
});

export const remove = asyncHandler(async (req, res) => {
  const target = await findOne(req.params.id);
  if (!target) throw new ApiError(404, 'User not found');
  await assertSafeChange(req, target, { role: target.Role, isActive: false });
  await query('UPDATE Users SET IsActive = 0 WHERE UserId = @id', { id: req.params.id });
  res.json({ message: 'User deactivated' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) throw new ApiError(422, 'Password must be at least 8 characters');
  const r = await query('UPDATE Users SET PasswordHash = @hash WHERE UserId = @id', { id: req.params.id, hash: await bcrypt.hash(newPassword, 10) });
  if (!r.rowsAffected[0]) throw new ApiError(404, 'User not found');
  res.json({ message: 'Password reset' });
});
