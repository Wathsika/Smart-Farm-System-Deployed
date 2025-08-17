import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// --- CONTEXT and HELPERS ---
import { useAuth } from "./context/AuthContext";
import Layout from "./components/common/Layout";

// --- PUBLIC PAGES ---
import Home from "./pages/Home";
import Storefront from "./pages/Storefront";
import AboutUs from "./pages/aboutus";
import ContactUs from "./pages/contactus";
import LoginPage from "./pages/Login"; // As discussed, assuming Login.jsx exports a component named LoginPage

// --- PRIVATE (Authenticated User) PAGES ---
import UserProfilePage from "./pages/UserProfile";
import CheckoutPage from "./pages/checkout";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderSuccessPage from './pages/store/OrderSuccessPage';
import OrderCancelPage from './pages/store/OrderCancelPage';

// --- ADMIN PAGES (add these as you build them) ---
// const AdminLayout = lazy(() => import("./admin/AdminLayout"));


// --- !!! THIS IS THE FIX: DEFINE THE ROUTE GUARDS !!! ---

// This component protects routes that only LOGGED-IN users should see.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Get auth state from our context
  const location = useLocation();

  if (!isAuthenticated) {
    // If the user is not authenticated, redirect them to the login page.
    // We save the location they were trying to access in the `state`.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user is authenticated, render the child components (the protected page).
  return children;
};

// This component protects routes that only LOGGED-OUT users should see (e.g., login/signup).
const PublicOnlyRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        // If the user is already logged in, redirect them away from the login/signup page.
        // The profile page is a sensible default destination.
        return <Navigate to="/profile" replace />;
    }

    // If the user is not authenticated, render the child component (the login/signup page).
    return children;
};


// --- Main App Component ---
export default function App() {
  return (
    <Routes>
      {/* === PUBLIC ROUTES (Wrapped with standard Layout) === */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/store" element={<Storefront />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        
        {/* The Login page uses the PublicOnlyRoute guard to prevent logged-in users from seeing it */}
        <Route path="/login" element={
            <PublicOnlyRoute>
                <LoginPage />
            </PublicOnlyRoute>
        } />
      </Route>


      {/* === PRIVATE / PROTECTED ROUTES (also uses Layout) === */}
      {/* We wrap the entire Layout in the ProtectedRoute guard. */}
      {/* Any route nested inside will now require authentication. */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/checkout" element={<CheckoutPage />} /> 
        <Route path="/order/success" element={<OrderSuccessPage />} />
        <Route path="/order/cancel" element={<OrderCancelPage />} />
      </Route>


      {/* === ADMIN ROUTES (Placeholder) === */}
      {/* Later, you would wrap this in an <AdminOnlyRoute> guard */}
      {/*
      <Route
        path="/admin"
        element={<Suspense fallback={<div>Loading Admin...</div>}><AdminLayout /></Suspense>}
      >
        ...
      </Route>
      */}
      
      {/* === FALLBACK ROUTE === */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}