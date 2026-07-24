const { pool } = require("../db/pool.js");

async function startOrRetryStep(executionId, stepId, input) {
  const { rows } = await pool.query(
    `INSERT INTO workflow_step_execution
       (workflow_execution_id, workflow_step_id, status, retry_count, input, started_at, completed_at, error)
     VALUES ($1, $2, 'RUNNING', 0, $3, now(), NULL, NULL)
     ON CONFLICT (workflow_execution_id, workflow_step_id) DO UPDATE
       SET status = 'RUNNING',
           retry_count = workflow_step_execution.retry_count + 1,
           error = NULL,
           input = $3,
           started_at = now(),
           completed_at = NULL
     RETURNING *`,
    [executionId, stepId, input]
  );

  return rows[0];
}

async function markCompleted(executionId, stepId, output, idempotencyKey = null) {
  const { rows } = await pool.query(
    `UPDATE workflow_step_execution
     SET status = 'COMPLETED',
         output = $3,
         idempotency_key = $4,
         completed_at = now()
     WHERE workflow_execution_id = $1 AND workflow_step_id = $2
     RETURNING *`,
    [executionId, stepId, output, idempotencyKey]
  );

  return rows[0];
}

async function markFailed(executionId, stepId, errorMessage) {
  const { rows } = await pool.query(
    `UPDATE workflow_step_execution
     SET status = 'FAILED',
         error = $3,
         completed_at = now()
     WHERE workflow_execution_id = $1 AND workflow_step_id = $2
     RETURNING *`,
    [executionId, stepId, errorMessage]
  );

  return rows[0];
}

async function markWaitingForApproval(executionId, stepId, output) {
  const { rows } = await pool.query(
    `UPDATE workflow_step_execution
     SET status = 'WAITING_FOR_APPROVAL',
         output = $3
     WHERE workflow_execution_id = $1 AND workflow_step_id = $2
     RETURNING *`,
    [executionId, stepId, output]
  );

  return rows[0];
}

async function getStepExecution(executionId, stepId) {
  const { rows } = await pool.query(
    `SELECT * FROM workflow_step_execution
     WHERE workflow_execution_id = $1 AND workflow_step_id = $2`,
    [executionId, stepId]
  );

  return rows[0] || null;
}

async function listStepExecutions(executionId) {
  const { rows } = await pool.query(
    `SELECT * FROM workflow_step_execution
     WHERE workflow_execution_id = $1
     ORDER BY started_at ASC`,
    [executionId]
  );

  return rows;
}

module.exports = { startOrRetryStep, markCompleted, markFailed, markWaitingForApproval, getStepExecution, listStepExecutions };
