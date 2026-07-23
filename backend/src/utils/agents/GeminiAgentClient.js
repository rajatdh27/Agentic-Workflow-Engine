const { GoogleGenAI, Type } = require("@google/genai");

class GeminiAgentClient {
  constructor({ apiKey, model }) {
    if (!apiKey) {
      throw new Error("AI_API_KEY is required to use GeminiAgentClient.");
    }
    this.client = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async classify({ message }) {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: `Classify this customer support request as "BUG", "BILLING", or "UNCLEAR".\n\nRequest: ${message}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ["BUG", "BILLING", "UNCLEAR"] },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
          },
          required: ["category", "confidence", "reasoning"],
        },
      },
    });
    return JSON.parse(response.text);
  }

  async draftReply({ category, message, context }) {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: [
        "Draft a short, friendly customer support reply email.",
        `Category: ${category}`,
        `Customer request: ${message}`,
        `Customer context: ${JSON.stringify(context)}`,
      ].join("\n"),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
          },
          required: ["subject", "body"],
        },
      },
    });
    return JSON.parse(response.text);
  }
}

module.exports = GeminiAgentClient;
