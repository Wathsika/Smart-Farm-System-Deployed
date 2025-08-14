import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/common/Layout";

// --- PUBLIC PAGES ---
import Home from "./pages/Home";
import Storefront from "./pages/Storefront";
import AboutUs from "./pages/aboutus";
import ContactUs from "./pages/contactus";
import UserProfile from "./pages/UserProfile";

import FinanceDashboard from "./admin/FinanceDashboard";
import CheckoutPage from "./pages/checkout"; // Correct import name
// FIX: The path you had was './pages/store/...', let's assume it's directly in './pages/'
import OrderSuccessPage from './pages/store/OrderSuccessPage';
import OrderCancelPage from './pages/store/OrderCancelPage';
import MyOrdersPage from './pages/MyOrdersPage'; 


// --- ADMIN PAGES (Lazy Loaded & Direct Imports) ---
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const StoreDashboard = lazy(() => import("./admin/AdminDashboard"));

// Direct import for the admin store management pages
import AdminProducts from "./pages/store/Products";
import AdminOrders from "./pages/store/Orders";



// --- PLACEHOLDER COMPONENTS ---
// These are fine as they are. They are simple, non-lazy components.
const FarmDashboard = () => <div className="p-6 text-2xl font-bold">Farm Overview Dashboard</div>;
const LivestockPage = () => <div className="p-6 text-2xl font-bold">Livestock Management</div>;
const CropPage = () => <div className="p-6 text-2xl font-bold">Crop Management</div>;
const StaffPage = () => <div className="p-6 text-2xl font-bold">Staff Management</div>;
const RevenuePage = () => <div className="p-6 text-2xl font-bold">Revenue & Financials</div>;
const DiscountsPage = () => <div className="p-6 text-2xl font-bold">Discount Management</div>;
const CustomersPage = () => <div className="p-6 text-2xl font-bold">Customer Management</div>;
const ReportsPage = () => <div className="p-6 text-2xl font-bold">Store Reports</div>;



// --- Main App Component ---
export default function App() {
  return (
    <Routes>
      {/* === PUBLIC ROUTES (Wrapped with standard Header/Footer via Layout) === */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/store" element={<Storefront />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/checkout" element={<CheckoutPage />} /> 
        <Route path="/my-orders" element={<MyOrdersPage />} />
        
        {/* The order completion pages also use the main layout */}
        <Route path="/order/success" element={<OrderSuccessPage />} />
        <Route path="/order/cancel" element={<OrderCancelPage />} />
      </Route>

      
      {/* === ADMIN ROUTES (Wrapped with special AdminLayout) === */}
      <Route
        path="/admin"
        element={
          <Suspense
            fallback={
              <div className="w-full h-screen flex items-center justify-center text-lg">
                Loading Admin...
              </div>
            }
          >
            <AdminLayout />
          </Suspense>
        }
      >
        <Route index element={<FarmDashboard />} />

        <Route path="livestock" element={<LivestockPage />} />
        <Route path="crop" element={<CropPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="revenue" element={<RevenuePage />} />


        {/* --- Nested Store Management Routes --- */}
        <Route path="store/dashboard" element={ <Suspense fallback={<div className="p-6">Loading Dashboard…</div>}><StoreDashboard /></Suspense> } />
        <Route path="store/products" element={<AdminProducts />} />
        <Route path="store/orders" element={<AdminOrders />} />

        <Route path="store/discounts" element={<DiscountsPage />} />
        <Route path="store/customers" element={<CustomersPage />} />
        <Route path="store/reports" element={<ReportsPage />} />
      </Route>


      <Route path="/finance" element={<FinanceDashboard />} />

      {/* === 404 FALLBACK ROUTE === */}

      
      {/* === FALLBACK ROUTE (Catches any unmatched URL) === */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}