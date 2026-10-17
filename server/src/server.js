require('dotenv').config();
const app = require('./app');
const { getPool } = require('./config/db');

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
