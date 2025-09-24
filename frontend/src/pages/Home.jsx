import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import heroImage from "../assets/ourstory.jpg";
import produceImage from "../assets/produce.jpg";
import dairyImage from "../assets/freshdiary.jpg";
import cropImage from "../assets/crop.jpg";
import ChatbotWidget from "../components/ChatbotWidget";

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
    details: ["+94 91 227 6246", "Open daily 7AM – 6PM"]
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-white pb-20 pt-24 sm:pt-28">
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

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 md:grid-cols-[1.05fr_minmax(0,_1fr)]">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">
              Growing freshness since 1998
            </span>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Farm-fresh produce delivered with heart
            </h1>
            <p className="max-w-xl text-lg text-gray-600">
              Welcome to GreenLeaf Farm. We grow, harvest, and hand-deliver organic produce and dairy using sustainable practices
              that respect our land, animals, and community.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/store"
                className="inline-flex items-center justify-center rounded-full bg-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-600/25 transition-transform duration-300 hover:-translate-y-1 hover:bg-green-700"
              >
                Shop the farm
                <i className="fas fa-arrow-right ml-2 text-sm" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-full border border-gray-900/70 px-6 py-3 font-semibold text-gray-900 transition-transform duration-300 hover:-translate-y-1 hover:border-gray-900 hover:bg-black hover:text-white"
              >
                Meet our team
                <i className="fas fa-seedling ml-2 text-sm" />
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
                className="absolute bottom-5 left-5 flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 text-sm text-gray-800 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-green-600 text-white">
                  <i className="fas fa-leaf" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Daily harvest</p>
                  <p className="text-sm font-semibold text-gray-900">Handpicked & delivered fresh</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section id="story" className="relative bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_minmax(0,_0.9fr)]">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Our story is rooted in <span className="text-green-600">sustainable farming</span>
              </h2>
              <p className="text-lg text-gray-600">
                GreenLeaf Farm began as a small family operation in 1998. What started with a few acres and a dream has grown into
                a thriving, technology-enabled farm that serves our community with premium produce and dairy.
              </p>
              <p className="text-lg text-gray-600">
                Today we combine generational knowledge with smart irrigation, soil monitoring, and ethical animal care to ensure
                every harvest meets our high standards while protecting the environment we call home.
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                {storyHighlights.map((highlight) => (
                  <motion.div
                    key={highlight.title}
                    className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm shadow-black/5 transition-transform duration-300 hover:-translate-y-1"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">{highlight.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-600">{highlight.description}</p>
                  </motion.div>
                ))}
              </div>
              <div>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/25 transition-transform duration-300 hover:-translate-y-1 hover:bg-green-700"
                >
                  Discover our journey
                  <i className="fas fa-arrow-up-right-from-square text-xs" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="rounded-3xl border border-black/10 bg-black text-white"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="space-y-6 p-8 sm:p-10">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">From our fields</p>
                <h3 className="text-2xl font-semibold">Smart, sustainable, and community driven</h3>
                <p className="text-base text-white/80">
                  Our integrated farm management system keeps every crop cycle transparent. We track soil health, rainfall, and animal
                  wellbeing so you can trust every bite.
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full bg-white/10 px-4 py-2">Eco-friendly inputs</span>
                  <span className="rounded-full bg-white/10 px-4 py-2">Happy livestock</span>
                  <span className="rounded-full bg-white/10 px-4 py-2">Local partnerships</span>
                </div>
                <a
                  href="#trending"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition-transform duration-300 hover:-translate-y-1"
                >
                  Explore what's fresh
                  <i className="fas fa-carrot text-xs" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trending foods */}
      <section id="trending" className="bg-green-50/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            className="mb-12 flex flex-col items-start gap-6 text-left sm:flex-row sm:items-center sm:justify-between"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-700">Trending this week</p>
              <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">Seasonal picks customers love</h2>
              <p className="mt-4 max-w-2xl text-base text-gray-600">
                Discover fresh harvest favourites curated by our team. Every item below is available in limited batches inside the store.
              </p>
            </div>
            <Link
              to="/store"
              className="inline-flex items-center gap-2 rounded-full border border-green-600 px-5 py-3 text-sm font-semibold text-green-700 transition-transform duration-300 hover:-translate-y-1 hover:bg-green-600 hover:text-white"
            >
              Browse full store
              <i className="fas fa-shop text-xs" />
            </Link>
          </motion.div>

          <motion.div
            className="grid gap-8 md:grid-cols-2 xl:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {trendingFoods.map((item) => (
              <motion.article
                key={item.name}
                variants={fadeInUp}
                className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg shadow-black/5 transition-transform duration-300 hover:-translate-y-1"
                whileHover={{ y: -6 }}
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <motion.img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    initial={{ scale: 1.02 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-green-600 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    {item.badge}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                  <p className="flex-1 text-sm text-gray-600">{item.description}</p>
                  <Link
                    to="/store"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 transition-colors hover:text-green-800"
                  >
                    Add to basket
                    <i className="fas fa-arrow-right" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            className="mx-auto mb-12 max-w-3xl text-center"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-900">Stay connected</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">We're here to welcome you to the farm</h2>
            <p className="mt-4 text-base text-gray-600">
              Whether you're planning a visit, looking for wholesale partnerships, or have questions about our produce, our team is ready to help.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {contactDetails.map((item) => (
              <motion.div
                key={item.title}
                className="rounded-3xl border border-black/5 bg-white p-8 shadow-md shadow-black/5 transition-transform duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                  <i className={`${item.icon} text-lg`} />
                </span>
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <ul className="mt-3 space-y-1 text-sm text-gray-600">
                  {item.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Plan your visit</p>
              <p className="text-lg font-semibold text-gray-900">Let's grow something fresh together.</p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-600/25 transition-transform duration-300 hover:-translate-y-1 hover:bg-green-700"
            >
              Contact our team
              <i className="fas fa-envelope" />
            </Link>
          </div>
          {/* ✅ Mount chatbot here so it's available on this page */}
                    <ChatbotWidget />
                 
        </div>
         </section>
    </main>
  );
};


export default Home;
