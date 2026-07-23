const { env } = require("../../config/env.js");
const FakeAgentClient = require("./FakeAgentClient.js");

let client;

function getAgentClient() {
  if (client) return client;

  const provider = env.aiProvider || "fake";

  if (provider === "fake") {
    client = new FakeAgentClient();
    return client;
  }

  throw new Error(`AI provider "${provider}" is not implemented yet`);
}

function setAgentClient(newClient) {
  client = newClient;
}

module.exports.getAgentClient = getAgentClient;
module.exports.setAgentClient = setAgentClient;
