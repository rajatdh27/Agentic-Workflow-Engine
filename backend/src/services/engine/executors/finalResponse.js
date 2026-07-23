const { ValidationError } = require("../errors.js");

async function execute({ context, agentClient }) {
  const reviewerNote = context.human_approval?.note
    ? `A human reviewer looked at this and said: ${context.human_approval.note}`
    : undefined;

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

module.exports.execute = execute;
