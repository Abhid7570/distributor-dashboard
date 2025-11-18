import { useEffect, useState } from 'react';
import { db } from '../src/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function OrderDetail({ order, onUpdateStatus, onClose }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadItems() {
      try {
        const q = query(
          collection(db, "order_items"),
          where("order_id", "==", order.id)
        );

        const snapshot = await getDocs(q);

        if (mounted) {
          const list: any[] = [];
          snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
          setItems(list);
        }
      } catch (err) {
        console.error("Failed to load order items", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadItems();

    return () => {
      mounted = false;
    };
  }, [order.id]);

  return (
    <div className="order-detail">
      <div className="detail-header">
        <div>
          <h2>{order.order_number}</h2>
          <div className="muted">
            {order.customer_name} — {order.customer_email}
          </div>
          <div className="muted detail-meta">
            Created: {new Date(order.created_at).toLocaleDateString()} • Status:{" "}
            <strong>{order.status}</strong>
          </div>
        </div>
        <div>
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>
      </div>

      <section className="detail-section">
        <h3>Shipping Address</h3>
        <pre className="address">{JSON.stringify(order.shipping_address, null, 2)}</pre>
      </section>

      <section className="detail-section">
        <h3>Items {loading ? "(loading...)" : `(${items.length})`}</h3>
        <ul className="items-list">
          {items.map((it) => (
            <li key={it.id} className="items-row">
              <div>{it.product_name}</div>
              <div>Qty: {it.quantity}</div>
              <div>${(it.subtotal || 0).toFixed(2)}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="detail-section">
        <h3>Actions</h3>
        <div className="actions">
          <button
            className="btn"
            onClick={() => {
              setUpdating(true);
              onUpdateStatus(order, "processing").finally(() => setUpdating(false));
            }}
            disabled={updating}
          >
            Mark Processing
          </button>

          <button
            className="btn"
            onClick={() => {
              setUpdating(true);
              onUpdateStatus(order, "shipped").finally(() => setUpdating(false));
            }}
            disabled={updating}
          >
            Mark Shipped
          </button>

          <button
            className="btn"
            onClick={() => {
              setUpdating(true);
              onUpdateStatus(order, "delivered").finally(() => setUpdating(false));
            }}
            disabled={updating}
          >
            Mark Delivered
          </button>

          <button
            className="btn danger"
            onClick={() => {
              setUpdating(true);
              onUpdateStatus(order, "cancelled").finally(() => setUpdating(false));
            }}
            disabled={updating}
          >
            Cancel Order
          </button>
        </div>
        {updating && <div className="loading-text">Updating...</div>}
      </section>
    </div>
  );
}
