// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/common/Layout";

// --- PUBLIC PAGES ---
import Home from "./pages/Home";
import AboutUs from "./pages/aboutus";
import ContactUs from "./pages/contactus";
import UserProfile from "./pages/UserProfile";
import Checkout from "./pages/checkout";
import Storefront from "./pages/Storefront";

// ✅ ADD THESE
import Login from "./pages/Login";
import AdminUsers from "./pages/AdminUsers";
import { auth } from "./lib/auth";

import StaffAttendance from "./admin/StaffAttendance";
import LeaveManagement from "./admin/LeaveManagement";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";

// --- ADMIN PAGES (Lazy Loaded) ---
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const StoreDashboard = lazy(() => import("./admin/AdminDashboard"));

// --- PLACEHOLDERS ---
const FarmDashboard = () => <div className="p-6 text-2xl font-bold">Farm Overview Dashboard</div>;
const LivestockPage = () => <div className="p-6 text-2xl font-bold">Livestock Management</div>;
const CropPage = () => <div className="p-6 text-2xl font-bold">Crop Management</div>;
const StaffPage = () => <div className="p-6 text-2xl font-bold">Staff Management</div>;
const RevenuePage = () => <div className="p-6 text-2xl font-bold">Revenue & Financials</div>;
const OrdersPage = () => <div className="p-6 text-2xl font-bold">Order Management</div>;
const DiscountsPage = () => <div className="p-6 text-2xl font-bold">Discount Management</div>;
const CustomersPage = () => <div className="p-6 text-2xl font-bold">Customer Management</div>;
const ReportsPage = () => <div className="p-6 text-2xl font-bold">Store Reports</div>;
// ✅ Placeholder for the missing component
const AdminProducts = () => <div className="p-6 text-2xl font-bold">Product Management</div>;


// ✅ simple guard
const Private = ({ children }) => (auth.token ? children : <Navigate to="/login" replace />);

export default function App() {
  return (
    <Routes>
      {/* Public site (header/footer via Layout) */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/store" element={<Storefront />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
         {/* Employee Dashboard Route */}
      <Route path="/dashboard" element={<Private><EmployeeDashboard /></Private>} />
       
      </Route>

      {/* Admin area */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={<div className="w-full h-screen flex items-center justify-center text-lg">Loading Admin...</div>}>
            <AdminLayout />
          </Suspense>
        }
      >
        <Route index element={<Private><FarmDashboard /></Private>} />
        <Route path="livestock" element={<Private><LivestockPage /></Private>} />
        <Route path="crop" element={<Private><CropPage /></Private>} />
        <Route path="staff" element={<Private><StaffPage /></Private>} />
        <Route path="revenue" element={<Private><RevenuePage /></Private>} />
        <Route path="attendance" element={<StaffAttendance />} />
         <Route path="leave" element={<Private><LeaveManagement /></Private>} />
        <Route
          path="store/dashboard"
          element={
            <Private>
              <Suspense fallback={<div className="p-6">Loading Store Dashboard…</div>}>
                <StoreDashboard />
              </Suspense>
            </Private>
          }
        />
        {/* ✅ CORRECTED: Use the placeholder AdminProducts component */}
        <Route path="store/products" element={<Private><AdminProducts /></Private>} />

        <Route path="users" element={<Private><AdminUsers /></Private>} />

        <Route path="store/orders" element={<Private><OrdersPage /></Private>} />
        <Route path="store/discounts" element={<Private><DiscountsPage /></Private>} />
        <Route path="store/customers" element={<Private><CustomersPage /></Private>} />
        <Route path="store/reports" element={<Private><ReportsPage /></Private>} />
      </Route>

      {/* 404 → home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}