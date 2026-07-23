const { loadWorkflow } = require("../../models/workflowModel.js");
const executionModel = require("../../models/executionModel.js");
const stepExecutionModel = require("../../models/stepExecutionModel.js");
const { getAgentClient } = require("../../utils/agents/index.js");
const { runStep } = require("./runStep.js");

async function runWorkflow(executionId, { startStepName, incomingOutcome = null } = {}) {
  const execution = await executionModel.getExecutionById(executionId);
  const { stepsByName } = await loadWorkflow();

  const stepRowsById = new Map(
    Array.from(stepsByName.values()).map((step) => [step.id, step])
  );

  const context = { request: execution.request };
  const history = await stepExecutionModel.listStepExecutions(executionId);
  for (const row of history) {
    if (row.status !== "COMPLETED") continue;
    const step = stepRowsById.get(row.workflow_step_id);
    if (step) context[step.name] = row.output;
  }

  let currentStepName = startStepName;
  if (!currentStepName) {
    const inputStep = Array.from(stepsByName.values()).find((step) => step.type === "INPUT");
    currentStepName = inputStep.name;
  }

  await executionModel.updateExecutionStatus(executionId, "RUNNING");

  const agentClient = getAgentClient();
  let lastOutcome = incomingOutcome;

  while (true) {
    const stepRow = stepsByName.get(currentStepName);

    if (stepRow.type === "END") {
      const finalStatus = lastOutcome === "REJECTED" ? "REJECTED" : "COMPLETED";
      await executionModel.updateExecutionStatus(executionId, finalStatus);
      return { status: finalStatus };
    }

    const result = await runStep({ executionId, stepRow, context, agentClient });

    if (result.status === "FAILED") {
      await executionModel.updateExecutionStatus(executionId, "FAILED");
      return { status: "FAILED", error: result.error };
    }

    if (result.status === "WAITING_FOR_APPROVAL") {
      await executionModel.updateExecutionStatus(executionId, "WAITING_FOR_APPROVAL");
      return { status: "WAITING_FOR_APPROVAL" };
    }

    context[stepRow.name] = result.output;
    lastOutcome = result.outcome;
    currentStepName = stepRow.transitions?.[result.outcome] ?? null;
  }
}

module.exports.runWorkflow = runWorkflow;
