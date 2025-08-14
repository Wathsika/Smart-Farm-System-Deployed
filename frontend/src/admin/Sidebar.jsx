// src/admin/Sidebar.jsx
import React, { useState, useMemo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const SidebarLink = ({ to, icon, children }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex w-full items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${
        isActive ? "bg-green-100 text-green-800 font-semibold" : "text-gray-700"
      }`
    }
  >
    <i className={`${icon} w-5 text-center`} />
    <span>{children}</span>
  </NavLink>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-open accordions based on current route
  const isOnStore = useMemo(
    () => location.pathname.startsWith("/admin/store"),
    [location.pathname]
  );
  const isOnFinance = useMemo(
    () => location.pathname.startsWith("/admin/finance"),
    [location.pathname]
  );

  const [isStoreOpen, setStoreOpen] = useState(isOnStore || true); // default open
  const [isFinanceOpen, setFinanceOpen] = useState(isOnFinance || false);

  const handleStoreClick = () => {
    setStoreOpen((v) => !v);
    navigate("/admin/store/dashboard");
  };

  return (
    <aside className="flex flex-col w-64 border-r border-gray-200 p-4 bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
          <i className="fas fa-leaf text-white text-xl" />
        </div>
        <div className="font-bold text-xl text-gray-800">Admin Panel</div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-1">
        <div className="text-xs uppercase tracking-wider text-gray-400 px-3 mb-2 mt-4">
          Overview
        </div>
        <SidebarLink to="/admin" icon="fas fa-chart-pie">
          Dashboard
        </SidebarLink>

        <div className="text-xs uppercase tracking-wider text-gray-400 px-3 mb-2 mt-4">
          Farm
        </div>
        <SidebarLink to="/admin/livestock" icon="fas fa-cow">
          Livestock
        </SidebarLink>
        <SidebarLink to="/admin/crop" icon="fas fa-seedling">
          Crop
        </SidebarLink>
        <SidebarLink to="/admin/staff" icon="fas fa-users-cog">
          Staff
        </SidebarLink>

        {/* Store */}
        <button
          type="button"
          onClick={handleStoreClick}
          className="flex w-full items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
        >
          <div className="flex items-center gap-3">
            <i className="fas fa-store w-5 text-center" />
            <span>Store</span>
          </div>
          <motion.i
            animate={{ rotate: isStoreOpen ? 0 : -90 }}
            className="fas fa-chevron-down text-xs"
          />
        </button>

        <AnimatePresence initial={false}>
          {isStoreOpen && (
            <motion.div
              key="store-sub"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pl-6 space-y-1"
            >
              <SidebarLink
                to="/admin/store/dashboard"
                icon="fas fa-tachometer-alt"
              >
                Dashboard
              </SidebarLink>
              <SidebarLink to="/admin/store/products" icon="fas fa-box">
                Products
              </SidebarLink>
              <SidebarLink to="/admin/store/orders" icon="fas fa-shopping-cart">
                Orders
              </SidebarLink>
              <SidebarLink to="/admin/store/discounts" icon="fas fa-tags">
                Discounts
              </SidebarLink>
              <SidebarLink
                to="/admin/store/customers"
                icon="fas fa-user-friends"
              >
                Customers
              </SidebarLink>
              <SidebarLink to="/admin/store/reports" icon="fas fa-chart-bar">
                Reports
              </SidebarLink>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Finance */}
        <button
          type="button"
          onClick={() => setFinanceOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
        >
          <div className="flex items-center gap-3">
            <i className="fas fa-coins w-5 text-center" />
            <span>Finance</span>
          </div>
          <motion.i
            animate={{ rotate: isFinanceOpen ? 0 : -90 }}
            className="fas fa-chevron-down text-xs"
          />
        </button>

        <AnimatePresence initial={false}>
          {isFinanceOpen && (
            <motion.div
              key="finance-sub"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pl-6 space-y-1"
            >
              <SidebarLink
                to="/admin/finance/overview"
                icon="fas fa-chart-line"
              >
                Overview
              </SidebarLink>
              <SidebarLink
                to="/admin/finance/transaction"
                icon="fas fa-receipt"
              >
                Transaction
              </SidebarLink>
              <SidebarLink
                to="/admin/finance/new_transaction"
                icon="fas fa-plus-circle"
              >
                Add New Transaction
              </SidebarLink>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </aside>
  );
};

export default Sidebar;
