// src/pages/store/AdminOrdersPage.jsx
import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import InvoiceModal from "../../components/common/InvoiceModal.jsx";
import {
  Eye,
  FileText,
  X,
  Loader2,
  Package,
  LogIn,
  Search,
  Filter,
  RefreshCw,
  Users,
  DollarSign,
  TrendingUp,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ========================
   UI HELPERS
======================== */

const formatCurrency = (amount) =>
  `Rs ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getOrderDisplayId = (order) => {
  if (!order) return "#ORDER";
  if (order.orderNumber) return order.orderNumber;
  const fallback =
    order.stripeSessionId?.slice(-10)?.toUpperCase() ||
    (order._id ? String(order._id).slice(-6).toUpperCase() : undefined);
  return fallback ? `#${fallback}` : "#ORDER";
};
/* ========================
   BADGE
======================== */

const Badge = ({ text, size = "default" }) => {
  const types = {
    PROCESSING: "bg-yellow-50 text-yellow-700 border-yellow-200",
    SHIPPED: "bg-blue-50 text-blue-700 border-blue-200",
    DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };

  const sizeClasses = {
    small: "px-2 py-0.5 text-xs",
    default: "px-2.5 py-1 text-xs",
    large: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`${sizeClasses[size]} inline-flex items-center font-medium rounded-full border shadow-sm ${
        types[text] || "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {text}
    </span>
  );
};

/* ========================
   STATUS DROPDOWN
======================== */

const StatusDropdown = ({ order, onStatusChange, isUpdating }) => (
  <div className="relative inline-block">
    <select
      value={order.status}
      disabled={isUpdating}
      onChange={(e) => onStatusChange(order._id, e.target.value)}
      className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm font-medium focus:ring-2 focus:ring-green-600 focus:border-green-600 disabled:opacity-50 disabled:bg-gray-100 transition-all"
    >
      <option value="PROCESSING">Processing</option>
      <option value="SHIPPED">Shipped</option>
      <option value="DELIVERED">Delivered</option>
      <option value="CANCELLED">Cancelled</option>
    </select>
    {isUpdating && (
      <div className="absolute inset-y-0 right-2 flex items-center">
        <Loader2 size={16} className="animate-spin text-gray-400" />
      </div>
    )}
  </div>
);

/* ========================
   ORDER DETAILS MODAL
======================== */

const OrderDetailsModal = ({ order, onClose, onExport }) => {
  if (!order) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 18 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 18 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Order {getOrderDisplayId(order)}
                </h2>
                <p className="text-green-100 mt-1">
                  Placed on{" "}
                  {new Date(order.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge text={order.status} size="large" />
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            {/* Customer & Shipping */}
            <div className="p-6 bg-gray-50 border-b">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Users size={16} className="text-green-600" />
                    Customer Details
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="font-medium text-gray-900">
                      {order.customer?.name}
                    </p>
                    <p>{order.customer?.email}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Package size={16} className="text-green-600" />
                    Shipping Address
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{order.shippingAddress?.addressLine1}</p>
                    <p>
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.postalCode}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <DollarSign size={16} className="text-green-600" />
                    Order Summary
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <Badge text={order.isPaid ? "PAID" : "PENDING"} size="small" />
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-emerald-600">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-gray-600" />
                Order Items
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Product
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                          Quantity
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                          Unit Price
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.orderItems?.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {item.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                              {item.qty}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-900">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">
                            {formatCurrency(item.price * item.qty)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-4 text-right font-semibold text-gray-900"
                        >
                          Grand Total
                        </td>
                        <td className="px-6 py-4 text-right text-xl font-bold text-emerald-600">
                          {formatCurrency(order.totalPrice)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Mobile items list */}
                <div className="md:hidden divide-y divide-gray-200">
                  {order.orderItems?.map((item, i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          x{item.qty}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                        <span>Unit: {formatCurrency(item.price)}</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(item.price * item.qty)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="p-4 bg-gray-50 flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Grand Total</span>
                    <span className="text-emerald-600 font-bold">
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
             <button
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              onClick={() => onExport?.(order)}
            >
              <Download size={16} />
              Export
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ========================
   STATS CARDS
======================== */

const StatsCards = ({ orders }) => {
  const stats = useMemo(() => {
    const total = orders.length;
    const revenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const pending = orders.filter((o) => o.status === "PROCESSING").length;
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    return { total, revenue, pending, delivered };
  }, [orders]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[
        {
          title: "Total Orders",
          value: stats.total,
          icon: <Package size={24} className="text-green-600" />,
          box: "bg-green-50",
        },
        {
          title: "Total Revenue",
          value: formatCurrency(stats.revenue),
          icon: <DollarSign size={24} className="text-green-600" />,
          box: "bg-green-50",
        },
        {
          title: "Pending Orders",
          value: stats.pending,
          icon: <Loader2 size={24} className="text-yellow-600" />,
          box: "bg-yellow-50",
        },
        {
          title: "Delivered",
          value: stats.delivered,
          icon: <TrendingUp size={24} className="text-emerald-600" />,
          box: "bg-emerald-50",
        },
      ].map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 * (i + 1) }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${card.box} flex items-center justify-center`}>
              {card.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/* ========================
   PAGE
======================== */

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
   const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [autoPrint, setAutoPrint] = useState(false);

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["adminAllOrders"],
    queryFn: async () => {
      const { data } = await api.get("/orders");
      return Array.isArray(data) ? data : [];
    },
    enabled: isAuthenticated,
  });

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (err) {
      console.error("Failed to refresh orders", err);
    }
  };

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ orderId, status }) => {
      setUpdatingId(orderId);
      return api.put(`/orders/${orderId}/status`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminAllOrders"] }),
    onError: (err) =>
      alert(`Update Failed: ${err?.response?.data?.message || err.message}`),
    onSettled: () => setUpdatingId(null),
  });

  const handleStatusChange = (orderId, status) => {
    updateStatus({ orderId, status });
  };

  const filteredOrders = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        order.customer?.name?.toLowerCase().includes(q) ||
        order.customer?.email?.toLowerCase().includes(q) ||
        order.orderNumber?.toLowerCase().includes(q) ||
        order.stripeSessionId?.toLowerCase().includes(q) ||
        order._id?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  /* Guards */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md"
        >
          <LogIn size={48} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600">Please log in to access the admin panel.</p>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg text-center"
        >
          <Loader2 size={48} className="text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </motion.div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md"
        >
          <div className="text-red-500 mb-4">
            <X size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Orders
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message || "Something went wrong"}
          </p>
          <button
             onClick={handleRefresh}
            disabled={isFetching}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isFetching ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Retrying...
              </span>
            ) : (
              "Try Again"
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  /* Page */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Orders Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
            </div>
            <button
            onClick={handleRefresh}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
             {isFetching ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Refreshing
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Refresh
                </>
              )}
            </button>
          </div>
        </motion.header>

        {/* Stats */}
        <StatsCards orders={orders} />

        {/* Filters */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by customer name, email, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
              >
                <option value="ALL">All Status</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Orders */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Orders ({filteredOrders.length})
            </h2>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "ALL"
                  ? "Try adjusting your search or filter criteria"
                  : "Orders will appear here once customers start placing them"}
              </p>
            </div>
          ) : (
            <>
              {/* Table (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Payment
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order, index) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {getOrderDisplayId(order)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {order.customer?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customer?.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(order.totalPrice)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusDropdown
                            order={order}
                            onStatusChange={handleStatusChange}
                            isUpdating={updatingId === order._id}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Badge text={order.isPaid ? "PAID" : "PENDING"} />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                            View Details
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards (mobile) */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredOrders.map((order, idx) => (
                  <div key={order._id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                       {getOrderDisplayId(order)}
                      </span>
                      <Badge text={order.isPaid ? "PAID" : "PENDING"} />
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium text-gray-900">
                        {order.customer?.name}
                      </div>
                      <div className="truncate">{order.customer?.email}</div>
                      <div className="mt-1">{formatDate(order.createdAt)}</div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(order.totalPrice)}
                      </div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg text-sm"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </div>
                    <div className="mt-3">
                      <StatusDropdown
                        order={order}
                        onStatusChange={handleStatusChange}
                        isUpdating={updatingId === order._id}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onExport={(order) => {
            setInvoiceOrder(order);
            setAutoPrint(true);
          }}
        />
      )}
       <InvoiceModal
        isOpen={!!invoiceOrder}
        order={invoiceOrder}
        autoPrint={autoPrint}
        onClose={() => {
          setInvoiceOrder(null);
          setAutoPrint(false);
        }}
      />
    </div>
  );
}
