const { test } = require("node:test");
const assert = require("node:assert/strict");
const { setupWorkflowTests } = require("./helpers/setup.js");
const { waitForTerminal } = require("./helpers/waitForTerminal.js");
const { setAgentClient } = require("../src/utils/agents/index.js");
const FakeAgentClient = require("../src/utils/agents/FakeAgentClient.js");
const { submitRequest } = require("../src/services/workflowService.js");

setupWorkflowTests();

test("an invalid category from the agent fails classify_issue and never reaches choose_path", async () => {
  setAgentClient(
    new FakeAgentClient({
      classify: { category: "NOT_REAL", confidence: 1, reasoning: "x" },
    })
  );

  try {
    const submitted = await submitRequest({ customerId: "C101", message: "anything" });
    const detail = await waitForTerminal(submitted.execution.id);

    assert.equal(detail.execution.status, "FAILED");

    const classifyIssue = detail.steps.find((s) => s.name === "classify_issue");
    assert.ok(classifyIssue);
    assert.equal(classifyIssue.status, "FAILED");
    assert.match(classifyIssue.error, /NOT_REAL/);

    assert.ok(!detail.steps.some((s) => s.name === "choose_path"));
  } finally {
    setAgentClient(new FakeAgentClient());
  }
});
