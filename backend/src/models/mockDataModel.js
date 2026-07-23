const { pool } = require("../db/pool.js");

async function getCustomerById(customerId) {
  const { rows } = await pool.query(
    "SELECT * FROM mock_customer WHERE id = $1",
    [customerId]
  );

  return rows[0] || null;
}

async function listCustomers() {
  const { rows } = await pool.query("SELECT * FROM mock_customer ORDER BY id");
  return rows;
}

async function getInvoiceByCustomerId(customerId) {
  const { rows } = await pool.query(
    "SELECT * FROM mock_invoice WHERE customer_id = $1",
    [customerId]
  );

  return rows[0] || null;
}

async function createBugTicketIdempotent({ idempotencyKey, executionId, title }) {
  const { rows: existingRows } = await pool.query(
    "SELECT * FROM mock_bug_ticket WHERE idempotency_key = $1",
    [idempotencyKey]
  );
  if (existingRows[0]) {
    return { record: existingRows[0], wasCreated: false };
  }

  const ticketId = `BUG-${Math.floor(Math.random() * 100000)}`;

  const { rows: insertedRows } = await pool.query(
    `INSERT INTO mock_bug_ticket (idempotency_key, workflow_execution_id, ticket_id, title)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (idempotency_key) DO NOTHING
     RETURNING *`,
    [idempotencyKey, executionId, ticketId, title]
  );

  if (insertedRows[0]) {
    return { record: insertedRows[0], wasCreated: true };
  }

  const { rows: raceRows } = await pool.query(
    "SELECT * FROM mock_bug_ticket WHERE idempotency_key = $1",
    [idempotencyKey]
  );

  return { record: raceRows[0], wasCreated: false };
}

async function listBugTickets() {
  const { rows } = await pool.query(
    "SELECT * FROM mock_bug_ticket ORDER BY created_at DESC"
  );
  return rows;
}

module.exports.getCustomerById = getCustomerById;
module.exports.listCustomers = listCustomers;
module.exports.getInvoiceByCustomerId = getInvoiceByCustomerId;
module.exports.createBugTicketIdempotent = createBugTicketIdempotent;
module.exports.listBugTickets = listBugTickets;
