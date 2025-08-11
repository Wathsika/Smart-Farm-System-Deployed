import React, { useEffect, useState, useMemo } from "react";
import { api } from "../../lib/api";
import ProductModal from "./ProductModal"; // The pop-up form for adding/editing

// A small, reusable component for displaying the product's status with colors.
const StatusBadge = ({ status }) => {
  const statusStyles = {
    ACTIVE: "bg-green-100 text-green-800",
    INACTIVE: "bg-gray-100 text-gray-800",
    ARCHIVED: "bg-red-100 text-red-800",
  };
  const text = (status || "INACTIVE").replace("_", " ");
  return (
    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || statusStyles.INACTIVE}`}>
      {text}
    </span>
  );
};

// --- Main Product Management Component ---
export default function ProductsPage() {
  // --- STATE MANAGEMENT ---
  const [items, setItems] = useState([]); // Holds the list of all products
  const [loading, setLoading] = useState(true); // Tracks if data is being fetched
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls the Add/Edit modal visibility
  const [editingProduct, setEditingProduct] = useState(null); // Holds the product being edited
  const [isSaving, setIsSaving] = useState(false); // Tracks if a product is being saved (for modal's loading state)
  const [searchTerm, setSearchTerm] = useState(""); // Holds the value of the search input

  // --- HELPER FUNCTIONS ---
  const formatCurrency = (n) => (typeof n === 'number' ? `Rs ${n.toFixed(2)}` : "Rs 0.00");

  // --- DATA FETCHING ---
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      // Handle both paginated and non-paginated responses gracefully
      const productData = Array.isArray(res.data.items) ? res.data.items : Array.isArray(res.data) ? res.data : [];
      setItems(productData);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load products from the API when the component first mounts.
  useEffect(() => {
    loadProducts();
  }, []);

  // --- EVENT HANDLERS ---

  // Opens the modal for adding a new product (no argument) or editing an existing one.
  const handleOpenModal = (product = null) => {
    setEditingProduct(product); // If null, modal is in "Add" mode.
    setIsModalOpen(true);
  };

  // Closes the modal and resets the editing state.
  const handleCloseModal = () => {
    if (isSaving) return; // Prevent closing while an operation is in progress
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Handles both creating and updating a product. This function is passed to the modal.
  const handleSaveProduct = async ({ formData, imageFile, productId }) => {
    setIsSaving(true);
    
    const payload = new FormData();
    // Append all form fields to the payload
    payload.append('name', formData.name);
    payload.append('category', formData.category);
    payload.append('price', Number(formData.price));
    payload.append('unit', formData.unit);
    payload.append('description', formData.description);
    payload.append('stock[qty]', Number(formData.qty));
    payload.append('sku', formData.sku || '');

    // Append the image file only if a new one was selected.
    if (imageFile) {
      payload.append('image', imageFile);
    }

    try {
      if (productId) {
        // If a productId exists, we are updating an existing product.
        await api.put(`/products/${productId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' }});
      } else {
        // Otherwise, we are creating a new product.
        await api.post("/products", payload, { headers: { 'Content-Type': 'multipart/form-data' }});
      }
      handleCloseModal(); // Close modal on success
      loadProducts();     // Refresh the product list
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Operation failed. Please check the details and try again.");
    } finally {
      setIsSaving(false); // Re-enable the save button
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      await api.delete(`/products/${productId}`);
      loadProducts(); // Refresh the list after deleting
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to delete product.");
    }
  };
  
  // --- SEARCH & FILTER LOGIC ---
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items; // If search is empty, return all items
    const lowercasedTerm = searchTerm.toLowerCase();
    return items.filter(item => 
      (item.name && item.name.toLowerCase().includes(lowercasedTerm)) ||
      (item.category && item.category.toLowerCase().includes(lowercasedTerm)) ||
      (item.sku && item.sku.toLowerCase().includes(lowercasedTerm))
    );
  }, [items, searchTerm]);


  // --- JSX RENDERING ---
  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        {/* Header: Title, Search, and Add Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
            <p className="text-sm text-gray-500">Manage all products in your store.</p>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-3">
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="Search by name, category, SKU..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-green-500 focus:border-green-500" 
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            <button 
              onClick={() => handleOpenModal()} 
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex-shrink-0"
            >
              <i className="fas fa-plus"></i>
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600 w-[40%]">Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Category</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Price</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Stock</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && <tr><td colSpan="6" className="text-center py-12 text-gray-500">Loading inventory...</td></tr>}
              {!loading && filteredItems.length === 0 && (
                <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-500">
                        {searchTerm ? "No products match your search." : "No products found. Add one to get started!"}
                    </td>
                </tr>
              )}
              {filteredItems.map(product => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-3">
                    <img src={product.images?.[0] || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                    <span>{product.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{product.category}</td>
                  <td className="px-4 py-3 text-gray-500">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3 text-gray-500">{product.stock?.qty ?? 0} {product.unit}</td>
                  <td className="px-4 py-3"><StatusBadge status={product.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-4 justify-end">
                       <button onClick={() => handleOpenModal(product)} className="text-blue-600 hover:text-blue-800" title="Edit Product">
                          <i className="fas fa-pen text-base"></i>
                       </button>
                       <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-800" title="Delete Product">
                          <i className="fas fa-trash text-base"></i>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* The Add/Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
        isSaving={isSaving}
      />
    </div>
  );
}