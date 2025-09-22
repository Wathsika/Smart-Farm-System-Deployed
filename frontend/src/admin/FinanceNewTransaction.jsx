import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const CATEGORY_OPTIONS = ["crop", "milk", "store", "staff", "others"];

const todayDate = new Date().toISOString().slice(0, 10);
function formatWithCommas(value) {
  const parts = value.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export default function AddTransactionPage() {
  const [form, setForm] = useState({
    type: "",
    date: new Date().toISOString().slice(0, 10),
    category: "others", // default value
    amount: "",
    description: "",
  });
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Check if we're editing (this would come from URL params or props)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("edit");
    if (!editId) return;

    setIsEditing(true);
    setEditingId(editId);

    // Fetch the existing transaction from backend
    (async () => {
      try {
        const { data } = await api.get(`/transactions/${editId}`);
        // Expecting: { type, date, category, amount, description }
        setForm({
          type: data.type || "expense",
          date: (data.date || new Date().toISOString()).slice(0, 10),
          category: data.category || "others",
          amount: String(data.amount ?? ""),
          description: data.description || "",
        });
      } catch (err) {
        console.error(err);
        alert("Failed to load transaction to edit.");
      }
    })();
  }, []);

  //submit data
  async function handleSubmit(e) {
    e.preventDefault();

    const amt = Number(form.amount);
    if (!form.date || !form.category?.trim() || !amt || amt <= 0) {
      alert("Please fill date, category and a positive amount.");
      return;
    }

    const payload = {
      type: form.type || "EXPENSE",
      date: form.date,
      category: form.category.trim(),
      amount: amt,
      description: form.description?.trim() || "",
    };

    try {
      if (isEditing && editingId) {
        // UPDATE
        await api.patch(`/transactions/${editingId}`, payload);
        alert("Transaction updated successfully.");
      } else {
        // CREATE
        await api.post("/transactions", payload);
        alert("Transaction added successfully.");
      }
      // Navigate back after success
      navigate("/admin/finance/transaction");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        (isEditing ? "Failed to update." : "Failed to add.");
      alert(msg);
    }
  }

  function handleCancel() {
    setForm({
      type: "expense",
      date: new Date().toISOString().slice(0, 10),
      category: "others",
      amount: "",
      description: "",
    });
    navigate("/admin/finance/transaction");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      {/* Page Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? "Edit Transaction" : "Add New Transaction"}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditing
            ? "Update transaction details"
            : "Record a new income or expense"}
        </p>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditing ? "Edit Transaction" : "Add New Transaction"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isEditing
                  ? "Update the transaction details"
                  : "Record a new income or expense"}
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Transaction Type
                  </label>
                  <div className="relative">
                    <select
                      className="w-full py-4 px-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-lg bg-white transition-all duration-200 appearance-none font-medium"
                      value={form.type}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, type: e.target.value }))
                      }
                    >
                      <option value="EXPENSE">💸 Expense</option>
                      <option value="INCOME">💰 Income</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full py-4 px-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-lg bg-white transition-all duration-200"
                    value={form.date}
                    max={todayDate}
                    min={todayDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Category dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Category
                </label>
                <div className="relative">
                  <select
                    className="w-full py-4 px-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-lg bg-white transition-all duration-200 appearance-none font-medium"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Amount (LKR)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg">₨</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-lg">LKR</span>
                    </div>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={formatWithCommas(form.amount)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/,/g, ""); // remove commas
                        const regex = /^(?:0|[1-9]\d{0,7})(?:\.\d{0,2})?$/;

                        // allow only valid number format
                        if (raw === "" || regex.test(raw)) {
                          setForm((f) => ({ ...f, amount: raw }));
                        }
                      }}
                      className="w-full pl-16 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-lg bg-white transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  placeholder="Additional details about this transaction..."
                  className="w-full py-4 px-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-lg bg-white transition-all duration-200 resize-none"
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="inline-flex items-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  >
                    {isEditing ? "Update Transaction" : "Add Transaction"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-base font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
