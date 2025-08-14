import { useEffect, useState, useMemo } from "react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard"; // Ensure this path is correct for your project
import { motion, AnimatePresence } from "framer-motion";

// These helper components are well-built and do not require changes.
// I've included them here so you have a single file to copy-paste.
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border bg-white overflow-hidden shadow-sm">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function FilterBar({ filters, onFilterChange, categories, resultCount }) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const handleFilterTupleChange = (key, value) => {
    onFilterChange(key, value);
  };
  
  const clearFilters = () => {
    onFilterChange('clear', null); // Use a special key for clearing
  };
  
  const activeFiltersCount = Object.values(filters).filter(value => value && value !== 'all').length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="lg:hidden p-4 border-b border-gray-100">
        <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="flex items-center justify-between w-full text-left">
          <div className="flex items-center gap-2">
            <i className="fas fa-filter text-gray-500"></i>
            <span className="font-medium text-gray-900">Filters</span>
            {activeFiltersCount > 0 && <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">{activeFiltersCount}</span>}
          </div>
          <i className={`fas fa-chevron-${showMobileFilters ? 'up' : 'down'} text-gray-400`}></i>
        </button>
      </div>

      <motion.div initial={false} animate={{ height: showMobileFilters || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 'auto' : 0 }} className="overflow-hidden lg:block">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{resultCount} {resultCount === 1 ? 'product' : 'products'}</span>
            {activeFiltersCount > 0 && <button onClick={clearFilters} className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors">Clear all</button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Category</label><select value={filters.category} onChange={(e) => handleFilterTupleChange('category', e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"><option value="all">All Categories</option>{categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Sort by</label><select value={filters.sortBy} onChange={(e) => handleFilterTupleChange('sortBy', e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"><option value="name">Name A-Z</option><option value="name-desc">Name Z-A</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="newest">Newest First</option></select></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Min Price</label><input type="number" placeholder="Rs. 0" value={filters.priceMin} onChange={(e) => handleFilterTupleChange('priceMin', e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"/></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Max Price</label><input type="number" placeholder="Rs. 999+" value={filters.priceMax} onChange={(e) => handleFilterTupleChange('priceMax', e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"/></div>
            <div className="flex items-end"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.inStock} onChange={(e) => handleFilterTupleChange('inStock', e.target.checked)} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-200"/><span className="text-sm text-gray-700">In stock only</span></label></div>
            <div className="flex items-end gap-2"><button onClick={clearFilters} className="px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"><i className="fas fa-refresh text-xs mr-1"></i>Reset</button></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function EmptyState({ searchQuery, hasFilters, onClearFilters }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"><i className={`fas ${searchQuery ? 'fa-search' : 'fa-shopping-bag'} text-3xl text-gray-400`}></i></div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{searchQuery ? 'No products found' : 'No products available'}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{searchQuery ? `We couldn't find any products matching "${searchQuery}". Try different keywords.` : hasFilters ? 'No products match your filters. Try clearing them.' : 'Our store is being stocked. Please check back soon!'}</p>
      {(searchQuery || hasFilters) && (<button onClick={onClearFilters} className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"><i className="fas fa-refresh"></i>Clear Search & Filters</button>)}
    </motion.div>
  );
}


export default function Storefront() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({
    category: 'all', sortBy: 'name', priceMin: '', priceMax: '', inStock: false
  });
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(searchQuery); }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products ONCE on component mount
  useEffect(() => {
    setLoading(true);
    api.get("/products")
      .then((res) => {
        const productData = res.data.items || res.data;
        setAllProducts(Array.isArray(productData) ? productData : []);
      })
      .catch((e) => {
        console.error("Failed to fetch products:", e);
        setAllProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    return [...new Set(allProducts.map(item => item.category).filter(Boolean))];
  }, [allProducts]);

  // Filter and sort products on the client-side
  const filteredAndSortedProducts = useMemo(() => {
    let processedProducts = [...allProducts];

    // Search filter
    if (debouncedSearch) {
        processedProducts = processedProducts.filter(item =>
            item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            item.category.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }
    
    // Advanced filters
    if (filters.category !== 'all') processedProducts = processedProducts.filter(item => item.category === filters.category);
    if (filters.priceMin) processedProducts = processedProducts.filter(item => (item.price || 0) >= Number(filters.priceMin));
    if (filters.priceMax) processedProducts = processedProducts.filter(item => (item.price || 0) <= Number(filters.priceMax));
    if (filters.inStock) processedProducts = processedProducts.filter(item => (item.stock?.qty || 0) > 0);

        // Apply sorting
    processedProducts.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-desc':
          // Safety check for names
          return (b.name || '').localeCompare(a.name || '');
        case 'price-low':
          // Safety check for prices
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          // Safety check for prices
          return (b.price || 0) - (a.price || 0);
        case 'newest':
          // Safety check for dates
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default: // 'name' (A-Z)
          // Safety check for names
          return (a.name || '').localeCompare(b.name || '');
      }
    });
    
    return processedProducts;
  }, [allProducts, filters, debouncedSearch]);
  
  const handleFilterChange = (key, value) => {
    if (key === 'clear') {
        clearAllFilters();
    } else {
        setFilters(prev => ({ ...prev, [key]: value }));
    }
  };
  
  const clearAllFilters = () => {
    setSearchQuery("");
    setFilters({ category: 'all', sortBy: 'name', priceMin: '', priceMax: '', inStock: false });
  };
  
  const hasActiveFilters = useMemo(() => {
    return debouncedSearch || filters.category !== 'all' || filters.priceMin || filters.priceMax || filters.inStock || filters.sortBy !== 'name';
  }, [filters, debouncedSearch]);
  
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Fresh from GreenLeaf</h1>
              <p className="text-gray-600">Discover our premium collection of fresh, organic products</p>
            </div>
            <div className="relative w-full lg:w-96">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for products..." className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all shadow-sm" />
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"><i className="fas fa-times"></i></button>}
            </div>
          </div>
          <FilterBar filters={filters} onFilterChange={handleFilterChange} categories={categories} resultCount={filteredAndSortedProducts.length} />
        </motion.div>
        
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
            </motion.div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <motion.div key="products" layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </motion.div>
          ) : (
            <EmptyState searchQuery={debouncedSearch} hasFilters={hasActiveFilters} onClearFilters={clearAllFilters} />
          )}
        </AnimatePresence>

        {!loading && filteredAndSortedProducts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 text-center">
            <p className="text-gray-600">Showing {filteredAndSortedProducts.length} of {allProducts.length} products</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}