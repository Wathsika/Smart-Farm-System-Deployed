// src/admin/Sidebar.jsx
import React, { useState, useMemo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/** Reusable link */
const SidebarLink = ({ to, icon, children, onNavigate }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex w-full items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? "bg-green-100 text-green-800 font-semibold"
          : "text-gray-700 hover:bg-gray-100"
      }`
    }
    onClick={onNavigate}
  >
    <i className={`${icon} w-5 text-center`} />
    <span>{children}</span>
  </NavLink>
);

/** Section label */
const SectionLabel = ({ children }) => (
  <div className="text-[11px] uppercase tracking-wider text-gray-400 px-3 mb-2 mt-4">
    {children}
  </div>
);

const drawerVariants = {
  hidden: { x: -320, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 280, damping: 28 },
  },
  exit: { x: -320, opacity: 0, transition: { duration: 0.2 } },
};
    

const SidebarInner = ({ location, navigate, closeMobile }) => {
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
  // I will update the logic for isOnCrop to correctly auto-open the accordion
  const isOnCrop = useMemo(() =>
      location.pathname.startsWith("/admin/crop") ||
      location.pathname.startsWith("/admin/fields") ||
      location.pathname.startsWith("/admin/crop/inputs"), // ADDED THIS to keep accordion open on the new page
    [location.pathname]
  );
  const isOnLivestock = useMemo(
    () => location.pathname.startsWith("/admin/livestock"),
    [location.pathname]
  );


  // Accordions
  const [isStoreOpen, setStoreOpen] = useState(isOnStore || false); // store open by default
  const [isFinanceOpen, setFinanceOpen] = useState(isOnFinance || false);
  const [isStaffOpen, setStaffOpen] = useState(isOnStaff || false);
  const [isCropOpen, setCropOpen] = useState(isOnCrop || false);
  const [isLivestockOpen, setLivestockOpen] = useState(isOnLivestock || false);


  const handleStoreClick = () => {
    setStoreOpen((v) => !v);
    navigate("/admin/store/dashboard");
    closeMobile?.();
  };


  const onNavigate = () => closeMobile?.();

  const handleCropClick = () => setCropOpen((v) => !v);

  const handleLivestockClick = () => {
    setLivestockOpen((v) => !v);
    navigate("/admin/livestock");
  };

  return (
    <div className="flex flex-col w-full h-full p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-sm">

          <i className="fas fa-leaf text-white text-xl" />
        </div>
        <div className="font-bold text-lg text-gray-800">Admin Panel</div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-1">

        <SectionLabel>Overview</SectionLabel>
        <SidebarLink to="/admin" icon="fas fa-chart-pie" onNavigate={onNavigate}>
          Dashboard
        </SidebarLink>

        {/* Farm */}
        <SectionLabel>Farm</SectionLabel>

        {/* Livestock accordion */}
        <button
          onClick={handleLivestockClick}
          className="flex w-full items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
        >
          <div className="flex items-center gap-3">
            <i className="fas fa-cow w-5 text-center" />
            <span>Livestock</span>
          </div>
          <motion.i
            animate={{ rotate: isLivestockOpen ? 0 : -90 }}
            className="fas fa-chevron-down text-xs"
          />
        </button>
        <AnimatePresence>
          {isLivestockOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pl-6 space-y-1"
            >
              <SidebarLink
                to="/admin/livestock/profile"
                icon="fas fa-id-card"
                onNavigate={onNavigate}
              >
                Cow Profile
              </SidebarLink>
              <SidebarLink
                to="/admin/livestock/milk"
                icon="fas fa-tint"
                onNavigate={onNavigate}
              >
                Milk Production
              </SidebarLink>
              <SidebarLink
                to="/admin/livestock/health"
                icon="fas fa-heartbeat"
                onNavigate={onNavigate}
              >
                Health Records
              </SidebarLink>
              <SidebarLink
                to="/admin/livestock/breeding"
                icon="fas fa-venus-mars"
                onNavigate={onNavigate}
              >
                Breeding Records
              </SidebarLink>
            </motion.div>
          )}
        </AnimatePresence>


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
<motion.div
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: "auto", opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  className="overflow-hidden pl-6 space-y-1"
>
  <SidebarLink
    to="/admin/crop"
    icon="fas fa-tractor"
    onNavigate={onNavigate}
  >
    Crop List
  </SidebarLink>
  <SidebarLink
    to="/admin/fields"
    icon="fas fa-map-marked-alt"
    onNavigate={onNavigate}
  >
    Farm Fields
  </SidebarLink>
  <SidebarLink
    to="/admin/crop/plans"
    icon="fas fa-clipboard-list"
    onNavigate={onNavigate}
  >
    Plans
  </SidebarLink>
  <SidebarLink
    to="/admin/crop/plan/new"
    icon="fas fa-plus-circle"
    onNavigate={onNavigate}
  > 
 
    Inputs Inventory
  </SidebarLink>
</motion.div>    

            
          )}
        </AnimatePresence>


        {/* Staff accordion */}
        <button
          type="button"
          onClick={() => setStaffOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
          aria-expanded={isStaffOpen}
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
              <SidebarLink to="/admin/users" icon="fas fa-users" onNavigate={onNavigate}>
                Manage Staff
              </SidebarLink>
              <SidebarLink to="/admin/tasks" icon="fas fa-tasks" onNavigate={onNavigate}>
                Task Management
              </SidebarLink>
              <SidebarLink to="/admin/attendance" icon="fas fa-clock" onNavigate={onNavigate}>
                Attendance
              </SidebarLink>
              <SidebarLink to="/admin/leave" icon="fas fa-calendar-check" onNavigate={onNavigate}>
                Leave Requests
              </SidebarLink>

            </motion.div>
          )}
        </AnimatePresence>


        {/* Store accordion */}
        <button
          type="button"
          onClick={handleStoreClick}
          className="flex w-full items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
          aria-expanded={isStoreOpen}
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
                onNavigate={onNavigate}
              >
                Dashboard
              </SidebarLink>
              <SidebarLink
                to="/admin/store/products"
                icon="fas fa-box"
                onNavigate={onNavigate}
              >
                Products
              </SidebarLink>
              <SidebarLink
                to="/admin/store/orders"
                icon="fas fa-shopping-cart"
                onNavigate={onNavigate}
              >
                Orders
              </SidebarLink>
              <SidebarLink
                to="/admin/store/discounts"
                icon="fas fa-tags"
                onNavigate={onNavigate}
              >
                Discounts
              </SidebarLink>
              <SidebarLink
                to="/admin/store/customers"
                icon="fas fa-user-friends"
                onNavigate={onNavigate}
              >
                Customers
              </SidebarLink>
              <SidebarLink
                to="/admin/store/reports"
                icon="fas fa-chart-bar"
                onNavigate={onNavigate}
              >
                Reports
              </SidebarLink>

            </motion.div>
          )}
        </AnimatePresence>


        {/* Finance accordion */}
        <button
          type="button"
          onClick={() => setFinanceOpen((v) => !v)}
          className="flex w/full items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
          aria-expanded={isFinanceOpen}
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
                onNavigate={onNavigate}
              >
                Overview
              </SidebarLink>
              <SidebarLink
                to="/admin/finance/transaction"
                icon="fas fa-receipt"
                onNavigate={onNavigate}
              >
                Transactions
              </SidebarLink>
              <SidebarLink
                to="/admin/finance/new_transaction"
                icon="fas fa-plus-circle"
                onNavigate={onNavigate}
              >
                Add New Transaction
              </SidebarLink>
              <SidebarLink
                to="/admin/finance/payroll_management"
                icon="fas fa-file-invoice-dollar"
                onNavigate={onNavigate}
              >
                Payroll Management
              </SidebarLink>

            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer helper
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile: floating hamburger */}
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-600 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <i className="fas fa-bars" />
      </button>

      {/* Desktop sidebar (sticky left) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 h-screen sticky top-0 border-r border-gray-200 bg-white">
        <SidebarInner location={location} navigate={navigate} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
            />

            {/* Drawer */}
            <motion.aside
              className="fixed z-50 inset-y-0 left-0 w-72 bg-white border-r border-gray-200 shadow-xl"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-label="Sidebar"
            >
              {/* Drawer header with close */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                    <i className="fas fa-leaf text-white" />
                  </div>
                  <span className="font-semibold text-gray-800">Admin Panel</span>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={closeMobile}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                  <i className="fas fa-times" />
                </button>
              </div>

              <SidebarInner
                location={location}
                navigate={navigate}
                closeMobile={closeMobile}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;