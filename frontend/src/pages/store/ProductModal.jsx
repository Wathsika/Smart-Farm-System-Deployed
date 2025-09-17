// src/pages/store/ProductModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";

const CATEGORY_OPTIONS = [
  "General",
  "Vegetables",
  "Fruits",
  "Dairy",
  "Grains",
  "Livestock",
  "Supplies",
  "Other",
];

const UNIT_OPTIONS = [
  "kg",
  "g",
  "lb",
  "pcs",
  "dozen",
  "liter",
  "ml",
  "bag",
  "box",
  "bundle",
];

const createEmptyForm = () => ({
  name: "",
  category: CATEGORY_OPTIONS[0],
  price: "",
  qty: "",
  unit: "",
  sku: "",
  description: "",
});

const NAME_ALLOWED_PATTERN = /^[A-Za-z0-9\s-]+$/;
const NAME_SANITIZE_REGEX = /[^A-Za-z0-9\s-]/g;

const PRICE_MIN = 1.00;
const PRICE_MAX = 100000;
const QTY_MIN = 1;
const TWO_DECIMAL_PATTERN = /^\d+(?:\.\d{1,2})?$/;
const TWO_DECIMAL_INPUT_PATTERN = "\\d+(\\.\\d{1,2})?";



const sanitizeDecimalInput = (input) => {
  if (input === null || input === undefined) return "";
  const stringValue = String(input);
  const filtered = stringValue.replace(/[^\d.]/g, "");
  if (!filtered) return "";

  const [rawInteger = "", ...decimalSections] = filtered.split(".");
  const hasDecimal = filtered.includes(".");
  const decimalPart = decimalSections.join("").slice(0, 2);
  let integerPart = rawInteger.replace(/^0+(?=\d)/, "");

  if (!integerPart && (hasDecimal || decimalPart)) {
    integerPart = "0";
  }

  let sanitized = integerPart;

  if (hasDecimal && (decimalPart.length > 0 || filtered.endsWith("."))) {
    sanitized = (sanitized || "0") + ".";
  }

  if (decimalPart) {
    sanitized += decimalPart;
  }

  return sanitized;
};
const QTY_MAX = 100000;
const formatPrice = (value) =>
  new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);


// --- Reusable Field Wrapper (animated, with error line) ---
const FormField = ({ label, name, error, children, required = false }) => (
  <Motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
  >
    <label
      htmlFor={name}
      className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1"
    >
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">{children}</div>
    <AnimatePresence>
      {error && (
        <Motion.p
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="mt-2 text-xs text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md border border-red-200"
        >
          <i className="fas fa-exclamation-circle" />
          {error}
        </Motion.p>
      )}
    </AnimatePresence>
  </Motion.div>
);

// --- Drag & Drop Image Upload (with preview) ---
const ImageUpload = ({ image, onImageChange }) => {
  const fileRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) {
      onImageChange({ target: { files: [f] } });
    }
  };

  return (
    <div className="space-y-4">
      <Motion.div
        className={`relative w-full h-40 rounded-2xl border-2 border-dashed overflow-hidden group transition-all duration-300 ${
          isDragging
            ? "border-green-400 bg-green-50"
            : image
            ? "border-green-200 bg-white"
            : "border-gray-300 bg-gray-50 hover:border-green-300 hover:bg-green-50"
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.15 }}
      >
        {image ? (
          <div className="relative w-full h-full">
            <img src={image} alt="Product" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="bg-white/90 rounded-full p-3 shadow">
                <i className="fas fa-camera text-green-600 text-lg" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Motion.div
              animate={{ y: isDragging ? -4 : 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <i className="fas fa-cloud-upload-alt text-green-600 text-xl" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {isDragging ? "Drop image here" : "Upload product image"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Drag & drop or click to browse</p>
              </div>
            </Motion.div>
          </div>
        )}
      </Motion.div>

      <div className="flex items-center justify-between">
        <Motion.button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-colors duration-150 flex items-center gap-2 shadow-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <i className="fas fa-plus text-green-600" />
          {image ? "Change Image" : "Select Image"}
        </Motion.button>
        <div className="text-right">
          <p className="text-xs text-gray-500">PNG or JPG</p>
          <p className="text-xs text-gray-400">Max 5MB</p>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={onImageChange}
      />
    </div>
  );
};

// --- Styled inputs (with subtle motion) ---
const StyledInput = ({ error, className = "", ...props }) => (
  <Motion.input
    {...props}
    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-150 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-100 ${
      error ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500 hover:border-gray-300"
    } ${className}`}
    whileFocus={{ scale: 1.005 }}
  />
);

const StyledSelect = ({ error, className = "", children, ...props }) => (
  <Motion.select
    {...props}
    className={`w-full px-4 py-3 pr-10 rounded-xl border-2 transition-all duration-150 bg-white text-gray-800 appearance-none focus:outline-none focus:ring-4 focus:ring-green-100 ${
      error ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500 hover:border-gray-300"
    } ${className}`}
    whileFocus={{ scale: 1.005 }}
  >
    {children}
  </Motion.select>
);

const StyledTextarea = ({ error, className = "", ...props }) => (
  <Motion.textarea
    {...props}
    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-150 bg-white text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-4 focus:ring-green-100 ${
      error ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500 hover:border-gray-300"
    } ${className}`}
    whileFocus={{ scale: 1.005 }}
  />
);

// --- Main Modal ---
export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  isSaving,
}) {
  // form state
  const [form, setForm] = useState(createEmptyForm);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
   const [rawName, setRawName] = useState("");
  const prevPreviewRef = useRef(null); // for URL.revokeObjectURL

  // animations
  const modalVariants = {
    hidden: { scale: 0.92, opacity: 0, y: 40 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.25, 0.25, 0, 1] },
    },
    exit: { scale: 0.95, opacity: 0, y: 20, transition: { duration: 0.25 } },
  };
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  // Populate form when opening / editing
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    if (productToEdit) {
      setForm({
        name: productToEdit.name || "",
        category: productToEdit.category || CATEGORY_OPTIONS[0],
        price:
          typeof productToEdit.price === "number"
            ? productToEdit.price.toFixed(2)
            : productToEdit.price ?? "",
        qty: productToEdit.stock?.qty ?? "",
        unit: productToEdit.unit || "",
        sku: productToEdit.sku || "",
        description: productToEdit.description || "",
      });
      setRawName(productToEdit.name || "");
      setImagePreview(productToEdit.images?.[0] || null);
      setImageFile(null);
    } else {
      setForm(createEmptyForm());
       setRawName("");
      setImagePreview(null);
      setImageFile(null);
    }
  }, [productToEdit, isOpen]);

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      if (prevPreviewRef.current) URL.revokeObjectURL(prevPreviewRef.current);
    };
  }, []);

  // handlers
  const handleChange = (eventOrName, maybeValue) => {
    const isSyntheticEvent = typeof eventOrName !== "string" && eventOrName?.target;
    const name = isSyntheticEvent ? eventOrName.target.name : eventOrName;
    const value = isSyntheticEvent ? eventOrName.target.value : maybeValue;

    if (!name) return;

     if (name === "name") {
      setRawName(value);
      const sanitizedValue = value.replace(NAME_SANITIZE_REGEX, "");

      setForm((p) => ({ ...p, [name]: sanitizedValue }));

      if (sanitizedValue !== value) {
        setErrors((prev) => ({ ...prev, name: "Use letters and numbers only" }));
      } else {
        setErrors((prev) => {
          if (!prev.name) return prev;
          const next = { ...prev };
          next.name = null;
          return next;
        });
      }
      return;
    }

    if (name === "price") {
      const sanitized = sanitizeDecimalInput(value);

      if (sanitized === "") {
        setForm((p) => ({ ...p, price: "" }));
        if (errors.price) setErrors((p) => ({ ...p, price: null }));
        return;
      }

      if (!TWO_DECIMAL_PATTERN.test(sanitized)) {
        return;
      }

      const numericValue = Number(sanitized);
      if (!Number.isFinite(numericValue)) {
        return;
      }

      if (numericValue < PRICE_MIN || numericValue > PRICE_MAX) {
        return;
      }
      setForm((p) => ({ ...p, price: sanitized }));
      if (errors.price) setErrors((p) => ({ ...p, price: null }));
      return;
    }

    let nextValue = value;

    if (name === "qty") {
       if (value === "" || value === null) {
        nextValue = "";
      } else {
        const numericValue = Number(value);
      if (!Number.isNaN(numericValue)) {
          if (numericValue < 0) {
            nextValue = "0";
          } else if (numericValue > QTY_MAX) {
            nextValue = QTY_MAX.toString();
          }
        }
      }
    }

    setForm((p) => ({ ...p, [name]: nextValue }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // optional: basic size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: "Image must be 5MB or less" }));
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    if (prevPreviewRef.current) URL.revokeObjectURL(prevPreviewRef.current);
    prevPreviewRef.current = url;
    setImagePreview(url);
  };

  const validateForm = () => {
    const e = {};
    const sanitizedRawName = rawName.replace(NAME_SANITIZE_REGEX, "");
    const trimmedName = form.name.trim();

    if (!trimmedName) e.name = "Product name is required";
    if (rawName && sanitizedRawName !== rawName) e.name = "Use letters and numbers only";
    else if (trimmedName && !NAME_ALLOWED_PATTERN.test(trimmedName))
      e.name = "Use letters and numbers only";
    if (form.price === "" || form.price === null) e.price = "Price is required";
     else if (!TWO_DECIMAL_PATTERN.test(form.price)) {
      e.price = "Enter a valid price with up to two decimal places";
    } else {
      const numericPrice = Number(form.price);
      if (!Number.isFinite(numericPrice)) {
        e.price = "Enter a valid price";
      } else if (numericPrice < PRICE_MIN) {
        e.price = `Price must be at least Rs ${formatPrice(PRICE_MIN)}`;
      } else if (numericPrice > PRICE_MAX) {
        e.price = `Price must be at most Rs ${formatPrice(PRICE_MAX)}`;
      }
    }
    if (form.qty === "" || form.qty === null) e.qty = "Stock quantity is required";
    else {
      const numericQty = Number(form.qty);
      if (
        Number.isNaN(numericQty) ||
        !Number.isInteger(numericQty) ||
        numericQty < 1 ||
        numericQty > QTY_MAX
      ) {
        e.qty = `Enter a valid whole number for stock (1 to ${QTY_MAX.toLocaleString()}).`;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    onSave({
      formData: form,
      imageFile,
      productId: productToEdit?._id,
    });
  };

  // Close on backdrop click/ESC (but not while saving)
  const onBackdropClick = (e) => {
    if (isSaving) return;
    if (e.target === e.currentTarget) onClose();
  };
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isSaving, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onBackdropClick}
        >
          <Motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 rounded-t-3xl z-10">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <Motion.div
                    className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 shadow-sm"
                    whileHover={{ rotate: 5, scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <i className="fas fa-box text-xl" />
                  </Motion.div>
                  <div>
                    <Motion.h3
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 }}
                      className="text-xl font-bold text-gray-900"
                    >
                      {productToEdit ? "Edit Product" : "Add New Product"}
                    </Motion.h3>
                    <Motion.p
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm text-gray-600 mt-1"
                    >
                      {productToEdit
                        ? "Update your product information"
                        : "Fill in the details to add to your inventory"}
                    </Motion.p>
                  </div>
                </div>
                <Motion.button
                  onClick={onClose}
                  disabled={isSaving}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-150 disabled:opacity-50"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-times text-gray-600" />
                </Motion.button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left: Image */}
                <Motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="lg:col-span-2"
                >
                  <FormField label="Product Image" name="image" error={errors.image}>
                    <ImageUpload image={imagePreview} onImageChange={handleImageChange} />
                  </FormField>
                </Motion.div>

                {/* Right: Fields */}
                <Motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-3 space-y-6"
                >
                  <FormField label="Product Name" name="name" error={errors.name} required>
                    <StyledInput
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g., Organic Carrots"
                      error={errors.name}
                      autoFocus
                    />
                  </FormField>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Category" name="category">
                     <div className="relative">
                        <StyledSelect
                          id="category"
                          name="category"
                          value={form.category || CATEGORY_OPTIONS[0]}
                          onChange={handleChange}
                        >
                          {CATEGORY_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                          {form.category && !CATEGORY_OPTIONS.includes(form.category) && (
                            <option value={form.category}>{form.category}</option>
                          )}
                        </StyledSelect>
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
                          <i className="fas fa-chevron-down text-xs" />
                        </span>
                      </div>
                    
                    </FormField>
                    <FormField label="SKU" name="sku">
                      <StyledInput
                        id="sku"
                        name="sku"
                        type="text"
                        value={form.sku}
                        onChange={handleChange}
                        placeholder="Product code (optional)"
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="Price (Rs)" name="price" error={errors.price} required>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                          Rs
                        </span>
                        <StyledInput
                          id="price"
                          name="price"
                          type="text"
                          inputMode="decimal"
                          pattern={TWO_DECIMAL_PATTERN.source}
                          value={form.price}
                          onChange={handleChange}
                          placeholder="0.00"
                          className="pl-10"
                          error={errors.price}
                        />
                      </div>
                    </FormField>
                    <FormField label="Stock Quantity" name="qty" error={errors.qty} required>
                      <StyledInput
                        id="qty"
                        name="qty"
                        type="number"
                        min={1}
                        step={1}
                        max={QTY_MAX}
                        value={form.qty}
                        onChange={handleChange}
                        placeholder="0"
                        error={errors.qty}
                      />
                    </FormField>
                    <FormField label="Unit" name="unit">
                      <div className="relative">
                        <StyledSelect
                          id="unit"
                          name="unit"
                          value={form.unit}
                          onChange={handleChange}
                        >
                          <option value="">Select unit </option>
                          {UNIT_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                          {form.unit && !UNIT_OPTIONS.includes(form.unit) && (
                            <option value={form.unit}>{form.unit}</option>
                          )}
                        </StyledSelect>
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
                          <i className="fas fa-chevron-down text-xs" />
                        </span>
                      </div>
                    </FormField>
                  </div>

                  <FormField label="Description" name="description">
                    <StyledTextarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe your product features, benefits, or other details..."
                    />
                  </FormField>
                </Motion.div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-100 rounded-b-3xl">
              <div className="flex flex-col sm:flex-row justify-end gap-3 p-6">
                <Motion.button
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors duration-150 disabled:opacity-50 min-w-[100px]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </Motion.button>
                <Motion.button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-3 text-sm font-semibold text-white bg-green-600 border-2 border-green-600 rounded-xl hover:bg-green-700 hover:border-green-700 disabled:bg-green-400 disabled:border-green-400 transition-colors duration-150 flex items-center justify-center min-w-[140px] shadow-lg shadow-green-600/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSaving ? (
                    <Motion.div
                      className="flex items-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Saving...
                    </Motion.div>
                  ) : (
                    <Motion.span className="flex items-center gap-2">
                      <i className="fas fa-save" />
                      Save Product
                    </Motion.span>
                  )}
                </Motion.button>
              </div>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
