const { env } = require("../../config/env.js");
const FakeAgentClient = require("./FakeAgentClient.js");
const GeminiAgentClient = require("./GeminiAgentClient.js");

let client;

function getAgentClient() {
  if (client) return client;

  const provider = env.aiProvider || "fake";

  if (provider === "fake") {
    client = new FakeAgentClient();
    return client;
  }

  if (provider === "gemini") {
    client = new GeminiAgentClient({ apiKey: env.aiApiKey, model: env.aiModel });
    return client;
  }

  throw new Error(`AI provider "${provider}" is not implemented yet`);
}

function setAgentClient(newClient) {
  client = newClient;
}

module.exports.getAgentClient = getAgentClient;
module.exports.setAgentClient = setAgentClient;
