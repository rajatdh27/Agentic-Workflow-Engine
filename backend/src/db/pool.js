const { Pool } = require("pg");
const { env } = require("../config/env.js");

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
});

module.exports.pool = pool;
