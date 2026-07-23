const { pool } = require("../db/pool.js");

async function addLog(stepExecutionId, level, message) {
  const { rows } = await pool.query(
    `INSERT INTO workflow_execution_log (workflow_step_execution_id, log_level, message)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [stepExecutionId, level, message]
  );

  return rows[0];
}

async function listLogsForStep(stepExecutionId) {
  const { rows } = await pool.query(
    `SELECT * FROM workflow_execution_log
     WHERE workflow_step_execution_id = $1
     ORDER BY created_at ASC`,
    [stepExecutionId]
  );

  return rows;
}

module.exports.addLog = addLog;
module.exports.listLogsForStep = listLogsForStep;
