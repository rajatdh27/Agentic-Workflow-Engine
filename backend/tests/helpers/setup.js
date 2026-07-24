const { before, beforeEach, after } = require("node:test");
const { resetDb } = require("./resetDb.js");
const { setAgentClient } = require("../../src/utils/agents/index.js");
const FakeAgentClient = require("../../src/utils/agents/FakeAgentClient.js");
const { pool } = require("../../src/db/pool.js");

function setupWorkflowTests() {
  before(() => setAgentClient(new FakeAgentClient()));
  beforeEach(() => resetDb());
  after(() => pool.end());
}

module.exports = { setupWorkflowTests };