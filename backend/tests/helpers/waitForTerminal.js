const { getExecutionDetail } = require("../../src/services/workflowService.js");

const TERMINAL_STATUSES = new Set(["COMPLETED", "FAILED", "REJECTED", "WAITING_FOR_APPROVAL"]);

async function waitForTerminal(executionId, { timeoutMs = 2000, intervalMs = 20 } = {}) {
  const deadline = Date.now() + timeoutMs;

  while (true) {
    const detail = await getExecutionDetail(executionId);
    if (TERMINAL_STATUSES.has(detail.execution.status)) {
      return detail;
    }
    if (Date.now() > deadline) {
      throw new Error(
        `Execution "${executionId}" did not reach a terminal status within ${timeoutMs}ms (last status: ${detail.execution.status})`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

module.exports.waitForTerminal = waitForTerminal;
