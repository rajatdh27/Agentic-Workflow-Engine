const { pool } = require("../db/pool.js");

let workflowPromise = null;

function loadWorkflow(name = "Customer Support Workflow") {
  if (!workflowPromise) {
    workflowPromise = fetchWorkflow(name).catch((err) => {
      workflowPromise = null;
      throw err;
    });
  }
  return workflowPromise;
}

async function fetchWorkflow(name) {
  const { rows: workflowRows } = await pool.query(
    "SELECT * FROM workflow WHERE name = $1",
    [name]
  );

  const workflow = workflowRows[0];
  if (!workflow) {
    throw new Error(`No workflow found with name "${name}"`);
  }

  const { rows: stepRows } = await pool.query(
    "SELECT * FROM workflow_step WHERE workflow_id = $1",
    [workflow.id]
  );

  const stepsByName = new Map(stepRows.map((step) => [step.name, step]));

  return { workflow, stepsByName };
}

module.exports.loadWorkflow = loadWorkflow;
