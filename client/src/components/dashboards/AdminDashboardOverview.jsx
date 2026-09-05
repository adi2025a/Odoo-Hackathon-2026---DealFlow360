import React from 'react';
import {
  Users, Package, Truck, Layers, BarChart3, UserCheck, ShieldAlert,
  ArrowRight, DollarSign, CheckCircle2, Sliders, Activity, Clock, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboardOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded-full uppercase">
              Executive Command Center
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center">
              ● All Systems Operational
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-2">
            System Administration & Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time oversight of deal execution, role governance, revenue protection, and warehouse logistics.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin')}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center inline-flex"
        >
          Manage User Profiles & Discount Caps <ArrowRight size={14} className="ml-1.5" />
        </button>
      </div>

      {/* System KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active System Users</span>
            <Users size={18} className="text-purple-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">7 Users</span>
          <span className="text-xs text-purple-700 font-bold">● 6 Configured Roles</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Master Product SKUs</span>
            <Package size={18} className="text-blue-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">5 Active SKUs</span>
          <span className="text-xs text-blue-600 font-bold">100 Stock Units</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Realized Revenue</span>
            <DollarSign size={18} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">₹44,86,330</span>
          <span className="text-xs text-emerald-600 font-bold">26.0% Avg Gross Margin</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Governance Alerts</span>
            <ShieldAlert size={18} className="text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-700 block">1 Pending Request</span>
          <span className="text-xs text-amber-600 font-semibold">Factory SKU Sign-off</span>
        </div>
      </div>

      {/* Quick Action Operations Grid (Matching Allowed Admin Menu Items) */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base uppercase text-xs tracking-wider">
          Admin Operations Window & Quick Navigation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Customer Directory */}
          <div
            onClick={() => navigate('/customers')}
            className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow cursor-pointer hover:border-purple-400 transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between text-blue-600">
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">Account Directory</span>
              <UserCheck size={22} className="group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-lg group-hover:text-purple-600 transition-colors">Customer Directory</h4>
              <p className="text-xs text-slate-500 mt-1">View enterprise customer profiles, credit limits, and locked projects.</p>
            </div>
            <span className="text-xs font-bold text-purple-600 flex items-center pt-2">
              Open Directory <ArrowRight size={14} className="ml-1" />
            </span>
          </div>

          {/* Card 2: Product Catalog */}
          <div
            onClick={() => navigate('/products')}
            className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow cursor-pointer hover:border-purple-400 transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between text-purple-600">
              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-md">Software SKUs</span>
              <Package size={22} className="group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-lg group-hover:text-purple-600 transition-colors">Product Catalog</h4>
              <p className="text-xs text-slate-500 mt-1">Manage master product SKUs, prices, specifications, and discount limits.</p>
            </div>
            <span className="text-xs font-bold text-purple-600 flex items-center pt-2">
              View Product Catalog <ArrowRight size={14} className="ml-1" />
            </span>
          </div>

          {/* Card 3: Inventory & Stock */}
          <div
            onClick={() => navigate('/inventory')}
            className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow cursor-pointer hover:border-purple-400 transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">Stock Control</span>
              <Truck size={22} className="group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-lg group-hover:text-purple-600 transition-colors">Inventory & Stock</h4>
              <p className="text-xs text-slate-500 mt-1">Inspect real-time stock levels and warehouse fulfillment allocations.</p>
            </div>
            <span className="text-xs font-bold text-purple-600 flex items-center pt-2">
              Inspect Stock Levels <ArrowRight size={14} className="ml-1" />
            </span>
          </div>

          {/* Card 4: Warehouse Management */}
          <div
            onClick={() => navigate('/warehouse')}
            className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow cursor-pointer hover:border-purple-400 transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between text-indigo-600">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md">Depot Allocation</span>
              <Layers size={22} className="group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-lg group-hover:text-purple-600 transition-colors">Warehouse Management</h4>
              <p className="text-xs text-slate-500 mt-1">Multi-warehouse stock splits between Main Warehouse (60) and East Depot (40).</p>
            </div>
            <span className="text-xs font-bold text-purple-600 flex items-center pt-2">
              Manage Depots <ArrowRight size={14} className="ml-1" />
            </span>
          </div>

          {/* Card 5: User Profiles & Governance */}
          <div
            onClick={() => navigate('/admin')}
            className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow cursor-pointer hover:border-purple-400 transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md">User Profiles & Caps</span>
              <Users size={22} className="group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-lg group-hover:text-purple-600 transition-colors">User Profiles & Governance</h4>
              <p className="text-xs text-slate-500 mt-1">Create Sales Rep & Manager profiles with cutoff discount limits.</p>
            </div>
            <span className="text-xs font-bold text-purple-600 flex items-center pt-2">
              Configure Profiles <ArrowRight size={14} className="ml-1" />
            </span>
          </div>

          {/* Card 6: Decision Reports & Analytics */}
          <div
            onClick={() => navigate('/reports')}
            className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow cursor-pointer hover:border-purple-400 transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between text-rose-600">
              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-md">Decision Analytics</span>
              <BarChart3 size={22} className="group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-lg group-hover:text-purple-600 transition-colors">Decision Reports & Analytics</h4>
              <p className="text-xs text-slate-500 mt-1">Analyze finance, product sales, and warehouse performance reports.</p>
            </div>
            <span className="text-xs font-bold text-purple-600 flex items-center pt-2">
              Open Decision Reports <ArrowRight size={14} className="ml-1" />
            </span>
          </div>
        </div>
      </div>

      {/* Live Governance Audit Stream */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center border-b border-slate-100 pb-3">
          <Activity size={18} className="text-purple-600 mr-2" /> Live System Audit & Governance Stream
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <div>
                <span className="font-extrabold text-slate-900">Deal Execution Sign-off Completed</span>
                <p className="text-slate-500">DEAL-1042 stock deducted and status updated to COMPLETED.</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Just Now</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <div>
                <span className="font-extrabold text-slate-900">Factory Product Addition Requested</span>
                <p className="text-slate-500">Factory requested SKU #SENS-TEMP-900 for software catalog.</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400">10m ago</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <div>
                <span className="font-extrabold text-slate-900">Cutoff Discount Authority Verified</span>
                <p className="text-slate-500">Sales Rep Rahul Sharma discount 10% cutoff rule evaluated.</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400">25m ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
