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

// LOGIN PAGE
import AuthPage from "./pages/AuthPage";

// FIREBASE
import { auth, db } from "./lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// LAYOUT
import { Outlet, useNavigate } from "react-router-dom";


// ✔ PUBLIC ROUTES → No login required
// ✔ PROTECTED ROUTES → Login required
export default function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // -----------------------------
  // AUTH LISTENER
  // -----------------------------
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setIsLoggedIn(false);
        setAuthLoading(false);
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      setIsLoggedIn(snap.exists());
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  // Show loading during Firebase check
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

          {/* PUBLIC ROUTES */}
          <Route element={<ShopLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
          </Route>

          {/* LOGIN PAGE */}
          <Route
            path="/login"
            element={<AuthPage onLogin={() => setIsLoggedIn(true)} />}
          />

          {/* PROTECTED ROUTES */}
          <Route
            element={
              isLoggedIn ? <ShopLayout /> : <Navigate to="/login" replace />
            }
          >
            <Route path="/quote" element={<QuoteRequestPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>

          {/* CATCH-ALL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}



// -----------------------------------------------------------------------
// SHOP LAYOUT COMPONENT
// -----------------------------------------------------------------------
 
function ShopLayout() {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
 const handleCheckout = () => {
    setIsCartOpen(false);     // Close the Add to Cart Drawer
    navigate("/checkout");    // Redirect to checkout page
  };
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header
        onNavigate={(path) => navigate(path)}
        onCartOpen={() => setIsCartOpen(true)}
      />

      <div className="flex-1">
        <Outlet />
      </div>

      <Footer />

       <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
