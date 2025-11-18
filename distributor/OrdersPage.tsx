import { useEffect, useState } from "react";
import {
  sendSigninLink,
  completeSigninIfLink,
  runFirestoreQuery,
  updateDocById,
  onAuthChange,
  signOutUser,
} from "../src/lib/firebase";

import OrderDetail from "./OrderDetail";
import QuoteDetail from "./QuoteDetail";
import DeclinedQuoteDetail from "./DeclinedQuoteDetail";

import "./styles.css";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface Quote {
  id: string;
  request_number: string;
  customer_name: string;
  status: string;
  created_at: string;
}

interface DeclinedQuote {
  id: string;
  request_number: string;
  customer_name: string;
  declined_at: string;
}

// --------------------------------------------------
// SIGN IN COMPONENT
// --------------------------------------------------

function SignIn({ onSigned }: { onSigned: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) return alert("Enter email");

    const { error } = await sendSigninLink(email);
    if (error) return alert("Error: " + error);

    setSent(true);
    onSigned();
  };

  return (
    <div className="sign-in">
      <h3>Distributor Sign In</h3>

      {sent ? (
        <div>Check your email for the magic link</div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
          <button className="btn" onClick={handleSend}>
            Send Link
          </button>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------
// MAIN DASHBOARD
// --------------------------------------------------

export default function OrdersPage() {
  const [user, setUser] = useState<any>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [declinedQuotes, setDeclinedQuotes] = useState<DeclinedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [tab, setTab] = useState<"orders" | "quotes" | "declined">("orders");
  const [selected, setSelected] = useState<any | null>(null);

  const [orderFilter, setOrderFilter] = useState("");
  const [quoteFilter, setQuoteFilter] = useState("");
  const [search, setSearch] = useState("");

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // --------------------------------------------------
  // MAGIC LINK
  // --------------------------------------------------

  useEffect(() => {
    completeSigninIfLink();
  }, []);

  // --------------------------------------------------
  // AUTH CHANGE LISTENER
  // --------------------------------------------------

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        await refresh();
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // --------------------------------------------------
  // REFRESH DATA
  // --------------------------------------------------

  const refresh = async () => {
  setLoading(true);
  try {
    // Fetch Orders
    const ordersList: Order[] = await runFirestoreQuery(
      "orders",
      [],
      { field: "created_at", ascending: false }
    );

    // Fetch Quotes
    const quotesList: Quote[] = await runFirestoreQuery(
      "quote_requests",
      [],
      { field: "created_at", ascending: false }
    );

    // Fetch Declined Quotes
    const declinedList: DeclinedQuote[] = await runFirestoreQuery(
      "declined_quotes",
      [],
      { field: "declined_at", ascending: false }
    );

    // Safely update state
    setOrders(Array.isArray(ordersList) ? ordersList : []);

    // Filter only non-declined quotes safely
    setQuotes(
      Array.isArray(quotesList)
        ? quotesList.filter((q) => q?.status !== "declined")
        : []
    );

    setDeclinedQuotes(Array.isArray(declinedList) ? declinedList : []);
  } catch (err) {
    console.error("Error loading data:", err);
  } finally {
    setLoading(false);
  }
};


  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
    setSelected(null);
    showToast("Logged out successfully");
  };

  // --------------------------------------------------
  // UPDATE ORDER
  // --------------------------------------------------

  const updateOrderStatus = async (order: Order, status: string) => {
    await updateDocById("orders", order.id, {
      status,
      updated_at: new Date().toISOString(),
    });

    const updated = { ...order, status };
    setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));

    if (selected?.id === order.id) setSelected(updated);
  };

  // --------------------------------------------------
  // UPDATE QUOTE
  // --------------------------------------------------

  const updateQuoteStatus = async (quote: Quote, status: string) => {
    await updateDocById("quote_requests", quote.id, {
      status,
      updated_at: new Date().toISOString(),
    });

    if (status === "declined") {
      setQuotes((prev) => prev.filter((q) => q.id !== quote.id));
      setSelected(null);
      return;
    }

    const updated = { ...quote, status };
    setQuotes((prev) => prev.map((q) => (q.id === quote.id ? updated : q)));

    if (selected?.id === quote.id) setSelected(updated);
  };

  // --------------------------------------------------
  // FILTER + SEARCH
  // --------------------------------------------------

  const filteredOrders = orders
    .filter((o) => (orderFilter ? o.status === orderFilter : true))
    .filter((o) =>
      search
        ? o.order_number.toLowerCase().includes(search.toLowerCase()) ||
          o.customer_name.toLowerCase().includes(search.toLowerCase())
        : true
    );

  const filteredQuotes = quotes
    .filter((q) => (quoteFilter ? q.status === quoteFilter : true))
    .filter((q) =>
      search
        ? q.request_number.toLowerCase().includes(search.toLowerCase()) ||
          q.customer_name.toLowerCase().includes(search.toLowerCase())
        : true
    );

  const isOrder = selected && "order_number" in selected;
  const isQuote = selected && "request_number" in selected;

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className={`dist-root ${darkMode ? "dark" : ""}`}>
      <header className="dist-header">
        <h1>Distributor Dashboard</h1>

        {user && (
          <div className="header-actions">
            <span className="user-email">{user.email}</span>

            <button
              className="btn ghost small"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "🌙 Dark" : "☀️ Light"}
            </button>

            <button className="btn small" onClick={refresh}>⟳ Refresh</button>

            <button className="btn ghost small" onClick={handleLogout}>
              ⎋ Logout
            </button>
          </div>
        )}
      </header>

      <div className="dist-grid">
        {/* ---------------------------------- SIDEBAR ---------------------------------- */}
        <aside className="dist-list">

          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${tab === "orders" ? "active" : ""}`}
              onClick={() => { setTab("orders"); setSelected(null); }}
            >
              Orders ({orders.length})
            </button>

            <button
              className={`tab ${tab === "quotes" ? "active" : ""}`}
              onClick={() => { setTab("quotes"); setSelected(null); }}
            >
              Quotes ({quotes.length})
            </button>

            <button
              className={`tab ${tab === "declined" ? "active" : ""}`}
              onClick={() => { setTab("declined"); setSelected(null); }}
            >
              Declined ({declinedQuotes.length})
            </button>
          </div>

          {/* Search */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          {tab === "orders" && (
            <select
              className="filter-select"
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}

          {tab === "quotes" && (
            <select
              className="filter-select"
              value={quoteFilter}
              onChange={(e) => setQuoteFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="quoted">Quoted</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
            </select>
          )}

          {/* Lists */}
          <ul>
            {tab === "orders" &&
              filteredOrders.map((o) => (
                <li
                  key={o.id}
                  className={`order-item ${o.status}`}
                  onClick={() => setSelected(o)}
                >
                  <div className="order-meta">
                    <div className="order-number">{o.order_number}</div>
                    <div className="muted">{o.customer_name}</div>
                  </div>
                  <div className="order-right">
                    <div>₹{(o.total_amount || 0).toFixed(2)}</div>
                    <div className="muted">{o.status}</div>
                  </div>
                </li>
              ))}

            {tab === "quotes" &&
              filteredQuotes.map((q) => (
                <li
                  key={q.id}
                  className={`order-item ${q.status}`}
                  onClick={() => setSelected(q)}
                >
                  <div className="order-meta">
                    <div className="order-number">{q.request_number}</div>
                    <div className="muted">{q.customer_name}</div>
                  </div>
                  <div className="order-right">
                    <div className="muted">{q.status}</div>
                  </div>
                </li>
              ))}

            {tab === "declined" &&
              declinedQuotes.map((dq) => (
                <li
                  key={dq.id}
                  className="order-item declined"
                  onClick={() => setSelected(dq)}
                >
                  <div className="order-meta">
                    <div className="order-number">{dq.request_number}</div>
                    <div className="muted">{dq.customer_name}</div>
                  </div>
                  <div className="order-right">
                    <div className="muted">
                      {new Date(dq.declined_at).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </aside>

        {/* ---------------------------------- RIGHT PANEL ---------------------------------- */}
        <main className="dist-main">

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Loading data...</p>
            </div>
          ) : !user ? (
            <SignIn onSigned={refresh} />
          ) : !selected ? (
            <div className="empty">Select an item to view details</div>
          ) : isOrder ? (
            <OrderDetail
              order={selected}
              onUpdateStatus={updateOrderStatus}
              onClose={() => setSelected(null)}
            />
          ) : isQuote ? (
            <QuoteDetail
              quote={selected}
              onUpdateStatus={updateQuoteStatus}
              onClose={() => setSelected(null)}
            />
          ) : (
            <DeclinedQuoteDetail
              declinedQuote={selected}
              onClose={() => setSelected(null)}
            />
          )}

        </main>
      </div>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
