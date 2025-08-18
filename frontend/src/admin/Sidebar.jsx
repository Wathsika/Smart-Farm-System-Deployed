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
  const isOnStaff = useMemo(
    () =>
      location.pathname.startsWith("/admin/users") ||
      location.pathname.startsWith("/admin/tasks") ||
      location.pathname.startsWith("/admin/attendance") ||
      location.pathname.startsWith("/admin/leave"),
    [location.pathname]
  );
  const isOnCrop = useMemo(
    () =>
      location.pathname.startsWith("/admin/crop") ||
      location.pathname.startsWith("/admin/fields"),
    [location.pathname]
  );

  // Accordions (Store & Crop open by default as requested)
  const [isStoreOpen, setStoreOpen] = useState(isOnStore || true);
  const [isFinanceOpen, setFinanceOpen] = useState(isOnFinance || false);
  const [isStaffOpen, setStaffOpen] = useState(isOnStaff || false);
  const [isCropOpen, setCropOpen] = useState(isOnCrop || true);

  const handleStoreClick = () => {
    setStoreOpen((v) => !v);
    navigate("/admin/store/dashboard");
  };

  const handleCropClick = () => {
    setCropOpen((v) => !v);

    // navigate("/admin/crop"); // keep current behavior commented out

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

        {/* Farm */}
        <div className="text-xs uppercase tracking-wider text-gray-400 px-3 mb-2 mt-4">
          Farm
        </div>
        <SidebarLink to="/admin/livestock" icon="fas fa-cow">
          Livestock
        </SidebarLink>

        {/* Crop accordion */}
        <button
          type="button"
          onClick={handleCropClick}
          className="flex w-full items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
        >
          <div className="flex items-center gap-3">
            <i className="fas fa-seedling w-5 text-center" />
            <span>Crop</span>
          </div>
          <motion.i
            animate={{ rotate: isCropOpen ? 0 : -90 }}
            className="fas fa-chevron-down text-xs"
          />
        </button>
        <AnimatePresence>
          {isCropOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pl-6 space-y-1"
            >
              <SidebarLink to="/admin/crop" icon="fas fa-tractor">
                Crop List
              </SidebarLink>
              <SidebarLink to="/admin/fields" icon="fas fa-map-marked-alt">
                Farm Fields
              </SidebarLink>

              {/* ⬇️ ADDED: Plans links under Crop */}
              <SidebarLink to="/admin/crop/plans" icon="fas fa-clipboard-list">
                Plans
              </SidebarLink>
              <SidebarLink to="/admin/crop/plan/new" icon="fas fa-plus-circle">
                Add Plan
              </SidebarLink>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Staff accordion */}
        <button
          type="button"
          onClick={() => setStaffOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
        >
          <div className="flex items-center gap-3">
            <i className="fas fa-users-cog w-5 text-center" />
            <span>Staff</span>
          </div>
          <motion.i
            animate={{ rotate: isStaffOpen ? 0 : -90 }}
            className="fas fa-chevron-down text-xs"
          />
        </button>
        <AnimatePresence>
          {isStaffOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pl-6 space-y-1"
            >
              <SidebarLink to="/admin/users" icon="fas fa-users">
                Manage Staff
              </SidebarLink>
              <SidebarLink to="/admin/tasks" icon="fas fa-tasks">
                Task Management
              </SidebarLink>
              <SidebarLink to="/admin/attendance" icon="fas fa-clock">
                Attendance
              </SidebarLink>
              <SidebarLink to="/admin/leave" icon="fas fa-calendar-check">
                Leave Requests
              </SidebarLink>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Store accordion (unchanged) */}
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
              <SidebarLink to="/admin/store/dashboard" icon="fas fa-tachometer-alt">
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
              <SidebarLink to="/admin/store/customers" icon="fas fa-user-friends">
                Customers
              </SidebarLink>
              <SidebarLink to="/admin/store/reports" icon="fas fa-chart-bar">
                Reports
              </SidebarLink>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Finance accordion (unchanged) */}
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
              {/* Matches /admin/finance/overview etc. from App.jsx */}
              <SidebarLink to="/admin/finance/overview" icon="fas fa-chart-line">
                Overview
              </SidebarLink>

              <SidebarLink to="/admin/finance/transaction" icon="fas fa-receipt">
                Transactions
              </SidebarLink>
              <SidebarLink
                to="/admin/finance/new_transaction"
                icon="fas fa-plus-circle"
              >

                Add New Transaction
              </SidebarLink>
              <SidebarLink
                to="/admin/finance/edit_rule"
                icon="fas fa-sliders-h"
              >
                Edit Payroll Rule
              </SidebarLink>
              <SidebarLink
                to="/admin/finance/payroll_management"
                icon="fas fa-file-invoice-dollar"
              >
                Payroll Management
              </SidebarLink>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </aside>
  );
};

export default Sidebar;
