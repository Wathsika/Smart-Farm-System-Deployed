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

import UserProfile from "./pages/UserProfile";

import FinanceOverview from "./admin/FinanceOverview";
import FinanceTransaction from "./admin/FinanceTransaction";
import FinanceNewTransaction from "./admin/FinanceNewTransaction";

import CheckoutPage from "./pages/checkout"; // Correct import name
// FIX: The path you had was './pages/store/...', let's assume it's directly in './pages/'
import OrderSuccessPage from "./pages/store/OrderSuccessPage";
import OrderCancelPage from "./pages/store/OrderCancelPage";
import MyOrdersPage from "./pages/MyOrdersPage";

// --- ADMIN PAGES (Lazy Loaded & Direct Imports) ---
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const StoreDashboard = lazy(() => import("./admin/AdminDashboard"));

// Direct import for the admin store management pages

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
        <Route path="attendance" element={<StaffAttendance />} />
        <Route path="leave" element={<LeaveManagement />} />
        <Route path="finance" element={<FinanceDashboard />} />
        <Route path="livestock" element={<LivestockPage />} />
        <Route path="crop" element={<CropPage />} />
        <Route path="revenue" element={<RevenuePage />} />

        {/* --- Nested Store Management Routes --- */}

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


        {/* Finance */}
        <Route path="finance">
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<FinanceOverview />} />
          <Route path="transaction" element={<FinanceTransaction />} />
          <Route path="new_transaction" element={<FinanceNewTransaction />} />
        </Route>
      </Route>

      {/* === 404 FALLBACK ROUTE === */}

      {/* === FALLBACK ROUTE (Catches any unmatched URL) === */}


      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
