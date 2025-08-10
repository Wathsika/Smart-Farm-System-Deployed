import React, { createContext, useState, useContext } from 'react';

// 1. Create the context
const CartContext = createContext();

// 2. Create a custom hook to use the context easily
export const useCart = () => {
  return useContext(CartContext);
};

// 3. Create the Provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Function to add a product to the cart
  const addToCart = (product) => {
    setCartItems(prevItems => {
      // Check if the item already exists in the cart
      const existingItem = prevItems.find(item => item._id === product._id);

      if (existingItem) {
        // If it exists, map through and increase the quantity of that item
        return prevItems.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // If it's a new item, add it to the cart with quantity 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // Function to remove an item from the cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  // Function to update the quantity of an item
  const updateQuantity = (productId, newQuantity) => {
    const quantity = Number(newQuantity);
    setCartItems(prevItems => {
      if (quantity < 1) {
        // If quantity is less than 1, remove the item
        return prevItems.filter(item => item._id !== productId);
      }
      return prevItems.map(item =>
        item._id === productId ? { ...item, quantity: quantity } : item
      );
    });
  };

  // Calculate total items for the badge
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // The value that will be available to all children
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};