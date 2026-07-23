// Deterministic stand-in for a real LLM provider — same classify/draftReply
// contract every real adapter must also implement, so swapping providers
// never touches any other file.
class FakeAgentClient {
  constructor(overrides = {}) {
    this.overrides = overrides;
  }

  async classify({ message }) {
    if (this.overrides.classify !== undefined) {
      return typeof this.overrides.classify === "function"
        ? this.overrides.classify({ message })
        : this.overrides.classify;
    }

    const text = message.toLowerCase();

    if (/error|crash|bug/.test(text)) {
      return { category: "BUG", confidence: 0.9, reasoning: "Message mentions error/crash/bug." };
    }

    if (/charge|invoice|payment|refund/.test(text)) {
      return { category: "BILLING", confidence: 0.9, reasoning: "Message mentions charge/invoice/payment/refund." };
    }

    return { category: "UNCLEAR", confidence: 0.4, reasoning: "No clear keyword match." };
  }

  async draftReply({ category, message, context, reviewerNote }) {
    if (this.overrides.draftReply !== undefined) {
      return typeof this.overrides.draftReply === "function"
        ? this.overrides.draftReply({ category, message, context, reviewerNote })
        : this.overrides.draftReply;
    }

    const greetingName = context?.name || "there";
    const subject = `Re: Your ${category.toLowerCase()} request`;
    const body =
      `Hi ${greetingName},\n\n` +
      `Thanks for reaching out about: "${message}"\n\n` +
      `Category: ${category}\n` +
      `${context ? `Context: ${JSON.stringify(context)}\n\n` : "\n"}` +
      `${reviewerNote ? `Note from reviewer: ${reviewerNote}\n\n` : ""}` +
      `We'll follow up shortly.\n\nBest,\nSupport Team`;

    return { subject, body };
  }
}

module.exports = FakeAgentClient;
