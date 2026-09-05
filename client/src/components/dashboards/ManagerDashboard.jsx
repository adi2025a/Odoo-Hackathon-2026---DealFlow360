import React from 'react';
import { CheckCircle2, ShieldAlert, AlertTriangle, ArrowRight, UserCheck, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ManagerDashboard({ viewMode }) {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full uppercase">
            Sales Manager Governance Panel
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-2">
            {viewMode === 'approvals' ? 'Manager Approval Queue & Discount Exceptions' :
             viewMode === 'deal-health' ? 'Deal Health Risk Alerts & Escalations' :
             'Sales Manager Dashboard & Risk Governance'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review high-risk deal quotes, evaluate discount anomalies, enforce margin floors, and oversee team deal progression.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Approvals</span>
          <span className="text-2xl font-black text-amber-600 block">1 Quote</span>
          <span className="text-xs text-amber-700 font-bold">● Requires Discount Sign-off</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">High Risk Deals</span>
          <span className="text-2xl font-black text-red-600 block">1 Escalated</span>
          <span className="text-xs text-red-700 font-bold">Score: 65/100 (HIGH)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Team Avg Margin</span>
          <span className="text-2xl font-black text-emerald-600 block">26.0%</span>
          <span className="text-xs text-emerald-700 font-bold">Above 20% Floor</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Pipeline Value</span>
          <span className="text-2xl font-black text-slate-900 block">₹44,86,330</span>
          <span className="text-xs text-blue-600 font-bold">Acme Industries Project</span>
        </div>
      </div>

      {/* Approval Queue Cards */}
      {(viewMode === 'approvals' || !viewMode) && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="flex items-center">
              <CheckCircle2 className="text-blue-600 mr-2" size={20} /> Pending Manager Approvals (1)
            </span>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md uppercase">
              Action Required
            </span>
          </h3>

          <div className="p-5 bg-amber-50/70 border border-amber-300 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-amber-900 text-sm">Quote #Q-1042</span>
                  <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-md">
                    Risk Score: 65/100 (HIGH)
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  Sales Rep: <span className="font-bold text-slate-900">Rahul Sharma</span> (Authority: 10%) • Customer: <span className="font-bold text-slate-900">Acme Industries</span> (Gold Tier)
                </p>
              </div>

              <div className="text-right">
                <span className="text-lg font-black text-amber-950 block">₹44,86,330</span>
                <span className="text-xs font-extrabold text-emerald-700">Gross Margin: 26.0%</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 text-xs text-slate-800 space-y-1.5 leading-relaxed">
              <p className="font-extrabold text-amber-900 flex items-center">
                <AlertTriangle size={16} className="text-amber-600 mr-1.5" /> WHY DO I NEED TO ACT?
              </p>
              <p>• Requested discount (<strong className="text-red-600">16%</strong>) exceeds Sales Rep Rahul Sharma authority limit (<strong className="text-slate-900">10%</strong>).</p>
              <p>• Discount anomaly: Rep historical avg is 7.2%, requested is 16.0% (+8.8% spike).</p>
            </div>

            <div className="flex justify-end space-x-3 pt-1">
              <button
                onClick={() => navigate('/deals/DEAL-1042')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center"
              >
                Open Full Deal Room <ArrowRight size={14} className="ml-1.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deal Health & Stalled Risk Alerts */}
      {(viewMode === 'deal-health' || !viewMode) && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="flex items-center text-slate-900">
              <ShieldAlert className="text-red-600 mr-2" size={20} /> Deal Health & Stalled Risk Monitoring
            </span>
            <span className="text-xs bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-md uppercase">
              1 High Risk Alert
            </span>
          </h3>

          <div className="p-4 bg-red-50/60 border border-red-200 rounded-xl space-y-2 text-xs text-red-900">
            <div className="flex items-center justify-between font-bold">
              <span>DEAL-1042: Acme Industries Automation Controllers</span>
              <span className="text-red-700 font-black">Risk Level: HIGH (65/100)</span>
            </div>
            <p className="text-slate-600">
              Alert: Stalled in QUOTATION PREP stage for &gt; 3 days. Discount request exceeds authority limit.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
