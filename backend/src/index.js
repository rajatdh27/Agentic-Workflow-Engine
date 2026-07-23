const { app } = require("./app.js");
const { env } = require("./config/env.js");

app.listen(env.port, () => {
  console.log(`Listening on http://localhost:${env.port}`);
});
