const Anthropic = require("@anthropic-ai/sdk");

class ClaudeAgentClient {
  constructor({ apiKey, model }) {
    if (!apiKey) {
      throw new Error("AI_API_KEY is required to use ClaudeAgentClient.");
    }
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async classify({ message }) {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Classify this customer support request as "BUG", "BILLING", or "UNCLEAR".\n\nRequest: ${message}`,
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              category: { type: "string", enum: ["BUG", "BILLING", "UNCLEAR"] },
              confidence: { type: "number" },
              reasoning: { type: "string" },
            },
            required: ["category", "confidence", "reasoning"],
            additionalProperties: false,
          },
        },
      },
    });

    return JSON.parse(response.content[0].text);
  }

  async draftReply({ category, message, context, reviewerNote }) {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
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
            .join("\n"),
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              subject: { type: "string" },
              body: { type: "string" },
            },
            required: ["subject", "body"],
            additionalProperties: false,
          },
        },
      },
    });

    return JSON.parse(response.content[0].text);
  }
}

module.exports = ClaudeAgentClient;
