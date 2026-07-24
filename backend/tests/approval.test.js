const { test } = require("node:test");
const assert = require("node:assert/strict");
const { setupWorkflowTests } = require("./helpers/setup.js");
const { waitForTerminal } = require("./helpers/waitForTerminal.js");
const { submitRequest, approveStep } = require("../src/services/workflowService.js");

setupWorkflowTests();

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
