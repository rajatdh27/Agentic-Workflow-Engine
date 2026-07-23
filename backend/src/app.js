const express = require("express");
const cors = require("cors");
const executionsRouter = require("./routes/executions.js");
const { errorHandler } = require("./middleware/errorHandler.js");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api", executionsRouter);

app.use(errorHandler);

module.exports.app = app;
