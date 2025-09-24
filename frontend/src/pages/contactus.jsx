import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // 'success' or 'error'

  const [formErrors, setFormErrors] = useState({}); // State to hold validation errors for each field

  // Client-side validation function
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required.";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
      isValid = false;
    } else if (formData.name.trim().length > 100) {
      errors.name = "Name cannot exceed 100 characters.";
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) { // Basic regex for email format
      errors.email = "Please enter a valid email address.";
      isValid = false;
    }

    // Phone validation (optional field, validate only if present)
    if (formData.phone.trim()) {
      const digitsOnly = formData.phone.replace(/\D/g, ''); // Ensure only digits are considered for length check
      if (digitsOnly.length < 7) { // Minimum 7 digits for a valid number
        errors.phone = "Phone number must have at least 7 digits.";
        isValid = false;
      } else if (digitsOnly.length > 15) { // Maximum 15 digits
        errors.phone = "Phone number cannot exceed 15 digits.";
        isValid = false;
      }
    }

    // Subject validation
    if (!formData.subject) {
      errors.subject = "Please select a subject.";
      isValid = false;
    }

    // Message validation
    if (!formData.message.trim()) {
      errors.message = "Message is required.";
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters.";
      isValid = false;
    } else if (formData.message.trim().length > 1000) {
      errors.message = "Message cannot exceed 1000 characters.";
      isValid = false;
    }

    setFormErrors(errors); // Update formErrors state
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Specific handling for the phone number field: allow only digits
    if (name === 'phone') {
      newValue = value.replace(/\D/g, ''); // Remove all non-digit characters
      if (newValue.length > 15) { // Prevent typing beyond 15 digits
        newValue = newValue.substring(0, 15);
      }
    }

    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: newValue
    }));
    // Clear the error for this field as the user types, if it exists
    if (formErrors[name]) {
      setFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowAlert(false); // Hide any previous alert when a new submission starts
    setFormErrors({}); // Clear all errors at the start of submission attempt

    if (!validateForm()) {
      // If client-side validation fails, show an error alert and stop submission
      setAlertMessage('Please correct the errors in the form.');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    setIsSubmitting(true);

    try {
      // Make a POST request to your backend API endpoint
      const response = await axios.post('http://localhost:5001/api/contact', formData);

      console.log('Form submitted successfully:', response.data);
      setAlertMessage('Thank you for your message! We\'ll get back to you within 24 hours.');
      setAlertType('success');
      setShowAlert(true);

      // Clear the form fields only on successful submission
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

    } catch (error) {
      console.error('Error submitting form:', error.response ? error.response.data : error.message);
      setAlertMessage(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'There was an error submitting your message. Please try again later.'
      );
      setAlertType('error');
      setShowAlert(true);

    } finally {
      setIsSubmitting(false);
      // Hide the alert after 5 seconds, regardless of success or error
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  // Animation variants (unchanged)
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const slideInLeft = {
    initial: { opacity: 0, x: -80 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const slideInRight = {
    initial: { opacity: 0, x: 80 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const contactInfo = [
    {
      icon: "fas fa-map-marker-alt",
      title: "Visit Our Farm",
      details: ["244/9, Dines Place, Kaduwela Rd", "Malabe, Sri Lanka"],
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      badge: "Location",
      badgeColor: "bg-red-100 text-red-800"
    },
    {
      icon: "fas fa-phone-alt",
      title: "Call Us",
      details: ["(555) 123-4567", "Available 7 days a week"],
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      badge: "Phone",
      badgeColor: "bg-blue-100 text-blue-800"
    },
    {
      icon: "fas fa-envelope-open",
      title: "Email Us",
      details: ["info@greenleaffarm.com", "We reply within 24 hours"],
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      badge: "Email",
      badgeColor: "bg-green-100 text-green-800"
    },
    {
      icon: "fas fa-business-time",
      title: "Farm Hours",
      details: ["Mon-Sat: 7AM - 6PM", "Sunday: 8AM - 4PM"],
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      badge: "Hours",
      badgeColor: "bg-purple-100 text-purple-800"
    }
  ];

  const faqData = [
    {
      question: "Can I visit the farm without an appointment?",
      answer: "While we welcome visitors, we recommend scheduling in advance to ensure someone is available to show you around and answer your questions.",
      icon: "fas fa-user-friends"
    },
    {
      question: "Do you offer wholesale pricing for restaurants?",
      answer: "Yes! We work with local restaurants and businesses. Contact us to discuss wholesale pricing and regular delivery schedules.",
      icon: "fas fa-handshake"
    },
    {
      question: "Are your products certified organic?",
      answer: "Yes, we are certified organic and follow strict guidelines to ensure all our products meet organic standards.",
      icon: "fas fa-seedling"
    },
    {
      question: "What's the best time to visit the farm?",
      answer: "Early morning (8-10 AM) or late afternoon (4-6 PM) are ideal times when the farm is most active and the lighting is perfect for photos.",
      icon: "fas fa-sun"
    }
  ];

  // Dynamic Tailwind CSS classes for the alert based on `alertType`
  const alertClass = alertType === 'success'
    ? 'border-green-200 bg-green-50 text-green-800'
    : 'border-red-200 bg-red-50 text-red-800';
  const alertIcon = alertType === 'success'
    ? 'fas fa-check-circle text-green-600'
    : 'fas fa-exclamation-triangle text-red-600';


  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.section
        className="relative h-96 flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <i className="fas fa-envelope-open-text text-white text-2xl sm:text-3xl"></i>
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              Contact <span className="text-green-300">Us</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl lg:text-2xl mb-8 leading-relaxed opacity-90 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              Get in touch with GreenLeaf Farm. We're here to answer your questions and welcome visitors to our Malabe location.
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Information Cards */}
      <motion.section
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: false, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            variants={fadeInUp}
          >
            <motion.h2
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false, amount: 0.5 }}
            >
              Get In <span className="text-green-600">Touch</span>
            </motion.h2>
            <motion.p
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: false, amount: 0.5 }}
            >
              We'd love to hear from you. Choose the best way to reach us.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.2
                }}
                viewport={{ once: false, amount: 0.3 }}
              >
                <div className="h-full bg-white rounded-xl border-2 border-gray-200 p-6 sm:p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer group">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <span className={`${info.badgeColor} text-xs font-semibold px-3 py-1 rounded-full`}>
                        {info.badge}
                      </span>
                    </div>
                    <motion.div
                      className={`w-12 h-12 sm:w-16 sm:h-16 ${info.bgColor} ${info.borderColor} border-2 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{
                        scale: 1.1,
                        transition: { duration: 0.3 }
                      }}
                    >
                      <i className={`${info.icon} ${info.color} text-xl sm:text-2xl`}></i>
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                      {info.title}
                    </h3>
                    <div className="text-gray-600 text-sm sm:text-base space-y-1">
                      {info.details.map((detail, detailIndex) => (
                        <p key={detailIndex}>{detail}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Form and Map Section */}
      <motion.section
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8"
        initial="initial"
        whileInView="animate"
        viewport={{ once: false, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            {/* Contact Form */}
            <motion.div
              variants={slideInLeft}
            >
              <div className="bg-white rounded-xl border-2 border-gray-200 shadow-xl">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <i className="fas fa-paper-plane text-green-600 text-xl"></i>
                    Send us a <span className="text-green-600">Message</span>
                  </h3>
                  <div className="mt-4 h-px bg-gray-200"></div>
                </div>
                <div className="p-6">
                  {/* Dynamic Alert Message Display */}
                  {showAlert && (
                    <div className={`mb-6 p-4 border ${alertClass} rounded-lg flex items-center gap-3`}>
                      <i className={`${alertIcon} text-lg`}></i>
                      <p className="font-medium">
                        {alertMessage} {/* Display dynamic message */}
                      </p>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Name and Phone */}
                    <motion.div
                      className="grid sm:grid-cols-2 gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: false }}
                    >
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">Name *</label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300`}
                          required
                        />
                        {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel" // Use type="tel" for better mobile keyboard
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Your phone number (up to 15 digits)" // Updated placeholder
                          maxLength={10} // HTML5 max length for user typing
                          // inputmode="numeric" pattern="[0-9]*" can be added for mobile keyboards, but JS handles strictness
                          className={`w-full px-3 py-2 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300`}
                        />
                        {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                      </div>
                    </motion.div>

                    {/* Email */}
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: false }}
                    >
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300`}
                        required
                      />
                      {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                    </motion.div>

                    {/* Subject */}
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      viewport={{ once: false }}
                    >
                      <label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject *</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${formErrors.subject ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300`}
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="farm-visit">Farm Visit Inquiry</option>
                        <option value="product-inquiry">Product Information</option>
                        <option value="wholesale">Wholesale Orders</option>
                        <option value="partnership">Partnership Opportunity</option>
                        <option value="general">General Question</option>
                      </select>
                      {formErrors.subject && <p className="text-red-500 text-xs mt-1">{formErrors.subject}</p>}
                    </motion.div>

                    {/* Message */}
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      viewport={{ once: false }}
                    >
                      <label htmlFor="message" className="text-sm font-medium text-gray-700">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={5}
                        placeholder="Tell us more about your inquiry..."
                        className={`w-full px-3 py-2 border ${formErrors.message ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 resize-none`}
                        required
                      />
                      {formErrors.message && <p className="text-red-500 text-xs mt-1">{formErrors.message}</p>}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      viewport={{ once: false }}
                    >
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white text-lg font-semibold py-4 px-6 rounded-md shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <i className="fas fa-paper-plane"></i>
                            Send Message
                          </div>
                        )}
                      </button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Map Section */}
            <motion.div
              variants={slideInRight}
            >
              <div className="bg-white rounded-xl border-2 border-gray-200 shadow-xl">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <i className="fas fa-map-marked-alt text-green-600 text-xl"></i>
                    Find <span className="text-green-600">Our Farm</span>
                  </h3>
                  <div className="mt-4 h-px bg-gray-200"></div>
                </div>
                <div className="p-6">
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: false }}
                  >
                    <div className="flex items-start gap-3 mb-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <i className="fas fa-map-pin text-green-600 text-lg flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-semibold text-gray-900">10/F,Ginimallagaha</p>
                        <p className="text-gray-600">Baddegama, Sri Lanka</p>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Located in Malabe, our farm is easily accessible and welcomes visitors throughout the week.
                    </p>
                  </motion.div>

                  {/* Interactive Map */}
                  <motion.div
                    className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden shadow-lg relative mb-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewport={{ once: false }}
                  >
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d20657.642448788385!2d80.17352694701248!3d6.1188832611760295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2slk!4v1758632857577!5m2!1sen!2slk"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="GreenLeaf Farm Location - Badde"
                      className="rounded-lg"
                    ></iframe>

                    {/* Map overlay with farm info */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm shadow-lg border-2 border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                          <i className="fas fa-tractor text-white text-sm"></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">GreenLeaf Farm</h4>
                          <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full mt-1 inline-block">
                            Organic & Sustainable
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    className="flex justify-center gap-4 max-w-fit mx-auto" // Changed to flex justify-center
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: false }}
                  >
                    <button
                      // Corrected Google Maps URL to directly open directions
                      onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=Baddegama,Sri lanka', '_blank')}
                      className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-md font-semibold transition-all duration-300 hover:shadow-md"
                    >
                      <i className="fas fa-route"></i>
                      Get Directions
                    </button>

                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: false, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            variants={fadeInUp}
          >
            <motion.h2
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false, amount: 0.5 }}
            >
              Frequently Asked <span className="text-green-600">Questions</span>
            </motion.h2>
            <motion.p
              className="text-lg sm:text-xl text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: false, amount: 0.5 }}
            >
              Quick answers to common questions about our farm and products
            </motion.p>
          </motion.div>

          <div className="space-y-6">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: false, amount: 0.3 }}
              >
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full border-2 border-green-200 flex items-center justify-center bg-green-50">
                      <i className={`${faq.icon} text-green-600 text-sm`}></i>
                    </span>
                    {faq.question}
                  </h4>
                  <div className="my-3 h-px bg-gray-200"></div>
                  <p className="text-gray-600 leading-relaxed pl-13">{faq.answer}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-green-600"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: false, amount: 0.3 }}
      >
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: false }}
          >
            Ready to Experience Farm Life?
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl mb-8 opacity-90 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: false }}
          >
            Join us for a farm tour, taste our fresh produce, and learn about sustainable farming practices.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: false }}
          >
            <button className="bg-white text-green-600 hover:bg-gray-50 px-6 py-3 sm:px-8 sm:py-4 rounded-md font-semibold text-base sm:text-lg shadow-lg transition-all duration-300 hover:shadow-xl">
              <i className="fas fa-phone-volume mr-2"></i>
               Call Now: (555) 123-4567
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-6 py-3 sm:px-8 sm:py-4 rounded-md font-semibold text-base sm:text-lg transition-all duration-300">
              <i className="fas fa-envelope-open mr-2"></i>
              Send Email
            </button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default ContactUs;