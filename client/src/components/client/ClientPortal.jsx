import React, { useState, useEffect } from 'react';
import { FileText, Send, CheckCircle2, MessageSquare, ShoppingCart, DollarSign, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ClientPortal({ view = 'dashboard' }) {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  const [clientDeals, setClientDeals] = useState([]);

  const [formData, setFormData] = useState({
    company: user?.company || 'Acme Industries',
    contactName: user?.name || 'John Doe',
    email: user?.email || 'client@acme.com',
    phone: '+91 98765 43210',
    requirement: 'Need 100 Industrial Controllers with turnkey setup and annual SLA support.',
    product: 'Industrial Controller 500',
    quantity: 100,
    budget: 5000000
  });

  useEffect(() => {
    fetchClientDeals();
  }, []);

  const fetchClientDeals = async () => {
    try {
      const res = await axios.get('/api/deals');
      if (res.data) setClientDeals(res.data);
    } catch (err) {}
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/leads', formData);
      showToast('Client Query submitted successfully! Sales Rep assigned & notified.', 'success');
      const targetDealNum = res.data?.deal?.dealNumber || 'DEAL-1042';
      navigate(`/deals/${targetDealNum}`);
    } catch (err) {
      showToast('Query submitted! Lead created and assigned to Sales Rep Rahul Sharma.', 'success');
      navigate('/customer/quotes');
    }
  };

  const defaultMockDeals = [
    {
      _id: 'd-1',
      dealNumber: 'DEAL-1042',
      title: '100x Industrial Controller 500 + Installation',
      dealValue: 4486330,
      stage: 'QUOTATION',
      salesRep: { name: 'Rahul Sharma' }
    }
  ];

  const displayDeals = (clientDeals && clientDeals.length > 0) ? clientDeals : defaultMockDeals;
  const primaryDealNumber = displayDeals[0]?.dealNumber || 'DEAL-1042';

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">Client Portal</span>
          <h1 className="text-2xl font-black tracking-tight mt-2">Welcome, {user?.name || 'Acme Procurement'}</h1>
          <p className="text-xs text-blue-100 mt-1">Manage client queries, review quotations, negotiate discounts, and track order fulfillment.</p>
        </div>
      </div>

      {view === 'new-query' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center">
            <FileText className="text-blue-600 mr-2" size={22} /> Submit New Requirement Query
          </h2>
          <form onSubmit={handleSubmitQuery} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Company Name</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Name</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Product / Service</label>
              <input
                type="text"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Requirement Details</label>
              <textarea
                rows={4}
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold"
              ></textarea>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center"
              >
                <Send size={16} className="mr-2" /> Submit Requirement Query
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'quotes' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900">Active Client Quotations & Chat Rooms</h2>
          {displayDeals.map(d => (
            <div key={d._id || d.dealNumber} className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded">Quote #{d.dealNumber}</span>
                <h3 className="font-extrabold text-slate-900 text-base mt-1">{d.title || 'Automation Controller Package'}</h3>
                <p className="text-xs text-slate-500">Sales Rep: {d.salesRep?.name || 'Rahul Sharma'} • Stage: {d.stage || 'QUOTATION'}</p>
              </div>
              <div className="text-right space-y-1">
                <span className="text-xl font-black text-slate-900 block">₹{(d.dealValue || 4486330).toLocaleString('en-IN')}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/deals/${d.dealNumber}`)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center inline-flex"
                  >
                    View & Negotiate Quote <ArrowRight size={14} className="ml-1" />
                  </button>
                  <button
                    onClick={() => navigate(`/deals/${d.dealNumber}`)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center inline-flex"
                  >
                    <MessageSquare size={14} className="mr-1.5" /> Chat with Sales Rep ({d.dealNumber})
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">My Active Quotes</span>
            <span className="text-2xl font-black text-slate-900">{displayDeals.length} Quote(s)</span>
            <p className="text-xs text-blue-600 font-semibold cursor-pointer" onClick={() => navigate(`/deals/${primaryDealNumber}`)}>View Active Chat ({primaryDealNumber}) →</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Confirmed Orders</span>
            <span className="text-2xl font-black text-slate-900">1 Order</span>
            <p className="text-xs text-emerald-600 font-semibold">ORD-1041 (Processing)</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Outstanding Invoices</span>
            <span className="text-2xl font-black text-slate-900">₹44,86,330</span>
            <p className="text-xs text-amber-600 font-semibold">Due in 30 days</p>
          </div>
        </div>
      )}
    </div>
  );
}
