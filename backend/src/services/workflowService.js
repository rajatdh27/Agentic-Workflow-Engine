const { loadWorkflow } = require("../models/workflowModel.js");
const executionModel = require("../models/executionModel.js");
const stepExecutionModel = require("../models/stepExecutionModel.js");
const { listLogsForStep, addLog } = require("../models/logModel.js");
const {
  listCustomers: listCustomersModel,
  listBugTickets: listBugTicketsModel,
} = require("../models/mockDataModel.js");
const { runWorkflow } = require("./engine/runWorkflow.js");
const { NotFoundError, BadRequestError } = require("./errors.js");

async function submitRequest(request) {
  const { workflow } = await loadWorkflow();
  const execution = await executionModel.createExecution(workflow.id, request);

  runWorkflow(execution.id).catch((err) => console.error("runWorkflow failed:", err));

  return getExecutionDetail(execution.id);
}

async function getExecutionDetail(executionId) {
  const execution = await executionModel.getExecutionById(executionId);
  if (!execution) {
    throw new NotFoundError(`No execution found with id "${executionId}"`);
  }

  const { stepsByName } = await loadWorkflow();
  const stepInfoById = new Map(
    Array.from(stepsByName.values()).map((step) => [step.id, { name: step.name, type: step.type }])
  );

  const stepExecutions = await stepExecutionModel.listStepExecutions(executionId);
  const steps = await Promise.all(
    stepExecutions.map(async (step) => ({
      ...step,
      ...stepInfoById.get(step.workflow_step_id),
      logs: await listLogsForStep(step.id),
    }))
  );

  return { execution, steps };
}

async function retryStep(executionId, stepName) {
  const { stepsByName } = await loadWorkflow();
  const stepRow = stepsByName.get(stepName);
  if (!stepRow) {
    throw new NotFoundError(`No step found with name "${stepName}"`);
  }

  const stepExecution = await stepExecutionModel.getStepExecution(executionId, stepRow.id);
  if (!stepExecution || stepExecution.status !== "FAILED") {
    throw new BadRequestError(`Step "${stepName}" is not in a FAILED state and cannot be retried`);
  }

  runWorkflow(executionId, { startStepName: stepName }).catch((err) =>
    console.error("runWorkflow failed:", err)
  );

  return getExecutionDetail(executionId);
}

async function approveStep(executionId, decision, note) {
  if (decision !== "APPROVED" && decision !== "REJECTED") {
    throw new BadRequestError(`decision must be "APPROVED" or "REJECTED"`);
  }

  const { stepsByName } = await loadWorkflow();
  const stepRow = Array.from(stepsByName.values()).find((step) => step.type === "HUMAN_APPROVAL");
  if (!stepRow) {
    throw new NotFoundError("No HUMAN_APPROVAL step found in workflow");
  }

  const stepExecution = await stepExecutionModel.getStepExecution(executionId, stepRow.id);
  if (!stepExecution || stepExecution.status !== "WAITING_FOR_APPROVAL") {
    throw new BadRequestError(`Step "${stepRow.name}" is not awaiting approval`);
  }

  const mergedOutput = { ...stepExecution.output, decision, note: note ?? null };
  await stepExecutionModel.markCompleted(executionId, stepRow.id, mergedOutput);
  await addLog(stepExecution.id, "INFO", `human decision: ${decision}${note ? ` - ${note}` : ""}`);

  const nextStepName = stepRow.transitions?.[decision] ?? null;
  runWorkflow(executionId, { startStepName: nextStepName, incomingOutcome: decision }).catch((err) =>
    console.error("runWorkflow failed:", err)
  );

  return getExecutionDetail(executionId);
}

async function listExecutions() {
  return executionModel.listExecutions();
}

async function listCustomers() {
  return listCustomersModel();
}

async function listBugTickets() {
  return listBugTicketsModel();
}

module.exports.submitRequest = submitRequest;
module.exports.getExecutionDetail = getExecutionDetail;
module.exports.retryStep = retryStep;
module.exports.approveStep = approveStep;
module.exports.listExecutions = listExecutions;
module.exports.listCustomers = listCustomers;
module.exports.listBugTickets = listBugTickets;
