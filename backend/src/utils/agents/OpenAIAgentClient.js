const OpenAI = require("openai");
const { classifyPrompt, draftReplyPrompt, CLASSIFY_SCHEMA, DRAFT_REPLY_SCHEMA } = require("./prompts.js");

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
      messages: [{ role: "user", content: classifyPrompt(message) }],
      response_format: {
        type: "json_schema",
        json_schema: { name: "classification", schema: CLASSIFY_SCHEMA },
      },
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async draftReply({ category, message, context, reviewerNote }) {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "user", content: draftReplyPrompt({ category, message, context, reviewerNote }) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "draft_reply", schema: DRAFT_REPLY_SCHEMA },
      },
    });

    return JSON.parse(response.choices[0].message.content);
  }
}

module.exports = OpenAIAgentClient;
