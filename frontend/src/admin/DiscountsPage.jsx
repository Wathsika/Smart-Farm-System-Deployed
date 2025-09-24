// src/admin/AdminDiscountsPage.jsx
import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api"; // correct path from src/admin to src/lib
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Loader2,
  Tag,
  Calendar,
  DollarSign,
  Percent,
  Users,
  Filter,
  RefreshCw,
  Sparkles,
  Keyboard,
} from "lucide-react";
import { motion } from "framer-motion";
import DiscountModal from "./DiscountModal";

/* -------------------------
   Small UI helpers
------------------------- */
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "-";
const formatCurrency = (n) => `Rs ${Number(n || 0).toFixed(2)}`;
const getStatus = (discount) => {
  const now = new Date();
  const end = discount?.endDate ? new Date(discount.endDate) : null;
  if (!discount?.isActive || (end && now > end)) return "Expired";
  return "Active";
};
const getModeLabel = (mode) => (mode === "MANUAL" ? "Manual Code" : "Auto Apply");
const Badge = ({ text, type }) => {
  const styles = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    EXPIRED: "bg-gray-50 text-gray-700 border-gray-200",
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[type] || styles.EXPIRED}`}>
      {text}
    </span>
  );
};

const StatCard = ({ icon: Icon, title, value, subtitle, tone = "green" }) => {
  const toneBox = {
    green: "bg-emerald-50",
    blue: "bg-blue-50",
    gray: "bg-gray-50",
    purple: "bg-purple-50",
    yellow: "bg-yellow-50",
  }[tone];
  const toneIcon = {
    green: "text-emerald-600",
    blue: "text-blue-600",
    gray: "text-gray-600",
    purple: "text-purple-600",
    yellow: "text-yellow-600",
  }[tone];

  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${toneBox}`}>
          <Icon size={24} className={toneIcon} />
        </div>
      </div>
    </motion.div>
  );
};

const ModePill = ({ mode }) => {
  const normalized = mode === "MANUAL" ? "MANUAL" : "AUTO";
  const label = getModeLabel(normalized);
  const styles =
    normalized === "AUTO"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-amber-50 text-amber-700 border-amber-200";
  const Icon = normalized === "AUTO" ? Sparkles : Keyboard;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border ${styles}`}>
      <Icon size={14} />
      {label}
    </span>
  );
};
/* -------------------------
   Page
------------------------- */
export default function AdminDiscountsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Load
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["discounts"],
    queryFn: async () => (await api.get("/discounts")).data,
  });
  const discounts = data?.items || [];

  // Mutations
  const { mutate: saveDiscount, isLoading: isSaving } = useMutation({
    mutationFn: ({ payload, id }) =>
      id ? api.put(`/discounts/${id}`, payload) : api.post("/discounts", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      handleCloseModal();
    },
    onError: (err) => alert(err?.response?.data?.message || "Failed to save discount."),
  });

  const { mutate: deleteDiscount } = useMutation({
    mutationFn: (id) => api.delete(`/discounts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["discounts"] }),
    onError: (err) => alert(err?.response?.data?.message || "Failed to delete discount."),
  });

  // Handlers
  const handleOpenModal = (discount = null) => {
    setEditingDiscount(discount);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDiscount(null);
  };
  const handleSave = (payload, id = null) => saveDiscount({ payload, id });
  const handleDelete = (id) => {
    if (window.confirm("Are you sure? This will permanently delete the discount code.")) {
      deleteDiscount(id);
    }
  };

  // Derived: search + filter
  const filteredDiscounts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return discounts.filter((d) => {
      const status = getStatus(d);
      const matchesSearch =
        d.name?.toLowerCase().includes(q) ||
        d.code?.toLowerCase().includes(q);
      const matchesFilter = statusFilter === "ALL" || status.toUpperCase() === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [discounts, searchTerm, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const active = discounts.filter((d) => getStatus(d) === "Active").length;
    const expired = discounts.filter((d) => getStatus(d) === "Expired").length;
    const percentage = discounts.filter((d) => d.type === "PERCENTAGE").length;
    return {
      total: discounts.length,
      active,
      expired,
      percentage,
      pctActive: ((active / (discounts.length || 1)) * 100).toFixed(0),
      pctPercentage: ((percentage / (discounts.length || 1)) * 100).toFixed(0),
    };
  }, [discounts]);

  /* Loading / Error */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading discounts...</p>
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="text-red-600 text-xl font-semibold mb-2">Failed to load discounts</div>
          <p className="text-red-500 mb-4">Please try refreshing the page.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  /* Page */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.header initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Discount Management</h1>
              <p className="text-gray-600 mt-1">Create and manage coupon codes to boost your sales</p>
            </div>
            <div className="flex items-center gap-2">
            
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 sm:px-6 py-2.5 rounded-xl hover:bg-emerald-700 shadow-sm"
              >
                <PlusCircle size={20} />
                Create Discount
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <StatCard icon={Tag} title="Total Discounts" value={stats.total} tone="green" />
            <StatCard
              icon={Users}
              title="Active"
              value={stats.active}
              subtitle={`${stats.pctActive}% of total`}
              tone="green"
            />
            <StatCard icon={Calendar} title="Expired" value={stats.expired} tone="gray" />
            <StatCard
              icon={Percent}
              title="Percentage Based"
              value={stats.percentage}
              subtitle={`${stats.pctPercentage}% of total`}
              tone="purple"
            />
          </div>
        </motion.header>

        {/* Filters */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Filter size={20} className="text-emerald-600" />
              All Discounts <span className="text-gray-500 font-normal">({filteredDiscounts.length})</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-72">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                />
              </div>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="EXPIRED">Expired Only</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Table (md and up) */}
          {filteredDiscounts.length > 0 ? (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-700">Discount</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Code</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Value</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Min Purchase</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Mode</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Duration</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                      <th className="p-4 text-right font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDiscounts.map((d, i) => (
                      <tr key={d._id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">{d.name}</div>
                          
                        </td>
                        <td className="p-4">
                          <span className="font-mono bg-gray-100 text-gray-800 px-2.5 py-1 rounded-lg text-sm border">
                            {d.code}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {d.type === "PERCENTAGE" ? (
                              <Percent size={16} className="text-emerald-600" />
                            ) : (
                              <DollarSign size={16} className="text-emerald-600" />
                            )}
                            <span className="font-semibold text-gray-900">
                              {d.type === "PERCENTAGE" ? `${d.value}%` : formatCurrency(d.value)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {d.minPurchase > 0 ? (
                            <span className="text-gray-800">{formatCurrency(d.minPurchase)}</span>
                          ) : (
                            <span className="text-gray-400 italic">No minimum</span>
                          )}
                        </td>
                        <td className="p-4">
                          <ModePill mode={d.applicationMode} />
                        </td>
                        <td className="p-4 text-sm">
                          <div className="text-gray-900">{formatDate(d.startDate)}</div>
                          <div className="text-gray-500">to {formatDate(d.endDate)}</div>
                        </td>
                        <td className="p-4">
                          <Badge
                            text={getStatus(d)}
                            type={getStatus(d) === "Active" ? "ACTIVE" : "EXPIRED"}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleOpenModal(d)}
                              className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(d._id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredDiscounts.map((d) => (
                  <div key={d._id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-gray-900">{d.name}</div>
                      <Badge text={getStatus(d)} type={getStatus(d) === "Active" ? "ACTIVE" : "EXPIRED"} />
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="mt-1">
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{d.code}</span>
                      </div>
                      <div className="mt-1">
                        Value:{" "}
                        <span className="font-semibold text-gray-900">
                          {d.type === "PERCENTAGE" ? `${d.value}%` : formatCurrency(d.value)}
                        </span>
                      </div>
                      <div className="mt-1">
                        Min Purchase:{" "}
                        {d.minPurchase > 0 ? (
                          <span>{formatCurrency(d.minPurchase)}</span>
                        ) : (
                          <span className="text-gray-400 italic">No minimum</span>
                        )}
                      </div>
                      <div className="mt-1">
                        {formatDate(d.startDate)} – {formatDate(d.endDate)}
                      </div>
                    </div>
                     <div className="mt-1 flex items-center gap-2">
                        <span className="text-gray-500">Mode:</span>
                        <ModePill mode={d.applicationMode} />
                      </div>
                    <div className="flex items-center justify-end gap-2 mt-3">
                      <button
                        onClick={() => handleOpenModal(d)}
                        className="px-3 py-1.5 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(d._id)}
                        className="px-3 py-1.5 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="bg-emerald-50/60 rounded-2xl p-10 mx-4 sm:mx-8">
                <Tag className="mx-auto mb-4 text-emerald-500" size={56} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No discounts {searchTerm || statusFilter !== "ALL" ? "match your filters" : "created yet"}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || statusFilter !== "ALL"
                    ? "Try adjusting your search term or status filter."
                    : "Create your first discount to attract more customers."}
                </p>
                {!searchTerm && statusFilter === "ALL" && (
                  <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700"
                  >
                    <PlusCircle size={18} />
                    Create Discount
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal */}
      <DiscountModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        discountToEdit={editingDiscount}
        isSaving={isSaving}
      />
    </div>
  );
}
