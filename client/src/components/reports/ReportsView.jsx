import React from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText, TrendingUp, DollarSign, Package, Truck, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';

export default function ReportsView() {
  const { showToast } = useAuth();

  const reportData = [
    { month: 'Jan', revenue: 3200000, margin: 24.2, discount: 8.5 },
    { month: 'Feb', revenue: 4500000, margin: 25.8, discount: 9.1 },
    { month: 'Mar', revenue: 4486330, margin: 26.0, discount: 16.0 },
    { month: 'Apr', revenue: 5800000, margin: 24.5, discount: 10.2 },
    { month: 'May', revenue: 6200000, margin: 27.1, discount: 7.8 }
  ];

  const handleExportXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SalesPerformance');
    XLSX.writeFile(workbook, 'DEALFLOW360_Decision_Report.xlsx');
    showToast('Decision report exported to DEALFLOW360_Decision_Report.xlsx successfully!', 'success');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded-full uppercase">
            Executive Decision Analytics
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-2">
            Finance, Product Sales & Warehouse Decision Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data-backed performance analytics for strategic pricing, discount cutoff compliance, and inventory planning.
          </p>
        </div>
        <button
          onClick={handleExportXLSX}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center inline-flex"
        >
          <FileSpreadsheet size={16} className="mr-2" /> Export Decision XLSX
        </button>
      </div>

      {/* Decision-Making Report Section 1: Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
              1. Finance & Cash Flow
            </span>
            <DollarSign className="text-emerald-600" size={20} />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">₹44,86,330</span>
            <span className="text-xs text-emerald-600 font-bold">Gross Margin: 26.0%</span>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
            <strong>Decision Insight:</strong> Revenue realization rate is 100%. Dual Finance sign-off for quotes &gt; 15% discount has prevented margin erosion.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md">
              2. Product Sales Volume
            </span>
            <Package className="text-blue-600" size={20} />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">100 Controllers</span>
            <span className="text-xs text-blue-600 font-bold">SKU: CTRL-IND-500</span>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
            <strong>Decision Insight:</strong> Automation Controllers generate 92% of hardware revenue. Recommend bundling 24/7 SLA subscription packages.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-purple-800 bg-purple-50 px-2.5 py-1 rounded-md">
              3. Warehouse Inventory
            </span>
            <Truck className="text-purple-600" size={20} />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">100 / 100 Stock</span>
            <span className="text-xs text-purple-600 font-bold">60 Main • 40 East Depot</span>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
            <strong>Decision Insight:</strong> Multi-warehouse stock split rule is active. Main warehouse (60) + East Depot (40) perfectly match DEAL-1042 order.
          </p>
        </div>
      </div>

      {/* Decision-Making Report Section 2: Visual Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Monthly Realized Revenue Trend (INR)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Gross Margin % vs Cutoff Discount Utilization</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="margin" stroke="#16A34A" strokeWidth={3} name="Gross Margin %" />
                <Line type="monotone" dataKey="discount" stroke="#DC2626" strokeWidth={2} name="Avg Discount %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
