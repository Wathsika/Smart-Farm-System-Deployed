import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useCart } from '../../context/CartContext'; // Correctly importing the useCart hook

const navItems = [
  { to: "/", label: "Home", icon: "fa-home" },
  { to: "/store", label: "Store", icon: "fa-store" },
  { to: "/about", label: "About Us", icon: "fa-circle-info" },
  { to: "/contact", label: "Contact", icon: "fa-envelope" },
];

export default function Header() {
  const [isSignedIn, setIsSignedIn] = useState(false); // Using a placeholder for now
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { pathname } = useLocation();
  
  // --- THIS IS THE FIX ---
  // Get the correctly named 'totalItemsInCart' from our Cart Context
  const { totalItemsInCart } = useCart();

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSignIn = () => setIsSignedIn(true);
  const handleSignOut = () => {
    setIsSignedIn(false);
    setShowProfileDropdown(false);
  };

  const linkBase = "relative text-sm font-medium text-gray-700 hover:text-green-700 transition-colors";
  const activeUnderline = "after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:bg-green-600 after:rounded-full";

  return (
    <motion.header
      className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm"
      initial={{ y: -72 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
          <Link to="/" className="inline-flex items-center gap-2 text-lg font-semibold text-gray-900">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-green-600 text-white">
              <i className="fa-solid fa-leaf" />
            </span>
            GreenLeaf Farm
          </Link>
        </motion.div>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${linkBase} ${isActive ? "text-green-700 " + activeUnderline : ""}`}
            >
              {({ isActive }) => (
                <span className="inline-flex items-center gap-2">
                  <i className={`fa-solid ${item.icon} ${isActive ? "text-green-700" : "text-gray-400"}`} />
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}

          {/* Desktop Cart */}
          <Link
            to="/checkout"
            className="relative inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-green-600 hover:bg-green-50 hover:text-green-700"
          >
            <i className="fa-solid fa-basket-shopping" />
            Cart
            <AnimatePresence>
              {totalItemsInCart > 0 && ( // <-- FIX 1: Use totalItemsInCart
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2 -right-2 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-green-600 px-1 text-xs font-semibold text-white"
                >
                  {totalItemsInCart} {/* <-- FIX 2: Use totalItemsInCart */}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Auth Section */}
          {!isSignedIn ? (
            <motion.button
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="fa-solid fa-user text-sm" />
              <span className="hidden sm:inline">Sign In</span>
            </motion.button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                onClick={() => setShowProfileDropdown((v) => !v)}
                className="inline-flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm hover:bg-green-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-haspopup="menu"
                aria-expanded={showProfileDropdown}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-green-600 text-white"><i className="fa-solid fa-user" /></span>
                <span className="hidden sm:block font-medium text-gray-800">John Farmer</span>
                <i className={`fa-solid fa-chevron-down text-xs transition-transform ${showProfileDropdown ? "rotate-180" : ""}`} />
              </motion.button>
              {/* Dropdown would go here */}
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-3 md:hidden">
            {/* ... Other mobile icons can go here ... */}
            <Link to="/checkout" className="relative grid h-10 w-10 place-items-center rounded-lg border">
                <i className="fa-solid fa-basket-shopping"></i>
                {totalItemsInCart > 0 && ( // <-- FIX for mobile
                    <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-green-600 text-xs text-white">
                        {totalItemsInCart} {/* <-- FIX for mobile */}
                    </span>
                )}
            </Link>
            <button
                onClick={() => setShowMobileMenu((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-lg border"
                aria-label="Open menu"
            >
                <i className={`fa-solid ${showMobileMenu ? "fa-xmark" : "fa-bars"}`} />
            </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {navItems.map((item) => (
                <NavLink 
                    key={item.to} 
                    to={item.to} 
                    className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? "bg-green-50 text-green-700" : ""}`}
                >
                    <i className={`fa-solid ${item.icon}`} />
                    {item.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};