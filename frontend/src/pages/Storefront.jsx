import { useEffect, useState } from "react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";
import { motion } from "framer-motion";

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border bg-white overflow-hidden">
      <div className="aspect-[4/3] bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-8 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function Storefront() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/products", { params: { q } })
      .then((res) => mounted && setData(res.data))
      .catch((e) => console.error(e))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [q]);

  return (
    <section>
      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Fresh from GreenLeaf</h1>
          <p className="text-sm text-gray-500">White & green minimal design — smooth & fast.</p>
        </div>
        <div className="sm:ml-auto w-full sm:w-80">
          <label className="relative block">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border px-4 py-2.5 pr-9 outline-none focus:ring-2 focus:ring-green-600"
            />
            <i className="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </label>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : data.items.length ? (
        <motion.div layout className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {data.items.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </motion.div>
      ) : (
        <div className="rounded-2xl border p-8 text-center text-gray-500">
          No products found.
        </div>
      )}
    </section>
  );
}
