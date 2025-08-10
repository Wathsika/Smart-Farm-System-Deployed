import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FormField = ({ label, name, error, children, required = false }) => (
  <div className="space-y-2">
    <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="text-green-500 ml-1">*</span>}
    </label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-xs text-red-500 flex items-center gap-1.5"
        >
          <i className="fas fa-exclamation-circle text-xs"></i>
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const ImageUpload = ({ image, onImageChange, error }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageChange({ target: { files: [file] } });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`relative w-full h-40 rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden group cursor-pointer ${
          isDragging 
            ? 'border-green-400 bg-green-50' 
            : error 
            ? 'border-red-300 bg-red-50' 
            : 'border-gray-300 bg-gray-50 hover:border-green-300 hover:bg-green-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {image ? (
          <div className="relative w-full h-full">
            <img src={image} alt="Product Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white text-center">
                <i className="fas fa-edit text-xl mb-2"></i>
                <p className="text-sm font-medium">Change Image</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-green-500 transition-colors">
            <i className="fas fa-cloud-upload-alt text-3xl mb-3"></i>
            <p className="text-sm font-medium mb-1">
              {isDragging ? 'Drop image here' : 'Upload Product Image'}
            </p>
            <p className="text-xs text-gray-500">
              Drag & drop or click to browse
            </p>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <i className="fas fa-info-circle"></i>
          <span>PNG, JPG up to 5MB</span>
        </div>
        {image && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onImageChange({ target: { files: [] } });
            }}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onImageChange} 
        className="hidden" 
        accept="image/png, image/jpeg, image/jpg" 
      />
    </div>
  );
};

const categories = [
  'General', 'Vegetables', 'Fruits', 'Dairy', 'Meat', 'Bakery', 'Beverages', 'Snacks', 'Spices', 'Other'
];

const units = [
  'kg', 'g', 'lb', 'oz', 'piece', 'dozen', 'liter', 'ml', 'pack', 'box', 'bottle', 'can'
];

export default function ProductModal({ isOpen, onClose, onSave, productToEdit, isSaving }) {
  const emptyForm = { name: "", category: "General", price: "", qty: "", unit: "", description: "" };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setTouched({});
      if (productToEdit) {
        setForm({
          name: productToEdit.name || "",
          category: productToEdit.category || "General",
          price: productToEdit.price || "",
          qty: productToEdit.stock?.qty || "",
          unit: productToEdit.unit || "", 
          description: productToEdit.description || "",
        });
        setImagePreview(productToEdit.images?.[0] || null);
        setImageFile(null);
      } else {
        setForm(emptyForm);
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [productToEdit, isOpen]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return "Product name is required";
        if (value.trim().length < 2) return "Product name must be at least 2 characters";
        return null;
      case 'price':
        if (!value) return "Price is required";
        if (isNaN(value) || Number(value) < 0) return "Please enter a valid price";
        if (Number(value) === 0) return "Price must be greater than 0";
        return null;
      case 'qty':
        if (!value) return "Stock quantity is required";
        if (isNaN(value) || !Number.isInteger(Number(value)) || Number(value) < 0) 
          return "Please enter a valid whole number";
        return null;
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation for touched fields
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image size must be less than 5MB" }));
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: null }));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  }

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all required fields
    newErrors.name = validateField('name', form.name);
    newErrors.price = validateField('price', form.price);
    newErrors.qty = validateField('qty', form.qty);
    
    // Filter out null errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });
    
    setErrors(newErrors);
    setTouched({ name: true, price: true, qty: true });
    return Object.keys(newErrors).length === 0;
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        formData: form, 
        imageFile: imageFile, 
        productId: productToEdit?._id
      });
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                  <i className="fas fa-box text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {productToEdit ? "Edit Product" : "Add New Product"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {productToEdit ? "Update your product details" : "Create a new product for your inventory"}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                disabled={isSaving}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <i className="fas fa-times text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Image Upload Section */}
                <div className="lg:col-span-2">
                  <FormField label="Product Image" name="image" error={errors.image}>
                    <ImageUpload 
                      image={imagePreview} 
                      onImageChange={handleImageChange}
                      error={errors.image}
                    />
                  </FormField>
                </div>

                {/* Form Fields Section */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Product Name */}
                  <FormField label="Product Name" name="name" error={errors.name} required>
                    <input 
                      id="name" 
                      name="name" 
                      type="text" 
                      value={form.name} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onKeyPress={handleKeyPress}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                        errors.name 
                          ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400' 
                          : 'border-gray-200 bg-white focus:ring-green-200 focus:border-green-400 hover:border-gray-300'
                      }`}
                      placeholder="e.g., Organic Carrots"
                    />
                  </FormField>
                  
                  {/* Category and Unit */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Category" name="category">
                      <select
                        id="category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-200 focus:border-green-400 hover:border-gray-300 transition-all duration-200"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </FormField>
                    
                    <FormField label="Unit" name="unit">
                      <select
                        id="unit"
                        name="unit"
                        value={form.unit}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-200 focus:border-green-400 hover:border-gray-300 transition-all duration-200"
                      >
                        <option value="">Select unit</option>
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                  
                  {/* Price and Stock */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Price" name="price" error={errors.price} required>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                        <input 
                          id="price" 
                          name="price" 
                          type="number" 
                          step="0.01" 
                          value={form.price} 
                          onChange={handleChange}
                          onBlur={handleBlur}
                          onKeyPress={handleKeyPress}
                          className={`w-full pl-8 pr-4 py-3 rounded-xl border transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                            errors.price 
                              ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400' 
                              : 'border-gray-200 bg-white focus:ring-green-200 focus:border-green-400 hover:border-gray-300'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                    </FormField>
                    
                    <FormField label="Stock Quantity" name="qty" error={errors.qty} required>
                      <input 
                        id="qty" 
                        name="qty" 
                        type="number" 
                        min="0"
                        value={form.qty} 
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyPress={handleKeyPress}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                          errors.qty 
                            ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400' 
                            : 'border-gray-200 bg-white focus:ring-green-200 focus:border-green-400 hover:border-gray-300'
                        }`}
                        placeholder="0"
                      />
                    </FormField>
                  </div>
                  
                  {/* Description */}
                  <FormField label="Description" name="description">
                    <textarea 
                      id="description" 
                      name="description" 
                      value={form.description} 
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      rows="4" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-200 focus:border-green-400 hover:border-gray-300 transition-all duration-200 placeholder-gray-400 focus:outline-none resize-none"
                      placeholder="Add a detailed description of your product..."
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center gap-4 p-6 bg-gray-50 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                <span className="text-green-500">*</span> Required fields
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={onClose} 
                  disabled={isSaving} 
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                
                <button 
                  onClick={handleSave} 
                  disabled={isSaving} 
                  className="px-8 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 border border-transparent rounded-xl hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      Save Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}