import React, { useState, useEffect } from "react";

export default function AddTransactionPage() {
  const [form, setForm] = useState({
    type: "expense",
    date: new Date().toISOString().slice(0, 10),
    category: "",
    amount: "",
    note: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Check if we're editing (in a real app, this would come from URL params or props)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("edit");
    if (editId) {
      setIsEditing(true);
      setEditingId(editId);
      // In a real app, you would fetch the transaction data here based on the ID
      // For now, we'll keep the form empty since there's no dummy data
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const amt = Number(form.amount);
    if (!form.date || !form.category || !amt || amt <= 0) {
      alert("Please fill date, category and a positive amount.");
      return;
    }

    const transaction = {
      ...form,
      amount: amt,
      id: editingId || crypto.randomUUID(),
    };

    // In a real app, you would save to database here
    console.log("Saving transaction:", transaction);
    alert(
      `${isEditing ? "Updated" : "Added"} transaction: ${
        form.category
      } - LKR ${amt.toLocaleString()}`
    );

    // Navigate back to transactions page
    handleCancel();
  }

  function handleCancel() {
    setForm({
      type: "expense",
      date: new Date().toISOString().slice(0, 10),
      category: "",
      amount: "",
      note: "",
    });
    // In a real app, this would navigate back to transactions page
    alert("Navigate back to Transactions page");
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
                      <option value="expense">💸 Expense</option>
                      <option value="income">💰 Income</option>
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
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full py-4 px-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-lg bg-white transition-all duration-200"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g., Feed, Fertilizer, Milk Sales, Crop Sales"
                  className="w-full py-4 px-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-lg bg-white transition-all duration-200"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Amount (LKR)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg">₨</span>
                  </div>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-lg bg-white transition-all duration-200"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Additional details about this transaction..."
                  className="w-full py-4 px-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-lg bg-white transition-all duration-200 resize-none"
                  rows={4}
                  value={form.note}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, note: e.target.value }))
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
                    {isEditing ? (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                        Update Transaction
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add Transaction
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-base font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-100">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-800 mb-2">
                  Quick Tips
                </h3>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>
                    • Use clear category names like "Feed", "Fertilizer", "Milk
                    Sales"
                  </li>
                  <li>
                    • Add detailed notes to track specific purchases or sales
                  </li>
                  <li>
                    • Record transactions promptly for accurate financial
                    tracking
                  </li>
                  <li>
                    • Consider setting up recurring transactions for regular
                    expenses
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
