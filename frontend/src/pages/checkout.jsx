import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext'; // Correct: using your CartContext
import { Navigate } from 'react-router-dom'; // Using Navigate for empty cart
import { api } from '../lib/api'; // Correct: using your configured axios instance

// This is a great reusable component! No changes needed here.
const InputField = ({ id, label, value, onChange, placeholder, required = false, type = "text", icon }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <div className="relative">
            {icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className={`${icon} text-gray-400`}></i>
                </div>
            )}
            <input
                type={type} id={id} name={id} value={value} onChange={onChange}
                placeholder={placeholder} required={required}
                className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
            />
        </div>
    </div>
);


export default function CheckoutPage() {
   const { cartItems, cartTotal, discountAmount, totalAfterDiscount, discount, applyDiscountCode, removeDiscount } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [customerInfo, setCustomerInfo] = useState({
        name: '', email: '', phone: '',
        addressLine1: '', city: '', postalCode: ''
    });
const [promoCode, setPromoCode] = useState('');
    const [promoMessage, setPromoMessage] = useState(null);
    const totalRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo(prevState => ({ ...prevState, [name]: value }));
    };

    const handleApplyPromo = async () => {
        try {
            await applyDiscountCode(promoCode);
            setPromoMessage({ type: 'success', text: 'Discount applied!' });
        } catch (e) {
            setPromoMessage({ type: 'error', text: e.response?.data?.message || 'Invalid promo code.' });
        }
    };

    const handleRemovePromo = () => {
        removeDiscount();
        setPromoCode('');
        setPromoMessage(null);
    };
    // --- THIS IS THE MAIN LOGIC CHANGE ---
    // This function now sends data to our backend to create a Stripe session.
    const handleProceedToPayment = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setError(null);
        
        // Basic form validation
        for (const key in customerInfo) {
            if (!customerInfo[key]) {
                setError(`Please fill in all required fields. The "${key}" field is missing.`);
                setIsProcessing(false);
                return;
            }
        }

        try {
            // Send cart and customer info to the backend
            const payload = {
                 cartItems,
                  customerInfo,
            };
            if (discount && discountAmount > 0) {
                payload.discountId = discount._id;
            }
            const { data } = await api.post('/orders/create-checkout-session', payload);
            
            // If the backend successfully creates a session, it will return a URL.
            // Redirect the user to this Stripe-hosted payment page.
            if (data.url) {
                window.location.href = data.url;
            } else {
                 throw new Error("Could not retrieve payment URL.");
            }

        } catch (err) {
            setError(err.response?.data?.message || "An error occurred. Please try again.");
            setIsProcessing(false);
        }
    };
    

    useEffect(() => {
        if (totalRef.current) {
            const displayed = parseFloat(totalRef.current.textContent.replace('Rs', '').trim());
            console.assert(Math.abs(displayed - totalAfterDiscount) < 0.01, 'Displayed total does not match totalAfterDiscount');
        }
    }, [totalAfterDiscount]);
    
    // If the cart is empty, redirect the user to the store page.
    if (cartItems.length === 0 && !isProcessing) {
        return <Navigate to="/store" replace />;
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Checkout</h1>
                    <p className="text-gray-600">Please provide your details to complete the purchase.</p>
                </div>

                <form onSubmit={handleProceedToPayment}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* --- LEFT SIDE: Form Fields --- */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                             <h2 className="text-xl font-bold text-gray-800 mb-6">Shipping & Contact Information</h2>
                             <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField id="name" label="Full Name" value={customerInfo.name} onChange={handleInputChange} placeholder="John Doe" required icon="fas fa-user" />
                                    <InputField id="phone" label="Phone Number" value={customerInfo.phone} onChange={handleInputChange} placeholder="0771234567" required icon="fas fa-phone" />
                                </div>
                                <InputField id="email" label="Email Address" type="email" value={customerInfo.email} onChange={handleInputChange} placeholder="you@example.com" required icon="fas fa-envelope" />
                                <InputField id="addressLine1" label="Street Address" value={customerInfo.addressLine1} onChange={handleInputChange} placeholder="123 Main St, Apartment 4B" required icon="fas fa-home" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField id="city" label="City" value={customerInfo.city} onChange={handleInputChange} placeholder="Colombo" required icon="fas fa-city" />
                                    <InputField id="postalCode" label="Postal Code" value={customerInfo.postalCode} onChange={handleInputChange} placeholder="10250" required icon="fas fa-mail-bulk" />
                                </div>
                             </div>
                        </div>

                        {/* --- RIGHT SIDE: Order Summary --- */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-8">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                                        {cartItems.map(item => (
                                            <div key={item._id} className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.images?.[0] || 'https://via.placeholder.com/40'} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-sm">{item.name}</p>
                                                        <p className="text-xs text-gray-500">{item.quantity} x Rs {item.price.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <p className="font-bold text-sm">Rs {(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                     <div className="mt-6">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={promoCode}
                                                onChange={e => setPromoCode(e.target.value)}
                                                placeholder="Promo code"
                                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleApplyPromo}
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        {promoMessage && (
                                            <p className={`mt-2 text-sm ${promoMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{promoMessage.text}</p>
                                        )}
                                    </div>
                                    <div className="mt-6 border-t pt-6 space-y-4">
                                         <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>Rs {cartTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Discount {discount ? `(${discount.code})` : ''}</span>
                                            <span>-Rs {discountAmount.toFixed(2)}</span>
                                        </div>
                                        {discount && (
                                            <div className="text-right -mt-2">
                                                <button type="button" onClick={handleRemovePromo} className="text-xs text-blue-600 underline">Remove</button>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-xl text-gray-800">
                                            <span>Total</span>
                                             <span ref={totalRef}>Rs {totalAfterDiscount.toFixed(2)}</span>
                                        </div>

                                        {error && (
                                            <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>
                                        )}

                                        <button 
                                            type="submit" 
                                            disabled={isProcessing}
                                            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-lock mr-2"></i>
                                                    Proceed to Payment
                                                </>
                                            )}
                                        </button>

                                        <p className="text-xs text-gray-500 text-center mt-2">You will be redirected to our secure payment partner, Stripe.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}