import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase"; // distributor firebase instance

import OrdersPage from "./pages/OrdersPage";
import AuthPage from "./AuthPage";

// Distributor detail pages (if you still need stand-alone routes)
import OrderDetail from "./pages/OrderDetail";
import QuoteDetail from "./pages/QuoteDetail";
import DeclinedQuoteDetail from "./pages/DeclinedQuoteDetail";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return loggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Distributor Login */}
        <Route path="/login" element={<AuthPage />} />

        {/* Dashboard Home */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        {/* OPTIONAL — If you want standalone detail pages */}
        <Route
          path="/order/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quote/:quoteId"
          element={
            <ProtectedRoute>
              <QuoteDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/declined/:quoteId"
          element={
            <ProtectedRoute>
              <DeclinedQuoteDetail />
            </ProtectedRoute>
          }
        />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
