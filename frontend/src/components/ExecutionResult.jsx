import StepItem from "./StepItem.jsx";
import FinalReplyBox from "./FinalReplyBox.jsx";
import BugTicketBox from "./BugTicketBox.jsx";

function ExecutionResult({ result, onRetry, onApprove }) {
  const finalResponseStep = result.steps.find(
    (step) => step.name === "final_response" && step.status === "COMPLETED"
  );

  const createBugStep = result.steps.find(
    (step) => step.name === "create_bug" && step.status === "COMPLETED"
  );

  return (
    <>
      <div className="run-detail-header">
        <div>
          <h2>{result.execution.id.slice(0, 8)}</h2>
          <p className="run-description">{result.execution.request?.message}</p>
        </div>
        <span className={`badge badge-${result.execution.status.toLowerCase()}`}>
          {result.execution.status}
        </span>
      </div>

      {createBugStep && (
        <BugTicketBox ticketId={createBugStep.output.ticketId} title={createBugStep.output.title} />
      )}

      {finalResponseStep && (
        <FinalReplyBox subject={finalResponseStep.output.subject} body={finalResponseStep.output.body} />
      )}

      <div className="node-list">
        {result.steps.map((step) => (
          <StepItem key={step.id} step={step} onRetry={onRetry} onApprove={onApprove} />
        ))}
      </div>
    </>
  );
}

export default ExecutionResult;
