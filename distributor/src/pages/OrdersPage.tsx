import { useCallback, useEffect, useMemo, useState } from "react";
import {
  runFirestoreQuery,
  updateDocById,
  logoutDistributor
} from "../lib/firebase";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

import OrderDetail from "./OrderDetail";
import QuoteDetail from "./QuoteDetail";
import DeclinedQuoteDetail from "./DeclinedQuoteDetail";

import "../styles.css";


/* ---------------------------
  Types
--------------------------- */
interface Order {
  id: string;
  order_number?: string;
  customer_name?: string;
  status?: string;
  total_amount?: number;
  created_at?: string;
  [k: string]: any;
}

interface Quote {
  id: string;
  request_number?: string;
  customer_name?: string;
  status?: string;
  created_at?: string;
  [k: string]: any;
}

interface DeclinedQuote {
  id: string;
  request_number?: string;
  customer_name?: string;
  declined_at?: string;
  [k: string]: any;
}

/* ---------------------------
  Small subcomponents
--------------------------- */
function LoadingState({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="loading-container">
      <div className="spinner" aria-hidden />
      <p className="loading-text">{text}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty">{text}</div>;
}

function ListItem({
  title,
  subtitle,
  right,
  className,
  onClick,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <li className={`order-item ${className || ""}`} onClick={onClick} role="button">
      <div className="order-meta">
        <div className="order-number">{title}</div>
        {subtitle && <div className="muted">{subtitle}</div>}
      </div>
      <div className="order-right">{right}</div>
    </li>
  );
}

/* ---------------------------
  Main Component
--------------------------- */
export default function OrdersPage() {
  const [user, setUser] = useState<any | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [declinedQuotes, setDeclinedQuotes] = useState<DeclinedQuote[]>([]);

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"orders" | "quotes" | "declined">("orders");
  const [selected, setSelected] = useState<any | null>(null);

  const [orderFilter, setOrderFilter] = useState("");
  const [quoteFilter, setQuoteFilter] = useState("");

  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // debounced value

  const [darkMode, setDarkMode] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  /* ---------------------------
    Preserve theme
  --------------------------- */
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
      setDarkMode(false);
    }
  }, []);

  /* ---------------------------
    Debounce search input (300ms)
  --------------------------- */
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  /* ---------------------------
    magic link completion (if used)
  --------------------------- */
  // useEffect(() => {
  //   completeSigninIfLink().catch(() => {
  //     /* ignore */
  //   });
  // }, []);

  /* ---------------------------
    auth change listener
  --------------------------- */
useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (u) => {
    setUser(u);
    if (u) {
      await refresh();
    } else {
      setLoading(false);
    }
  });

  return () => unsub();
}, []);


  /* ---------------------------
    Refresh data (safe, idempotent)
  --------------------------- */
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // orders
      const ordersList = await runFirestoreQuery(
        "orders",
        [],
        { field: "created_at", ascending: false }
      );
      setOrders(Array.isArray(ordersList) ? ordersList as Order[] : []);

      // quote requests
      const quotesList = await runFirestoreQuery(
        "quote_requests",
        [],
        { field: "created_at", ascending: false }
      );
      const safeQuotes = Array.isArray(quotesList) ? (quotesList as Quote[]).filter((q) => q?.status !== "declined") : [];
      setQuotes(safeQuotes);

      // declined quotes
      const declinedList = await runFirestoreQuery(
        "declined_quotes",
        [],
        { field: "declined_at", ascending: false }
      );
      setDeclinedQuotes(Array.isArray(declinedList) ? declinedList as DeclinedQuote[] : []);
    } catch (err) {
      console.error("refresh error:", err);
      showToast("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------------------
    Logout
  --------------------------- */
  const handleLogout = async () => {
    setLoading(true);
    try {
      // await signOutUser();
      await logoutDistributor();
      setUser(null);
      setSelected(null);
      showToast("Logged out");
    } catch (e) {
      console.error("logout error", e);
      showToast("Logout failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
    Update order status
  --------------------------- */
  const updateOrderStatus = async (order: Order, status: string) => {
    try {
      await updateDocById("orders", order.id, {
        status,
        updated_at: new Date().toISOString(),
      });

      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
      if (selected?.id === order.id) setSelected((s: any) => ({ ...s, status }));
      showToast("Order updated");
    } catch (err) {
      console.error(err);
      showToast("Failed to update order");
    }
  };

  /* ---------------------------
    Update quote status
  --------------------------- */
  const updateQuoteStatus = async (quote: Quote, status: string) => {
    try {
      await updateDocById("quote_requests", quote.id, {
        status,
        updated_at: new Date().toISOString(),
      });

      if (status === "declined") {
        setQuotes((prev) => prev.filter((q) => q.id !== quote.id));
        setSelected(null);
        showToast("Quote declined");
        return;
      }

      setQuotes((prev) => prev.map((q) => (q.id === quote.id ? { ...q, status } : q)));
      if (selected?.id === quote.id) setSelected((s: any) => ({ ...s, status }));
      showToast("Quote updated");
    } catch (err) {
      console.error(err);
      showToast("Failed to update quote");
    }
  };

  /* ---------------------------
    Filter & Search (memoized)
  --------------------------- */
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => (orderFilter ? o.status === orderFilter : true))
      .filter((o) => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        const n = (o.order_number || "").toString().toLowerCase();
        const c = (o.customer_name || "").toLowerCase();
        return n.includes(s) || c.includes(s);
      });
  }, [orders, orderFilter, searchTerm]);

  const filteredQuotes = useMemo(() => {
    return quotes
      .filter((q) => (quoteFilter ? q.status === quoteFilter : true))
      .filter((q) => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        const n = (q.request_number || "").toString().toLowerCase();
        const c = (q.customer_name || "").toLowerCase();
        return n.includes(s) || c.includes(s);
      });
  }, [quotes, quoteFilter, searchTerm]);

  /* ---------------------------
    Helpers
  --------------------------- */
  const isOrder = selected && "order_number" in selected;
  const isQuote = selected && "request_number" in selected;

  /* ---------------------------
    Render
  --------------------------- */
  return (
    <div className={`dist-root ${darkMode ? "dark" : ""}`}>
      <header className="dist-header">
        <h1 className="text-lg font-semibold">Distributor Dashboard</h1>

        <div className="header-actions">
          {user ? (
            <>
              <span className="user-email">{user.email}</span>

              <button
                className="btn ghost small"
                onClick={() => {
                  const newMode = !darkMode;
                  setDarkMode(newMode);
                  document.body.classList.toggle("dark", newMode);
                  localStorage.setItem("theme", newMode ? "dark" : "light");
                }}
                aria-label="Toggle theme"
              >
                {darkMode ? "🌙" : "☀️"}
              </button>

              <button className="btn small" onClick={() => refresh()}>
                ⟳ Refresh
              </button>

              <button className="btn small" onClick={handleLogout}>
                ⎋ Logout
              </button>
            </>
          ) : (
            <div className="muted">Sign in to manage orders</div>
          )}
        </div>
      </header>

      <div className="dist-grid">
        <aside className="dist-list">
          <div className="tabs">
            <button
              className={`tab ${tab === "orders" ? "active" : ""}`}
              onClick={() => { setTab("orders"); setSelected(null); }}
            >
              Orders <span className="badge">{orders.length}</span>
            </button>
            <button
              className={`tab ${tab === "quotes" ? "active" : ""}`}
              onClick={() => { setTab("quotes"); setSelected(null); }}
            >
              Quotes <span className="badge">{quotes.length}</span>
            </button>
            <button
              className={`tab ${tab === "declined" ? "active" : ""}`}
              onClick={() => { setTab("declined"); setSelected(null); }}
            >
              Declined <span className="badge">{declinedQuotes.length}</span>
            </button>
          </div>

          <div className="search-box">
            <input
              aria-label="Search orders or quotes"
              type="text"
              placeholder="Search by name or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

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

          <ul>
            {tab === "orders" &&
              (filteredOrders.length ? (
                filteredOrders.map((o) => (
                  <ListItem
                    key={o.id}
                    title={o.order_number || `#${o.id}`}
                    subtitle={o.customer_name}
                    right={
                      <>
                        <div>₹{Number(o.total_amount || 0).toFixed(2)}</div>
                        <div className="muted">{o.status || "—"}</div>
                      </>
                    }
                    onClick={() => setSelected(o)}
                    className={o.status}
                  />
                ))
              ) : (
                <EmptyState text="No orders found" />
              ))}

            {tab === "quotes" &&
              (filteredQuotes.length ? (
                filteredQuotes.map((q) => (
                  <ListItem
                    key={q.id}
                    title={q.request_number || `#${q.id}`}
                    subtitle={q.customer_name}
                    right={<div className="muted">{q.status || "—"}</div>}
                    onClick={() => setSelected(q)}
                    className={q.status}
                  />
                ))
              ) : (
                <EmptyState text="No quotes found" />
              ))}

            {tab === "declined" &&
              (declinedQuotes.length ? (
                declinedQuotes.map((dq) => (
                  <ListItem
                    key={dq.id}
                    title={dq.request_number || `#${dq.id}`}
                    subtitle={dq.customer_name}
                    right={
                      <div className="muted">
                        {dq.declined_at ? new Date(dq.declined_at).toLocaleDateString() : "—"}
                      </div>
                    }
                    onClick={() => setSelected(dq)}
                    className="declined"
                  />
                ))
              ) : (
                <EmptyState text="No declined quotes" />
              ))}
          </ul>
        </aside>

        <main className="dist-main">
          {loading ? (
            <LoadingState />
          ) : !user ? (
            // Keep the magic link small sign in — this calls refresh after sign-in
            <div className="sign-in">
              <h3>Distributor Sign In</h3>
              <p className="muted">Check your email for the magic link or use the login page.</p>
              <button className="btn" onClick={() => refresh()}>
                Try Refresh
              </button>
            </div>
          ) : !selected ? (
            <EmptyState text="Select an item to view details" />
          ) : isOrder ? (
            <OrderDetail order={selected} onUpdateStatus={updateOrderStatus} onClose={() => setSelected(null)} />
          ) : isQuote ? (
            <QuoteDetail quote={selected} onUpdateStatus={updateQuoteStatus} onClose={() => setSelected(null)} />
          ) : (
            <DeclinedQuoteDetail declinedQuote={selected} onClose={() => setSelected(null)} />
          )}
        </main>
      </div>

      {/* toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
