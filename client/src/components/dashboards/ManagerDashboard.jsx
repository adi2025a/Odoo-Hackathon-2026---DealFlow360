import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, ShieldAlert, AlertTriangle, ArrowRight, UserCheck, TrendingUp,
  DollarSign, Activity, Lock, Share2, MessageSquare, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ManagerDashboard({ viewMode }) {
  const navigate = useNavigate();
  const [escalations, setEscalations] = useState({ leads: [], deals: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEscalations();
  }, []);

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/manager/escalations');
      if (res.data) {
        setEscalations(res.data);
      }
    } catch (err) {
      // Fallback mock escalation if database initial
      setEscalations({
        leads: [
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
        ],
        deals: [
          {
            _id: 'd-1',
            dealNumber: 'DEAL-1061',
            title: 'MegaTech Solutions - 100x Automation Controllers',
            customer: { company: 'MegaTech Solutions', name: 'Vikram Mehta' },
            dealValue: 6500000,
            grossMargin: 24.5,
            discount: 16,
            stage: 'MANAGER_APPROVAL',
            escalationReason: 'Client requested 16% discount on 100 units. Exceeds Rep authority limit (10%).',
            updatedAt: new Date().toISOString()
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

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
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Shared Rep Queries</span>
          <span className="text-2xl font-black text-purple-600 block">{displayLeads.length} Escalated</span>
          <span className="text-xs text-purple-700 font-bold">● Exceeds Rep Threshold</span>
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

      {/* ------------------------------------------------------------------ */}
      {/* SECTION: SHARED LEAD QUERIES FROM SALES REPS (Threshold Escalations) */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white border border-purple-200 rounded-2xl p-6 card-shadow space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="flex items-center text-slate-900">
            <Share2 className="text-purple-600 mr-2" size={20} /> Shared Lead Queries & Threshold Escalations ({displayLeads.length})
          </span>
          <span className="text-xs bg-purple-100 text-purple-900 font-bold px-2.5 py-1 rounded-md uppercase">
            Manager Review Needed
          </span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {displayLeads.map(lead => (
            <div key={lead._id || lead.leadNumber} className="p-5 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-purple-950 text-sm">{lead.leadNumber || 'LD-2026-132'}</span>
                    <span className="text-[10px] font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-md">
                      Shared by Sales Rep
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mt-0.5">{lead.company} • <span className="text-xs text-slate-500 font-medium">{lead.contactName} ({lead.email})</span></h4>
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
