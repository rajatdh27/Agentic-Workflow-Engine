const { before, beforeEach, after, test } = require("node:test");
const assert = require("node:assert/strict");
const { resetDb } = require("./helpers/resetDb.js");
const { waitForTerminal } = require("./helpers/waitForTerminal.js");
const { setAgentClient } = require("../src/utils/agents/index.js");
const FakeAgentClient = require("../src/utils/agents/FakeAgentClient.js");
const { submitRequest } = require("../src/services/workflowService.js");
const { pool } = require("../src/db/pool.js");

before(() => setAgentClient(new FakeAgentClient()));
beforeEach(() => resetDb());
after(() => pool.end());

function stepNames(detail) {
  return detail.steps.map((s) => s.name);
}

test("bug-sounding message completes through create_bug, never visits check_invoice", async () => {
  const submitted = await submitRequest({
    customerId: "C101",
    message: "The app keeps crashing with an error",
  });
  const detail = await waitForTerminal(submitted.execution.id);

  assert.equal(detail.execution.status, "COMPLETED");

  const createBug = detail.steps.find((s) => s.name === "create_bug");
  assert.ok(createBug);
  assert.equal(createBug.status, "COMPLETED");

  assert.ok(!stepNames(detail).includes("check_invoice"));
});

test("billing-sounding message completes through check_invoice, never visits create_bug", async () => {
  const submitted = await submitRequest({
    customerId: "C101",
    message: "I was charged twice on my invoice",
  });
  const detail = await waitForTerminal(submitted.execution.id);

  assert.equal(detail.execution.status, "COMPLETED");
  assert.ok(stepNames(detail).includes("check_invoice"));
  assert.ok(!stepNames(detail).includes("create_bug"));
});

test("unclear message waits for human approval, never reaches final_response", async () => {
  const submitted = await submitRequest({
    customerId: "C101",
    message: "not sure what's going on with my account",
  });
  const detail = await waitForTerminal(submitted.execution.id);

  assert.equal(detail.execution.status, "WAITING_FOR_APPROVAL");

  const humanApproval = detail.steps.find((s) => s.name === "human_approval");
  assert.ok(humanApproval);
  assert.equal(humanApproval.status, "WAITING_FOR_APPROVAL");

  assert.ok(!stepNames(detail).includes("final_response"));
});
