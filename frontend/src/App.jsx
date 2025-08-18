// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { auth } from "./lib/auth";
import Layout from "./components/common/Layout";

// --- PUBLIC PAGES ---
import Home from "./pages/Home";
import Storefront from "./pages/Storefront";
import AboutUs from "./pages/AboutUs"; // <-- match file casing
import ContactUs from "./pages/ContactUs"; // <-- match file casing
import UserProfile from "./pages/UserProfile";
import CheckoutPage from "./pages/checkout";
import OrderSuccessPage from "./pages/store/OrderSuccessPage";
import OrderCancelPage from "./pages/store/OrderCancelPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import Login from "./pages/Login";

// --- FINANCE (admin) ---
import FinanceOverview from "./admin/FinanceOverview";
import FinanceTransaction from "./admin/FinanceTransaction";
import FinanceNewTransaction from "./admin/FinanceNewTransaction";
import FinancePayrollManagement from "./admin/FinancePayrollManagement";
import FinanceEditPayrollRule from "./admin/FinanceEditPayrollRule";

// --- ADMIN (lazy) ---
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const StoreDashboard = lazy(() => import("./admin/AdminDashboard"));

// --- STORE MGMT ---
import AdminProducts from "./pages/store/Products";
import AdminOrders from "./pages/store/Orders";

// --- MISSING PAGES (temporary placeholders so app runs) ---
const EmployeeDashboard = () => <div className="p-6">Employee Dashboard</div>;
const AdminUsers = () => <div className="p-6">Admin Users</div>;
const StaffAttendance = () => <div className="p-6">Staff Attendance</div>;
const LeaveManagement = () => <div className="p-6">Leave Management</div>;

// --- PLACEHOLDERS you already had ---
const FarmDashboard = () => (
  <div className="p-6 text-2xl font-bold">Farm Overview Dashboard</div>
);
const LivestockPage = () => (
  <div className="p-6 text-2xl font-bold">Livestock Management</div>
);
const CropPage = () => (
  <div className="p-6 text-2xl font-bold">Crop Management</div>
);
const RevenuePage = () => (
  <div className="p-6 text-2xl font-bold">Revenue & Financials</div>
);
const DiscountsPage = () => (
  <div className="p-6 text-2xl font-bold">Discount Management</div>
);
const CustomersPage = () => (
  <div className="p-6 text-2xl font-bold">Customer Management</div>
);
const ReportsPage = () => (
  <div className="p-6 text-2xl font-bold">Store Reports</div>
);

// --- GUARDS ---
const Private = ({ children }) =>
  auth.token ? children : <Navigate to="/login" replace />;
const AdminOnly = ({ children }) =>
  auth.user?.role === "Admin" ? children : <Navigate to="/" replace />;
const EmployeeOnly = ({ children }) =>
  auth.user?.role === "Employee" ? children : <Navigate to="/" replace />;

export default function App() {
  return (
    <Routes>
      {/* PUBLIC (with Layout) */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/store" element={<Storefront />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        {/* Use your order pages (they were imported but unused) */}
        <Route path="/order/success" element={<OrderSuccessPage />} />
        <Route path="/order/cancel" element={<OrderCancelPage />} />
      </Route>

      {/* STANDALONE */}
      <Route path="/login" element={<Login />} />

      {/* AUTHENTICATED USER */}
      <Route
        path="/profile"
        element={
          <Private>
            <UserProfile />
          </Private>
        }
      />
      <Route
        path="/checkout"
        element={
          <Private>
            <CheckoutPage />
          </Private>
        }
      />
      <Route
        path="/my-orders"
        element={
          <Private>
            <MyOrdersPage />
          </Private>
        }
      />

      {/* EMPLOYEE */}
      <Route
        path="/dashboard"
        element={
          <EmployeeOnly>
            <EmployeeDashboard />
          </EmployeeOnly>
        }
      />

      {/* ADMIN (lazy + Suspense) */}
      <Route
        path="/admin"
        element={
          <AdminOnly>
            <Suspense
              fallback={
                <div className="w-full h-screen flex items-center justify-center text-lg">
                  Loading Admin…
                </div>
              }
            >
              <AdminLayout />
            </Suspense>
          </AdminOnly>
        }
      >
        <Route index element={<FarmDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="attendance" element={<StaffAttendance />} />
        <Route path="leave" element={<LeaveManagement />} />
        <Route path="livestock" element={<LivestockPage />} />
        <Route path="crop" element={<CropPage />} />
        <Route path="revenue" element={<RevenuePage />} />

        {/* Store */}
        <Route
          path="store/dashboard"
          element={
            <Suspense fallback={<div className="p-6">Loading Dashboard…</div>}>
              <StoreDashboard />
            </Suspense>
          }
        />
        <Route path="store/products" element={<AdminProducts />} />
        <Route path="store/orders" element={<AdminOrders />} />
        <Route path="store/discounts" element={<DiscountsPage />} />
        <Route path="store/customers" element={<CustomersPage />} />
        <Route path="store/reports" element={<ReportsPage />} />

        {/* Finance (nested) */}
        <Route path="finance">
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<FinanceOverview />} />
          <Route path="transaction" element={<FinanceTransaction />} />
          <Route path="new_transaction" element={<FinanceNewTransaction />} />
          <Route path="edit_rule" element={<FinanceEditPayrollRule />} />
          <Route
            path="payroll_management"
            element={<FinancePayrollManagement />}
          />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
