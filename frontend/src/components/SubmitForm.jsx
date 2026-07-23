function SubmitForm({ customers, customerId, setCustomerId, message, setMessage, loading, onSubmit }) {
  return (
    <form className="submit-form" onSubmit={onSubmit}>
      <label>
        Customer
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} ({customer.id})
            </option>
          ))}
        </select>
      </label>

      <label>
        Message
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

export default SubmitForm;
