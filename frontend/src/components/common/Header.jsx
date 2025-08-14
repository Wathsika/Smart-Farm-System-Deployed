import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from '../../context/CartContext';

const navItems = [
  { to: "/", label: "Home" },
  { to: "/store", label: "Store" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [isSignedIn, setIsSignedIn] = useState(false); // Placeholder for auth state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null); 
  
  const { pathname } = useLocation();
  const { totalItemsInCart } = useCart();

  useEffect(() => {
    // Close menus on route change
    setShowMobileMenu(false);
    setShowProfileDropdown(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Logic to close dropdowns when clicking outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  const linkBaseClasses = "relative text-sm font-medium text-gray-700 hover:text-green-700 transition-colors";
  const activeLinkClasses = "text-green-700 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:bg-green-600 after:rounded-full";

  return (
    <motion.header ref={mobileMenuRef} className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-sm">
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold text-gray-900 flex-shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-green-600 text-white"><i className="fa-solid fa-leaf" /></span>
          <span className="hidden sm:inline">GreenLeaf Farm</span>
        </Link>

        {/* --- THIS IS THE MAIN FIX: Create a central container for nav and actions --- */}
        <div className="hidden md:flex items-center justify-end flex-grow">
          {/* Group 1: Navigation Links */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `${linkBaseClasses} ${isActive ? activeLinkClasses : ""}`}>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Group 2: Separator and Action Buttons */}
          <div className="flex items-center gap-4 ml-8 pl-8 border-l border-gray-200">
            <Link to="/checkout" className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-green-700" aria-label="Cart">
              <i className="fa-solid fa-basket-shopping text-lg" />
              {totalItemsInCart > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-1 -right-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-green-600 px-1 text-xs font-bold text-white">
                  {totalItemsInCart}
                </motion.span>
              )}
            </Link>

            {/* Placeholder Sign In Button */}
            <motion.button 
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700" 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
          </div>
        </div>

        {/* --- Mobile Actions --- */}
        <div className="flex items-center gap-3 md:hidden">
          <Link to="/checkout" className="relative grid h-10 w-10 place-items-center rounded-lg border">
            <i className="fa-solid fa-basket-shopping"></i>
            {totalItemsInCart > 0 && (<span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-green-600 text-xs text-white">{totalItemsInCart}</span>)}
          </Link>
          <button onClick={() => setShowMobileMenu((v) => !v)} className="grid h-10 w-10 place-items-center rounded-lg border" aria-label="Open menu">
            <i className={`fa-solid ${showMobileMenu ? "fa-xmark" : "fa-bars"}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="md:hidden overflow-hidden border-t">
            <div className="flex flex-col gap-1 px-4 py-4">
              {navItems.map((item) => ( 
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-lg ${isActive ? "bg-green-50 text-green-700" : "text-gray-700"}`}>
                  {item.label}
                </NavLink>
              ))}
              {/* Sign In Button for Mobile Menu */}
              <motion.button 
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white" 
                whileTap={{ scale: 0.98 }}
              >
                Sign In
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};