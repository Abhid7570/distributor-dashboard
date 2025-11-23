import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { CartProvider } from "./context/CartContext";

// SHOP PAGES
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";

import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { QuoteRequestPage } from "./pages/QuoteRequestPage";
import { CheckoutPage } from "./pages/CheckoutPage";

// LOGIN
import AuthPage from "./pages/AuthPage";

// FIREBASE
import { auth, db } from "./lib/firebase";
import { doc, getDoc } from "firebase/firestore";


// -----------------------------------------------------------------------
// APP COMPONENT (CLIENT ONLY — distributor removed)
// -----------------------------------------------------------------------
export default function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // -----------------------------
  // AUTH LISTENER – Detect user
  // -----------------------------
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setIsLoggedIn(false);
        setAuthLoading(false);
        return;
      }

      // Check if user record exists (optional)
      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(true); // default allow
      }

      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  // Loading UI while Firebase checks user
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <CartProvider>
        <Routes>

          {/* LOGIN PAGE */}
         <Route
  path="/login"
  element={<AuthPage onLogin={() => setIsLoggedIn(true)} />}
/>


          {/* STORE – only when logged in */}
          <Route
            path="/"
            element={
              isLoggedIn ? <ShopLayout /> : <Navigate to="/login" replace />
            }
          >
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="quote" element={<QuoteRequestPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
          </Route>

          {/* ANY UNKNOWN ROUTE */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}



// -----------------------------------------------------------------------
// SHOP LAYOUT COMPONENT
// -----------------------------------------------------------------------
import { Outlet, useNavigate } from "react-router-dom";


function ShopLayout() {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header
        onNavigate={(path) => navigate(path)}
        onCartOpen={() => setIsCartOpen(true)}
      />

      <div className="flex-1">
        <Outlet /> {/* Middle page content */}
      </div>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => navigate("/checkout")}
      />
    </div>
  );
}
