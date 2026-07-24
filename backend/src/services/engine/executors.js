const { ValidationError } = require("./errors.js");
const {
  getCustomerById,
  getInvoiceByCustomerId,
  createBugTicketIdempotent,
} = require("../../models/mockDataModel.js");

const VALID_CATEGORIES = new Set(["BUG", "BILLING", "UNCLEAR"]);

async function receiveRequest({ context }) {
  const { customerId, message } = context.request || {};

  if (!customerId) {
    throw new Error("request is missing customerId");
  }
  if (!message) {
    throw new Error("request is missing message");
  }

  return { output: { customerId, message }, outcome: "default" };
}

async function classifyIssue({ context, agentClient }) {
  const result = await agentClient.classify({ message: context.receive_request.message });

  if (!VALID_CATEGORIES.has(result.category)) {
    throw new ValidationError(`classify() returned invalid category "${result.category}"`);
  }

  return { output: result, outcome: "default" };
}

async function fetchCustomer({ context }) {
  const customer = await getCustomerById(context.receive_request.customerId);

  if (!customer) {
    throw new Error(`No customer found with id "${context.receive_request.customerId}"`);
  }

  return { output: customer, outcome: "default" };
}

async function choosePath({ context }) {
  const { category } = context.classify_issue;

  return { output: { category }, outcome: category };
}

async function createBug({ context, executionId }) {
  const idempotencyKey = `${executionId}:create_bug`;

  const { record, wasCreated } = await createBugTicketIdempotent({
    idempotencyKey,
    executionId,
    title: context.receive_request.message,
  });

  return {
    output: { ticketId: record.ticket_id, title: record.title, wasCreated },
    outcome: "default",
  };
}

async function checkInvoice({ context }) {
  const invoice = await getInvoiceByCustomerId(context.receive_request.customerId);

  if (!invoice) {
    throw new Error(`No invoice found for customer "${context.receive_request.customerId}"`);
  }

  return { output: invoice, outcome: "default" };
}

async function humanApproval({ context }) {
  return {
    output: {
      summary: "Needs human review",
      message: context.receive_request.message,
      customer: context.fetch_customer,
    },
    outcome: null,
  };
}

async function finalResponse({ context, agentClient }) {
  const reviewerNote = context.human_approval?.note || null;

  const result = await agentClient.draftReply({
    category: context.choose_path.category,
    message: context.receive_request.message,
    context: context.fetch_customer,
    reviewerNote,
  });

  if (!result.subject || !result.body) {
    throw new ValidationError("draftReply() did not return non-empty subject and body");
  }

  return { output: result, outcome: "default" };
}

async function endWorkflow() {
  return { output: {}, outcome: null };
}

const executorRegistry = {
  receive_request: receiveRequest,
  classify_issue: classifyIssue,
  fetch_customer: fetchCustomer,
  choose_path: choosePath,
  create_bug: createBug,
  check_invoice: checkInvoice,
  human_approval: humanApproval,
  final_response: finalResponse,
  end_workflow: endWorkflow,
};

module.exports = { executorRegistry };