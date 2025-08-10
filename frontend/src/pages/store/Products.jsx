// src/admin/pages/store/Products.jsx
import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";

export default function Products() {
  const empty = { name: "", price: "", sku: "", category: "", qty: 0, lowStockThreshold: 10, tags: "" };
  const [form, setForm] = useState(empty);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/products");
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      price: Number(form.price),
      sku: form.sku || undefined,
      category: form.category || undefined,
      stock: { qty: Number(form.qty), lowStockThreshold: Number(form.lowStockThreshold) },
      tags: form.tags ? form.tags.split(",").map(t => t.trim()) : []
    };
    await api.post("/products", payload);
    setForm(empty);
    load();
  };

  const remove = async (id) => {
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Products</h1>

      {/* Create */}
      <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input className="rounded-lg border-gray-300" placeholder="Name*" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          <input type="number" className="rounded-lg border-gray-300" placeholder="Price*" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required />
          <input className="rounded-lg border-gray-300" placeholder="SKU" value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} />
          <input className="rounded-lg border-gray-300" placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
          <input type="number" className="rounded-lg border-gray-300" placeholder="Qty" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} />
          <input type="number" className="rounded-lg border-gray-300" placeholder="Low stock threshold" value={form.lowStockThreshold} onChange={e=>setForm({...form,lowStockThreshold:e.target.value})} />
          <input className="rounded-lg border-gray-300 sm:col-span-2 lg:col-span-2" placeholder="Tags (comma separated)" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} />
        </div>
        <div className="mt-4">
          <button className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
            <i className="fas fa-plus mr-2" /> Add Product
          </button>
        </div>
      </form>

      {/* List */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-6" colSpan="6">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="px-4 py-6" colSpan="6">No products yet.</td></tr>
              ) : (
                items.map(p => (
                  <tr key={p._id} className="border-t">
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">{p.sku || "-"}</td>
                    <td className="px-4 py-3">Rs {p.price?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {p.stock?.qty ?? 0}
                      {(p.stock?.qty ?? 0) <= (p.stock?.lowStockThreshold ?? 10) && (
                        <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Low</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{(p.tags||[]).join(", ")}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={()=>remove(p._id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-red-600 hover:bg-red-100">
                        <i className="fas fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
