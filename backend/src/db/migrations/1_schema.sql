CREATE TABLE workflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  version INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE'))
);

CREATE TABLE workflow_step (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type TEXT NOT NULL CHECK (type IN
    ('INPUT','AGENT','TOOL','CONDITION','HUMAN_APPROVAL','RESPONSE','END')),
  transitions JSONB,
  UNIQUE (workflow_id, name)
);

CREATE TABLE workflow_execution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflow(id),
  request JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN
    ('PENDING','RUNNING','WAITING_FOR_APPROVAL','COMPLETED','FAILED','REJECTED')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE workflow_step_execution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_execution_id UUID NOT NULL REFERENCES workflow_execution(id) ON DELETE CASCADE,
  workflow_step_id UUID NOT NULL REFERENCES workflow_step(id),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN
    ('PENDING','RUNNING','WAITING_FOR_APPROVAL','COMPLETED','FAILED')),
  input JSONB,
  output JSONB,
  error TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  idempotency_key VARCHAR(255) UNIQUE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE (workflow_execution_id, workflow_step_id)
);

CREATE TABLE workflow_execution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_step_execution_id UUID NOT NULL REFERENCES workflow_step_execution(id) ON DELETE CASCADE,
  log_level TEXT NOT NULL DEFAULT 'INFO' CHECK (log_level IN ('INFO','WARN','ERROR')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE mock_customer (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  plan VARCHAR(50) NOT NULL,
  account_status VARCHAR(50) NOT NULL
);

CREATE TABLE mock_invoice (
  id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL REFERENCES mock_customer(id),
  amount_cents INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid','unpaid','overdue')),
  due_date DATE NOT NULL
);
