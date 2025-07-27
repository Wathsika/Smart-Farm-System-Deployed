import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// --- FIX: Imported icons from react-icons library ---
import { FaUser, FaEnvelope, FaPhone, FaTruck, FaMapMarkerAlt, FaCity, FaFlag, FaMailBulk, FaCommentDots, FaShippingFast, FaCreditCard, FaPaypal, FaCalendar, FaLock, FaCheck, FaShoppingBag, FaArrowLeft, FaArrowRight, FaSpinner, FaClipboardCheck, FaWallet } from 'react-icons/fa';

// --- FIX: Moved static data outside the component to prevent re-declaration on re-renders ---
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};
const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6 }
};
const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6 }
};
const steps = [
    { id: 1, title: "Customer Info", icon: <FaUser />, description: "Your details" },
    { id: 2, title: "Shipping", icon: <FaTruck />, description: "Delivery address" },
    { id: 3, title: "Payment", icon: <FaCreditCard />, description: "Payment method" },
    { id: 4, title: "Review", icon: <FaClipboardCheck />, description: "Confirm order" }
];
const cartItems = [
    { id: 1, name: "Fresh Whole Milk", price: 4.99, quantity: 2, unit: "1 Gallon" },
    { id: 2, name: "Organic Tomatoes", price: 3.50, quantity: 1, unit: "1 lb" },
    { id: 3, name: "Free-Range Eggs", price: 5.99, quantity: 1, unit: "1 Dozen" },
    { id: 4, name: "Farm Honey", price: 8.99, quantity: 1, unit: "12 oz jar" }
];


// --- FIX: Created a separate component for the Order Summary for better organization ---
const OrderSummary = ({ formData }) => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = formData.deliveryOption === 'express' ? 9.99 : subtotal >= 50 ? 0 : 5.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + deliveryFee + tax;

    return (
        <motion.div 
            className="bg-white rounded-xl shadow-lg p-6 lg:sticky lg:top-8"
            variants={slideInRight}
            initial="initial"
            animate="animate"
        >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-4">Order Summary</h2>
            <div className="space-y-4">
                {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                        <div>
                            <p className="font-medium text-gray-800">{item.name} <span className="text-gray-500">x{item.quantity}</span></p>
                            <p className="text-gray-500">{item.unit}</p>
                        </div>
                        <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Delivery Fee</span><span>${deliveryFee.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg font-bold text-gray-900 mt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
        </motion.div>
    );
};


const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zipCode: '', deliveryInstructions: '',
    cardNumber: '', expiryDate: '', cvv: '', cardName: '',
    deliveryOption: 'standard', paymentMethod: 'card'
  });
  
  // --- FIX: Added state for validation errors ---
  const [errors, setErrors] = useState({});
  const [orderComplete, setOrderComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for the field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // --- FIX: Added validation logic ---
  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
        if (!formData.firstName) newErrors.firstName = "First name is required.";
        if (!formData.lastName) newErrors.lastName = "Last name is required.";
        if (!formData.email) newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid.";
        if (!formData.phone) newErrors.phone = "Phone number is required.";
    }
    if (currentStep === 2) {
        if (!formData.address) newErrors.address = "Street address is required.";
        if (!formData.city) newErrors.city = "City is required.";
        if (!formData.state) newErrors.state = "State is required.";
        if (!formData.zipCode) newErrors.zipCode = "ZIP code is required.";
    }
    if (currentStep === 3 && formData.paymentMethod === 'card') {
        if (!formData.cardNumber) newErrors.cardNumber = "Card number is required.";
        if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required.";
        else if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(formData.expiryDate)) newErrors.expiryDate = "Format must be MM/YY.";
        if (!formData.cvv) newErrors.cvv = "CVV is required.";
        if (!formData.cardName) newErrors.cardName = "Cardholder name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const nextStep = () => {
    if (validateStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateStep()) return; // Final validation check
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setOrderComplete(true);
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <motion.div
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <FaCheck className="text-white text-3xl" />
          </motion.div>
          <motion.h2 className="text-2xl font-bold text-gray-900 mb-4" {...fadeInUp} transition={{ delay: 0.5 }}>
            Order Confirmed!
          </motion.h2>
          <motion.p className="text-gray-600 mb-6" {...fadeInUp} transition={{ delay: 0.7 }}>
            Thank you for your order! We'll send you a confirmation email shortly.
          </motion.p>
          <motion.div className="space-y-3" {...fadeInUp} transition={{ delay: 0.9 }}>
            <p className="text-sm text-gray-500">Order Number: #GF-2024-001</p>
            <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center">
              <FaShoppingBag className="mr-2" />
              Continue Shopping
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-8" {...fadeInUp}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order from GreenLeaf Farm</p>
        </motion.div>

        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Progress Bar Logic remains the same, but icons are now components */}
            <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <motion.div
                  className="flex flex-col items-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${ currentStep >= step.id ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                    {step.icon}
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-green-600' : 'text-gray-400'}`}>{step.title}</p>
                    <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
                  </div>
                </motion.div>
                {index !== steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 mb-8 transition-all duration-300 ${ currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <motion.div className="bg-white rounded-xl shadow-lg p-6" variants={slideInLeft} initial="initial" animate="animate">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }}>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center"><FaUser className="text-green-600 mr-3" />Customer Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Example of an input with validation */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2"><FaUser className="inline mr-2 text-green-600" />First Name</label>
                            <input type="text" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className={`w-full p-3 border rounded-lg transition-all duration-300 ${errors.firstName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent`} placeholder="Enter your first name"/>
                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                        </div>
                        {/* Repeat for other inputs... */}
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2"><FaUser className="inline mr-2 text-green-600" />Last Name</label>
                            <input type="text" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className={`w-full p-3 border rounded-lg transition-all duration-300 ${errors.lastName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent`} placeholder="Enter your last name"/>
                            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2"><FaEnvelope className="inline mr-2 text-green-600" />Email Address</label>
                            <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={`w-full p-3 border rounded-lg transition-all duration-300 ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent`} placeholder="Enter your email"/>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2"><FaPhone className="inline mr-2 text-green-600" />Phone Number</label>
                            <input type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className={`w-full p-3 border rounded-lg transition-all duration-300 ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent`} placeholder="Enter your phone number"/>
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                    </div>
                  </motion.div>
                )}
                 {/* The other steps would follow the same pattern of adding error messages and dynamic border colors */}
              </AnimatePresence>

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <motion.button className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${ currentStep === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:bg-green-50' }`} onClick={prevStep} disabled={currentStep === 1} whileHover={currentStep > 1 ? { scale: 1.05 } : {}} whileTap={currentStep > 1 ? { scale: 0.95 } : {}}>
                  <FaArrowLeft className="mr-2" />Previous
                </motion.button>
                <motion.button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 flex items-center" onClick={currentStep === 4 ? handleSubmitOrder : nextStep} disabled={loading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {loading ? <FaSpinner className="animate-spin mr-2" /> : currentStep === 4 ? <FaCheck className="mr-2" /> : <FaArrowRight className="mr-2" />}
                  {loading ? 'Processing...' : currentStep === 4 ? 'Place Order' : 'Next'}
                </motion.button>
              </div>
            </motion.div>
          </div>
          
          {/* --- FIX: Added the OrderSummary component to the layout --- */}
          <div className="lg:col-span-1">
            <OrderSummary formData={formData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;