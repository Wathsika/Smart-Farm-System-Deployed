import { motion } from "framer-motion";
import { useState } from "react";

export default function ProductCard({ 
  product, 
  onAddToCart,
  className = "" 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const img = product?.images?.[0] || "https://via.placeholder.com/300x300?text=No+Image";
  const isOutOfStock = (product?.stock?.qty ?? 0) === 0;
  
  const handleAddToCart = async () => {
    if (isOutOfStock || isLoading) return;
    
    setIsLoading(true);
    try {
      await onAddToCart?.(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `Rs. ${price.toLocaleString("en-LK")}`;
    }
    return "Price unavailable";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-200 transition-all duration-300 group ${className}`}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              -{product.discount}%
            </span>
          </div>
        )}

        {/* Product Image */}
        <motion.img
          src={imageError ? "https://via.placeholder.com/300x300?text=No+Image" : img}
          alt={product.name || "Product"}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isOutOfStock ? 'opacity-50 grayscale' : ''
          }`}
          onError={() => setImageError(true)}
          loading="lazy"
        />

        {/* Quick Add Button - Shows on Hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            onClick={handleAddToCart}
            disabled={isOutOfStock || isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isOutOfStock
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : isLoading
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-800 hover:bg-green-50 hover:text-green-700 shadow-lg'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </div>
            ) : isOutOfStock ? (
              'Out of Stock'
            ) : (
              'Quick Add'
            )}
          </motion.button>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium">
              Out of Stock
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 leading-tight min-h-[2.5rem] group-hover:text-green-600 transition-colors">
          {product.name || "Unnamed Product"}
        </h3>
        
        {/* Category */}
        <p className="text-xs text-gray-500 mb-3 capitalize">
          {product.category || "General"}
        </p>
        
        {/* Price and Cart Button */}
        <div className="flex items-center justify-between">
          {/* Price Section */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-600 text-lg">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  Rs. {product.originalPrice.toLocaleString("en-LK")}
                </span>
              )}
            </div>
            
            {/* Unit Info */}
            {product.unit && (
              <span className="text-xs text-gray-500">
                per {product.unit}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={isOutOfStock || isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isLoading
                ? 'bg-green-500 text-white'
                : 'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700'
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isOutOfStock ? (
              <i className="fas fa-ban text-sm"></i>
            ) : (
              <i className="fas fa-cart-plus text-sm"></i>
            )}
          </motion.button>
        </div>

        {/* Stock Status (subtle) */}
        {!isOutOfStock && product.stock?.qty && product.stock.qty <= 5 && (
          <div className="mt-2 text-xs text-orange-600">
            Only {product.stock.qty} left
          </div>
        )}
      </div>
    </motion.div>
  );
}