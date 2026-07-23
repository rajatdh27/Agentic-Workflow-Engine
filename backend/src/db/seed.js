const { pool } = require("./pool.js");

const WORKFLOW_STEPS = [
  {
    name: "receive_request",
    type: "INPUT",
    transitions: { default: "classify_issue" },
  },
  {
    name: "classify_issue",
    type: "AGENT",
    transitions: { default: "fetch_customer" },
  },
  {
    name: "fetch_customer",
    type: "TOOL",
    transitions: { default: "choose_path" },
  },
  {
    name: "choose_path",
    type: "CONDITION",
    transitions: {
      BUG: "create_bug",
      BILLING: "check_invoice",
      UNCLEAR: "human_approval",
    },
  },
  {
    name: "create_bug",
    type: "TOOL",
    transitions: { default: "final_response" },
  },
  {
    name: "check_invoice",
    type: "TOOL",
    transitions: { default: "final_response" },
  },
  {
    name: "human_approval",
    type: "HUMAN_APPROVAL",
    transitions: { APPROVED: "final_response", REJECTED: "end_workflow" },
  },
  {
    name: "final_response",
    type: "RESPONSE",
    transitions: { default: "end_workflow" },
  },
  {
    name: "end_workflow",
    type: "END",
    transitions: null,
  },
];

const MOCK_CUSTOMERS = [
  { id: "C101", name: "Amy Chen", plan: "pro", account_status: "active" },
  { id: "C102", name: "Ben Ortiz", plan: "starter", account_status: "active" },
  { id: "C103", name: "Cara Singh", plan: "enterprise", account_status: "past_due" },
];

const MOCK_INVOICES = [
  { id: "INV101", customer_id: "C101", amount_cents: 4900, status: "paid", due_date: "2026-06-15" },
  { id: "INV102", customer_id: "C102", amount_cents: 1900, status: "overdue", due_date: "2026-05-20" },
  { id: "INV103", customer_id: "C103", amount_cents: 29900, status: "unpaid", due_date: "2026-07-10" },
];

async function seedWorkflow() {
  const { rows } = await pool.query(
    `INSERT INTO workflow (name)
     VALUES ($1)
     ON CONFLICT (name) DO NOTHING
     RETURNING id`,
    ["Customer Support Workflow"]
  );

  let workflowId = rows[0]?.id;
  if (!workflowId) {
    const existing = await pool.query(
      "SELECT id FROM workflow WHERE name = $1",
      ["Customer Support Workflow"]
    );
    workflowId = existing.rows[0].id;
  }

  for (const step of WORKFLOW_STEPS) {
    await pool.query(
      `INSERT INTO workflow_step (workflow_id, name, type, transitions)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (workflow_id, name) DO NOTHING`,
      [workflowId, step.name, step.type, step.transitions ? JSON.stringify(step.transitions) : null]
    );
  }
}

async function seedMockData() {
  for (const customer of MOCK_CUSTOMERS) {
    await pool.query(
      `INSERT INTO mock_customer (id, name, plan, account_status)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [customer.id, customer.name, customer.plan, customer.account_status]
    );
  }

  for (const invoice of MOCK_INVOICES) {
    await pool.query(
      `INSERT INTO mock_invoice (id, customer_id, amount_cents, status, due_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [invoice.id, invoice.customer_id, invoice.amount_cents, invoice.status, invoice.due_date]
    );
  }
}

async function seed() {
  await seedWorkflow();
  await seedMockData();
}

if (require.main === module) {
  seed()
    .then(() => console.log("Seed complete."))
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports.seed = seed;
