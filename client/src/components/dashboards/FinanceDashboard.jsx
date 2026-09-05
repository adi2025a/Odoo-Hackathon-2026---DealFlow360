import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2, Truck, Layers, BarChart3, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function FinanceDashboard({ viewMode }) {
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [prorationPreview, setProrationPreview] = useState(null);
  const [dealData, setDealData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/deals/DEAL-1042');
      setDealData(res.data);
    } catch (err) {
      console.error('Failed to fetch finance deal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinanceApprove = async () => {
    try {
      const dealId = dealData?.deal?._id || 'DEAL-1042';
      await axios.post(`/api/deals/${dealId}/approvals/finance`, {
        action: 'APPROVE',
        comments: 'Finance profit check passed (26.0% margin >= 20.0% floor). Final lock executed & routed to Factory.'
      });
      showToast('Finance Final Lock Approved! Order #ORD-2026 created & routed to Factory.', 'success');
      fetchFinanceData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Finance approval failed', 'error');
    }
  };

  const handleFinanceReject = async () => {
    try {
      const dealId = dealData?.deal?._id || 'DEAL-1042';
      await axios.post(`/api/deals/${dealId}/approvals/finance`, {
        action: 'RETURN',
        comments: 'Returned by Finance for margin re-negotiation.'
      });
      showToast('Quotation returned to Sales Rep for revision.', 'info');
      fetchFinanceData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Action failed', 'error');
    }
  };

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

  const currentStage = dealData?.deal?.stage || 'FINANCE_APPROVAL';
  const isFinancePending = currentStage === 'FINANCE_APPROVAL';
  const isFinalApproved = currentStage === 'FULFILLMENT' || currentStage === 'APPROVED' || currentStage === 'ORDER_CREATED' || currentStage === 'COMPLETED';

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
        <div>
          <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full uppercase border border-emerald-200">
            Finance & Profitability Engine
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mt-2 gradient-text-emerald">
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
        <div className="glass-card hover-lift hover-glow-emerald p-5 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
          <span className="text-2xl font-black text-slate-900">₹44,86,330</span>
          <span className="text-xs text-emerald-600 font-bold">Gross Margin: 26.0%</span>
        </div>

        <div className="glass-card hover-lift p-5 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Outstanding Invoices</span>
          <span className="text-2xl font-black text-amber-700">₹44,86,330</span>
          <span className="text-xs text-amber-600 font-semibold">1 Invoice Unpaid</span>
        </div>

        <div className="glass-card hover-lift hover-glow-blue p-5 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Monthly Recurring ARR</span>
          <span className="text-2xl font-black text-slate-900">₹60,000</span>
          <span className="text-xs text-emerald-600 font-bold">1 Active Subscription</span>
        </div>

        <div className="glass-card hover-lift hover-glow-emerald p-5 rounded-2xl space-y-1">
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
              <CheckCircle2 className={isFinalApproved ? "text-emerald-600 mr-2" : "text-amber-600 mr-2"} size={20} />
              {isFinalApproved ? "Finance Approval & Margin Verification Complete" : "Pending Finance Approval & Margin Calculation"}
            </span>
            <span className={`text-xs font-black px-2.5 py-1 rounded-md uppercase ${
              isFinalApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {isFinalApproved ? 'STATUS: DEAL FINAL LOCKED & APPROVED ✓' : 'ACTION REQUIRED: PENDING FINANCE SIGN-OFF'}
            </span>
          </h3>

          {isFinancePending && (
            <div className="p-5 bg-amber-50/80 border border-amber-300 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-slate-900 text-sm">DEAL-1042: Acme Industries</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase">
                      Sales Manager Approved ✓
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Sales Rep: <span className="font-bold text-slate-900">Rahul Sharma</span> • Customer: <span className="font-bold text-slate-900">Acme Industries (Gold Tier)</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-slate-950 block">₹44,86,330</span>
                  <span className="text-xs font-extrabold text-emerald-700">Gross Margin: 26.0% (Profit: ₹11,66,446)</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-amber-200 text-xs text-slate-800 space-y-1.5 leading-relaxed">
                <p className="font-extrabold text-amber-900 flex items-center">
                  <AlertTriangle size={16} className="text-amber-600 mr-1.5" /> WHY DO I NEED TO ACT AS FINANCE?
                </p>
                <p>• Sales Manager approved quotation with 16% discount exception (above Rep 10% limit).</p>
                <p>• Finance sign-off required to verify gross profit margin (<strong>26.0%</strong>) exceeds company floor (<strong>20.0%</strong>).</p>
                <p>• Upon Finance Approval, deal status becomes <strong>DEAL LOCKED</strong>, Order <strong>ORD-2026</strong> is created, and routed to Factory to ship ASAP.</p>
              </div>

              <div className="flex flex-wrap justify-end items-center gap-3 pt-2 border-t border-amber-200">
                <button
                  onClick={handleFinanceReject}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center"
                >
                  <X size={15} className="mr-1.5" /> Reject / Return for Revision
                </button>

                <button
                  onClick={handleFinanceApprove}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center"
                >
                  <ShieldCheck size={16} className="mr-1.5" /> Approve (Execute Final Lock & Send to Factory)
                </button>

                <button
                  onClick={() => navigate('/deals/DEAL-1042')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center"
                >
                  Open Full Deal Room <ArrowRight size={14} className="ml-1.5" />
                </button>
              </div>
            </div>
          )}

          {isFinalApproved && (
            <div className="p-5 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                <div>
                  <span className="font-black text-slate-900 text-sm">DEAL-1042: Acme Industries (Order #ORD-2026)</span>
                  <p className="text-xs text-slate-600 mt-0.5">Total Value: ₹44,86,330 • Cost Price: ₹33,19,884 • Gross Margin: <strong className="text-emerald-700">26.0%</strong></p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate('/factory')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center"
                  >
                    <Truck size={15} className="mr-1.5" /> View Factory Fulfillment Status →
                  </button>
                  <button
                    onClick={() => navigate('/deals/DEAL-1042')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center"
                  >
                    Open Deal Workspace →
                  </button>
                </div>
              </div>
              <p className="text-xs text-emerald-900 font-medium flex items-center">
                <ShieldCheck size={16} className="text-emerald-600 mr-1.5 flex-shrink-0" />
                Finance calculation confirmed deal profitability (26.0% margin). Final lock executed and Order #ORD-2026 passed to Factory for immediate fulfillment.
              </p>
            </div>
          )}
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

