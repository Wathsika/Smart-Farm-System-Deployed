// src/App.jsx

import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// --- HELPERS & LAYOUTS ---
import { auth } from "./lib/auth";
import Layout from "./components/common/Layout"; // Public pages වලට header/footer දෙන Layout එක

// --- PUBLIC PAGES ---
import Home from "./pages/Home";
import Storefront from "./pages/Storefront";
import AboutUs from "./pages/aboutus";
import ContactUs from "./pages/contactus";

// --- USER-SPECIFIC PAGES (LOGGED IN USERS) ---
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import MyOrdersPage from './pages/MyOrdersPage';
import CheckoutPage from "./pages/checkout";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";

// --- ADMIN PAGES ---
// Admin pages ටික කෙලින්ම import කරගමු, lazy loading වලින් එන complexity එකක් නැතුව
import AdminLayout from "./admin/AdminLayout";
import AdminUsers from "./pages/AdminUsers";
import StaffAttendance from "./admin/StaffAttendance";
import LeaveManagement from "./admin/LeaveManagement";
import TaskManagement from "./admin/TaskManagement";
import StoreDashboard from "./admin/StoreDashboard";
import AdminProducts from "./pages/store/Products";
import AdminOrders from "./pages/store/Orders";
import FinanceDashboard from "./admin/FinanceDashboard";

// --- PLACEHOLDER COMPONENTS (මේවා ඔයාට පස්සේ හදන්න පුළුවන්) ---
const FarmDashboard = () => <div className="p-6 text-2xl font-bold">Farm Overview Dashboard</div>;
const LivestockPage = () => <div className="p-6 text-2xl font-bold">Livestock Management</div>;
const CropPage = () => <div className="p-6 text-2xl font-bold">Crop Management</div>;
const RevenuePage = () => <div className="p-6 text-2xl font-bold">Revenue & Financials</div>;
const DiscountsPage = () => <div className="p-6 text-2xl font-bold">Discount Management</div>;
const CustomersPage = () => <div className="p-6 text-2xl font-bold">Customer Management</div>;
const ReportsPage = () => <div className="p-6 text-2xl font-bold">Store Reports</div>;


// --- ROUTE GUARDS (ආරක්ෂක components) ---
const Private = ({ children }) => (auth.token ? children : <Navigate to="/login" replace />);
const AdminOnly = ({ children }) => (auth.user?.role === 'Admin' ? children : <Navigate to="/" replace />);
const EmployeeOnly = ({ children }) => (auth.user?.role === 'Employee' ? children : <Navigate to="/" replace />);


// --- MAIN APP COMPONENT ---
export default function App() {
  return (
    <Routes>
      {/* ================================================================== */}
      {/* 1. PUBLIC ROUTES (Header/Footer එක්ක පේන පිටු)                 */}
      {/* ================================================================== */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/store" element={<Storefront />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
      </Route>

      {/* ================================================================== */}
      {/* 2. STANDALONE ROUTES (Layout එකක් නැති, වෙනම පේන පිටු)          */}
      {/* ================================================================== */}
      <Route path="/login" element={<Login />} />

      {/* ================================================================== */}
      {/* 3. LOGGED-IN USER ROUTES (Login වෙච්ච ඕනම කෙනෙක්ට)            */}
      {/* ================================================================== */}
      <Route path="/profile" element={<Private><UserProfile /></Private>} />
      <Route path="/checkout" element={<Private><CheckoutPage /></Private>} />
      <Route path="/my-orders" element={<Private><MyOrdersPage /></Private>} />
      
      {/* ================================================================== */}
      {/* 4. EMPLOYEE-ONLY DASHBOARD                                     */}
      {/* ================================================================== */}
      <Route path="/dashboard" element={<EmployeeOnly><EmployeeDashboard /></EmployeeOnly>} />

      {/* ================================================================== */}
      {/* 5. ADMIN-ONLY ROUTES (Adminට විතරක් පේන පිටු)                  */}
      {/* ================================================================== */}
      <Route
        path="/admin"
        element={<AdminOnly><AdminLayout /></AdminOnly>}
      >
        <Route index element={<FarmDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="tasks" element={<TaskManagement />} />
        <Route path="attendance" element={<StaffAttendance />} />
        <Route path="leave" element={<LeaveManagement />} />
        <Route path="finance" element={<FinanceDashboard />} />
        <Route path="livestock" element={<LivestockPage />} />
        <Route path="crop" element={<CropPage />} />
        <Route path="revenue" element={<RevenuePage />} />

        {/* --- Nested Store Management Routes --- */}
        <Route path="store/dashboard" element={<StoreDashboard />} />
        <Route path="store/products" element={<AdminProducts />} />
        <Route path="store/orders" element={<AdminOrders />} />
        <Route path="store/discounts" element={<DiscountsPage />} />
        <Route path="store/customers" element={<CustomersPage />} />
        <Route path="store/reports" element={<ReportsPage />} />
      </Route>
      
      {/* ================================================================== */}
      {/* 6. 404 FALLBACK ROUTE (ගැලපෙන path එකක් නැත්නම් Home එකට යවන්න) */}
      {/* ================================================================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}