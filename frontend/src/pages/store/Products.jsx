// src/pages/store/Products.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import ProductModal from "./ProductModal";

/* ---------------- Status badge ---------------- */
const StatusBadge = ({ status, stock = 0 }) => {
  const effective =
    stock === 0 ? "OUT_OF_STOCK" : stock < 10 ? "LOW_STOCK" : (status || "ACTIVE");

  const styles = {
    ACTIVE: "bg-green-50 text-green-700 border border-green-200",
    INACTIVE: "bg-gray-50 text-gray-600 border border-gray-200",
    ARCHIVED: "bg-red-50 text-red-700 border border-red-200",
    LOW_STOCK: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    OUT_OF_STOCK: "bg-red-50 text-red-700 border-red-200",
  };

  const text = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    ARCHIVED: "Archived",
    LOW_STOCK: "Low Stock",
    OUT_OF_STOCK: "Out of Stock",
  };

  const icons = {
    ACTIVE: "fas fa-check-circle",
    INACTIVE: "fas fa-pause-circle",
    ARCHIVED: "fas fa-archive",
    LOW_STOCK: "fas fa-exclamation-triangle",
    OUT_OF_STOCK: "fas fa-times-circle",
  };

  return (
    <span className={`px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-medium rounded-full ${styles[effective]}`}>
      <i className={`${icons[effective]} text-xs`} />
      {text[effective]}
    </span>
  );
};

/* ---------------- Desktop row ---------------- */
const ProductRow = ({ product, onEdit, onDelete, index }) => {
  const qty = product?.stock?.qty ?? 0;
  return (
      <Motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
      className="group hover:bg-green-50/40 transition-colors"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <Motion.div
            className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-100"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.18 }}
          >
            <img
              src={product.images?.[0] || "https://via.placeholder.com/48"}
              alt={product.name || "Product"}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/48"; }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          </Motion.div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
              {product.name}
            </span>
            {product.sku && (
              <span className="text-xs text-gray-500 mt-0.5">SKU: {product.sku}</span>
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-gray-50 rounded-lg text-sm text-gray-700">
          <i className="fas fa-tag text-xs text-gray-400" />
          {product.category || "-"}
        </span>
      </td>

      <td className="px-6 py-4">
        <span className="font-semibold text-gray-900">
          Rs {typeof product.price === "number" ? product.price.toFixed(2) : "0.00"}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span
            className={`font-medium ${
              qty === 0 ? "text-red-600" : qty < 10 ? "text-yellow-600" : "text-gray-900"
            }`}
          >
            {qty}
          </span>
          <span className="text-sm text-gray-500">{product.unit || ""}</span>
        </div>
      </td>

      <td className="px-6 py-4">
        <StatusBadge status={product.status} stock={qty} />
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onEdit(product)}
            className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center"
            title="Edit Product"
          >
            <i className="fas fa-edit text-sm" />
          </Motion.button>
          <Motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onDelete(product._id)}
            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
            title="Delete Product"
          >
            <i className="fas fa-trash text-sm" />
          </Motion.button>
        </div>
      </td>
    </Motion.tr>
  );
};

/* ---------------- Mobile card ---------------- */
const ProductCard = ({ product, onEdit, onDelete }) => {
  const qty = product?.stock?.qty ?? 0;
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border">
        <img
          src={product.images?.[0] || "https://via.placeholder.com/56"}
          alt={product.name || "Product"}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/56"; }}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-gray-900">{product.name}</h4>
          <span className="font-semibold text-gray-900">Rs {Number(product.price || 0).toFixed(2)}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
          <span className="px-2 py-0.5 rounded bg-gray-50 border text-gray-700">
            <i className="fas fa-tag mr-1 text-gray-400" /> {product.category || "-"}
          </span>
          <span className={`font-medium ${qty === 0 ? "text-red-600" : qty < 10 ? "text-yellow-600" : "text-gray-700"}`}>
            {qty} {product.unit || ""}
          </span>
          <StatusBadge status={product.status} stock={qty} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 px-3 py-2 rounded-lg border text-blue-600 border-blue-200 bg-blue-50 active:scale-[0.98]"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(product._id)}
            className="flex-1 px-3 py-2 rounded-lg border text-red-600 border-red-200 bg-red-50 active:scale-[0.98]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Main page ---------------- */
export default function ProductsPage() {
  // data
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);       // first load spinner
  const [refreshing, setRefreshing] = useState(false); // background refresh (no hide)
  const firstLoad = useRef(true);

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // ui
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = items.length || 1000;

  // fetch (keeps list on screen after first load)
  const loadProducts = async () => {
    try {
      if (firstLoad.current) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
     const res = await api.get("/products", { params: { limit: 1000 } });
      const data = Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setItems(data);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to load products. Please try again.");
    } finally {
      if (firstLoad.current) {
        setLoading(false);
        firstLoad.current = false;
      }
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // keep currentPage in range whenever items change (fix blank after delete)
  useEffect(() => {
    const tp = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
    if (currentPage > tp) setCurrentPage(tp);
   }, [items, currentPage, ITEMS_PER_PAGE]);

  // handlers
  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async ({ formData, imageFile, productId }) => {
    setIsSaving(true);

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("category", formData.category);
    payload.append("price", Number(formData.price));
    payload.append("unit", formData.unit);
    payload.append("description", formData.description);
    payload.append("stock[qty]", Number(formData.qty));
    payload.append("sku", formData.sku || "");
    if (imageFile) payload.append("image", imageFile);

    try {
      if (productId) {
        // Optimistic UI for edit
        setItems((prev) =>
          prev.map((p) =>
            p._id === productId
              ? {
                  ...p,
                  ...formData,
                  price: Number(formData.price),
                  stock: { ...(p.stock || {}), qty: Number(formData.qty) },
                }
              : p
          )
        );
        await api.put(`/products/${productId}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        // Create then background refresh
        await api.post("/products", payload, { headers: { "Content-Type": "multipart/form-data" } });
      }
      handleCloseModal();
      // background refresh (won't hide table)
      loadProducts();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Operation failed. Please check and try again.");
      // if server failed after optimistic change, refetch to correct
      loadProducts();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
    const prev = items;
    // optimistic remove to avoid “ghost row”
    setItems((p) => p.filter((x) => x._id !== id));
    try {
      await api.delete(`/products/${id}`);
      // background refresh (keeps UI)
      loadProducts();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to delete product.");
      setItems(prev); // rollback if failed
    }
  };

  // search + pagination
  const filtered = useMemo(() => {
    if (!searchTerm) return items;
    const q = searchTerm.toLowerCase();
    return items.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
    );
  }, [items, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1); // reset to first page if search changes
  }, [searchTerm]);

  // stats
  const stats = useMemo(() => {
    const totalProducts = items.length;
    const outOfStock = items.filter((i) => (i.stock?.qty ?? 0) === 0).length;
    const lowStock = items.filter((i) => {
      const q = i.stock?.qty ?? 0;
      return q > 0 && q < 10;
    }).length;
    const totalValue = items.reduce(
      (sum, i) => sum + (Number(i.price) || 0) * (i.stock?.qty ?? 0),
      0
    );
    return { totalProducts, outOfStock, lowStock, totalValue };
  }, [items]);

  const statStyle = {
    green: { box: "bg-green-50", icon: "text-green-600" },
    yellow: { box: "bg-yellow-50", icon: "text-yellow-600" },
    red: { box: "bg-red-50", icon: "text-red-600" },
    blue: { box: "bg-blue-50", icon: "text-blue-600" },
  };

  const statCards = [
    { title: "Total Products", value: stats.totalProducts, icon: "fas fa-box", s: statStyle.green },
    { title: "Low Stock", value: stats.lowStock, icon: "fas fa-exclamation-triangle", s: statStyle.yellow },
    { title: "Out of Stock", value: stats.outOfStock, icon: "fas fa-times-circle", s: statStyle.red },
    { title: "Total Value", value: `Rs ${stats.totalValue.toFixed(2)}`, icon: "fas fa-dollar-sign", s: statStyle.blue },
  ];

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="p-4 sm:p-6 bg-gray-50 min-h-screen"
    >
      {/* Stats */}
      <Motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {statCards.map((c, i) => (
          <Motion.div
            key={c.title}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12 + i * 0.05 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{c.title}</p>
                <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${c.s.box} flex items-center justify-center`}>
                <i className={`${c.icon} ${c.s.icon} text-xl`} />
              </div>
            </div>
          </Motion.div>
        ))}
      </Motion.div>

      {/* Card */}
      <Motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-sm text-gray-600 mt-0.5">Manage all products in your store</p>
              </div>
              {refreshing && (
                <span className="ml-1 text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                  Refreshing…
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <input
                  type="text"
                  placeholder="Search products, categories, SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenModal()}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 sm:px-6 py-2.5 rounded-xl hover:bg-green-700 transition shadow-sm flex-shrink-0"
              >
                <i className="fas fa-plus" />
                <span className="hidden sm:inline font-medium">Add Product</span>
              </Motion.button>
            </div>
          </div>
        </div>

        {/* Mobile list */}
        <div className="p-4 space-y-3 sm:hidden">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Loading inventory…</p>
            </div>
          ) : pageItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-3">
                <i className="fas fa-box text-2xl text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">
                {searchTerm ? "No products match your search" : "No products found"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm ? "Try different keywords" : "Add your first product to get started"}
              </p>
            </div>
          ) : (
            pageItems.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {loading && (
                  <Motion.tr
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan="6" className="text-center py-16">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500">Loading inventory...</p>
                      </div>
                    </td>
                  </Motion.tr>
                )}

                {!loading && pageItems.length === 0 && (
                  <Motion.tr
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan="6" className="text-center py-16">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-box text-2xl text-gray-400" />
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">
                            {searchTerm ? "No products match your search" : "No products found"}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {searchTerm
                              ? "Try adjusting your search terms"
                              : "Add your first product to get started"}
                          </p>
                        </div>
                      </div>
                    </td>
                  </Motion.tr>
                )}

                {!loading &&
                  pageItems.map((p, i) => (
                    <ProductRow
                      key={p._id}
                      product={p}
                      onEdit={handleOpenModal}
                      onDelete={handleDelete}
                      index={i}
                    />
                  ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <Motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between"
          >
            <div className="text-sm text-gray-600">
              Showing {start + 1} to {Math.min(start + ITEMS_PER_PAGE, filtered.length)} of {filtered.length} products
            </div>

           {totalPages > 1 && (
              <div className="flex items-center gap-2">
              
                <button
                 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <i className="fas fa-chevron-left" />
                </button>
             {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === pg ? "bg-green-600 text-white" : "border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <i className="fas fa-chevron-right" />
                </button>
              </div>
            )}
          </Motion.div>

             
        )}
      </Motion.div>

      {/* Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
        isSaving={isSaving}
      />
    </Motion.div>
  );
}
