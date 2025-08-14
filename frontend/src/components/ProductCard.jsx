import { motion } from "framer-motion";
import { useState } from "react";
import { useCart } from "../context/CartContext"; // Import useCart to get item quantities
import { Link } from "react-router-dom";

export default function ProductCard({ 
  product, 
  className = "" 
}) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Find the current item in the global cart state to get its quantity
  const itemInCart = cartItems.find(item => item._id === product._id);
  const quantityInCart = itemInCart?.quantity || 0;
  
  const img = product?.images?.[0] || `https://via.placeholder.com/300x300.png?text=${(product?.name || 'No+Name').replace(/ /g, '+')}`;
  const isOutOfStock = (product?.stock?.qty ?? 0) === 0;
  
  // A wrapper for add to cart to handle loading state
  const handleAddToCart = async () => {
    if (isOutOfStock || isLoading) return;
    
    setIsLoading(true);
    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300)); 
      addToCart(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `Rs ${price.toFixed(2)}`;
    }
    return "N/A";
  };
  
  // --- USER-FRIENDLY ADD-TO-CART BUTTON COMPONENT ---
  const AddToCartButton = () => {
    if(isOutOfStock){
        return <button disabled className="w-full text-center px-4 py-2 rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed text-sm font-semibold">Out of Stock</button>
    }
    
    if (quantityInCart > 0) {
      // If item is already in cart, show quantity controls
      return (
        <div className="flex items-center justify-between w-full bg-green-50 rounded-lg">
          <button 
            onClick={() => updateQuantity(product._id, quantityInCart - 1)}
            className="px-4 py-2 text-green-700 hover:text-green-900 rounded-l-lg"
          >
            <i className="fas fa-minus"></i>
          </button>
          <span className="font-semibold text-green-800">{quantityInCart} in cart</span>
          <button
            onClick={() => updateQuantity(product._id, quantityInCart + 1)}
            className="px-4 py-2 text-green-700 hover:text-green-900 rounded-r-lg"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      );
    }

    // Default "Add to Cart" button
    return (
        <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            disabled={isLoading}
            className="w-full text-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 text-sm font-semibold flex items-center justify-center gap-2"
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Adding...
                </>
            ) : (
                <>
                    <i className="fas fa-cart-plus"></i> Add to Cart
                </>
            )}
        </motion.button>
    );
  };


  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, boxShadow: "0 10px 20px -5px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col group ${className}`}
    >
      {/* Image Container with Link */}
      <Link to={`/product/${product._id}`} className="relative block aspect-square bg-gray-50 overflow-hidden">
        <motion.img
          src={imageError ? "https://via.placeholder.com/300x300.png?text=Image+Error" : img}
          alt={product.name || "Product"}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isOutOfStock ? 'opacity-50 grayscale' : ''
          }`}
          onError={() => setImageError(true)}
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              Out of Stock
            </div>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-xs text-gray-500 mb-1 capitalize">
          {product.category || "General"}
        </p>
        <Link to={`/product/${product._id}`} className="block">
          <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2 leading-tight min-h-[2.5rem] group-hover:text-green-600 transition-colors">
            {product.name || "Unnamed Product"}
          </h3>
        </Link>
        
        {/* Spacer */}
        <div className="flex-grow"></div>
        
        {/* Price Section */}
        <div className="flex items-end gap-2 mt-2">
            <span className="font-bold text-green-600 text-lg">
              {formatPrice(product.price)}
            </span>
             {product.unit && (
              <span className="text-xs text-gray-500 pb-0.5">
                / {product.unit}
              </span>
            )}
        </div>
        
        {/* Add to Cart Button Section */}
        <div className="mt-4">
            <AddToCartButton />
        </div>
      </div>
    </motion.div>
  );
}