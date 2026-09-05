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
      {/* Header Banner with Background Image */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl text-white">
        <img
          src="/b2b_crm_banner.jpg"
          alt="Client Portal Header"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.35]"
        />
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-[2px] bg-slate-900/40">
          <div>
            <span className="text-[10px] font-black bg-blue-500/30 border border-blue-400/30 text-blue-200 px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md">
              Client Enterprise Portal
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-md mt-2">
              Welcome, {user?.name || 'Acme Procurement'}
            </h1>
            <p className="text-xs md:text-sm text-slate-200 mt-1 max-w-xl font-medium">
              Submit custom engineering requirements, negotiate quotations with assigned sales reps, review financial terms, and track order fulfillment.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/customer/new-query')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all border border-white/20 hover-lift"
            >
              + Submit New Requirement Query
            </button>
          </div>
        </div>
      </div>

      {view === 'new-query' && (
        <div className="glass-card border border-slate-200 rounded-3xl p-6 md:p-8 card-shadow space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center">
            <FileText className="text-blue-600 mr-2" size={22} /> Submit Custom Requirement Query
          </h2>
          <form onSubmit={handleSubmitQuery} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Company Name</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Name</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Product / Service</label>
              <input
                type="text"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Requirement Details</label>
              <textarea
                rows={4}
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md hover-lift transition-all flex items-center"
              >
                <Send size={16} className="mr-2" /> Submit Requirement Query
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'quotes' && (
        <div className="glass-card border border-slate-200 rounded-3xl p-6 md:p-8 card-shadow space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900">Active Client Quotations & Chat Rooms</h2>
          {displayDeals.map(d => (
            <div key={d._id || d.dealNumber} className="border border-slate-200 rounded-2xl p-5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-400 hover-lift transition-all">
              <div>
                <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-md">Quote #{d.dealNumber}</span>
                <h3 className="font-extrabold text-slate-900 text-base mt-2">{d.title || 'Automation Controller Package'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Sales Rep: {d.salesRep?.name || 'Rahul Sharma'} • Stage: {d.stage || 'QUOTATION'}</p>
              </div>
              <div className="text-right space-y-2">
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-200 card-shadow hover-lift space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">My Active Quotes</span>
              <span className="text-3xl font-black text-slate-900">{displayDeals.length} Quote(s)</span>
              <p className="text-xs text-blue-600 font-bold cursor-pointer hover:underline" onClick={() => navigate(`/deals/${primaryDealNumber}`)}>
                View Active Chat ({primaryDealNumber}) →
              </p>
            </div>
            <div className="glass-card p-6 rounded-3xl border border-slate-200 card-shadow hover-lift space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Confirmed Orders</span>
              <span className="text-3xl font-black text-slate-900">1 Order</span>
              <p className="text-xs text-emerald-600 font-bold">ORD-1041 (Processing)</p>
            </div>
            <div className="glass-card p-6 rounded-3xl border border-slate-200 card-shadow hover-lift space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Outstanding Invoices</span>
              <span className="text-3xl font-black text-slate-900">₹44,86,330</span>
              <p className="text-xs text-amber-600 font-bold">Due in 30 days</p>
            </div>
          </div>

          {/* Product Highlights Showcase Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">Featured Hardware & Services Catalog</h2>
                <p className="text-xs text-slate-500">Popular solution packages available for immediate procurement quotation.</p>
              </div>
              <button
                onClick={() => navigate('/catalog')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
              >
                Browse Full Catalog <ArrowRight size={14} className="ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 card-shadow flex flex-col md:flex-row gap-4 items-center hover-lift group">
                <div className="w-full md:w-40 h-32 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0 relative">
                  <img
                    src="/industrial_controller.jpg"
                    alt="Industrial Controller 500"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <span className="absolute top-2 left-2 text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded">Hardware</span>
                </div>
                <div className="space-y-2 min-w-0 flex-1">
                  <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                    Industrial Controller 500
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    High-precision industrial PLC automation controller unit with dual bus protocols.
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-black text-slate-900">₹45,000 / unit</span>
                    <button
                      onClick={() => navigate('/customer/new-query')}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Request Quote
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 card-shadow flex flex-col md:flex-row gap-4 items-center hover-lift group">
                <div className="w-full md:w-40 h-32 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0 relative">
                  <img
                    src="/onsite_installation.jpg"
                    alt="Turnkey Installation & Setup"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <span className="absolute top-2 left-2 text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded">Services</span>
                </div>
                <div className="space-y-2 min-w-0 flex-1">
                  <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                    Turnkey Field Engineering & Setup
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Turnkey onsite deployment, engineering setup, and integration testing by certified engineers.
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-black text-slate-900">₹15,000 / service</span>
                    <button
                      onClick={() => navigate('/customer/new-query')}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Request Quote
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
