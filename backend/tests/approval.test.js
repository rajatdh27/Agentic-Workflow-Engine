const { before, beforeEach, after, test } = require("node:test");
const assert = require("node:assert/strict");
const { resetDb } = require("./helpers/resetDb.js");
const { waitForTerminal } = require("./helpers/waitForTerminal.js");
const { setAgentClient } = require("../src/utils/agents/index.js");
const FakeAgentClient = require("../src/utils/agents/FakeAgentClient.js");
const { submitRequest, approveStep } = require("../src/services/workflowService.js");
const { pool } = require("../src/db/pool.js");

before(() => setAgentClient(new FakeAgentClient()));
beforeEach(() => resetDb());
after(() => pool.end());

test("APPROVED decision completes the execution through final_response", async () => {
  const submitted = await submitRequest({
    customerId: "C101",
    message: "not sure what's going on with my account",
  });
  const detail = await waitForTerminal(submitted.execution.id);
  assert.equal(detail.execution.status, "WAITING_FOR_APPROVAL");

  await approveStep(detail.execution.id, "APPROVED");
  const approved = await waitForTerminal(detail.execution.id);

  assert.equal(approved.execution.status, "COMPLETED");
  const finalResponse = approved.steps.find((s) => s.name === "final_response");
  assert.ok(finalResponse);
  assert.equal(finalResponse.status, "COMPLETED");
});

test("REJECTED decision marks the execution REJECTED, final_response never runs", async () => {
  const submitted = await submitRequest({
    customerId: "C101",
    message: "not sure what's going on with my account",
  });
  const detail = await waitForTerminal(submitted.execution.id);
  assert.equal(detail.execution.status, "WAITING_FOR_APPROVAL");

  await approveStep(detail.execution.id, "REJECTED");
  const rejected = await waitForTerminal(detail.execution.id);

  assert.equal(rejected.execution.status, "REJECTED");
  assert.ok(!rejected.steps.some((s) => s.name === "final_response"));
});
