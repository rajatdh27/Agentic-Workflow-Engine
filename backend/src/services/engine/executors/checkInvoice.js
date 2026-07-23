const { getInvoiceByCustomerId } = require("../../../models/mockDataModel.js");

async function execute({ context }) {
  const invoice = await getInvoiceByCustomerId(context.receive_request.customerId);

  if (!invoice) {
    throw new Error(`No invoice found for customer "${context.receive_request.customerId}"`);
  }

  return { output: invoice, outcome: "default" };
}

module.exports.execute = execute;
