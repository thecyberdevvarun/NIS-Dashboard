const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const r = await query('SELECT * FROM Users WHERE Username = @username AND IsActive = 1', { username });
  const user = r.recordset[0];
  if (!user || !(await bcrypt.compare(password, user.PasswordHash))) throw new ApiError(401, 'Wrong username or password');
  const payload = { userId: user.UserId, role: user.Role, name: user.FullName };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '12h' });
  res.json({ token, user: { userId: user.UserId, name: user.FullName, username: user.Username, role: user.Role } });
});

exports.me = asyncHandler(async (req, res) => {
  const r = await query('SELECT UserId, FullName, Username, Role FROM Users WHERE UserId = @id AND IsActive = 1', { id: req.user.userId });
  if (!r.recordset[0]) throw new ApiError(401, 'User no longer exists');
  const u = r.recordset[0];
  res.json({ userId: u.UserId, name: u.FullName, username: u.Username, role: u.Role });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const r = await query('SELECT PasswordHash FROM Users WHERE UserId = @id', { id: req.user.userId });
  if (!(await bcrypt.compare(currentPassword, r.recordset[0].PasswordHash))) throw new ApiError(400, 'Current password is wrong');
  await query('UPDATE Users SET PasswordHash = @hash WHERE UserId = @id', { hash: await bcrypt.hash(newPassword, 10), id: req.user.userId });
  res.json({ message: 'Password changed' });
});
