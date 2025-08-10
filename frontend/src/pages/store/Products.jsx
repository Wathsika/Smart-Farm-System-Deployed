import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import ProductModal from "./ProductModal";

// THIS IS THE NEW STATUS BADGE - REPLACE THE OLD ONE WITH THIS
const StatusBadge = ({ product }) => {
  // Use a default product object to prevent errors if 'product' is undefined
  const safeProduct = product || { stock: {} };

  const stockQty = safeProduct.stock?.qty ?? 0;
  const lowThreshold = safeProduct.stock?.lowStockThreshold ?? 10;
  const dbStatus = safeProduct.status;

  let displayStatus = 'INACTIVE';
  
  if (dbStatus === 'ACTIVE') {
      if (stockQty <= 0) {
        displayStatus = 'OUT_OF_STOCK';
      } else if (stockQty <= lowThreshold) {
        displayStatus = 'LOW_STOCK';
      } else {
        displayStatus = 'IN_STOCK';
      }
  } else if (dbStatus) {
      displayStatus = dbStatus;
  }
  
  const statusConfig = {
    IN_STOCK: {
      bg: "bg-green-100", 
      text: "text-green-700", 
      label: "In Stock",
      dot: "bg-green-500",
    },
    LOW_STOCK: {
      bg: "bg-yellow-100", 
      text: "text-yellow-700", 
      label: "Low Stock",
      dot: "bg-yellow-500",
    },
    OUT_OF_STOCK: {
      bg: "bg-red-100", 
      text: "text-red-700", 
      label: "Out of Stock",
      dot: "bg-red-500",
    },
    INACTIVE: {
      bg: "bg-gray-100", 
      text: "text-gray-700", 
      label: "Inactive",
      dot: "bg-gray-500",
    },
    ARCHIVED: {
      bg: "bg-red-100", 
      text: "text-red-700", 
      label: "Archived",
      dot: "bg-red-500",
    }
  };

  const config = statusConfig[displayStatus] || statusConfig.INACTIVE;
  
  return (
    <span className={`px-2.5 py-1 inline-flex items-center gap-2 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
      {config.label}
    </span>
  );
};

const DeleteModal = ({ isOpen, onClose, onConfirm, productName, isDeleting }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <i className="fas fa-trash text-red-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <span className="font-semibold">"{productName}"</span>? 
                This will permanently remove the product from your inventory.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={onClose}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash text-sm"></i>
                      Delete Product
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
};

const EmptyState = ({ searchTerm }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <i className={`fas ${searchTerm ? 'fa-search' : 'fa-box'} text-3xl text-gray-400`}></i>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {searchTerm ? 'No products found' : 'No products yet'}
    </h3>
    <p className="text-gray-600 mb-6">
      {searchTerm 
        ? `No products match "${searchTerm}". Try adjusting your search.`
        : 'Start building your inventory by adding your first product.'
      }
    </p>
    {!searchTerm && (
      <button 
        onClick={() => handleOpenModal()}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <i className="fas fa-plus"></i>
        Add Your First Product
      </button>
    )}
  </motion.div>
);

const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4">
        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/6"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
        <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const formatCurrency = (n) => (typeof n === 'number' ? `Rs ${n.toFixed(2)}` : "Rs 0.00");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      const productData = Array.isArray(res.data.items) ? res.data.items : Array.isArray(res.data) ? res.data : [];
      setItems(productData);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleSaveProduct = async ({ formData, imageFile, productId }) => {
    setIsSaving(true);
    
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('category', formData.category);
    payload.append('price', Number(formData.price));
    payload.append('description', formData.description);
    payload.append('unit', formData.unit);
    payload.append('stock[qty]', Number(formData.qty));
    payload.append('stock[lowStockThreshold]', editingProduct?.stock?.lowStockThreshold || 10);
    if(imageFile){
      payload.append('image', imageFile);
    }

    try {
      if (productId) {
        await api.put(`/products/${productId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' }});
      } else {
        await api.post("/products", payload, { headers: { 'Content-Type': 'multipart/form-data' }});
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Operation failed.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteClick = (product) => {
    setDeleteModal({ isOpen: true, product });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.product) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/products/${deleteModal.product._id}`);
      setDeleteModal({ isOpen: false, product: null });
      loadProducts();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const filteredItems = useMemo(() => {
    if(!searchTerm) return items;
    return items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-green-50 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-50 to-white p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <i className="fas fa-warehouse text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Inventory</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {loading ? "Loading..." : `${items.length} ${items.length === 1 ? 'product' : 'products'} in stock`}
                </p>
              </div>
            </div>
            
            <div className="flex w-full sm:w-auto items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <input 
                  type="text" 
                  placeholder="Search products or categories..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 py-3 border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all duration-200 bg-white hover:border-gray-300"
                />
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenModal()} 
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl flex-shrink-0 font-medium"
              >
                <i className="fas fa-plus"></i>
                <span className="hidden sm:inline">Add Product</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredItems.length === 0 ? (
            <EmptyState searchTerm={searchTerm} />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  <AnimatePresence>
                    {filteredItems.map((product, index) => (
                      <motion.tr
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img 
                                src={product.images?.[0] || 'https://via.placeholder.com/48'} 
                                alt={product.name}
                                className="w-12 h-12 rounded-xl object-cover border-2 border-gray-100"
                              />
                              {product.images?.[0] && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <i className="fas fa-check text-xs text-white"></i>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                              {product.description && (
                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm text-gray-700">{product.category}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {product.stock?.qty ?? 0}
                            </span>
                            {product.unit && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {product.unit}
                              </span>
                            )}
                          </div>
                        </td>
                        
                       <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge product={product} />
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleOpenModal(product)}
                              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                              title="Edit Product"
                            >
                              <i className="fas fa-edit"></i>
                              <span className="hidden sm:inline">Edit</span>
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteClick(product)}
                              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                              title="Delete Product"
                            >
                              <i className="fas fa-trash"></i>
                              <span className="hidden sm:inline">Delete</span>
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && filteredItems.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredItems.length} of {items.length} products
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>In Stock</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Low Stock</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Out of Stock</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={handleDeleteConfirm}
        productName={deleteModal.product?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}