const { createBugTicketIdempotent } = require("../../../models/mockDataModel.js");

async function execute({ context, executionId }) {
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

module.exports.execute = execute;
