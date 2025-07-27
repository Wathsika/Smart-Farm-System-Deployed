import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add form submission logic here
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  // Animation variants
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

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: "easeOut"
      }
    }
  };

  const cardHover = {
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3, ease: "easeOut" }
  };

  const buttonHover = {
    y: -3,
    scale: 1.05,
    boxShadow: "0 10px 25px rgba(5, 150, 105, 0.3)",
    transition: { duration: 0.3, ease: "easeOut" }
  };

  const contactInfo = [
    {
      icon: "fas fa-map-marker-alt",
      title: "Visit Our Farm",
      details: ["244/9, Dines Place, Kaduwela Rd", "Malabe, Sri Lanka"],
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      icon: "fas fa-phone",
      title: "Call Us",
      details: ["(555) 123-4567", "Available 7 days a week"],
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: "fas fa-envelope",
      title: "Email Us",
      details: ["info@greenleaffarm.com", "We reply within 24 hours"],
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: "fas fa-clock",
      title: "Farm Hours",
      details: ["Mon-Sat: 7AM - 6PM", "Sunday: 8AM - 4PM"],
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  const faqData = [
    {
      question: "Can I visit the farm without an appointment?",
      answer: "While we welcome visitors, we recommend scheduling in advance to ensure someone is available to show you around and answer your questions."
    },
    {
      question: "Do you offer wholesale pricing for restaurants?",
      answer: "Yes! We work with local restaurants and businesses. Contact us to discuss wholesale pricing and regular delivery schedules."
    },
    {
      question: "Are your products certified organic?",
      answer: "Yes, we are certified organic and follow strict guidelines to ensure all our products meet organic standards."
    },
    {
      question: "What's the best time to visit the farm?",
      answer: "Early morning (8-10 AM) or late afternoon (4-6 PM) are ideal times when the farm is most active and the lighting is perfect for photos."
    }
  ];

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
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <i className="fas fa-envelope text-white text-2xl sm:text-3xl"></i>
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
              className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4"
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
                className="bg-white rounded-xl p-6 sm:p-8 shadow-lg transition-all duration-300 text-center"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2
                }}
                viewport={{ once: false, amount: 0.3 }}
                whileHover={cardHover}
              >
                <motion.div 
                  className={`w-12 h-12 sm:w-16 sm:h-16 ${info.bgColor} rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.2 + index * 0.2
                  }}
                  viewport={{ once: false }}
                  whileHover={{ 
                    scale: 1.1,
                    transition: { duration: 0.3 }
                  }}
                >
                  <i className={`${info.icon} ${info.color} text-xl sm:text-2xl`}></i>
                </motion.div>
                <motion.h3 
                  className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4"
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
                  viewport={{ once: false }}
                >
                  {info.title}
                </motion.h3>
                <motion.div 
                  className="text-gray-600 text-sm sm:text-base"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.2 }}
                  viewport={{ once: false }}
                >
                  {info.details.map((detail, detailIndex) => (
                    <p key={detailIndex} className="mb-1">{detail}</p>
                  ))}
                </motion.div>
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
              className="bg-white rounded-xl p-6 sm:p-8 shadow-lg"
            >
              <motion.h3 
                className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: false }}
              >
                Send us a <span className="text-green-600">Message</span>
              </motion.h3>
              
              <div className="space-y-6">
                <motion.div 
                  className="grid sm:grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: false }}
                >
                  <div>
                    <div className="block text-gray-700 font-semibold mb-2">Name *</div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <div className="block text-gray-700 font-semibold mb-2">Phone</div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Your phone number"
                    />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: false }}
                >
                  <div className="block text-gray-700 font-semibold mb-2">Email *</div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    placeholder="your.email@example.com"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: false }}
                >
                  <div className="block text-gray-700 font-semibold mb-2">Subject *</div>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Select a subject</option>
                    <option value="farm-visit">Farm Visit Inquiry</option>
                    <option value="product-inquiry">Product Information</option>
                    <option value="wholesale">Wholesale Orders</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="general">General Question</option>
                  </select>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: false }}
                >
                  <div className="block text-gray-700 font-semibold mb-2">Message *</div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 resize-vertical"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </motion.div>
                
                <motion.button
                  onClick={handleSubmit}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: false }}
                  whileHover={buttonHover}
                  whileTap={{ scale: 0.98 }}
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  Send Message
                </motion.button>
              </div>
            </motion.div>

            {/* Map Section */}
            <motion.div 
              variants={slideInRight}
              className="bg-white rounded-xl p-6 sm:p-8 shadow-lg"
            >
              <motion.h3 
                className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: false }}
              >
                Find <span className="text-green-600">Our Farm</span>
              </motion.h3>
              
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: false }}
              >
                <p className="text-gray-600 mb-4">
                  <i className="fas fa-map-marker-alt text-green-600 mr-2"></i>
                  244/9, Dines Place, Kaduwela Rd, Malabe, Sri Lanka
                </p>
                <p className="text-gray-600 mb-4">
                  Located in Malabe, our farm is easily accessible and welcomes visitors throughout the week.
                </p>
              </motion.div>

              {/* Interactive Map */}
              <motion.div 
                className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden shadow-lg relative"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: false }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.798225099747!2d79.97315631477394!3d6.914742594993306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae256db1a6771c5%3A0x2c63e344ab9a7536!2sMalabe%2C%20Sri%20Lanka!5e0!3m2!1sen!2s!4v1649880373164!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="GreenLeaf Farm Location - Malabe"
                  className="rounded-lg"
                ></iframe>
                
                {/* Map overlay with farm info */}
                <motion.div 
                  className="absolute top-4 left-4 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg backdrop-blur-sm"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: false }}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                      <i className="fas fa-tractor text-white text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">GreenLeaf Farm</h4>
                      <p className="text-gray-600 text-xs">Organic & Sustainable</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Directions and Additional Info */}
              <motion.div 
                className="mt-6 grid sm:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: false }}
              >
                <motion.a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <i className="fas fa-directions mr-2"></i>
                  Get Directions
                </motion.a>
                <motion.button
                  className="flex items-center justify-center bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <i className="fas fa-calendar-alt mr-2"></i>
                  Schedule Visit
                </motion.button>
              </motion.div>
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
              className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4"
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
                className="bg-white rounded-xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: false, amount: 0.3 }}
                whileHover={cardHover}
              >
                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <i className="fas fa-question-circle text-green-600 mr-3"></i>
                  {faq.question}
                </h4>
                <p className="text-gray-600 leading-relaxed pl-8">{faq.answer}</p>
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
            <motion.button
              className="bg-white text-green-600 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg shadow-lg transition-all duration-300"
              whileHover={{
                y: -3,
                scale: 1.05,
                boxShadow: "0 15px 35px rgba(255, 255, 255, 0.3)",
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="fas fa-phone mr-2"></i>
              Call Now: (555) 123-4567
            </motion.button>
            <motion.button
              className="border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-white hover:text-green-600 transition-all duration-300"
              whileHover={{
                y: -3,
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="fas fa-envelope mr-2"></i>
              Send Email
            </motion.button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default ContactUs;