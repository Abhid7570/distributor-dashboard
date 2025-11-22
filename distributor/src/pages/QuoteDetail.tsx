import { useState } from 'react';
import {
  doc,
  updateDoc,
  collection,
  addDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase'; // your firebase config

export default function QuoteDetail({ quote, onUpdateStatus, onClose }: any) {
  const [quotePrice, setQuotePrice] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [updating, setUpdating] = useState(false);

  // -----------------------------
  // SEND QUOTE
  // -----------------------------
  const handleRespond = async () => {
    if (!quotePrice) return alert('Enter quote price');
    setUpdating(true);

    try {
      const quoteRef = doc(db, 'quote_requests', quote.id);

      await updateDoc(quoteRef, {
        quoted_price: parseFloat(quotePrice),
        status: 'quoted',
        updated_at: new Date().toISOString(),
      });

      alert('Quote sent successfully!');
      await onUpdateStatus(quote, 'quoted');
    } catch (err) {
      console.error('Failed to send quote', err);
      alert('Failed to send quote');
    } finally {
      setUpdating(false);
    }
  };

  // -----------------------------
  // DECLINE QUOTE
  // -----------------------------
  const handleDecline = async () => {
    setUpdating(true);

    try {
      const declinedRef = collection(db, 'declined_quotes');

      await addDoc(declinedRef, {
        quote_request_id: quote.id,
        request_number: quote.request_number,
        customer_name: quote.customer_name,
        customer_email: quote.customer_email,
        customer_phone: quote.customer_phone,
        company_name: quote.company_name || '',
        items: quote.items || [],
        message: quote.message || '',
        declined_reason: declineReason || 'No reason provided',
        declined_by: 'distributor',
        declined_at: new Date().toISOString(),
      });

      alert('Quote declined and archived!');
      await onUpdateStatus(quote, 'declined');
    } catch (err: any) {
      console.error('Failed to decline quote', err);
      alert('Failed to decline quote: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="order-detail">
      <div className="detail-header">
        <div>
          <h2>{quote.request_number}</h2>
          <div className="muted">{quote.customer_name} — {quote.customer_email}</div>
          <div className="muted">{quote.company_name}</div>
          <div className="muted detail-meta">
            Created: {new Date(quote.created_at).toLocaleDateString()} • Status: <strong>{quote.status}</strong>
          </div>
        </div>
        <div><button className="btn ghost" onClick={onClose}>Close</button></div>
      </div>

      <section className="detail-section">
        <h3>Contact</h3>
        <p><strong>Phone:</strong> {quote.customer_phone}</p>
        <p><strong>Email:</strong> {quote.customer_email}</p>
      </section>

      <section className="detail-section">
        <h3>Requested Items</h3>
        <ul className="items-list">
          {Array.isArray(quote.items) &&
            quote.items.map((item: any, idx: number) => (
              <li key={idx} className="items-row">
                <div>{item.product_name}</div>
                <div>Qty: {item.quantity}</div>
              </li>
            ))}
        </ul>
      </section>

      <section className="detail-section">
        <h3>Message</h3>
        <pre className="address">{quote.message}</pre>
      </section>

      <section className="detail-section">
        <h3>Respond with Quote</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            type="number"
            value={quotePrice}
            onChange={(e) => setQuotePrice(e.target.value)}
            placeholder="Quote price"
            style={{ flex: 1 }}
            disabled={updating}
          />
          <button className="btn" onClick={handleRespond} disabled={updating}>
            Send Quote
          </button>
        </div>

        {updating && <div className="loading-text">Sending...</div>}
        {quote.quoted_price && <div className="muted">Current quote: ${quote.quoted_price}</div>}
      </section>

      <section className="detail-section">
        <h3>Decline Reason (Optional)</h3>
        <textarea
          value={declineReason}
          onChange={(e) => setDeclineReason(e.target.value)}
          placeholder="Why are you declining this quote?"
          style={{ width: '100%', padding: 8, minHeight: 60 }}
          disabled={updating}
        />
      </section>

      <section className="detail-section">
        <h3>Actions</h3>
        <div className="actions">
          <button className="btn" disabled={updating}
            onClick={() => { setUpdating(true); onUpdateStatus(quote, 'quoted').finally(() => setUpdating(false)); }}>
            Mark as Quoted
          </button>

          <button className="btn" disabled={updating}
            onClick={() => { setUpdating(true); onUpdateStatus(quote, 'accepted').finally(() => setUpdating(false)); }}>
            Accept Quote
          </button>

          <button className="btn danger" disabled={updating} onClick={handleDecline}>
            Decline Quote
          </button>
        </div>
      </section>
    </div>
  );
}
