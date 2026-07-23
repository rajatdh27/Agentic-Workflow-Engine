const { execute: receiveRequest } = require("./executors/receiveRequest.js");
const { execute: classifyIssue } = require("./executors/classifyIssue.js");
const { execute: fetchCustomer } = require("./executors/fetchCustomer.js");
const { execute: choosePath } = require("./executors/choosePath.js");
const { execute: createBug } = require("./executors/createBug.js");
const { execute: checkInvoice } = require("./executors/checkInvoice.js");
const { execute: humanApproval } = require("./executors/humanApproval.js");
const { execute: finalResponse } = require("./executors/finalResponse.js");
const { execute: endWorkflow } = require("./executors/endWorkflow.js");

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

module.exports.executorRegistry = executorRegistry;
