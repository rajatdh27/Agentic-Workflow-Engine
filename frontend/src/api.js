async function getJson(url) {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Request failed");
  }

  return data;
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Request failed");
  }

  return data;
}

export function listCustomers() {
  return getJson("/api/customers");
}

export function listExecutions() {
  return getJson("/api/executions");
}

export function getExecution(executionId) {
  return getJson(`/api/executions/${executionId}`);
}

export function submitRequest({ customerId, message }) {
  return postJson("/api/executions", { customerId, message });
}

export function retryStep(executionId, stepName) {
  return postJson(`/api/executions/${executionId}/steps/${stepName}/retry`, {});
}

export function approveStep(executionId, stepName, decision, note) {
  return postJson(`/api/executions/${executionId}/steps/${stepName}/approve`, { decision, note });
}
