require("dotenv").config({ quiet: true });

function required(name) {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const env = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: required("DATABASE_URL"),
  aiProvider: process.env.AI_PROVIDER || "",
  aiApiKey: process.env.AI_API_KEY || "",
  aiModel: process.env.AI_MODEL || "",
};

module.exports.env = env;
