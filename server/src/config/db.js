import sql from "mssql";
import dotenv from "dotenv";
dotenv.config()

const config = {
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT !== "false",
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise;

export const getPool = () => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config).connect().catch((err) => {
      poolPromise = undefined; // Allow retry
      throw err;
    });
  }

  return poolPromise;
};

const bindParams = (request, params) => {
  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value === undefined ? null : value);
  });

  return request;
};

/**
 * Run a parameterised query.
 * Returns the MSSQL result.
 */
export async function query(text, params = {}) {
  const pool = await getPool();

  return bindParams(pool.request(), params).query(text);
}

/**
 * Run several queries inside one transaction.
 * fn receives a run(text, params) helper.
 */
export async function withTransaction(fn) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);

  await tx.begin();

  try {
    const run = (text, params = {}) =>
      bindParams(new sql.Request(tx), params).query(text);

    const result = await fn(run);

    await tx.commit();

    return result;
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

export { sql };
