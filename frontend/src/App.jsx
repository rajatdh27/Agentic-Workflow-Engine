import { useState, useEffect, useRef } from "react";
import SubmitForm from "./components/SubmitForm.jsx";
import ExecutionResult from "./components/ExecutionResult.jsx";
import {
  submitRequest,
  retryStep,
  approveStep,
  listCustomers,
  listExecutions,
  listBugTickets,
  getExecution,
} from "./api.js";

const TERMINAL_STATUSES = new Set(["COMPLETED", "FAILED", "REJECTED", "WAITING_FOR_APPROVAL"]);
const POLL_INTERVAL_MS = 700;

function App() {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [runs, setRuns] = useState([]);
  const [bugTickets, setBugTickets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [result, setResult] = useState(null);
  const pollingRef = useRef(null);

  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  function pollUntilTerminal(executionId) {
    stopPolling();
    setLoading(true);

    pollingRef.current = setInterval(async () => {
      try {
        const data = await getExecution(executionId);
        setResult(data);

        if (TERMINAL_STATUSES.has(data.execution.status)) {
          stopPolling();
          setLoading(false);
          refreshRuns();
          refreshBugTickets();
        }
      } catch (err) {
        stopPolling();
        setLoading(false);
        setError(err.message);
      }
    }, POLL_INTERVAL_MS);
  }

  function getCustomerName(customerId) {
    return customers.find((c) => c.id === customerId)?.name || customerId;
  }

  function refreshRuns() {
    listExecutions()
      .then(setRuns)
      .catch((err) => setError(err.message));
  }

  function refreshBugTickets() {
    listBugTickets()
      .then(setBugTickets)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    listCustomers()
      .then((data) => {
        setCustomers(data);
        if (data.length > 0) {
          setCustomerId(data[0].id);
        }
      })
      .catch((err) => setError(err.message));

    refreshRuns();
    refreshBugTickets();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    stopPolling();
    setLoading(true);
    setError(null);

    try {
      const data = await submitRequest({ customerId, message });
      setResult(data);
      setSelectedId(data.execution.id);
      refreshRuns();
      pollUntilTerminal(data.execution.id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleSelectRun(id) {
    stopPolling();
    setLoading(false);
    setError(null);

    try {
      const data = await getExecution(id);
      setResult(data);
      setSelectedId(id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRetry(stepName) {
    stopPolling();
    setLoading(true);
    setError(null);

    try {
      const data = await retryStep(result.execution.id, stepName);
      setResult(data);
      refreshRuns();
      pollUntilTerminal(data.execution.id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleApprove(stepName, decision, note) {
    stopPolling();
    setLoading(true);
    setError(null);

    try {
      const data = await approveStep(result.execution.id, stepName, decision, note);
      setResult(data);
      refreshRuns();
      pollUntilTerminal(data.execution.id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Workflow Debugger</h1>

        <SubmitForm
          customers={customers}
          customerId={customerId}
          setCustomerId={setCustomerId}
          message={message}
          setMessage={setMessage}
          loading={loading}
          onSubmit={handleSubmit}
        />

        <div className="runs-list">
          <ul>
            {runs.map((run) => (
              <li
                key={run.id}
                className={run.id === selectedId ? "selected" : ""}
                onClick={() => handleSelectRun(run.id)}
              >
                <span className="run-id">{run.id.slice(0, 8)}</span>
                <span className={`badge badge-${run.status.toLowerCase()}`}>{run.status}</span>
                <span className="run-customer">{getCustomerName(run.request?.customerId)}</span>
                <span className="run-desc">{run.request?.message}</span>
              </li>
            ))}
          </ul>
        </div>

        {bugTickets.length > 0 && (
          <div className="bug-tickets">
            <h2>Bug Tickets</h2>
            <ul>
              {bugTickets.map((ticket) => (
                <li key={ticket.id}>
                  <span className="ticket-id">{ticket.ticket_id}</span>
                  <span className="ticket-title">{ticket.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <main className="main">
        {error && <div className="banner banner-error">{error}</div>}
        {loading && (
          <div className="banner banner-loading">
            <span className="spinner" />
            Processing...
          </div>
        )}

        {result ? (
          <ExecutionResult result={result} onRetry={handleRetry} onApprove={handleApprove} />
        ) : (
          <p className="empty-state">Submit a request or select one to inspect it.</p>
        )}
      </main>
    </div>
  );
}

export default App;
