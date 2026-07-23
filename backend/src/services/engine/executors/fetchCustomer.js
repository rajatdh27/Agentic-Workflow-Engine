const { getCustomerById } = require("../../../models/mockDataModel.js");

async function execute({ context }) {
  const customer = await getCustomerById(context.receive_request.customerId);

  if (!customer) {
    throw new Error(`No customer found with id "${context.receive_request.customerId}"`);
  }

  return { output: customer, outcome: "default" };
}

module.exports.execute = execute;
