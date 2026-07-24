const { env } = require("../../config/env.js");
const FakeAgentClient = require("./FakeAgentClient.js");
const GeminiAgentClient = require("./GeminiAgentClient.js");
const ClaudeAgentClient = require("./ClaudeAgentClient.js");
const OpenAIAgentClient = require("./OpenAIAgentClient.js");

const PROVIDERS = {
  fake: () => new FakeAgentClient(),
  gemini: () => new GeminiAgentClient({ apiKey: env.aiApiKey, model: env.aiModel }),
  claude: () => new ClaudeAgentClient({ apiKey: env.aiApiKey, model: env.aiModel }),
  openai: () => new OpenAIAgentClient({ apiKey: env.aiApiKey, model: env.aiModel }),
};

let client;

function getAgentClient() {
  if (client) return client;

  const provider = env.aiProvider || "fake";
  const factory = PROVIDERS[provider];
  if (!factory) {
    throw new Error(`AI provider "${provider}" is not implemented yet`);
  }

  client = factory();
  return client;
}

function setAgentClient(newClient) {
  client = newClient;
}

module.exports.getAgentClient = getAgentClient;
module.exports.setAgentClient = setAgentClient;
