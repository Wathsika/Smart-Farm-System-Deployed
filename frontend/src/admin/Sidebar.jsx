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

  // This logic is all correct and untouched.
  const isOnStore = useMemo(() => location.pathname.startsWith("/admin/store"), [location.pathname]);
  const isOnFinance = useMemo(() => location.pathname.startsWith("/admin/finance"), [location.pathname]);
  const isOnStaff = useMemo(() =>
      location.pathname.startsWith("/admin/users") ||
      location.pathname.startsWith("/admin/tasks") ||
      location.pathname.startsWith("/admin/attendance") ||
      location.pathname.startsWith("/admin/leave"),
    [location.pathname]
  );
  // I will update the logic for isOnCrop to correctly auto-open the accordion
  const isOnCrop = useMemo(() =>
      location.pathname.startsWith("/admin/crop") ||
      location.pathname.startsWith("/admin/fields") ||
      location.pathname.startsWith("/admin/crop/inputs"), // ADDED THIS to keep accordion open on the new page
    [location.pathname]
  );

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
  };

  return (
    <aside className="flex flex-col w-64 border-r border-gray-200 p-4 bg-white">
      {/* Header (No change) */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
          <i className="fas fa-leaf text-white text-xl" />
        </div>
        <div className="font-bold text-xl text-gray-800">Admin Panel</div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-1">
        <div className="text-xs uppercase tracking-wider text-gray-400 px-3 mb-2 mt-4">Overview</div>
        <SidebarLink to="/admin" icon="fas fa-chart-pie">Dashboard</SidebarLink>

        {/* Farm */}
        <div className="text-xs uppercase tracking-wider text-gray-400 px-3 mb-2 mt-4">Farm</div>
        <SidebarLink to="/admin/livestock" icon="fas fa-cow">Livestock</SidebarLink>

        {/* --- CROP ACCORDION --- */}
        <button type="button" onClick={handleCropClick} className="flex w-full items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
          <div className="flex items-center gap-3">
            <i className="fas fa-seedling w-5 text-center" />
            <span>Crop</span>
          </div>
          <motion.i animate={{ rotate: isCropOpen ? 0 : -90 }} className="fas fa-chevron-down text-xs"/>
        </button>
        <AnimatePresence>
          {isCropOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-6 space-y-1">
              <SidebarLink to="/admin/crop" icon="fas fa-tractor">Crop List</SidebarLink>
              <SidebarLink to="/admin/fields" icon="fas fa-map-marked-alt">Farm Fields</SidebarLink>
              <SidebarLink to="/admin/crop/plans" icon="fas fa-clipboard-list">Plans</SidebarLink>

              {/* === THIS IS THE ONLY ADDED LINK as requested === */}
              {/* This link now logically sits under the Crop section. */}
              <SidebarLink to="/admin/crop/inputs" icon="fas fa-vial">Inputs Inventory</SidebarLink>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Staff accordion (No Change) */}
        <button type="button" onClick={() => setStaffOpen((v) => !v)} /* ... no changes ... */ >
          {/* ... */}
        </button>
        <AnimatePresence>
          {isStaffOpen && (
            <motion.div /* ... no changes ... */ >
              {/* ... All Staff links ... */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Store accordion (No Change - the inputs link is not here) */}
        <button type="button" onClick={handleStoreClick} /* ... no changes ... */ >
          {/* ... */}
        </button>
        <AnimatePresence initial={false}>
          {isStoreOpen && (
            <motion.div key="store-sub" /* ... no changes ... */ >
              <SidebarLink to="/admin/store/dashboard" icon="fas fa-tachometer-alt">Dashboard</SidebarLink>
              <SidebarLink to="/admin/store/products" icon="fas fa-box">Products</SidebarLink>
              {/* The Farm Inputs link was NOT here and has NOT been added here. */}
              <SidebarLink to="/admin/store/orders" icon="fas fa-shopping-cart">Orders</SidebarLink>
              <SidebarLink to="/admin/store/discounts" icon="fas fa-tags">Discounts</SidebarLink>
              <SidebarLink to="/admin/store/customers" icon="fas fa-user-friends">Customers</SidebarLink>
              <SidebarLink to="/admin/store/reports" icon="fas fa-chart-bar">Reports</SidebarLink>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Finance accordion (No Change) */}
        <button type="button" onClick={() => setFinanceOpen((v) => !v)} /* ... no changes ... */>
           {/* ... */}
        </button>
        <AnimatePresence initial={false}>
          {isFinanceOpen && (
            <motion.div key="finance-sub" /* ... no changes ... */>
               {/* ... All Finance links ... */}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </aside>
  );
};

export default Sidebar;