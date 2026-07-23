const OpenAI = require("openai");

class OpenAIAgentClient {
  constructor({ apiKey, model }) {
    if (!apiKey) {
      throw new Error("AI_API_KEY is required to use OpenAIAgentClient.");
    }
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async classify({ message }) {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "user",
          content: `Classify this customer support request as "BUG", "BILLING", or "UNCLEAR".\n\nRequest: ${message}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "classification",
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

    return JSON.parse(response.choices[0].message.content);
  }

  async draftReply({ category, message, context, reviewerNote }) {
    const response = await this.client.chat.completions.create({
      model: this.model,
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
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "draft_reply",
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

    return JSON.parse(response.choices[0].message.content);
  }
}

module.exports = OpenAIAgentClient;
