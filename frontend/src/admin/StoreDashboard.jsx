// src/admin/StoreDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";

// --- Enhanced helpers ---
const formatNumber = (n) => Intl.NumberFormat("en-LK").format(Number(n || 0));
const formatCurrency = (n) =>
  `Rs ${Number(n || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const trendBadge = (pct) => {
  if (pct === undefined || pct === null) return null;
  const up = Number(pct) >= 0;
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className={`ml-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${
        up ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      <i className={`fas fa-arrow-${up ? "up" : "down"} text-xs`} />
      {Math.abs(Number(pct)).toFixed(1)}%
    </motion.span>
  );
};

// --- Enhanced stat card with hover effects ---
const StatCard = ({ to, icon, label, value, hint, rightHint, tone = "green", index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const toneStyles = {
    green: "from-emerald-50 to-green-50 border-emerald-100 text-emerald-600",
    amber: "from-amber-50 to-orange-50 border-amber-100 text-amber-600",
    sky: "from-sky-50 to-blue-50 border-sky-100 text-sky-600",
    purple: "from-purple-50 to-indigo-50 border-purple-100 text-purple-600"
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -2, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/30 to-emerald-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <motion.div 
            animate={isHovered ? { rotate: 5, scale: 1.1 } : { rotate: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${toneStyles[tone]} flex items-center justify-center shadow-sm`}
          >
            <i className={`${icon} text-xl`} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(value)}</p>
            {hint && <p className="text-xs text-gray-400">{hint}</p>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {rightHint}
          {to && (
            <motion.i 
              animate={isHovered ? { x: 2 } : { x: 0 }}
              className="fas fa-arrow-right text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
  
  return to ? <Link to={to} className="block">{content}</Link> : content;
};

// --- Enhanced skeleton with shimmer effect ---
const CardSkeleton = ({ index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
  >
    <div className="animate-pulse flex items-start gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200" />
      <div className="flex-1">
        <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
        <div className="h-8 w-28 bg-gray-200 rounded mb-2" />
        <div className="h-2 w-16 bg-gray-100 rounded" />
      </div>
    </div>
  </motion.div>
);

const ChartSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl p-6 shadow-sm border border-gray-100 bg-white"
  >
    <div className="animate-pulse">
      <div className="h-5 w-48 bg-gray-200 rounded mb-4" />
      <div className="h-80 w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl" />
    </div>
  </motion.div>
);

// --- Filter component ---
const FilterTabs = ({ activeFilter, onFilterChange, className = "" }) => {
  const filters = [
    { key: 'daily', label: 'Daily', icon: 'fas fa-calendar-day' },
    { key: 'weekly', label: 'Weekly', icon: 'fas fa-calendar-week' },
    { key: 'monthly', label: 'Monthly', icon: 'fas fa-calendar' }
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {filters.map((filter) => (
        <motion.button
          key={filter.key}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFilterChange(filter.key)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeFilter === filter.key
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
              : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200'
          }`}
        >
          <i className={`${filter.icon} text-xs`} />
          {filter.label}
        </motion.button>
      ))}
    </div>
  );
};

// --- Enhanced table cells ---
const TCell = ({ children, className = "" }) => (
  <td className={`px-4 py-4 text-sm text-gray-700 ${className}`}>{children}</td>
);

export default function StoreDashboard() {
  const [loading, setLoading] = useState(true);
  const [storeSummary, setStoreSummary] = useState(null);
  const [sales30, setSales30] = useState([]);
  const [invByCat, setInvByCat] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [error, setError] = useState("");
  const [salesFilter, setSalesFilter] = useState('daily');
  const [chartType, setChartType] = useState('line');

  // Mock function to simulate different data based on filter
  const getFilteredSalesData = (data, filter) => {
    if (!data.length) return data;
    
    switch (filter) {
      case 'weekly':
        // Group by week (simplified)
        return data.filter((_, index) => index % 7 === 0);
      case 'monthly':
        // Group by month (simplified)
        return data.filter((_, index) => index % 30 === 0);
      default:
        return data;
    }
  };

  // fetch data
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const [ss, s30, cat, ro, ts] = await Promise.all([
          api.get("/admin/store/summary"),
          api.get("/admin/charts/sales-30d"),
          api.get("/admin/charts/inventory-by-category"),
          api.get("/admin/orders/recent?limit=5"),
          api.get("/admin/charts/top-sellers?limit=5"),
        ]);

        if (!mounted) return;
        setStoreSummary(ss?.data || {});
        setSales30(Array.isArray(s30?.data) ? s30.data : []);
        setInvByCat(Array.isArray(cat?.data) ? cat.data : []);
        setRecentOrders(Array.isArray(ro?.data) ? ro.data : []);
        setTopSellers(Array.isArray(ts?.data) ? ts.data : []);
      } catch (e) {
        console.error("Failed to load store dashboard data:", e);
        setError(e?.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Enhanced data processing
  const salesData = useMemo(() => {
    const baseData = (sales30 || []).map((d, i) => ({
      date: d.date || d._id || d.day || d.label || `Day ${i + 1}`,
      revenue: Number(d.revenue ?? d.total ?? 0),
      orders: Number(d.orders ?? d.count ?? 0),
    }));
    
    return getFilteredSalesData(baseData, salesFilter);
  }, [sales30, salesFilter]);

  const invData = useMemo(() => {
    return (invByCat || []).map((d) => ({
      name: d._id || d.name || "Unknown",
      value: Number(d.value ?? d.qty ?? d.count ?? 0),
    }));
  }, [invByCat]);

  const summary = storeSummary || {};
  const pieColors = ["#10b981", "#059669", "#34d399", "#6ee7b7", "#84cc16", "#65a30d", "#22c55e", "#16a34a"];

  const renderPieLabel = ({ name, percent }) => {
    if (percent < 0.05) return null; // Hide labels for very small slices
    const short = name?.length > 10 ? name.slice(0, 10) + "…" : name || "—";
    return `${short} ${(percent * 100).toFixed(0)}%`;
  };

  const renderChart = () => {
    if (salesData.length === 0) {
      return (
        <div className="h-full w-full rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-500 p-8">
          <i className="fas fa-chart-line text-4xl mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No sales data to display</p>
          <p className="text-sm text-center">Data will appear here once you start receiving orders</p>
        </div>
      );
    }

    const ChartComponent = chartType === 'area' ? AreaChart : chartType === 'bar' ? BarChart : LineChart;
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={salesData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value, name) =>
              name === "revenue" ? formatCurrency(value) : formatNumber(value)
            }
          />
          <Legend />
          
          {chartType === 'line' && (
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name="Revenue" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            />
          )}
          
          {chartType === 'area' && (
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          )}
          
          {chartType === 'bar' && (
            <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/20">
      <div className="p-4 lg:p-8 space-y-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
              Store Dashboard
            </h1>
            <p className="text-gray-600 text-lg mt-2">Complete overview of your online business</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/admin/analytics"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition-all duration-200 shadow-sm"
              >
                <i className="fas fa-chart-bar" />
                Analytics
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/store"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg shadow-emerald-200"
              >
                <i className="fas fa-store" />
                View Storefront
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Error state with better design */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm"
            >
              <i className="fas fa-exclamation-triangle text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} index={i} />)
          ) : (
            <>
              <StatCard
                to="/admin/store/products"
                icon="fas fa-boxes"
                label="Total Products"
                value={summary.productCount}
                hint={`${formatNumber(summary.lowStockCount || 0)} low stock items`}
                rightHint={<span className="text-xs text-gray-400 font-medium">Manage →</span>}
                tone="green"
                index={0}
              />
              <StatCard
                to="/admin/store/orders"
                icon="fas fa-shopping-cart"
                label="Orders Today"
                value={summary.ordersToday ?? 0}
                rightHint={trendBadge(summary.ordersTodayChangePct)}
                tone="sky"
                index={1}
              />
              <StatCard
                to="/admin/customers"
                icon="fas fa-users"
                label="Total Customers"
                value={summary.customers}
                hint="Active user base"
                tone="purple"
                index={2}
              />
              <StatCard
                to="/admin/finance"
                icon="fas fa-chart-line"
                label="Today's Revenue"
                value={formatCurrency(summary.revenueToday)}
                rightHint={trendBadge(summary.revenueTodayChangePct)}
                tone="amber"
                index={3}
              />
            </>
          )}
        </div>

        {/* Secondary metrics */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <StatCard
              to="/admin/discounts"
              icon="fas fa-tags"
              label="Active Promotions"
              value={summary.activeDiscounts || 0}
              hint="Current campaigns"
              tone="amber"
            />
            <StatCard
              to="/admin/store/orders"
              icon="fas fa-receipt"
              label="Total Orders"
              value={summary.orderCount}
              hint="Lifetime orders"
              tone="sky"
            />
            <StatCard
              to="/admin/finance"
              icon="fas fa-wallet"
              label="Total Revenue"
              value={formatCurrency(summary.revenueAllTime)}
              hint="All-time earnings"
              tone="green"
            />
          </motion.div>
        )}

        {/* Enhanced charts section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Sales chart with filters */}
          {loading ? (
            <div className="xl:col-span-2"><ChartSkeleton /></div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="xl:col-span-2 rounded-2xl p-6 shadow-sm border border-gray-100 bg-white"
            >
              {/* Chart header with controls */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Sales Analytics</h3>
                  <p className="text-sm text-gray-500">Revenue trends and patterns</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <FilterTabs 
                    activeFilter={salesFilter} 
                    onFilterChange={setSalesFilter}
                  />
                  
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                    {[
                      { key: 'line', icon: 'fas fa-chart-line' },
                      { key: 'area', icon: 'fas fa-chart-area' },
                      { key: 'bar', icon: 'fas fa-chart-bar' }
                    ].map((type) => (
                      <button
                        key={type.key}
                        onClick={() => setChartType(type.key)}
                        className={`p-2 rounded-lg transition-all ${
                          chartType === type.key
                            ? 'bg-white text-emerald-600 shadow-sm'
                            : 'text-gray-500 hover:text-emerald-600'
                        }`}
                      >
                        <i className={type.icon} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {salesData.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500" />
                    <span className="text-gray-600">
                      Total Revenue: <span className="font-semibold text-gray-900">
                        {formatCurrency(salesData.reduce((s, d) => s + (d.revenue || 0), 0))}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                      Period: <span className="font-semibold text-gray-900 capitalize">{salesFilter}</span>
                    </span>
                  </div>
                </div>
              )}

              <div className="h-80 lg:h-96">
                {renderChart()}
              </div>
            </motion.div>
          )}

          {/* Enhanced inventory chart */}
          {loading ? (
            <ChartSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl p-6 shadow-sm border border-gray-100 bg-white"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Inventory Distribution</h3>
                  <p className="text-sm text-gray-500">Products by category</p>
                </div>
                <Link to="/admin/inventory" className="text-sm text-emerald-700 hover:text-emerald-800 font-medium">
                  Manage →
                </Link>
              </div>
              
              {invData.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm text-gray-600">
                    Total Items: <span className="font-bold text-gray-900">
                      {formatNumber(invData.reduce((s, d) => s + (d.value || 0), 0))}
                    </span>
                  </span>
                </div>
              )}

              <div className="h-80">
                {invData.length === 0 ? (
                  <div className="h-full w-full rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-500">
                    <i className="fas fa-boxes text-4xl mb-4 text-gray-300" />
                    <p className="font-medium">No inventory data</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={invData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        labelLine={false}
                        label={renderPieLabel}
                      >
                        {invData.map((_, idx) => (
                          <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(v, n) => [formatNumber(v), n]}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Enhanced bottom section */}
        {!loading && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="rounded-2xl p-6 shadow-sm border border-gray-100 bg-white"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Recent Orders</h3>
                  <p className="text-sm text-gray-500">Latest customer orders</p>
                </div>
                <Link 
                  to="/admin/store/orders" 
                  className="text-sm text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                >
                  View all <i className="fas fa-arrow-right text-xs" />
                </Link>
              </div>
              
              {recentOrders.length === 0 ? (
                <div className="h-48 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-500">
                  <i className="fas fa-shopping-cart text-4xl mb-4 text-gray-300" />
                  <p className="font-medium">No recent orders</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-3 text-left">Order</th>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-left">Total</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentOrders.map((o, index) => (
                        <motion.tr
                          key={o._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TCell>
                            <Link 
                              to={`/admin/store/orders/${o._id}`}
                              className="text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
                            >
                              #{o.code || o._id?.slice(-6)}
                            </Link>
                          </TCell>
                          <TCell className="font-medium">{o.customer?.name || o.customer || "Guest"}</TCell>
                          <TCell className="font-semibold">{formatCurrency(o.total)}</TCell>
                          <TCell>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                o.status === "completed"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : o.status === "pending"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : o.status === "canceled"
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-gray-50 text-gray-700 border border-gray-200"
                              }`}
                            >
                              {o.status?.charAt(0).toUpperCase() + o.status?.slice(1) || "—"}
                            </span>
                          </TCell>
                          <TCell className="text-gray-500">
                            {new Date(o.createdAt || Date.now()).toLocaleDateString('en-GB')}
                          </TCell>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* Top Sellers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="rounded-2xl p-6 shadow-sm border border-gray-100 bg-white"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Top Performers</h3>
                  <p className="text-sm text-gray-500">Best selling products</p>
                </div>
                <Link 
                  to="/admin/store/products" 
                  className="text-sm text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                >
                  Manage <i className="fas fa-arrow-right text-xs" />
                </Link>
              </div>
              
              {topSellers.length === 0 ? (
                <div className="h-48 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-500">
                  <i className="fas fa-star text-4xl mb-4 text-gray-300" />
                  <p className="font-medium">No sales data yet</p>
                  <p className="text-xs">Top products will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topSellers.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-emerald-50/30 hover:from-emerald-50 hover:to-green-50 transition-all duration-200 border border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            i === 0 ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-200' :
                            i === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-200' :
                            i === 2 ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-200' :
                            'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg shadow-emerald-200'
                          }`}>
                            #{i + 1}
                          </div>
                          {i < 3 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                              <i className={`fas fa-${i === 0 ? 'crown' : i === 1 ? 'medal' : 'award'} text-xs ${
                                i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-500' : 'text-orange-500'
                              }`} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{p.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <i className="fas fa-box text-emerald-500" />
                              {formatNumber(p.units || 0)} sold
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <i className="fas fa-chart-line text-emerald-500" />
                              {((p.units || 0) / Math.max(...topSellers.map(s => s.units || 0)) * 100).toFixed(0)}% of top
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(p.revenue || 0)}</div>
                        <div className="text-xs text-gray-500">Revenue</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Enhanced loading state */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-12"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-700 font-medium">Loading Store Analytics...</span>
            </div>
          </motion.div>
        )}

        {/* Quick actions floating buttons (mobile) */}
        <div className="fixed bottom-6 right-6 lg:hidden">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col gap-3"
          >
            <Link
              to="/admin/store/orders/new"
              className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200 hover:shadow-xl transition-all duration-200"
            >
              <i className="fas fa-plus text-lg" />
            </Link>
            <Link
              to="/admin/analytics"
              className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-gray-600 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <i className="fas fa-chart-bar" />
            </Link>
          </motion.div>
        </div>

        {/* Footer stats */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-r from-emerald-50 via-white to-green-50 rounded-2xl p-6 border border-emerald-100"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-700">{formatNumber(summary.productCount || 0)}</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-700">{formatNumber(summary.orderCount || 0)}</div>
                <div className="text-sm text-gray-600">Orders</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-700">{formatNumber(summary.customers || 0)}</div>
                <div className="text-sm text-gray-600">Customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-700">
                  {summary.revenueAllTime ? formatCurrency(summary.revenueAllTime).replace('Rs ', '') : '0'}
                </div>
                <div className="text-sm text-gray-600">Revenue</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}