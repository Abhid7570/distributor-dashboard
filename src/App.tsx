import { useEffect, useState } from "react";

import { CartProvider } from "./context/CartContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";

import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { QuoteRequestPage } from "./pages/QuoteRequestPage";
import { CheckoutPage } from "./pages/CheckoutPage";

// NEW AUTH PAGE (You created earlier)
import AuthPage from "./pages/AuthPage";

// FIREBASE
import { auth, db } from "./lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// DISTRIBUTOR DASHBOARD
import DistributorDashboard from "../distributor/OrdersPage";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // AUTH STATES
  const [authLoading, setAuthLoading] = useState(true);
  const [role, setRole] = useState<"client" | "distributor" | null>(null);

  // -------------------------------
  // AUTH LISTENER (runs once)
  // -------------------------------
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setRole(null);
        setAuthLoading(false);
        return;
      }

      // Fetch role from Firestore
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        setRole(snap.data().role); // client OR distributor
      } else {
        setRole("client"); // fallback
      }

      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  // -------------------------------
  // NAVIGATION HANDLER
  // -------------------------------
  const handleNavigate = (page: string, productId?: string) => {
    setCurrentPage(page);
    if (productId) setSelectedProductId(productId);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setCurrentPage("checkout");
  };

  // -------------------------------
  // AUTH CHECKS
  // -------------------------------

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  // NOT LOGGED IN → show login/signup page
  if (!role) {
    return <AuthPage onLogin={() => window.location.reload()} />;
  }

  // LOGGED IN AS DISTRIBUTOR → redirect to distributor dashboard
  if (role === "distributor") {
    return <DistributorDashboard />;
  }

  // -------------------------------------
  // LOGGED IN AS CLIENT → show full shop
  // -------------------------------------
  return (
    <CartProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <Header
          onNavigate={handleNavigate}
          currentPage={currentPage}
          onCartOpen={() => setIsCartOpen(true)}
        />

        {currentPage === "home" && <HomePage onNavigate={handleNavigate} />}
        {currentPage === "products" && (
          <ProductsPage onNavigate={handleNavigate} />
        )}
        {currentPage === "product" && (
          <ProductDetailPage
            productId={selectedProductId}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === "quote" && (
          <QuoteRequestPage onNavigate={handleNavigate} />
        )}
        {currentPage === "checkout" && (
          <CheckoutPage onNavigate={handleNavigate} />
        )}

        <Footer />

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleCheckout}
        />
      </div>
    </CartProvider>
  );
}

export default App;
