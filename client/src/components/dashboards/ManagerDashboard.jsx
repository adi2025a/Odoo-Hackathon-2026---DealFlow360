import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, ShieldAlert, AlertTriangle, ArrowRight, UserCheck, TrendingUp,
  DollarSign, Activity, Lock, Share2, MessageSquare, FileText, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function ManagerDashboard({ viewMode }) {
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [escalations, setEscalations] = useState({ leads: [], deals: [] });
  const [dealData, setDealData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEscalations();
  }, []);

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const [escRes, dealRes] = await Promise.all([
        axios.get('/api/manager/escalations').catch(() => ({ data: null })),
        axios.get('/api/deals/DEAL-1042').catch(() => ({ data: null }))
      ]);

      if (escRes?.data) {
        setEscalations(escRes.data);
      }
      if (dealRes?.data) {
        setDealData(dealRes.data);
      }
    } catch (err) {
      console.error('Error fetching manager data:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentStage = dealData?.deal?.stage;
  const isManagerPending = currentStage === 'MANAGER_APPROVAL' || currentStage === 'QUOTATION' || (!currentStage && loading);
  const isForwardedToFinance = currentStage === 'FINANCE_APPROVAL';
  const isFinalApproved = currentStage === 'FULFILLMENT' || currentStage === 'APPROVED' || currentStage === 'ORDER_CREATED' || currentStage === 'COMPLETED';

  const displayLeads = escalations.leads && escalations.leads.length > 0 ? escalations.leads : [
    {
      _id: 'ld-escalated-1',
      leadNumber: 'LD-2026-132',
      company: 'MegaTech Solutions',
      contactName: 'Vikram Mehta',
      email: 'vikram@megatech.com',
      product: 'Industrial Controller 500',
      quantity: 100,
      budget: 6500000,
      requirement: 'Client requested 100 units + turnkey onsite deployment & 24/7 SLA.',
      escalationReason: 'Client budget/quantity (100 units, ₹65 Lakhs) exceeds standard Sales Rep threshold limit. Requires Manager custom quotation & SLA sign-off.',
      createdAt: new Date().toISOString()
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
        <div>
          <span className="text-xs font-black bg-purple-100 text-purple-900 px-3 py-1 rounded-full uppercase border border-purple-200">
            Sales Manager Governance Panel
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mt-2 gradient-text-purple">
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
        <div className="glass-card hover-lift p-5 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Escalated Leads</span>
          <span className="text-2xl font-black text-slate-900">{displayLeads.length}</span>
          <span className="text-xs text-purple-600 font-bold">Action Required</span>
        </div>

        <div className="glass-card hover-lift hover-glow-amber p-5 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Discount Exception Requests</span>
          <span className="text-2xl font-black text-amber-700">{isManagerPending ? '1 Request' : '0 Pending'}</span>
          <span className="text-xs text-amber-600 font-semibold">{isManagerPending ? 'Quote #Q-1042 (16%)' : 'All Approved'}</span>
        </div>

        <div className="glass-card hover-lift hover-glow-blue p-5 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Team Pipeline Value</span>
          <span className="text-2xl font-black text-slate-900">₹1,09,86,330</span>
          <span className="text-xs text-emerald-600 font-bold">2 High Value Deals</span>
        </div>

        <div className="glass-card hover-lift hover-glow-emerald p-5 rounded-2xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Avg Deal Gross Margin</span>
          <span className="text-2xl font-black text-emerald-700">25.3%</span>
          <span className="text-xs text-emerald-600 font-bold">● Above 20% Floor</span>
        </div>
      </div>

      {/* Escalated Leads Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="flex items-center">
            <UserCheck className="text-purple-600 mr-2" size={20} /> High-Value Escalated Leads Requiring Manager Action
          </span>
          <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-md uppercase">
            {displayLeads.length} Lead(s)
          </span>
        </h3>

        <div className="space-y-4">
          {displayLeads.map(lead => (
            <div key={lead._id} className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-purple-900 text-sm">{lead.company}</span>
                    <span className="text-[10px] font-extrabold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-md uppercase">
                      {lead.leadNumber || 'ESCALATED LEAD'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Contact: <span className="font-bold text-slate-900">{lead.contactName}</span> ({lead.email}) • Product: <span className="font-bold text-slate-900">{lead.product}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-purple-950 block">₹{(lead.budget || 6500000).toLocaleString('en-IN')}</span>
                  <span className="text-xs font-extrabold text-purple-700">Quantity: {lead.quantity || 100} units</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-purple-200 space-y-1">
                  <span className="font-extrabold text-purple-900 uppercase text-[10px] tracking-wider block">Sales Rep Escalation Reason:</span>
                  <p className="text-slate-800 leading-relaxed italic">
                    "{lead.escalationReason || 'Client requirement exceeds standard sales rep threshold. Manager custom pricing requested.'}"
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-purple-200 space-y-1">
                  <span className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider block">Client Requirement:</span>
                  <p className="text-slate-800 leading-relaxed">
                    "{lead.requirement || 'Need 100 units with turnkey setup and annual support SLA coverage.'}"
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-1 border-t border-purple-200">
                <button
                  onClick={() => navigate(`/deals/DEAL-1061?tab=internal_chat`)}
                  className="px-4 py-2 bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 font-bold text-xs rounded-xl transition-all flex items-center"
                >
                  <Lock size={14} className="mr-1.5 text-amber-600" /> Internal Chat (Sales ↔ Manager)
                </button>

                <button
                  onClick={() => navigate(`/deals/DEAL-1061?tab=quotation`)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center"
                >
                  <FileText size={15} className="mr-1.5" /> Improve & Create Manager Quotation <ArrowRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Approval Queue Cards */}
      {(viewMode === 'approvals' || !viewMode) && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="flex items-center">
              <CheckCircle2 className={isFinalApproved || isForwardedToFinance ? "text-emerald-600 mr-2" : "text-amber-600 mr-2"} size={20} />
              {isFinalApproved ? "Manager & Finance Approvals Completed" : isForwardedToFinance ? "Manager Approval Completed (Pending in Finance)" : "Pending Manager Approvals"}
            </span>
            <span className={`text-xs font-black px-2.5 py-1 rounded-md uppercase ${
              isFinalApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
              isForwardedToFinance ? 'bg-blue-100 text-blue-800 border border-blue-300' :
              'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {isFinalApproved ? 'STATUS: DEAL FINAL LOCKED & APPROVED ✓' :
               isForwardedToFinance ? 'STATUS: APPROVED BY MANAGER → PENDING FINANCE' :
               'ACTION REQUIRED: PENDING MANAGER SIGN-OFF'}
            </span>
          </h3>

          {/* STATE 1: Pending Manager Approval */}
          {isManagerPending && (
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

              <div className="flex flex-wrap justify-end items-center gap-3 pt-2 border-t border-amber-200">
                <button
                  onClick={async () => {
                    try {
                      await axios.post('/api/deals/DEAL-1042/approvals/manager', { action: 'REJECT', comments: 'Manager rejected negotiation quote.' });
                      showToast('Quotation Rejected as per flowchart.', 'info');
                      fetchEscalations();
                    } catch (e) {
                      showToast(e.response?.data?.error || 'Reject failed', 'error');
                    }
                  }}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center"
                >
                  <X size={15} className="mr-1.5" /> Reject Quote
                </button>

                <button
                  onClick={async () => {
                    try {
                      await axios.post('/api/deals/DEAL-1042/approvals/manager', { action: 'APPROVE', comments: 'Approved under threshold / negotiated terms. Shared with Finance.' });
                      showToast('Quotation Approved by Manager! Forwarded to Finance Manager for profit check.', 'success');
                      fetchEscalations();
                    } catch (e) {
                      showToast(e.response?.data?.error || 'Approval failed', 'error');
                    }
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center"
                >
                  <CheckCircle2 size={15} className="mr-1.5" /> Approve (Under Threshold → Pass to Finance)
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

          {/* STATE 2: Forwarded to Finance Queue */}
          {isForwardedToFinance && (
            <div className="p-5 bg-blue-50/80 border border-blue-300 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200 pb-3">
                <div>
                  <span className="font-black text-slate-900 text-sm">Quote #Q-1042: Acme Industries (₹44,86,330)</span>
                  <p className="text-xs text-slate-600 mt-0.5">Sales Manager Action: <strong className="text-emerald-700">Approved 16% Discount Exception ✓</strong></p>
                </div>
                <button
                  onClick={() => navigate('/finance/approvals')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center"
                >
                  Track in Finance Queue →
                </button>
              </div>
              <p className="text-xs text-blue-900 font-medium">
                ✓ Sales Manager approved quote #Q-1042. Currently pending in <strong>Finance Approval Queue</strong> for final gross margin verification.
              </p>
            </div>
          )}

          {/* STATE 3: Final Approved & Locked */}
          {isFinalApproved && (
            <div className="p-5 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                <div>
                  <span className="font-black text-slate-900 text-sm">DEAL-1042: Acme Industries (Order #ORD-2026)</span>
                  <p className="text-xs text-slate-600 mt-0.5">Manager Approved ✓ • Finance Margin Approved ✓ (26.0%) • Order Created</p>
                </div>
                <button
                  onClick={() => navigate('/deals/DEAL-1042')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center"
                >
                  Open Deal Workspace →
                </button>
              </div>
              <p className="text-xs text-emerald-900 font-medium">
                ✓ Both Sales Manager and Finance Manager sign-offs complete. Deal #DEAL-1042 is locked and Order #ORD-2026 routed to Factory for fulfillment.
              </p>
            </div>
          )}
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
