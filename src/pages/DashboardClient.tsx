import React, { useEffect, useState } from 'react';
import { runFirestoreQuery, updateDocById } from '../lib/firebase';

export default function DashboardClient() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const o = await runFirestoreQuery('orders', [], { field: 'created_at', ascending: false });
        setOrders(o);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cancelOrder = async (orderId: string) => {
    try {
      await updateDocById('orders', orderId, { status: 'cancelled', updated_at: new Date().toISOString() });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      alert('Failed to cancel order');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Client Dashboard</h1>
      {orders.length === 0 ? <div>No orders yet.</div> : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{o.order_number}</div>
                  <div className="text-sm text-gray-600">{o.customer_name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{o.total_amount}</div>
                  <div className="text-sm">{o.status}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {o.status !== 'cancelled' && <button className="px-3 py-1 border" onClick={() => cancelOrder(o.id)}>Cancel</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
