function classifyPrompt(message) {
  return `Classify this customer support request as "BUG", "BILLING", or "UNCLEAR".\n\nRequest: ${message}`;
}

function draftReplyPrompt({ category, message, context, reviewerNote }) {
  return [
    "Draft a short, friendly customer support reply email.",
    `Category: ${category}`,
    `Customer request: ${message}`,
    `Customer context: ${JSON.stringify(context)}`,
    context?.name ? `Address the customer by name ("${context.name}") in the greeting.` : null,
    reviewerNote
      ? `A human reviewer looked at this and left this instruction: "${reviewerNote}". Incorporate this into the reply.`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

const CLASSIFY_SCHEMA = {
  type: "object",
  properties: {
    category: { type: "string", enum: ["BUG", "BILLING", "UNCLEAR"] },
    confidence: { type: "number" },
    reasoning: { type: "string" },
  },
  required: ["category", "confidence", "reasoning"],
  additionalProperties: false,
};

const DRAFT_REPLY_SCHEMA = {
  type: "object",
  properties: {
    subject: { type: "string" },
    body: { type: "string" },
  },
  required: ["subject", "body"],
  additionalProperties: false,
};

module.exports = { classifyPrompt, draftReplyPrompt, CLASSIFY_SCHEMA, DRAFT_REPLY_SCHEMA };
