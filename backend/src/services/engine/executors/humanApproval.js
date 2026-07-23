async function execute({ context }) {
  return {
    output: {
      summary: "Needs human review",
      message: context.receive_request.message,
      customer: context.fetch_customer,
    },
    outcome: null,
  };
}

module.exports.execute = execute;
