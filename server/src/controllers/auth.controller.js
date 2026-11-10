import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { pagesFor } from '../utils/access.js';

const publicUser = async (u) => ({ userId: u.UserId, name: u.FullName, username: u.Username, role: u.Role, pages: await pagesFor(u.Role) });

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const r = await query('SELECT * FROM Users WHERE Username = @username AND IsActive = 1', { username });
  const user = r.recordset[0];
  if (!user || !(await bcrypt.compare(password, user.PasswordHash))) throw new ApiError(401, 'Wrong username or password');
  const token = jwt.sign({ userId: user.UserId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '12h' });
  res.json({ token, user: await publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  const r = await query('SELECT UserId, FullName, Username, Role FROM Users WHERE UserId = @id', { id: req.user.userId });
  res.json(await publicUser(r.recordset[0]));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (currentPassword === newPassword) throw new ApiError(422, 'New password must be different from the current one');
  const r = await query('SELECT PasswordHash FROM Users WHERE UserId = @id', { id: req.user.userId });
  if (!(await bcrypt.compare(currentPassword, r.recordset[0].PasswordHash))) throw new ApiError(400, 'Current password is wrong');
  await query('UPDATE Users SET PasswordHash = @hash WHERE UserId = @id', { hash: await bcrypt.hash(newPassword, 10), id: req.user.userId });
  res.json({ message: 'Password changed' });
});
