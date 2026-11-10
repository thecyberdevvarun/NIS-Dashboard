import 'dotenv/config'; // must stay the first import so .env is loaded before the database config reads it
import app from './app.js';
import { getPool } from './config/db.js';

const port = process.env.PORT || 5000;
getPool()
  .then(() => {
    console.log('MSSQL connected');
    app.listen(port, () => console.log(`API running on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
