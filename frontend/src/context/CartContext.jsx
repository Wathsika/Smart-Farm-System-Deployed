import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'; // 1. Import useCallback

// Create the context
const CartContext = createContext();

// Create a custom hook for easy access
export const useCart = () => {
  return useContext(CartContext);
};

// Create the Provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('cartItems');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse cart data from localStorage", error);
      return [];
    }
  });

  // Save to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  
  // --- THIS IS THE FIX ---
  // Wrap the functions that don't depend on external state in `useCallback`
  // with an empty dependency array `[]`. This tells React to create them only once.

  const addToCart = useCallback((product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      if (existingItem) {
        return prevItems.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  }, []);
  
  const updateQuantity = useCallback((productId, newQuantity) => {
    const quantity = Number(newQuantity);
    setCartItems(prevItems => {
      if (quantity < 1) {
        return prevItems.filter(item => item._id !== productId);
      }
      return prevItems.map(item =>
        item._id === productId ? { ...item, quantity: quantity } : item
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []); // The empty dependency array `[]` is crucial here


  // --- CALCULATED VALUES ---
  const totalItemsInCart = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);


  // --- EXPORTED VALUE ---
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart, // Now exporting the stable, memoized function
    totalItemsInCart,
    cartTotal,
  };

  // The Provider component renders its children, making the `value` object available
  // to any component nested inside that calls the `useCart()` hook.
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};