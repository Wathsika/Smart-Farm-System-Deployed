import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

// Reusable input
const InputField = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  icon,
  error,
  ...inputProps
}) => {
  const inputClasses = `w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-xl shadow-sm focus:outline-none transition-all ${
    error
      ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'
  }`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`${icon} text-gray-400`}></i>
          </div>
        )}
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={inputClasses}
          {...inputProps}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, discountAmount, totalAfterDiscount, discount, applyDiscountCode, removeDiscount, updateQuantity, removeFromCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [customerInfo, setCustomerInfo] = useState({
    name: '', email: '', phone: '',
    addressLine1: '', city: '', postalCode: ''
  });
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState(null);
  const totalRef = useRef(null);

  // === Validation helpers (STRICT as requested) ===
  const emailAllowedCharsOnly = (s) => s.replace(/[^A-Za-z0-9@.]/g, '');
  const hasExactlyOneAt = (s) => (s.match(/@/g) || []).length === 1;
  const emailStartsOrEndsWithAt = (s) => s.startsWith('@') || s.endsWith('@');

  const getFieldError = (fieldName, value) => {
    const v = (value || '').toString().trim();

    switch (fieldName) {
      case 'name':
        if (!v) return 'Full Name is required.';
        if (!/^[A-Za-z\s]+$/.test(v)) return 'Name can contain only letters and spaces.';
        return null;

      case 'phone':
        if (!v) return 'Phone Number is required.';
        if (!/^\d{10}$/.test(v)) return 'Phone Number must be exactly 10 digits.';
        return null;

     case 'email':
        if (!v) return 'Email is required.';
        if (!/^[A-Za-z0-9@.]+$/.test(v)) return 'Only letters, numbers, ".", and "@" are allowed.';
        if (!hasExactlyOneAt(v)) return 'Email must contain exactly one "@" symbol.';
        if (emailStartsOrEndsWithAt(v) || v.startsWith('.') || v.endsWith('.'))
            return 'Email cannot start or end with "." or "@".';
        if (v.includes('..')) return 'Email cannot contain consecutive dots.';
        return null;

      case 'addressLine1':
        if (!v) return 'Street Address is required.';
        if (!/^[A-Za-z0-9\s]+$/.test(v)) return 'Address can contain only letters, numbers, and spaces.';
        return null;

      case 'city':
        if (!v) return 'City is required.';
        if (!/^[A-Za-z\s]+$/.test(v)) return 'City can contain only letters and spaces.';
        return null;

      case 'postalCode':
        if (!v) return 'Postal Code is required.';
        if (!/^\d{5}$/.test(v)) return 'Postal Code must be exactly 5 digits.';
        return null;

      default:
        return null;
    }
  };

  // Per-field sanitize while typing (blocks unwanted chars)
  const sanitizeByField = (name, value) => {
    switch (name) {
      case 'name':
        return value.replace(/[^A-Za-z\s]/g, '');

      case 'phone':
        return value.replace(/\D/g, '').slice(0, 10);

      case 'email': {
        const cleaned = emailAllowedCharsOnly(value);
        // optional hard length cap to avoid crazy input
        return cleaned.slice(0, 64);
      }

      case 'addressLine1':
        return value.replace(/[^A-Za-z0-9\s]/g, '');

      case 'city':
        return value.replace(/[^A-Za-z\s]/g, '');

      case 'postalCode':
        return value.replace(/\D/g, '').slice(0, 5);

      default:
        return value;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeByField(name, value);

    setCustomerInfo(prev => ({ ...prev, [name]: sanitizedValue }));

    // live clear or update error only if already present
    setFieldErrors(prevErrors => {
      if (!prevErrors[name]) return prevErrors;
      const msg = getFieldError(name, sanitizedValue);
      if (msg) return { ...prevErrors, [name]: msg };
      const { [name]: _omit, ...rest } = prevErrors;
      return rest;
    });
  };

  // On blur -> validate and show red if invalid
  const handleBlur = (e) => {
    const { name } = e.target;
    const msg = getFieldError(name, customerInfo[name]);
    setFieldErrors(prev => (msg ? { ...prev, [name]: msg } : (() => {
      const { [name]: _omit, ...rest } = prev;
      return rest;
    })()));
  };

  const handleBackNavigation = () => {
    if (typeof window !== 'undefined' && window.history?.length > 1) {
      navigate(-1);
    } else {
      navigate('/store');
    }
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

  const validateForm = () => {
    const errors = {};
    Object.entries(customerInfo).forEach(([key, val]) => {
      const msg = getFieldError(key, val);
      if (msg) errors[key] = msg;
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      setError('Please correct the highlighted fields before proceeding.');
      return;
    }

    setIsProcessing(true);
    try {
      const payload = { cartItems, customerInfo };
      if (discount && discountAmount > 0) payload.discountId = discount._id;

      const { data } = await api.post('/orders/create-checkout-session', payload);
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

  if (cartItems.length === 0 && !isProcessing) {
    return <Navigate to="/store" replace />;
  }

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <button
              type="button"
              onClick={handleBackNavigation}
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold transition-colors mb-4"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600">
                <i className="fas fa-arrow-left"></i>
              </span>
              <span>Back</span>
            </button>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Checkout</h1>
              <p className="text-gray-600">Please provide your details to complete the purchase.</p>
            </div>
          </div>

          <form onSubmit={handleProceedToPayment}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT: Form */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Shipping & Contact Information</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      id="name"
                      label="Full Name"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="John Doe"
                      required
                      icon="fas fa-user"
                      inputMode="text"
                      pattern="^[A-Za-z\s]+$"
                      title="Name can contain only letters and spaces."
                      maxLength={60}
                      error={fieldErrors.name}
                    />
                    <InputField
                      id="phone"
                      label="Phone Number"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="0771234567"
                      required
                      icon="fas fa-phone"
                      inputMode="numeric"
                      pattern="^\d{10}$"
                      title="Phone Number must be exactly 10 digits."
                      maxLength={10}
                      error={fieldErrors.phone}
                    />
                  </div>

                  <InputField
                    id="email"
                    label="Email Address"
                    type="text"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="you@gmail.com"
                    required
                    icon="fas fa-envelope"
                    inputMode="email"
                    pattern="^[A-Za-z0-9@.]+$"
                    title='Only letters, numbers, ".", and "@" are allowed (must contain exactly one "@").'

                    maxLength={64}
                    error={fieldErrors.email}
                  />

                  <InputField
                    id="addressLine1"
                    label="Street Address"
                    value={customerInfo.addressLine1}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="123 Main Street"
                    required
                    icon="fas fa-home"
                    inputMode="text"
                    pattern="^[A-Za-z0-9\s]+$"
                    title="Address can contain only letters, numbers, and spaces."
                    maxLength={100}
                    error={fieldErrors.addressLine1}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      id="city"
                      label="City"
                      value={customerInfo.city}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Colombo"
                      required
                      icon="fas fa-city"
                      inputMode="text"
                      pattern="^[A-Za-z\s]+$"
                      title="City can contain only letters and spaces."
                      maxLength={40}
                      error={fieldErrors.city}
                    />
                    <InputField
                      id="postalCode"
                      label="Postal Code"
                      value={customerInfo.postalCode}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="10250"
                      required
                      icon="fas fa-mail-bulk"
                      inputMode="numeric"
                      pattern="^\d{5}$"
                      maxLength={5}
                      title="Postal code must be exactly 5 digits."
                      error={fieldErrors.postalCode}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-8">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                      {cartItems.map(item => (
                        <div key={item._id} className="flex justify-between items-start gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <img src={item.images?.[0] || 'https://via.placeholder.com/40'} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                              <p className="text-xs text-gray-500">Rs {item.price.toFixed(2)} each</p>
                              <div className="mt-2 flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => item.quantity > 1 && updateQuantity(item._id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full border text-gray-600 transition ${item.quantity <= 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-100'}`}
                                  >
                                    -
                                  </button>
                                  <span className="text-sm font-semibold text-gray-700 w-6 text-center">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item._id)}
                                  className="text-xs font-medium text-red-500 hover:text-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                          <p className="font-bold text-sm text-gray-800">Rs {(item.price * item.quantity).toFixed(2)}</p>
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
      <Footer />
    </>
  );
}
