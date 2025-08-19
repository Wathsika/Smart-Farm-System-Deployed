import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Reusable Sub-component for Form Fields ---
// This component standardizes the layout for labels and error messages.
const FormField = ({ label, name, error, children }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    {children}
    {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
  </div>
);

// --- Reusable Sub-component for Image Uploading ---
const ImageUpload = ({ image, onImageChange }) => {
  const fileInputRef = useRef(null); // Create a reference to the hidden file input
  
  return (
    <div className="flex items-center gap-5">
      {/* Image Preview Box */}
      <div className="w-28 h-28 rounded-xl bg-gray-100 border-2 border-dashed flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt="Product Preview" className="w-full h-full object-cover" />
        ) : (
          <i className="fas fa-image text-gray-400 text-3xl"></i>
        )}
      </div>
      {/* Upload Button */}
      <div>
        <button
          type="button"
          // Clicking this button programmatically clicks the hidden file input
          onClick={() => fileInputRef.current.click()}
          className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Upload Image
        </button>
        <p className="text-xs text-gray-500 mt-2">PNG or JPG recommended.</p>
        {/* The actual file input is hidden from the user for better styling */}
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onImageChange} 
            className="hidden" 
            accept="image/png, image/jpeg" 
        />
      </div>
    </div>
  );
};


// --- Main Product Modal Component ---
export default function ProductModal({ isOpen, onClose, onSave, productToEdit, isSaving }) {
  // --- STATE MANAGEMENT ---
  const emptyForm = { name: "", category: "General", price: "", qty: "", unit: "", sku: "", description: "" };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({}); // Stores validation errors
  const [imagePreview, setImagePreview] = useState(null); // URL for the image preview
  const [imageFile, setImageFile] = useState(null);     // The actual File object to be uploaded

  // This effect runs whenever the modal is opened or the product to edit changes.
  useEffect(() => {
    if (isOpen) {
      setErrors({}); // Clear any previous validation errors
      if (productToEdit) {
        // If we are editing, populate the form with the existing product's data.
        setForm({
          name: productToEdit.name || "",
          category: productToEdit.category || "General",
          price: productToEdit.price || "",
          qty: productToEdit.stock?.qty || "",
          unit: productToEdit.unit || "", 
          sku: productToEdit.sku || "",
          description: productToEdit.description || "",
        });
        setImagePreview(productToEdit.images?.[0] || null);
        setImageFile(null); // Reset the image file until the user selects a new one
      } else {
        // If we are adding a new product, reset everything to its empty state.
        setForm(emptyForm);
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [productToEdit, isOpen]);

  // --- EVENT HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear the error for a field as soon as the user starts typing in it.
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Set the file object for uploading
      setImageFile(file);
      // Create a temporary local URL for the preview image
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Product name is required.";
    if (!form.price) newErrors.price = "Price is required.";
    else if (isNaN(form.price) || Number(form.price) < 0) newErrors.price = "Please enter a valid price.";
    if (!form.qty) newErrors.qty = "Stock quantity is required.";
    else if (isNaN(form.qty) || !Number.isInteger(Number(form.qty)) || Number(form.qty) < 0) newErrors.qty = "Please enter a valid whole number for stock.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if there are no errors
  };

  const handleSave = () => {
    if (validateForm()) {
      // If validation passes, send all data up to the parent component
      onSave({
        formData: form, 
        imageFile: imageFile, 
        productId: productToEdit?._id
      });
    }
  };

  // --- JSX RENDERING ---
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 border-b">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  <i className="fas fa-box text-xl"></i>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{productToEdit ? "Edit Product" : "Add New Product"}</h3>
                    <p className="text-sm text-gray-500">Fill in the details below to update your inventory.</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center" disabled={isSaving}>
                <i className="fas fa-times text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="md:col-span-1">
                        <FormField label="Product Image" name="image">
                             <ImageUpload image={imagePreview} onImageChange={handleImageChange} />
                        </FormField>
                    </div>
                    {/* Right Column */}
                    <div className="md:col-span-2 space-y-5">
                        <FormField label="Name*" name="name" error={errors.name}>
                            <input id="name" name="name" type="text" value={form.name} onChange={handleChange} className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.name ? 'border-red-500' : ''}`} placeholder="e.g., Organic Carrots" />
                        </FormField>
                        <div className="grid grid-cols-2 gap-5">
                           <FormField label="Category" name="category">
                                <input id="category" name="category" type="text" value={form.category} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" placeholder="e.g., Vegetables" />
                            </FormField>
                             <FormField label="SKU" name="sku">
                                <input id="sku" name="sku" type="text" value={form.sku} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" placeholder="Optional" />
                            </FormField>
                        </div>
                        <div className="grid grid-cols-3 gap-5">
                            <FormField label="Price*" name="price" error={errors.price}>
                                <input id="price" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.price ? 'border-red-500' : ''}`} />
                            </FormField>
                            <FormField label="Stock*" name="qty" error={errors.qty}>
                                <input id="qty" name="qty" type="number" value={form.qty} onChange={handleChange} className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.qty ? 'border-red-500' : ''}`} />
                            </FormField>
                             <FormField label="Unit" name="unit">
                                <input id="unit" name="unit" type="text" value={form.unit} onChange={handleChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" placeholder="e.g., kg" />
                            </FormField>
                        </div>
                        <FormField label="Description" name="description">
                            <textarea id="description" name="description" value={form.description} onChange={handleChange} rows="4" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500" placeholder="A short description..."></textarea>
                        </FormField>
                    </div>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-4 p-5 bg-gray-50 border-t rounded-b-2xl">
              <button onClick={onClose} disabled={isSaving} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="px-5 py-2 text-sm font-medium text-white bg-green-600 border rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:bg-green-400 flex items-center min-w-[120px] justify-center">
                {isSaving ? (
                    <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>
                ) : 'Save Product'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}