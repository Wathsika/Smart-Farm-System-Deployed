// src/admin/DiscountModal.jsx  (DROP-IN REPLACEMENT)
import React, { useEffect, useMemo, useState } from "react";
import { X, Loader2, Percent, DollarSign, Calendar, Tag, ShoppingCart } from "lucide-react";

const DISCOUNT_TYPES = { PERCENTAGE: "PERCENTAGE", FLAT: "FLAT" };

export default function DiscountModal({ isOpen, onClose, onSave, discountToEdit, isSaving }) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    type: DISCOUNT_TYPES.PERCENTAGE,
    value: 0,
    minPurchase: 0,
    startDate: "",
    endDate: "",
    isActive: true,
  });

  // --- load/edit state ---
  useEffect(() => {
    if (!isOpen) return;
    if (discountToEdit) {
      setForm({
        name: discountToEdit.name || "",
        code: (discountToEdit.code || "").toUpperCase(),
        type: discountToEdit.type || DISCOUNT_TYPES.PERCENTAGE,
        value: Number(discountToEdit.value || 0),
        minPurchase: Number(discountToEdit.minPurchase || 0),
        startDate: discountToEdit.startDate ? discountToEdit.startDate.slice(0, 10) : "",
        endDate: discountToEdit.endDate ? discountToEdit.endDate.slice(0, 10) : "",
        isActive: discountToEdit.isActive ?? true,
      });
    } else {
      setForm({
        name: "",
        code: "",
         type: DISCOUNT_TYPES.PERCENTAGE,
        value: 0,
        minPurchase: 0,
        startDate: "",
        endDate: "",
        isActive: true,
      });
    }
  }, [discountToEdit, isOpen]);

  // --- helpers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : name === "code" ? value.toUpperCase() : value,
    }));
  };

 const isPercent = form.type === DISCOUNT_TYPES.PERCENTAGE;
  const valueSuffix = isPercent ? "%" : "Rs";

  const disabledSave = useMemo(() => {
    // minimal validation to keep it compact
    if (!form.name.trim()) return true;
    if (!form.code.trim() || form.code.trim().length < 3) return true;
    if (Number(form.value) <= 0) return true;
    if (isPercent && Number(form.value) > 100) return true;
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) return true;
    return false;
  }, [form, isPercent]);

  const submit = (e) => {
    e?.preventDefault?.();
    if (disabledSave) return;
    onSave(form, discountToEdit?._id);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        // close when clicking backdrop
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div className="w-full max-w-[680px] md:max-w-[860px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header - compact */}
        <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-3.5 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-700">
              <Tag size={18} />
            </div>
            <div className="leading-tight">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                {discountToEdit ? "Edit Discount" : "Create Discount"}
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                {discountToEdit ? "Update discount details" : "Set up a new discount"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body - scroll area, compact spacing */}
        <form onSubmit={submit}>
          <div className="max-h-[85vh] overflow-y-auto px-4 md:px-5 py-4 space-y-5">
            {/* Basic Info */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., Summer Sale"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Code *</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      placeholder="SAVE20"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 pr-9"
                    />
                    <Tag className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
              </div>
            </section>

            {/* Value */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">Discount Value</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                       onClick={() => setForm((p) => ({ ...p, type: DISCOUNT_TYPES.PERCENTAGE }))}
                      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm border ${
                        form.type === DISCOUNT_TYPES.PERCENTAGE
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Percent size={16} />
                      Percentage
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, type: DISCOUNT_TYPES.FLAT }))}
                      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm border ${
                        form.type === DISCOUNT_TYPES.FLAT
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <DollarSign size={16} />
                      Fixed
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Value * {isPercent ? "(%)" : "(Rs)"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="value"
                      value={form.value}
                      onChange={handleChange}
                      min="0"
                      max={isPercent ? "100" : undefined}
                      step={isPercent ? "1" : "0.01"}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{valueSuffix}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Conditions & Schedule */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">Conditions & Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Minimum Purchase (Rs)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="minPurchase"
                      value={form.minPurchase}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
                    />
                    <ShoppingCart className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Start Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
                    />
                    <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">End Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
                    />
                    <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
              </div>
            </section>

            {/* Status */}
            <section className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium text-gray-900">Discount Status</h4>
                <p className="text-xs text-gray-500">
                  {form.isActive ? "Currently active" : "Currently inactive"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-600 transition-colors" />
                <div className="absolute left-0.5 top-0.5 h-4 w-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-5" />
              </label>
            </section>
          </div>

          {/* Footer - compact, sticky to bottom of card */}
          <div className="flex justify-end gap-2 px-4 md:px-5 py-3 border-t bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || disabledSave}
              className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {discountToEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
