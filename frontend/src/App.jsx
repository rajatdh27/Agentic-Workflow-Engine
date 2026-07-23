import { useState, useEffect } from "react";
import SubmitForm from "./components/SubmitForm.jsx";
import ExecutionResult from "./components/ExecutionResult.jsx";
import { submitRequest, retryStep, approveStep, listCustomers, listExecutions, getExecution } from "./api.js";

function App() {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [runs, setRuns] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [result, setResult] = useState(null);

  function refreshRuns() {
    listExecutions()
      .then(setRuns)
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
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await submitRequest({ customerId, message });
      setResult(data);
      setSelectedId(data.execution.id);
      refreshRuns();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectRun(id) {
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
    setError(null);

    try {
      const data = await retryStep(result.execution.id, stepName);
      setResult(data);
      refreshRuns();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleApprove(stepName, decision) {
    setError(null);

    try {
      const data = await approveStep(result.execution.id, stepName, decision);
      setResult(data);
      refreshRuns();
    } catch (err) {
      setError(err.message);
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
                <span className="run-desc">{run.request?.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="main">
        {error && <div className="banner banner-error">{error}</div>}

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
