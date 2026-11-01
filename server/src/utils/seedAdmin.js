import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { query, getPool } from "../config/db.js";

dotenv.config();

const seedAdmin = async () => {
  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;

  const hash = await bcrypt.hash(password, 10);

  const existing = await query(
    "SELECT UserId FROM Users WHERE Username = @username",
    { username },
  );

  if (existing.recordset.length) {
    await query(
      `UPDATE Users
       SET PasswordHash = @hash
       WHERE Username = @username`,
      { hash, username },
    );

    console.log(`Password reset for "${username}"`);
  } else {
    await query(
      `INSERT INTO Users (FullName, Username, PasswordHash, Role)
       VALUES (N'Administrator', @username, @hash, 'Admin')`,
      { username, hash },
    );

    console.log(`Admin created -> ${username}`);
  }
};

const start = async () => {
  try {
    await seedAdmin();
  } catch (error) {
    console.error("Admin seeding failed:", error);
    process.exitCode = 1;
  } finally {
    try {
      const pool = await getPool();
      await pool.close();
    } catch (error) {
      console.error("Database pool cleanup failed:", error);
      process.exitCode = 1;
    }
  }
};

start();
