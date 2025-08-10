import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "@fortawesome/fontawesome-free/css/all.min.css";

const navItems = [
  { to: "/", label: "Home", icon: "fa-home" },
  { to: "/store", label: "Store", icon: "fa-store" },
  { to: "/about", label: "About Us", icon: "fa-circle-info" },
  { to: "/contact", label: "Contact", icon: "fa-envelope" },
];

const Header = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { pathname } = useLocation();

  // Close menus on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowProfileDropdown(false);
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
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

  const linkBase =
    "relative text-sm font-medium text-gray-700 hover:text-green-700 transition-colors";
  const activeUnderline =
    "after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:bg-green-600 after:rounded-full";

  return (
    <motion.header
      className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
      initial={{ y: -72 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-lg font-semibold text-gray-900"
          >
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
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "text-green-700 " + activeUnderline : ""}`
              }
            >
              {({ isActive }) => (
                <span className="inline-flex items-center gap-2">
                  <i
                    className={`fa-solid ${item.icon} ${
                      isActive ? "text-green-700" : "text-gray-400"
                    }`}
                  />
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}

          {/* Cart */}
          <button
            className="relative inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:border-green-600 hover:text-green-700"
            onClick={() => alert("Cart coming soon")}
          >
            <i className="fa-solid fa-basket-shopping" />
            Cart
            <span className="absolute -top-2 -right-2 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-green-600 px-1 text-xs text-white">
              0
            </span>
          </button>

          {/* Auth */}
          {!isSignedIn ? (
            <motion.button
              onClick={handleSignIn}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <i className="fa-solid fa-right-to-bracket" />
              Sign In
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
                <span className="grid h-8 w-8 place-items-center rounded-full bg-green-600 text-white">
                  <i className="fa-solid fa-user" />
                </span>
                <span className="hidden sm:block font-medium text-gray-800">
                  John Farmer
                </span>
                <i
                  className={`fa-solid fa-chevron-down text-xs transition-transform ${
                    showProfileDropdown ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border bg-white shadow-xl"
                    role="menu"
                  >
                    <div className="border-b bg-white/80 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-green-600 text-white">
                          <i className="fa-solid fa-user" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            John Farmer
                          </p>
                          <p className="text-xs text-gray-500">
                            john.farmer@email.com
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <DropdownLink to="/profile" icon="fa-user-circle" label="My Profile" />
                      <DropdownLink to="/orders" icon="fa-bag-shopping" label="My Orders" />
                      <DropdownLink to="/settings" icon="fa-gear" label="Settings" />
                      <div className="my-1 border-t" />
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50"
                      >
                        <i className="fa-solid fa-right-from-bracket" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-3 md:hidden">
          {!isSignedIn ? (
            <button
              onClick={handleSignIn}
              className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
            >
              <i className="fa-solid fa-right-to-bracket" /> <span className="ml-1">Sign In</span>
            </button>
          ) : (
            <button
              onClick={() => setShowProfileDropdown((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full bg-green-600 text-white"
              aria-label="Account menu"
            >
              <i className="fa-solid fa-user" />
            </button>
          )}

          <button
            onClick={() => setShowMobileMenu((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg border"
            aria-label="Open menu"
          >
            <i className={`fa-solid ${showMobileMenu ? "fa-xmark" : "fa-bars"}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence initial={false}>
        {showMobileMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t"
          >
            <div className="space-y-1 px-4 py-4">
              {navItems.map((item) => (
                <MobileLink
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => setShowMobileMenu(false)}
                  active={pathname === item.to}
                />
              ))}

              {/* Mobile cart */}
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  alert("Cart coming soon");
                }}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:border-green-600 hover:text-green-700"
              >
                <i className="fa-solid fa-basket-shopping" />
                Cart
                <span className="ml-2 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-green-600 px-1 text-xs text-white">
                  0
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

function DropdownLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
      role="menuitem"
    >
      <i className={`fa-solid ${icon} text-green-600`} />
      {label}
    </Link>
  );
}

function MobileLink({ to, icon, label, onClick, active }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`block rounded-xl px-4 py-2 text-sm transition-colors ${
        active
          ? "bg-green-50 text-green-700"
          : "text-gray-700 hover:bg-green-50 hover:text-green-700"
      }`}
    >
      <span className="inline-flex items-center gap-2">
        <i className={`fa-solid ${icon}`} />
        {label}
      </span>
    </NavLink>
  );
}

export default Header;
