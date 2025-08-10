import { motion } from "framer-motion";

export default function ProductCard({ product }) {
  const img = product?.images?.[0] || "https://via.placeholder.com/640x480?text=Product";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-[4/3] bg-gray-50">
        <img
          src={img}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 font-medium text-gray-900">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{product.category || "—"}</p>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-green-700 font-semibold">Rs. {product.price?.toLocaleString("en-LK")}</p>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 text-white text-sm px-3 py-2 hover:bg-green-700"
            onClick={() => alert("Added to cart")}
          >
            <i className="fa-solid fa-cart-plus" />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
