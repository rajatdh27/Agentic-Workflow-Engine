async function execute({ context }) {
  const { customerId, message } = context.request || {};

  if (!customerId) {
    throw new Error("request is missing customerId");
  }
  if (!message) {
    throw new Error("request is missing message");
  }

  return { output: { customerId, message }, outcome: "default" };
}

module.exports.execute = execute;
