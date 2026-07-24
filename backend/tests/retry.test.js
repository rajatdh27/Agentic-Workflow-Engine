const { test } = require("node:test");
const assert = require("node:assert/strict");
const { setupWorkflowTests } = require("./helpers/setup.js");
const { waitForTerminal } = require("./helpers/waitForTerminal.js");
const { submitRequest, retryStep } = require("../src/services/workflowService.js");
const { BadRequestError } = require("../src/services/errors.js");
const { pool } = require("../src/db/pool.js");

setupWorkflowTests();

test("unknown customer fails fetch_customer and the execution", async () => {
  const submitted = await submitRequest({
    customerId: "no-such-customer",
    message: "The app keeps crashing with an error",
  });
  const detail = await waitForTerminal(submitted.execution.id);

  assert.equal(detail.execution.status, "FAILED");

  const fetchCustomer = detail.steps.find((s) => s.name === "fetch_customer");
  assert.ok(fetchCustomer);
  assert.equal(fetchCustomer.status, "FAILED");
  assert.ok(fetchCustomer.error);
});

test("retryStep rejects with BadRequestError for a step that isn't FAILED", async () => {
  const submitted = await submitRequest({
    customerId: "no-such-customer",
    message: "The app keeps crashing with an error",
  });
  const detail = await waitForTerminal(submitted.execution.id);

  await assert.rejects(
    () => retryStep(detail.execution.id, "classify_issue"),
    BadRequestError
  );
});

test("retryStep succeeds once the underlying data is fixed", async () => {
  const submitted = await submitRequest({
    customerId: "temp-customer",
    message: "The app keeps crashing with an error",
  });
  const detail = await waitForTerminal(submitted.execution.id);
  assert.equal(detail.execution.status, "FAILED");

  await pool.query(
    `INSERT INTO mock_customer (id, name, plan, account_status) VALUES ($1, $2, $3, $4)`,
    ["temp-customer", "Temp Customer", "starter", "active"]
  );

  try {
    await retryStep(detail.execution.id, "fetch_customer");
    const retried = await waitForTerminal(detail.execution.id);
    assert.equal(retried.execution.status, "COMPLETED");
    assert.ok(retried.steps.every((s) => s.status === "COMPLETED"));
  } finally {
    await pool.query("DELETE FROM mock_customer WHERE id = $1", ["temp-customer"]);
  }
});
