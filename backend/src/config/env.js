require("dotenv").config();

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
};

module.exports.env = env;
