const { pool } = require("../db/pool.js");

const TERMINAL_STATUSES = new Set(["COMPLETED", "FAILED", "REJECTED"]);

async function createExecution(workflowId, request) {
  const { rows } = await pool.query(
    `INSERT INTO workflow_execution (workflow_id, request)
     VALUES ($1, $2)
     RETURNING *`,
    [workflowId, request]
  );

  return rows[0];
}

async function getExecutionById(id) {
  const { rows } = await pool.query(
    "SELECT * FROM workflow_execution WHERE id = $1",
    [id]
  );

  return rows[0] || null;
}

async function updateExecutionStatus(id, status) {
  const setCompletedAt = TERMINAL_STATUSES.has(status);

  const { rows } = await pool.query(
    `UPDATE workflow_execution
     SET status = $2${setCompletedAt ? ", completed_at = now()" : ""}
     WHERE id = $1
     RETURNING *`,
    [id, status]
  );

  return rows[0];
}

async function listExecutions() {
  const { rows } = await pool.query(
    "SELECT * FROM workflow_execution ORDER BY created_at DESC LIMIT 50"
  );

  return rows;
}

module.exports = { createExecution, getExecutionById, updateExecutionStatus, listExecutions };
