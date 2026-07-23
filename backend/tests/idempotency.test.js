const { before, beforeEach, after, test } = require("node:test");
const assert = require("node:assert/strict");
const { resetDb } = require("./helpers/resetDb.js");
const { setAgentClient } = require("../src/utils/agents/index.js");
const FakeAgentClient = require("../src/utils/agents/FakeAgentClient.js");
const { submitRequest, retryStep } = require("../src/services/workflowService.js");
const { createBugTicketIdempotent } = require("../src/models/mockDataModel.js");
const { loadWorkflow } = require("../src/models/workflowModel.js");
const stepExecutionModel = require("../src/models/stepExecutionModel.js");
const { pool } = require("../src/db/pool.js");

before(() => setAgentClient(new FakeAgentClient()));
beforeEach(() => resetDb());
after(() => pool.end());

test("createBugTicketIdempotent returns the same record on repeat calls", async () => {
  const detail = await submitRequest({
    customerId: "C101",
    message: "The app keeps crashing with an error",
  });
  const executionId = detail.execution.id;
  const idempotencyKey = `${executionId}:manual-check`;

  const first = await createBugTicketIdempotent({ idempotencyKey, executionId, title: "Some bug" });
  const second = await createBugTicketIdempotent({ idempotencyKey, executionId, title: "Some bug" });

  assert.equal(first.wasCreated, true);
  assert.equal(second.wasCreated, false);
  assert.equal(first.record.ticket_id, second.record.ticket_id);
});

test("retrying create_bug after a forced failure returns the identical ticketId and doesn't duplicate the ticket row", async () => {
  const detail = await submitRequest({
    customerId: "C101",
    message: "The app keeps crashing with an error",
  });
  assert.equal(detail.execution.status, "COMPLETED");

  const createBugStep = detail.steps.find((s) => s.name === "create_bug");
  const originalTicketId = createBugStep.output.ticketId;

  const { stepsByName } = await loadWorkflow();
  const createBugStepRow = stepsByName.get("create_bug");

  await stepExecutionModel.markFailed(
    detail.execution.id,
    createBugStepRow.id,
    "forced failure for test"
  );

  const retried = await retryStep(detail.execution.id, "create_bug");
  assert.equal(retried.execution.status, "COMPLETED");

  const retriedCreateBugStep = retried.steps.find((s) => s.name === "create_bug");
  assert.equal(retriedCreateBugStep.output.ticketId, originalTicketId);

  const { rows } = await pool.query(
    "SELECT * FROM mock_bug_ticket WHERE workflow_execution_id = $1",
    [detail.execution.id]
  );
  assert.equal(rows.length, 1);
});
