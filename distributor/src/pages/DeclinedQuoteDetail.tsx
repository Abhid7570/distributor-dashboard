export default function DeclinedQuoteDetail({ declinedQuote, onClose }: any) {
  return (
    <div className="order-detail">
      <div className="detail-header">
        <div>
          <h2>{declinedQuote.request_number}</h2>
          <div className="muted">{declinedQuote.customer_name} — {declinedQuote.customer_email}</div>
          <div className="muted">{declinedQuote.company_name}</div>
          <div className="muted detail-meta">Declined: {new Date(declinedQuote.declined_at).toLocaleDateString()}</div>
        </div>
        <div>
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>
      </div>

      <section className="detail-section">
        <h3>Contact</h3>
        <div>
          <p><strong>Phone:</strong> {declinedQuote.customer_phone}</p>
          <p><strong>Email:</strong> {declinedQuote.customer_email}</p>
        </div>
      </section>

      <section className="detail-section">
        <h3>Requested Items</h3>
        <ul className="items-list">
          {Array.isArray(declinedQuote.items) && declinedQuote.items.map((item: any, idx: number) => (
            <li key={idx} className="items-row">
              <div>{item.product_name}</div>
              <div>Qty: {item.quantity}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="detail-section">
        <h3>Customer Message</h3>
        <pre className="address">{declinedQuote.message}</pre>
      </section>

      <section className="detail-section">
        <h3>Decline Reason</h3>
        <div style={{ backgroundColor: '#fee2e2', padding: 12, borderRadius: 4, borderLeft: '3px solid #ef4444' }}>
          {declinedQuote.declined_reason}
        </div>
      </section>
    </div>
  );
}
