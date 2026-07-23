function BugTicketBox({ ticketId, title }) {
  return (
    <div className="bug-ticket-box">
      <h3>Bug Ticket Created</h3>
      <p className="bug-ticket-id">{ticketId}</p>
      <p className="bug-ticket-title">{title}</p>
    </div>
  );
}

export default BugTicketBox;
