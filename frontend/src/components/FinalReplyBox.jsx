function FinalReplyBox({ subject, body }) {
  return (
    <div className="final-reply">
      <h3>Final Reply</h3>
      <p className="final-reply-subject">{subject}</p>
      <p className="final-reply-body">{body}</p>
    </div>
  );
}

export default FinalReplyBox;
