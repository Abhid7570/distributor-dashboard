import { ShoppingCart, Package, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

type HeaderProps = {
  onCartOpen: () => void;
};

export function Header({ onCartOpen }: HeaderProps) {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setLoggedIn(!!user);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
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
            onClick={() => navigate("/")}
          >
            <Package className="w-10 h-10 text-[#FFB400]" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">ConduitPro</h1>
              <p className="text-xs text-gray-300">Industrial Conduit Solutions</p>
            </div>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:text-[#FFB400] font-medium ${isActive && "text-[#FFB400]"}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `hover:text-[#FFB400] font-medium ${isActive && "text-[#FFB400]"}`
              }
            >
              Products
            </NavLink>

            <NavLink
              to="/quote"
              className={({ isActive }) =>
                `hover:text-[#FFB400] font-medium ${isActive && "text-[#FFB400]"}`
              }
            >
              Request Quote
            </NavLink>

            {/* CART */}
            <button
              onClick={onCartOpen}
              className="relative hover:text-[#FFB400]"
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
                onClick={() => navigate("/login")}
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

          {/* MOBILE MENU ICON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-3 border-t border-gray-700">

            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-[#FFB400]"
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-[#FFB400]"
            >
              Products
            </NavLink>

            <NavLink
              to="/quote"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-[#FFB400]"
            >
              Request Quote
            </NavLink>

            <button
              onClick={() => {
                onCartOpen();
                setMobileMenuOpen(false);
              }}
              className="block py-2 hover:text-[#FFB400]"
            >
              Cart ({cartCount})
            </button>

            {!loggedIn ? (
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className="block py-2 hover:text-[#FFB400]"
              >
                Login
              </button>
            ) : (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block py-2 text-red-400 hover:text-red-500"
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
