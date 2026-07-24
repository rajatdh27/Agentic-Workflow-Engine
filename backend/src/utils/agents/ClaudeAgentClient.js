const Anthropic = require("@anthropic-ai/sdk");
const { classifyPrompt, draftReplyPrompt, CLASSIFY_SCHEMA, DRAFT_REPLY_SCHEMA } = require("./prompts.js");

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
      messages: [{ role: "user", content: classifyPrompt(message) }],
      output_config: {
        format: { type: "json_schema", schema: CLASSIFY_SCHEMA },
      },
    });

    return JSON.parse(response.content[0].text);
  }

  async draftReply({ category, message, context, reviewerNote }) {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [
        { role: "user", content: draftReplyPrompt({ category, message, context, reviewerNote }) },
      ],
      output_config: {
        format: { type: "json_schema", schema: DRAFT_REPLY_SCHEMA },
      },
    });

    return JSON.parse(response.content[0].text);
  }
}

module.exports = ClaudeAgentClient;
