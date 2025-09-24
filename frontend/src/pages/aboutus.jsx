import React from "react";
import { motion } from "framer-motion";
import heroImage from "../assets/aboutushero.jpg";
import ourstory from "../assets/ourstory.jpg";
import freshdiary from "../assets/freshdiary.jpg";
import crop from "../assets/crop.jpg";
import produce from "../assets/produce.jpg";
import ChatbotWidget from "../components/ChatbotWidget";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } }
};
const slideInLeft = { initial: { opacity: 0, x: -80 }, animate: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } } };
const slideInRight = { initial: { opacity: 0, x: 80 }, animate: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } } };
const staggerContainer = { animate: { transition: { staggerChildren: 0.2, delayChildren: 0.1 } } };
const scaleIn = { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } } };
const cardHover = { y: -8, scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,.1)", transition: { duration: 0.25 } };

const farmValues = [
  { icon: "fas fa-heart", title: "Sustainable Farming", description: "We practice eco-friendly farming methods that preserve our land for future generations while maintaining high-quality produce." },
  { icon: "fas fa-users", title: "Family Heritage", description: "Three generations of farming expertise combined with modern technology to bring you the freshest, highest quality farm products." },
  { icon: "fas fa-leaf", title: "Organic Practices", description: "Our commitment to natural, chemical-free farming ensures that every product from our farm is pure and healthy." }
];

const farmProducts = [
  { icon: "fas fa-cow", title: "Fresh Dairy", description: "Daily fresh milk and dairy products from our happy, healthy cows.", image: freshdiary },
  { icon: "fas fa-apple-alt", title: "Organic Crops", description: "Seasonal fruits and vegetables grown with natural farming methods.", image: crop },
  { icon: "fas fa-seedling", title: "Farm Fresh Produce", description: "Hand-picked, farm-fresh produce delivered straight from our fields.", image: produce }
];

const statistics = [
  { number: "25+", label: "Years of Experience", icon: "fas fa-calendar-alt" },
  { number: "100+", label: "Happy Customers", icon: "fas fa-smile" },
  { number: "50+", label: "Acres of Farmland", icon: "fas fa-map" },
  { number: "365", label: "Days Fresh Supply", icon: "fas fa-truck" }
];

export default function AboutUs() {
  return (
    // NOTE: no min-h-screen or page-level background here
    <div className="pb-12">
      {/* Hero (edge-to-edge) */}
      <motion.section
        className="relative flex h-[60vh] items-center justify-center bg-cover bg-center bg-no-repeat md:h-[70vh]"
        style={{ backgroundImage: `linear-gradient(rgba(34,84,61,.7),rgba(34,84,61,.5)),url(${heroImage})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="mx-auto max-w-4xl px-4 text-center text-white">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
            <div className="mb-5 flex justify-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-white/20 backdrop-blur-sm">
                <i className="fas fa-leaf text-2xl" />
              </div>
            </div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Welcome to <span className="text-green-300">GreenLeaf Farm</span>
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-lg opacity-90 sm:text-xl">
              Where tradition meets innovation. Growing fresh, organic produce with love and care for over 25 years.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Our Story */}
      <motion.section className="px-4 py-16 sm:px-6 lg:px-8" initial="initial" whileInView="animate" viewport={{ once: false, amount: 0.3 }} variants={staggerContainer}>
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div className="order-2 lg:order-1" variants={slideInLeft}>
              <h2 className="mb-6 text-3xl font-bold text-gray-800 sm:text-4xl">
                Our <span className="text-green-600">Story</span>
              </h2>
              <p className="mb-6 text-base leading-relaxed text-gray-600 sm:text-lg">
                GreenLeaf Farm began as a small family operation in 1998. What started with a few acres and a dream has grown into a thriving sustainable farm that serves our local community with the freshest, highest-quality produce and dairy products.
              </p>
              <p className="mb-8 text-base leading-relaxed text-gray-600 sm:text-lg">
                Today, we combine traditional farming wisdom with modern technology to ensure every product meets our high standards while caring for the environment and our animals.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {statistics.map((stat, i) => (
                  <motion.div key={i} className="rounded-lg bg-green-50 p-4 text-center" variants={scaleIn} whileHover={{ ...cardHover, backgroundColor: "#dcfce7" }}>
                    <i className={`${stat.icon} mb-2 text-xl text-green-600`} />
                    <div className="text-2xl font-bold text-green-700 sm:text-3xl">{stat.number}</div>
                    <div className="text-sm text-gray-600 sm:text-base">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div className="order-1 lg:order-2" variants={slideInRight}>
              <div className="relative">
                <motion.img
                  src={ourstory}
                  alt="Farmer in field at sunset"
                  className="h-64 w-full rounded-2xl object-cover shadow-xl sm:h-80 lg:h-96"
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: false, amount: 0.3 }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 grid h-24 w-24 place-items-center rounded-full bg-green-600 text-white shadow-lg sm:h-32 sm:w-32"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <i className="fas fa-tractor text-2xl sm:text-3xl" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Values */}
      <motion.section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8" initial="initial" whileInView="animate" viewport={{ once: false, amount: 0.2 }} variants={staggerContainer}>
        <div className="mx-auto max-w-6xl">
          <motion.div className="mb-12 text-center sm:mb-16" variants={fadeInUp}>
            <h2 className="mb-4 text-3xl font-bold text-gray-800 sm:text-4xl">
              Our <span className="text-green-600">Values</span>
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">The principles that guide everything we do at GreenLeaf Farm</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3 sm:gap-8">
            {farmValues.map((v, i) => (
              <motion.div key={i} className="rounded-xl bg-white p-6 shadow-lg transition-all sm:p-8" initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: i * 0.15 }} whileHover={cardHover}>
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-green-100 sm:h-16 sm:w-16">
                  <i className={`${v.icon} text-xl text-green-600 sm:text-2xl`} />
                </div>
                <h3 className="mb-3 text-lg font-bold text-gray-800 sm:text-xl">{v.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600 sm:text-base">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Products */}
      <motion.section className="px-4 py-16 sm:px-6 lg:px-8" initial="initial" whileInView="animate" viewport={{ once: false, amount: 0.2 }} variants={staggerContainer}>
        <div className="mx-auto max-w-6xl">
          <motion.div className="mb-12 text-center sm:mb-16" variants={fadeInUp}>
            <h2 className="mb-4 text-3xl font-bold text-gray-800 sm:text-4xl">
              What We <span className="text-green-600">Grow</span>
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">Fresh, natural products grown with care and delivered with pride</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3 sm:gap-8">
            {farmProducts.map((p, i) => (
              <motion.div key={i} className="overflow-hidden rounded-xl bg-white shadow-lg transition-all" initial={{ opacity: 0, y: 70 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: i * 0.2 }}>
                <div className="h-48 overflow-hidden sm:h-56">
                  <motion.img src={p.image} alt={p.title} className="h-full w-full object-cover" initial={{ opacity: 0, scale: 1.04 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} />
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center">
                    <div className="mr-3 grid h-10 w-10 place-items-center rounded-full bg-green-100">
                      <i className={`${p.icon} text-lg text-green-600`} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 sm:text-xl">{p.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600 sm:text-base">{p.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Visit */}
      <motion.section className="bg-green-600 px-4 py-16 text-white sm:px-6 lg:px-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl">Visit Our Farm</h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg opacity-90">Experience farm life firsthand. Schedule a visit to see how we grow your food with care and dedication.</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button className="rounded-full bg-white px-6 py-3 font-semibold text-green-600 shadow-lg sm:px-8 sm:py-4">Schedule Visit</button>
            <button className="rounded-full border-2 border-white px-6 py-3 font-semibold text-white hover:bg-white hover:text-green-600 sm:px-8 sm:py-4">Contact Us</button>
          </div>
        </div>
      </motion.section>
    {/* ✅ Mount chatbot here so it's available on this page */}
          <ChatbotWidget />
       </div>
  );
}
