// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { auth } from "./lib/auth";
import Layout from "./components/common/Layout";

// --- PUBLIC-FACING PAGES ---
import Home from "./pages/Home";

import Storefront from "./pages/Storefront";
import AboutUs from "./pages/aboutus.jsx";
import ContactUs from "./pages/contactus.jsx";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp.jsx";

import UserProfile from "./pages/UserProfile";
import CheckoutPage from "./pages/checkout";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderSuccessPage from "./pages/store/OrderSuccessPage";
import OrderCancelPage from "./pages/store/OrderCancelPage";

import MainDashboard from "./admin/MainDashboard.jsx";

// --- EMPLOYEE ---
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";

// --- ADMIN (direct imports) ---
import AdminUsers from "./pages/AdminUsers";
import StaffAttendance from "./admin/StaffAttendance";
import LeaveManagement from "./admin/LeaveManagement";
import TaskManagement from "./admin/TaskManagement";
import AdminProducts from "./pages/store/Products";
import AdminOrders from "./pages/store/Orders";
import AdminDiscountsPage from "./admin/DiscountsPage";
import StoreReports from "./admin/StoreReports";

// --- ADMIN FARM MODULES ---
import AddCrop from "./admin/AddCrop.jsx";
import CropPage from "./admin/CropPage.jsx";
import EditCrop from "./admin/EditCrop.jsx";
import FieldPage from "./admin/FieldPage.jsx";
import AddFieldPage from "./admin/AddFieldPage.jsx";
import EditFieldPage from "./admin/EditFieldPage.jsx";
import FieldDetailsPage from "./admin/FieldDetailsPage.jsx"; // ✅ IMPORT ADDED FOR THE NEW PAGE
import AddPlan from "./admin/AddPlan.jsx";
import EditPlanPage from "./admin/EditPlan.jsx";
import PlanList from "./admin/PlanList.jsx";
import InputListPage from "./admin/InputListPage.jsx";
import AddInputPage from "./admin/AddInputPage.jsx";
import EditInputPage from "./admin/EditInputPage.jsx";

// --- FINANCE (admin) ---
import FinanceOverview from "./admin/FinanceOverview";
import FinanceTransaction from "./admin/FinanceTransaction";
import FinanceNewTransaction from "./admin/FinanceNewTransaction";
import FinancePayrollManagement from "./admin/FinancePayrollManagement";
import FinanceEditPayrollRule from "./admin/FinanceEditPayrollRule";
import FinanceAuditLogPage from "./admin/FinanceAuditLogPage";

// Livestock management pages
import CowProfilePage from "./pages/livestock/cow.jsx";
import CowDetailsPage from "./pages/livestock/CowDetailsPage.jsx";
import CowPublicPage from "./pages/livestock/CowPublicPage.jsx";
import MilkProduction from "./pages/livestock/Milk.jsx";
import HealthPage from "./pages/livestock/Health.jsx";
import BreedingPage from "./pages/livestock/Breeding.jsx";

// --- ADMIN PAGES (Lazy Loading for performance) ---
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const StoreDashboard = lazy(() => import("./admin/StoreDashboard"));

// --- TEMP PLACEHOLDERS ---

const FarmDashboard = () => (
  <div className="p-6 text-2xl font-bold">Farm Overview Dashboard</div>
);

const StaffPage = () => (
  <div className="p-6 text-2xl font-bold">Staff Management</div>
);
const RevenuePage = () => (
  <div className="p-6 text-2xl font-bold">Revenue & Financials</div>
);
const CustomersPage = () => (
  <div className="p-6 text-2xl font-bold">Customer Management</div>
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
      {/* PUBLIC (wrapped with main layout) */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/store" element={<Storefront />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/order/success" element={<OrderSuccessPage />} />
        <Route path="/order/cancel" element={<OrderCancelPage />} />
      </Route>

      {/* STANDALONE */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/cow/:id" element={<CowPublicPage />} />

      {/* AUTH USER */}
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

      {/* --- ADMIN --- */}
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
        <Route index element={<MainDashboard />} />

        <Route path="livestock" element={<CowProfilePage />} />
        <Route path="livestock/profile" element={<CowProfilePage />} />
        <Route path="livestock/:id" element={<CowDetailsPage />} />
        <Route path="livestock/milk" element={<MilkProduction />} />
        <Route path="livestock/health" element={<HealthPage />} />
        <Route path="livestock/breeding" element={<BreedingPage />} />

        <Route path="staff" element={<StaffPage />} />
        <Route path="revenue" element={<RevenuePage />} />

        {/* Crop management */}
        <Route path="crop" element={<CropPage />} />
        <Route path="crop/add" element={<AddCrop />} />
        <Route path="crop/:id/edit" element={<EditCrop />} />

        {/* Plan management */}
        <Route path="crop/plans" element={<PlanList />} />
        <Route path="crop/plan/new" element={<AddPlan />} />

        <Route path="crop/plan/edit/:id" element={<EditPlanPage />} />
        

        {/* Input Inventory management */}
        <Route path="crop/inputs" element={<InputListPage />} />
        <Route path="crop/inputs/add" element={<AddInputPage />} />
        <Route path="crop/inputs/edit/:id" element={<EditInputPage />} />

        {/* Field management */}
        <Route path="fields" element={<FieldPage />} />
        <Route path="fields/add" element={<AddFieldPage />} />
        <Route path="fields/edit/:id" element={<EditFieldPage />} />
        {/* ✅ ROUTE ADDED FOR THE NEW DETAILS PAGE */}
        <Route path="fields/:id" element={<FieldDetailsPage />} />

        {/* HR management */}
        <Route path="users" element={<AdminUsers />} />
        <Route path="tasks" element={<TaskManagement />} />
        <Route path="attendance" element={<StaffAttendance />} />
        <Route path="leave" element={<LeaveManagement />} />

        {/* Store (nested) */}
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
        <Route path="store/discounts" element={<AdminDiscountsPage />} />
        <Route path="store/customers" element={<CustomersPage />} />

        <Route path="store/reports" element={<StoreReports />} />

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
          <Route path="audit_log" element={<FinanceAuditLogPage />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
