import { useState } from "react";

function StepItem({ step, onRetry, onApprove }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="node-card">
      <button type="button" className="node-card-header" onClick={() => setExpanded((e) => !e)}>
        <span className="node-id">{step.name}</span>
        <span className="node-type">{step.type}</span>
        <span className={`badge badge-${step.status.toLowerCase()}`}>{step.status}</span>
        <span className="node-caret">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="node-card-body">
          <div className="node-section">
            <h4>Input</h4>
            <pre>{JSON.stringify(step.input, null, 2)}</pre>
          </div>

          <div className="node-section">
            <h4>Output</h4>
            <pre>{JSON.stringify(step.output, null, 2)}</pre>
          </div>

          {step.error && (
            <div className="node-section tone-error">
              <h4>Error</h4>
              <pre>{step.error}</pre>
            </div>
          )}

          <div className="node-logs">
            <h4>Logs</h4>
            <pre>{JSON.stringify(step.logs, null, 2)}</pre>
          </div>

          {step.status === "FAILED" && (
            <button type="button" className="action-button" onClick={() => onRetry(step.name)}>
              Retry
            </button>
          )}

          {step.status === "WAITING_FOR_APPROVAL" && (
            <div className="approval-actions">
              <button type="button" className="action-button" onClick={() => onApprove(step.name, "APPROVED")}>
                Approve
              </button>
              <button
                type="button"
                className="action-button reject"
                onClick={() => onApprove(step.name, "REJECTED")}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StepItem;
