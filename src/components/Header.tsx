import { ShoppingCart, Package, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

type HeaderProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
  onCartOpen: () => void;
};
const clearAllCookies = () => {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;

    document.cookie =
      name +
      "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax";
  }
};

export function Header({ onNavigate, currentPage, onCartOpen }: HeaderProps) {
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);

  // Check login state
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setLoggedIn(!!user);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    clearAllCookies(); 
    window.location.reload();
  };

  return (
    <header className="bg-[#1A2A44] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate("home")}
          >
            <Package className="w-10 h-10 text-[#FFB400]" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">ConduitPro</h1>
              <p className="text-xs text-gray-300">
                Industrial Conduit Solutions
              </p>
            </div>
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center space-x-8">

            <button
              onClick={() => onNavigate("home")}
              className={`hover:text-[#FFB400] transition-colors font-medium ${
                currentPage === "home" ? "text-[#FFB400]" : ""
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate("products")}
              className={`hover:text-[#FFB400] transition-colors font-medium ${
                currentPage === "products" ? "text-[#FFB400]" : ""
              }`}
            >
              Products
            </button>

            <button
              onClick={() => onNavigate("quote")}
              className={`hover:text-[#FFB400] transition-colors font-medium ${
                currentPage === "quote" ? "text-[#FFB400]" : ""
              }`}
            >
              Request Quote
            </button>

            {/* CART ICON */}
            <button
              onClick={onCartOpen}
              className="relative hover:text-[#FFB400] transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FFB400] text-[#1A2A44] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* LOGIN / LOGOUT */}
            {!loggedIn ? (
              <button
                onClick={() => onNavigate("auth")}
                className="px-4 py-2 bg-[#FFB400] text-[#1A2A44] rounded-lg font-semibold hover:bg-[#ffc933]"
              >
                Login
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileMenuOpen((p) => !p)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* MOBILE MENU PANEL */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-3 border-t border-gray-700">
            <button
              onClick={() => {
                onNavigate("home");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-[#FFB400]"
            >
              Home
            </button>

            <button
              onClick={() => {
                onNavigate("products");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-[#FFB400]"
            >
              Products
            </button>

            <button
              onClick={() => {
                onNavigate("quote");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-[#FFB400]"
            >
              Request Quote
            </button>

            {/* CART */}
            <button
              onClick={() => {
                onCartOpen();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-[#FFB400]"
            >
              Cart ({cartCount})
            </button>

            {/* LOGIN / LOGOUT MOBILE */}
            {!loggedIn ? (
              <button
                onClick={() => {
                  onNavigate("auth");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 hover:text-[#FFB400]"
              >
                Login
              </button>
            ) : (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-red-400 hover:text-red-500"
              >
                Logout
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
