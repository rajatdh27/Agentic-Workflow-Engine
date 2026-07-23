const { pool } = require("../../src/db/pool.js");
const { seed } = require("../../src/db/seed.js");

async function resetDb() {
  await pool.query(
    `TRUNCATE TABLE
       workflow_execution,
       workflow_step_execution,
       workflow_execution_log,
       mock_customer,
       mock_invoice
     RESTART IDENTITY CASCADE`
  );

  await seed();
}

module.exports.resetDb = resetDb;
