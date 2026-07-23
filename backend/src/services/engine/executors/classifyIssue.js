const { ValidationError } = require("../errors.js");

const VALID_CATEGORIES = new Set(["BUG", "BILLING", "UNCLEAR"]);

async function execute({ context, agentClient }) {
  const result = await agentClient.classify({ message: context.receive_request.message });

  if (!VALID_CATEGORIES.has(result.category)) {
    throw new ValidationError(`classify() returned invalid category "${result.category}"`);
  }

  return { output: result, outcome: "default" };
}

module.exports.execute = execute;
