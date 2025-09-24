import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import heroImage from "../assets/ourstory.jpg";
import produceImage from "../assets/produce.jpg";
import dairyImage from "../assets/freshdiary.jpg";
import cropImage from "../assets/crop.jpg";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.12
    }
  }
};

const storyHighlights = [
  {
    title: "Three Generations of Care",
    description:
      "Since 1998 our family has grown GreenLeaf Farm from a few acres into a sustainable operation that nourishes Malabe and beyond."
  },
  {
    title: "Sustainable at Heart",
    description:
      "We blend traditional wisdom with smart-farm technology to keep our soil healthy, animals happy, and produce vibrant."
  },
  {
    title: "Always Fresh",
    description:
      "Daily harvests and careful handling mean every box of produce and dairy arrives crisp, flavorful, and full of goodness."
  }
];

const trendingFoods = [
  {
    name: "Morning Harvest Veggie Box",
    description: "A curated mix of seasonal greens picked at sunrise for peak nutrition.",
    image: produceImage,
    badge: "Best Seller"
  },
  {
    name: "Farmhouse Dairy Set",
    description: "Creamy milk, yogurt, and cheese crafted in small batches from our herd.",
    image: dairyImage,
    badge: "Customer Favorite"
  },
  {
    name: "Signature Crop Bundle",
    description: "Rotating selection of root vegetables and herbs grown with organic methods.",
    image: cropImage,
    badge: "Seasonal Highlight"
  }
];

const contactDetails = [
  {
    icon: "fas fa-location-dot",
    title: "Visit our farm",
    details: ["244/9, Dines Place, Kaduwela Rd", "Malabe, Sri Lanka"]
  },
  {
    icon: "fas fa-phone",
    title: "Call us any day",
    details: ["(555) 123-4567", "Open daily 7AM – 6PM"]
  },
  {
    icon: "fas fa-envelope-open-text",
    title: "Write to us",
    details: ["info@greenleaffarm.com", "We reply within 24 hours"]
  }
];

const Home = () => {
  return (
    <main className="bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pb-24 pt-32 sm:pb-28 sm:pt-36 lg:pb-32 lg:pt-40">
        <motion.span
          className="absolute -right-20 top-12 hidden h-72 w-72 rounded-full bg-green-100/60 blur-3xl lg:block"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <motion.span
          className="absolute -left-24 bottom-0 hidden h-64 w-64 rounded-full bg-black/5 blur-3xl md:block"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
        />

        <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid items-center gap-16 md:grid-cols-[1.1fr_0.9fr] lg:gap-20">
            <motion.div 
              variants={fadeInUp} 
              initial="hidden" 
              animate="visible" 
              className="space-y-8 lg:space-y-10"
            >
              <span className="inline-flex items-center rounded-full bg-green-100 px-5 py-2 text-sm font-medium text-green-700">
                Growing freshness since 1998
              </span>
              
              <div className="space-y-6">
                <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl xl:text-7xl">
                  Farm-fresh produce delivered with heart
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-gray-600 lg:text-xl">
                  Welcome to GreenLeaf Farm. We grow, harvest, and hand-deliver organic produce and dairy using sustainable practices
                  that respect our land, animals, and community.
                </p>
              </div>
              
              <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:gap-6">
                <Link
                  to="/store"
                  className="inline-flex items-center justify-center rounded-full bg-green-600 px-8 py-4 font-semibold text-white shadow-lg shadow-green-600/25 transition-transform duration-300 hover:-translate-y-1 hover:bg-green-700"
                >
                  Shop the farm
                  <i className="fas fa-arrow-right ml-3 text-sm" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center rounded-full border border-gray-900/70 px-8 py-4 font-semibold text-gray-900 transition-transform duration-300 hover:-translate-y-1 hover:border-gray-900 hover:bg-black hover:text-white"
                >
                  Meet our team
                  <i className="fas fa-seedling ml-3 text-sm" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            >
              <div className="relative overflow-hidden rounded-3xl border border-green-100 bg-white shadow-2xl shadow-black/10">
                <motion.img
                  src={heroImage}
                  alt="GreenLeaf farmers harvesting crops"
                  className="h-full w-full object-cover"
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute bottom-6 left-6 flex items-center gap-4 rounded-2xl bg-white/90 px-5 py-4 text-sm text-gray-800 shadow-lg backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-green-600 text-white">
                    <i className="fas fa-leaf" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Daily harvest</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">Handpicked & delivered fresh</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

   {/* Our Story */}
<section id="story" className="relative bg-gradient-to-b from-green-50 via-white to-white py-24">
  <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      className="space-y-12"
    >
      {/* Heading */}
      <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl uppercase text-center">
        Our story is rooted in <span className="text-green-600">sustainable farming</span>
      </h2>

      {/* Paragraphs */}
      <div className="max-w-4xl mx-auto space-y-6 text-center">
        <p className="text-lg text-gray-700">
          GreenLeaf Farm began as a small family operation in 1998. What started
          with a few acres and a dream has grown into a thriving,
          technology-enabled farm that serves our community with premium produce
          and dairy.
        </p>
        <p className="text-lg text-gray-700">
          Today we combine generational knowledge with smart irrigation, soil
          monitoring, and ethical animal care to ensure every harvest meets our
          high standards while protecting the environment we call home.
        </p>
      </div>

      {/* Cards row */}
      <div className="grid gap-6 md:grid-cols-3">
        {storyHighlights.map((highlight, idx) => (
          <motion.div
            key={highlight.title}
            className="rounded-2xl border border-green-100 bg-white p-6 shadow-md shadow-black/5 transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.1 }}
          >
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {highlight.title}
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">
              {highlight.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CTA button */}
      <div className="flex justify-center">
        <Link
          to="/about"
          className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/25 transition-transform duration-300 hover:-translate-y-1 hover:bg-green-700"
        >
          Discover our journey
          <i className="fas fa-arrow-up-right-from-square text-xs" />
        </Link>
      </div>
    </motion.div>
  </div>
</section>

      {/* Contact Section */}
      <section className="bg-white py-24 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <motion.div
            className="mx-auto mb-16 max-w-4xl text-center space-y-6"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-900">Stay connected</p>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">We're here to welcome you to the farm</h2>
            <p className="text-lg leading-relaxed text-gray-600 max-w-3xl mx-auto">
              Whether you're planning a visit, looking for wholesale partnerships, or have questions about our produce, our team is ready to help.
            </p>
          </motion.div>

          <div className="grid gap-10 md:grid-cols-3">
            {contactDetails.map((item, index) => (
              <motion.div
                key={item.title}
                className="rounded-3xl border border-black/5 bg-white p-10 shadow-md shadow-black/5 transition-transform duration-300 hover:-translate-y-2 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
              >
                <span className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
                  <i className={`${item.icon} text-xl`} />
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{item.title}</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {item.details.map((detail) => (
                    <li key={detail} className="leading-relaxed">{detail}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center gap-8 sm:flex-row sm:justify-between border-t border-gray-100 pt-16">
            <div className="text-center sm:text-left space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 font-medium">Plan your visit</p>
              <p className="text-xl font-semibold text-gray-900">Let's grow something fresh together.</p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 rounded-full bg-green-600 px-8 py-4 font-semibold text-white shadow-lg shadow-green-600/25 transition-transform duration-300 hover:-translate-y-1 hover:bg-green-700"
            >
              Contact our team
              <i className="fas fa-envelope" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;