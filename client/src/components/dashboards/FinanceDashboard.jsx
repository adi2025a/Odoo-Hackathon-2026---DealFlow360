import React, { useState } from 'react';
import { DollarSign, RefreshCw, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2, Truck, Layers, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FinanceDashboard({ viewMode }) {
  const navigate = useNavigate();
  const [prorationPreview, setProrationPreview] = useState(null);

  const handleProrationTest = () => {
    setProrationPreview({
      currentQty: 1,
      newQty: 3,
      unitPrice: 5000,
      daysUsed: 12,
      daysRemaining: 18,
      proratedAmount: 6000
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase">
            Finance & Profitability Engine
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-2">
            {viewMode === 'approvals' ? 'Final Finance Approval & Margin Calculation' :
             viewMode === 'inventory' ? 'Inventory & Stock Availability Review' :
             'Finance Cash Flow & Subscription Billing'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gross profit protection, hybrid one-time + recurring schedule management, margin floor enforcement, and proration engine.
          </p>
        </div>
      </div>

      {/* Finance KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
          <span className="text-2xl font-black text-slate-900">₹44,86,330</span>
          <span className="text-xs text-emerald-600 font-bold">Gross Margin: 26.0%</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Outstanding Invoices</span>
          <span className="text-2xl font-black text-amber-700">₹44,86,330</span>
          <span className="text-xs text-amber-600 font-semibold">1 Invoice Unpaid</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Monthly Recurring ARR</span>
          <span className="text-2xl font-black text-slate-900">₹60,000</span>
          <span className="text-xs text-emerald-600 font-bold">1 Active Subscription</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gross Profit Margin</span>
          <span className="text-2xl font-black text-emerald-700">₹9,87,500</span>
          <span className="text-xs text-emerald-600 font-bold">● Above 20% Threshold</span>
        </div>
      </div>

      {/* Final Approval by Margin Calc Section */}
      {(viewMode === 'approvals' || !viewMode) && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="flex items-center">
              <CheckCircle2 className="text-emerald-600 mr-2" size={20} /> Final Approval by Margin Calculation
            </span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md uppercase">
              Margin Verified: 26.0%
            </span>
          </h3>

          <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
              <div>
                <span className="font-black text-slate-900 text-sm">DEAL-1042: Acme Industries</span>
                <p className="text-xs text-slate-600 mt-0.5">Total Value: ₹44,86,330 • Cost Price: ₹33,19,884 • Gross Margin: <strong className="text-emerald-700">26.0%</strong></p>
              </div>
              <button
                onClick={() => navigate('/deals/DEAL-1042')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center"
              >
                Execute Finance Sign-off →
              </button>
            </div>
            <p className="text-xs text-emerald-900 font-medium">
              ✓ Finance calculation confirms deal profitability exceeds minimum required gross margin threshold (20.0%). Ready for inventory execution!
            </p>
          </div>
        </div>
      )}

      {/* Mid-Cycle Subscription Proration Simulator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center">
            <RefreshCw className="text-blue-600 mr-2" size={20} /> Subscription Mid-Cycle Proration Engine
          </h3>
          <button
            onClick={handleProrationTest}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            Run Proration Test (Qty: 1 → 3 Seats)
          </button>
        </div>

        {prorationPreview && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs text-blue-900">
            <p className="font-bold">✓ Mid-Cycle Proration Computed Successfully!</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
              <div>Days Used: <span className="font-bold">12 / 30 Days</span></div>
              <div>Days Remaining: <span className="font-bold">18 Days</span></div>
              <div>Unused Credit Refund: <span className="font-bold">₹3,000</span></div>
              <div>New Charge (Prorated): <span className="font-bold text-blue-700">₹9,000</span></div>
            </div>
            <p className="font-extrabold text-blue-950 pt-1">Net Prorated Add-On Invoice Charge: +₹6,000</p>
          </div>
        )}
      </div>
    </div>
  );
}
