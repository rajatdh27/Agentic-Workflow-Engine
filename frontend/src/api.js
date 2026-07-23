const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Request failed");
  }

  return data;
}

async function postJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
