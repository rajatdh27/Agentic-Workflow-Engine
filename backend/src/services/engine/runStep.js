const { executorRegistry } = require("./executorRegistry.js");
const stepExecutionModel = require("../../models/stepExecutionModel.js");
const { addLog } = require("../../models/logModel.js");

async function runStep({ executionId, stepRow, context, agentClient }) {
  const stepExecution = await stepExecutionModel.startOrRetryStep(
    executionId,
    stepRow.id,
    context
  );
  await addLog(stepExecution.id, "INFO", "started");

  const executor = executorRegistry[stepRow.name];

  try {
    const result = await executor({ context, agentClient, executionId });

    if (stepRow.type === "HUMAN_APPROVAL") {
      await stepExecutionModel.markWaitingForApproval(
        executionId,
        stepRow.id,
        result.output
      );
      await addLog(stepExecution.id, "INFO", "waiting for human approval");

      return { status: "WAITING_FOR_APPROVAL", outcome: null, output: result.output };
    }

    await stepExecutionModel.markCompleted(
      executionId,
      stepRow.id,
      result.output,
      `${executionId}:${stepRow.id}`
    );
    await addLog(stepExecution.id, "INFO", "completed");

    return { status: "COMPLETED", outcome: result.outcome, output: result.output };
  } catch (error) {
    await stepExecutionModel.markFailed(executionId, stepRow.id, error.message);
    await addLog(stepExecution.id, "ERROR", `failed: ${error.message}`);

    return { status: "FAILED", outcome: null, error: error.message };
  }
}

module.exports.runStep = runStep;
