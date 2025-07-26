import React from 'react';
import { motion } from 'framer-motion';
import heroImage from '../assets/aboutushero.jpg';
import ourstory from '../assets/ourstory.jpg';
import freshdiary from'../assets/freshdiary.jpg';
import crop from'../assets/crop.jpg';
import produce from'../assets/produce.jpg';

const AboutUs = () => {
  // Professional animation variants - no rotation
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

  // Professional hover effects - no rotation
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

  const farmValues = [
    {
      icon: "fas fa-heart",
      title: "Sustainable Farming",
      description: "We practice eco-friendly farming methods that preserve our land for future generations while maintaining high-quality produce."
    },
    {
      icon: "fas fa-users",
      title: "Family Heritage",
      description: "Three generations of farming expertise combined with modern technology to bring you the freshest, highest quality farm products."
    },
    {
      icon: "fas fa-leaf",
      title: "Organic Practices",
      description: "Our commitment to natural, chemical-free farming ensures that every product from our farm is pure and healthy."
    }
  ];

  const farmProducts = [
    {
      icon: "fas fa-cow",
      title: "Fresh Dairy",
      description: "Daily fresh milk and dairy products from our happy, healthy cows.",
      image: freshdiary,
    },
    {
      icon: "fas fa-apple-alt",
      title: "Organic Crops",
      description: "Seasonal fruits and vegetables grown with natural farming methods.",
      image: crop,
    },
    {
      icon: "fas fa-seedling",
      title: "Farm Fresh Produce",
      description: "Hand-picked, farm-fresh produce delivered straight from our fields.",
      image: produce,
    }
  ];

  const statistics = [
    { number: "25+", label: "Years of Experience", icon: "fas fa-calendar-alt" },
    { number: "100+", label: "Happy Customers", icon: "fas fa-smile" },
    { number: "50+", label: "Acres of Farmland", icon: "fas fa-map" },
    { number: "365", label: "Days Fresh Supply", icon: "fas fa-truck" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Clean Hero Section */}
      <motion.section 
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(34, 84, 61, 0.7), rgba(34, 84, 61, 0.5)), url(${heroImage})`
        }}
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
                <i className="fas fa-leaf text-white text-2xl sm:text-3xl"></i>
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              Welcome to <br />
              <motion.span 
                className="text-green-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                GreenLeaf Farm
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl lg:text-2xl mb-8 leading-relaxed opacity-90 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              Where tradition meets innovation. Growing fresh, organic produce with love and care for over 25 years.
            </motion.p>
            
            <motion.button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.8 }}
              whileHover={buttonHover}
              whileTap={{ scale: 0.98 }}
            >
              <i className="fas fa-arrow-down mr-2"></i>
              Discover Our Story
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Our Story Section */}
      <motion.section 
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8"
        initial="initial"
        whileInView="animate"
        viewport={{ once: false, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div 
              className="order-2 lg:order-1"
              variants={slideInLeft}
            >
              <motion.h2 
                className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: false, amount: 0.5 }}
              >
                Our <span className="text-green-600">Story</span>
              </motion.h2>
              
              <motion.p 
                className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: false, amount: 0.5 }}
              >
                GreenLeaf Farm began as a small family operation in 1998. What started with a few acres 
                and a dream has grown into a thriving sustainable farm that serves our local community 
                with the freshest, highest-quality produce and dairy products.
              </motion.p>
              
              <motion.p 
                className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: false, amount: 0.5 }}
              >
                Today, we combine traditional farming wisdom with modern technology to ensure every 
                product meets our high standards while caring for the environment and our animals.
              </motion.p>
              
              <motion.div 
                className="grid sm:grid-cols-2 gap-4"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: false, amount: 0.3 }}
              >
                {statistics.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center p-4 bg-green-50 rounded-lg"
                    variants={scaleIn}
                    whileHover={{
                      ...cardHover,
                      backgroundColor: "#dcfce7"
                    }}
                  >
                    <motion.i 
                      className={`${stat.icon} text-green-600 text-xl mb-2`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: false }}
                    ></motion.i>
                    <motion.div 
                      className="text-2xl sm:text-3xl font-bold text-green-700"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                      viewport={{ once: false }}
                    >
                      {stat.number}
                    </motion.div>
                    <div className="text-gray-600 text-sm sm:text-base">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="order-1 lg:order-2"
              variants={slideInRight}
            >
              <div className="relative">
                <motion.img 
                  src={ourstory} 
                  alt="Farmer in field at sunset" 
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-2xl shadow-xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                />
                <motion.div 
                  className="absolute -bottom-4 -left-4 w-24 h-24 sm:w-32 sm:h-32 bg-green-600 rounded-full flex items-center justify-center shadow-lg"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: false, amount: 0.3 }}
                  whileHover={{ 
                    scale: 1.1,
                    transition: { duration: 0.3 }
                  }}
                >
                  <i className="fas fa-tractor text-white text-2xl sm:text-3xl"></i>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Farm Values Section */}
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
              Our <span className="text-green-600">Values</span>
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: false, amount: 0.5 }}
            >
              The principles that guide everything we do at GreenLeaf Farm
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {farmValues.map((value, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 sm:p-8 shadow-lg transition-all duration-300"
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
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 sm:mb-6"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.2 + index * 0.2
                  }}
                  viewport={{ once: false }}
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: "#dcfce7",
                    transition: { duration: 0.3 }
                  }}
                >
                  <i className={`${value.icon} text-green-600 text-xl sm:text-2xl`}></i>
                </motion.div>
                <motion.h3 
                  className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
                  viewport={{ once: false }}
                >
                  {value.title}
                </motion.h3>
                <motion.p 
                  className="text-gray-600 leading-relaxed text-sm sm:text-base"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.2 }}
                  viewport={{ once: false }}
                >
                  {value.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Products Section */}
      <motion.section 
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8"
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
              What We <span className="text-green-600">Grow</span>
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: false, amount: 0.5 }}
            >
              Fresh, natural products grown with care and delivered with pride
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {farmProducts.map((product, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.3
                }}
                viewport={{ once: false, amount: 0.3 }}
                whileHover={{
                  y: -12,
                  scale: 1.02,
                  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
                  transition: { duration: 0.3 }
                }}
              >
                <motion.div 
                  className="h-48 sm:h-56 overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.img 
                    src={product.image} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.1 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.3 }}
                    viewport={{ once: false }}
                  />
                </motion.div>
                <motion.div 
                  className="p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.3 }}
                  viewport={{ once: false }}
                >
                  <div className="flex items-center mb-3">
                    <motion.div 
                      className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3"
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: 0.6 + index * 0.3
                      }}
                      viewport={{ once: false }}
                      whileHover={{ 
                        scale: 1.1,
                        backgroundColor: "#dcfce7",
                        transition: { duration: 0.3 }
                      }}
                    >
                      <i className={`${product.icon} text-green-600 text-lg`}></i>
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">{product.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{product.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Visit Section */}
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
            Visit Our Farm
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl mb-8 opacity-90 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: false }}
          >
            Experience farm life firsthand. Schedule a visit to see how we grow your food with care and dedication.
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
              <i className="fas fa-calendar-alt mr-2"></i>
              Schedule Visit
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
              <i className="fas fa-phone mr-2"></i>
              Contact Us
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.section 
        className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-800 text-white"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: false, amount: 0.2 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, amount: 0.2 }}
          >
            {[
              {
                title: "Location",
                icon: "fas fa-map-marker-alt",
                content: ["123 Farm Road", "Green Valley, State 12345"]
              },
              {
                title: "Contact",
                icon: "fas fa-phone",
                content: ["(555) 123-4567", "info@greenleaffarm.com"]
              },
              {
                title: "Farm Hours",
                icon: "fas fa-clock",
                content: ["Mon - Sat: 7AM - 6PM", "Sunday: 8AM - 4PM"]
              },
              {
                title: "Follow Us",
                icon: "fas fa-share-alt",
                content: []
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center sm:text-left"
                variants={scaleIn}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.3 }
                }}
              >
                <h4 className="font-bold mb-3 text-green-400">{item.title}</h4>
                {item.title === "Follow Us" ? (
                  <div className="flex justify-center sm:justify-start space-x-4">
                    <motion.i 
                      className="fab fa-facebook text-xl hover:text-green-400 cursor-pointer transition-colors"
                      whileHover={{ scale: 1.2, y: -2 }}
                      transition={{ duration: 0.3 }}
                    ></motion.i>
                    <motion.i 
                      className="fab fa-instagram text-xl hover:text-green-400 cursor-pointer transition-colors"
                      whileHover={{ scale: 1.2, y: -2 }}
                      transition={{ duration: 0.3 }}
                    ></motion.i>
                    <motion.i 
                      className="fab fa-twitter text-xl hover:text-green-400 cursor-pointer transition-colors"
                      whileHover={{ scale: 1.2, y: -2 }}
                      transition={{ duration: 0.3 }}
                    ></motion.i>
                  </div>
                ) : (
                  <p className="text-gray-300 text-sm sm:text-base">
                    <i className={`${item.icon} mr-2`}></i>
                    {item.content.map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < item.content.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default AboutUs;