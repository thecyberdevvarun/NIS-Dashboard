require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query, getPool } = require('../config/db');

(async () => {
  const username = process.env.ADMIN_USER || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const hash = await bcrypt.hash(password, 10);
  const existing = await query('SELECT UserId FROM Users WHERE Username = @username', { username });
  if (existing.recordset.length) {
    await query('UPDATE Users SET PasswordHash = @hash WHERE Username = @username', { hash, username });
    console.log(`Password reset for "${username}"`);
  } else {
    await query(
      "INSERT INTO Users (FullName, Username, PasswordHash, Role) VALUES (N'Administrator', @username, @hash, 'Admin')",
      { username, hash }
    );
    console.log(`Admin created -> ${username} / ${password}`);
  }
  (await getPool()).close();
})().catch((e) => { console.error(e); process.exit(1); });
