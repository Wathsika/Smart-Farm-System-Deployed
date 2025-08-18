import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

// 1. Create the context
const CartContext = createContext();

// 2. Create the custom hook
export const useCart = () => useContext(CartContext);


// 3. Create the ONE and ONLY Provider component
//    (This was previously named 'FullCartProvider')
export const CartProvider = ({ children }) => {
    // State for cart items, initialized from localStorage
    const [cartItems, setCartItems] = useState(() => {
        try {
            const data = localStorage.getItem('smartfarm_cart_items');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    });

    // State for applied discount, initialized from localStorage
    const [discount, setDiscount] = useState(() => {
        try {
            const data = localStorage.getItem('smartfarm_cart_discount');
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    });

    // Save state to localStorage whenever it changes
    useEffect(() => { localStorage.setItem('smartfarm_cart_items', JSON.stringify(cartItems)); }, [cartItems]);
    useEffect(() => { localStorage.setItem('smartfarm_cart_discount', JSON.stringify(discount)); }, [discount]);

     // --- Calculated Values ---
    const cartTotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);
    const totalItemsInCart = cartItems.reduce((t, i) => t + i.quantity, 0);


    // --- All Cart & Discount Functions ---
    const addToCart = useCallback((product) => setCartItems(p => {
        const exist = p.find(i => i._id === product._id);
        return exist
            ? p.map(i => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i)
            : [...p, { ...product, quantity: 1 }];
    }), []);
    const updateQuantity = useCallback((id, q) => setCartItems(p => p.map(i => i._id === id ? { ...i, quantity: Math.max(0, Number(q)) } : i).filter(i => i.quantity > 0)), []);
    const removeFromCart = useCallback((id) => setCartItems(p => p.filter(i => i._id !== id)), []);
    const clearCart = useCallback(() => { setCartItems([]); setDiscount(null); }, []);

    const applyDiscountCode = useCallback(async (code) => {
        try {
       const { data } = await api.post('/discounts/validate', { code });
            if (cartTotal >= data.minPurchase) {
                setDiscount({ ...data, source: 'CODE' });
                return { success: true };
            }
            return { success: false };
        } catch (e) {
            setDiscount(null);
            throw e;
        }
    }, [cartTotal]);

    const fetchAutoDiscount = useCallback(async () => {
        try {
            const { data } = await api.get('/discounts/active');
            if (cartTotal >= data.minPurchase && (!discount || discount.source !== 'CODE')) {
                setDiscount({ ...data, source: 'AUTO' });
            } else if (discount?.source === 'AUTO') {
                setDiscount(null);
            }
        } catch {
            if (discount?.source === 'AUTO') setDiscount(null);
        }
    }, [cartTotal, discount]);

    const removeDiscount = useCallback(() => setDiscount(null), []);

    // --- Calculated Values ---
    useEffect(() => { fetchAutoDiscount(); }, [cartTotal]);
    useEffect(() => { if (!discount) fetchAutoDiscount(); }, [discount]);

    let discountAmount = 0;
    let isDiscountValid = false;
    if (discount && cartTotal >= discount.minPurchase) {
        isDiscountValid = true;
        discountAmount = discount.type === 'PERCENTAGE' ? cartTotal * (discount.value / 100) : discount.value;
        discountAmount = Math.min(discountAmount, cartTotal);
    }
    const totalAfterDiscount = cartTotal - discountAmount;
    
    // The value provided to all consuming components
    const value = { cartItems, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal, totalItemsInCart, discount, discountAmount, totalAfterDiscount, isDiscountValid, applyDiscountCode, removeDiscount };
    
    return (<CartContext.Provider value={value}>{children}</CartContext.Provider>);
};