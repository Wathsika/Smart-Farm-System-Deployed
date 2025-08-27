import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";

const TABS = [
  { key: "sales", label: "Sales Reports" },
  { key: "inventory", label: "Inventory Reports" },
  { key: "customers", label: "Customer Reports" },
];

const RANGES = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All Time" },
];

export default function StoreReports() {
  const [activeTab, setActiveTab] = useState("sales");
  const [range, setRange] = useState("today");
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/reports/${activeTab}`, {
          params: { range },
        });
        setData(res.data || []);
      } catch (err) {
        console.error(err);
        setData([]);
      }
    };
    fetchData();
  }, [activeTab, range]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Smart Farm Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Section: ${TABS.find((t) => t.key === activeTab)?.label}`, 14, 32);
    doc.text(`Range: ${RANGES.find((r) => r.key === range)?.label}`, 14, 38);
    if (data.length) {
      const columns = Object.keys(data[0]).map((key) => ({
        header: key,
        dataKey: key,
      }));
      doc.autoTable({ startY: 48, columns, body: data });
    } else {
      doc.text("No data available", 14, 48);
    }
    doc.save(`${activeTab}-report.pdf`);
  };

  const renderChart = () => {
    if (!data.length) return null;
    if (activeTab === "sales") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#16a34a" />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    if (activeTab === "inventory") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="item" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="quantity" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    if (activeTab === "customers") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="orders" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex space-x-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm"
          >
            {RANGES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
          >
            Export Reports
          </button>
        </div>
      </div>

      {renderChart()}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {data.length > 0 &&
                Object.keys(data[0]).map((key) => (
                  <th
                    key={key}
                    className="px-4 py-2 text-left font-medium text-gray-700 capitalize"
                  >
                    {key}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((row, i) => (
              <tr key={i}>
                {Object.keys(row).map((key) => (
                  <td key={key} className="px-4 py-2">
                    {row[key]}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center" colSpan="100%">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
