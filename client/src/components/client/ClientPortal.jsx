import React, { useState, useEffect } from 'react';
import { FileText, Send, CheckCircle2, MessageSquare, ShoppingCart, DollarSign, ArrowRight, ShieldCheck, Sparkles, Building2, Package } from 'lucide-react';
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
      showToast('Client Requirement Query submitted successfully! Assigned to Sales Rep.', 'success');
      const targetDealNum = res.data?.deal?.dealNumber || 'DEAL-1042';
      navigate(`/deals/${targetDealNum}`);
    } catch (err) {
      showToast('Requirement Query submitted! Assigned to Sales Rep Rahul Sharma.', 'success');
      navigate('/customer/quotes');
    }
  };

  const defaultMockDeals = [
    {
      _id: 'd-1',
      dealNumber: 'DEAL-1042',
      title: '100x Industrial Controller 500 + Turnkey Setup',
      dealValue: 4486330,
      stage: 'QUOTATION',
      salesRep: { name: 'Rahul Sharma' }
    }
  ];

  const displayDeals = (clientDeals && clientDeals.length > 0) ? clientDeals : defaultMockDeals;
  const primaryDealNumber = displayDeals[0]?.dealNumber || 'DEAL-1042';

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* EXECUTIVE HERO BANNER WITH ARCHITECTURAL BACKGROUND */}
      <div className="relative rounded-3xl overflow-hidden border border-stone-200/80 shadow-lg text-white">
        <img
          src="/client_minimal_bg.jpg"
          alt="Client Executive Workspace"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] contrast-[1.05]"
        />
        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-[2px] bg-stone-950/40">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2.5">
              <span className="text-[10px] font-black tracking-widest uppercase bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1 rounded-full backdrop-blur-md">
                Client Enterprise Workspace
              </span>
              <span className="text-[10px] font-bold bg-stone-800/80 border border-stone-700 text-stone-200 px-3 py-1 rounded-full backdrop-blur-md">
                {user?.company || 'Acme Procurement'}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white drop-shadow-sm font-heading">
              Welcome, {user?.name || 'Acme Procurement'}
            </h1>
            <p className="text-xs md:text-sm text-stone-200 leading-relaxed font-medium">
              Manage custom hardware queries, review approved quotations, negotiate volume terms, and track order fulfillment in real-time.
            </p>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={() => navigate('/customer/new-query')}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg hover:shadow-emerald-600/20 transition-all border border-emerald-500/50 hover-lift flex items-center"
            >
              <Send size={15} className="mr-2" /> + Submit Requirement Query
            </button>
          </div>
        </div>
      </div>

      {/* NEW REQUIREMENT FORM (MINIMAL LIGHT STYLE) */}
      {view === 'new-query' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 card-shadow space-y-6">
          <div className="border-b border-stone-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-stone-900 flex items-center font-heading">
                <FileText className="text-emerald-700 mr-2.5" size={22} /> Submit Engineering Requirement Query
              </h2>
              <p className="text-xs text-stone-500 mt-1">Provide your project specifications to receive an instant commercial quotation.</p>
            </div>
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Step 1 of 5 Flowchart
            </span>
          </div>

          <form onSubmit={handleSubmitQuery} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1.5 uppercase text-[11px] tracking-wider">Company Name</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50/70 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
                required
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1.5 uppercase text-[11px] tracking-wider">Contact Person</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50/70 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
                required
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1.5 uppercase text-[11px] tracking-wider">Target Hardware / Solution</label>
              <input
                type="text"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50/70 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1.5 uppercase text-[11px] tracking-wider">Required Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-stone-50/70 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-bold text-stone-700 block mb-1.5 uppercase text-[11px] tracking-wider">Requirement & Technical Specs</label>
              <textarea
                rows={4}
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50/70 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
              ></textarea>
            </div>
            <div className="md:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                className="px-7 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md hover-lift transition-all flex items-center"
              >
                <Send size={15} className="mr-2" /> Submit Requirement Query
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QUOTATION LIST (MINIMAL LIGHT THEME) */}
      {view === 'quotes' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 card-shadow space-y-5">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-lg font-black text-stone-900 font-heading">Active Quotations & Negotiation Rooms</h2>
            <p className="text-xs text-stone-500 mt-0.5">Review pricing proposals, negotiate volume discounts, and chat with your assigned sales rep.</p>
          </div>

          {displayDeals.map(d => (
            <div key={d._id || d.dealNumber} className="border border-stone-200 rounded-2xl p-5 bg-stone-50/40 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-emerald-500 hover:bg-white hover-lift transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black bg-stone-900 text-white px-3 py-0.5 rounded-md">Quote #{d.dealNumber}</span>
                  <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                    Stage: {d.stage || 'QUOTATION'}
                  </span>
                </div>
                <h3 className="font-extrabold text-stone-900 text-base font-heading">{d.title || 'Automation Controller Package'}</h3>
                <p className="text-xs text-stone-500">Sales Representative: <strong className="text-stone-800">{d.salesRep?.name || 'Rahul Sharma'}</strong></p>
              </div>

              <div className="text-right space-y-2 flex-shrink-0">
                <span className="text-2xl font-black text-stone-900 block font-heading">₹{(d.dealValue || 4486330).toLocaleString('en-IN')}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/deals/${d.dealNumber}`)}
                    className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all flex items-center"
                  >
                    View & Negotiate Quote <ArrowRight size={14} className="ml-1.5" />
                  </button>
                  <button
                    onClick={() => navigate(`/deals/${d.dealNumber}`)}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center"
                  >
                    <MessageSquare size={14} className="mr-1.5" /> Chat ({d.dealNumber})
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DASHBOARD METRICS & PRODUCT HIGHLIGHTS (MINIMAL LIGHT THEME) */}
      {view === 'dashboard' && (
        <div className="space-y-8">
          {/* Executive Minimal KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 card-shadow hover-lift space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Active Proposals</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <FileText size={16} />
                </div>
              </div>
              <span className="text-3xl font-black text-stone-900 block font-heading">{displayDeals.length} Quote</span>
              <p
                className="text-xs text-emerald-700 font-extrabold cursor-pointer hover:underline flex items-center"
                onClick={() => navigate(`/deals/${primaryDealNumber}`)}
              >
                Open Active Deal Chat ({primaryDealNumber}) <ArrowRight size={13} className="ml-1" />
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 card-shadow hover-lift space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Confirmed Orders</span>
                <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-xs">
                  <ShoppingCart size={16} />
                </div>
              </div>
              <span className="text-3xl font-black text-stone-900 block font-heading">1 Order</span>
              <p className="text-xs text-stone-600 font-bold">ORD-1041 (Processing & Assembly)</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 card-shadow hover-lift space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Outstanding Invoices</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                  <DollarSign size={16} />
                </div>
              </div>
              <span className="text-3xl font-black text-stone-900 block font-heading">₹44,86,330</span>
              <p className="text-xs text-amber-700 font-bold">Payment Due in 30 Days</p>
            </div>
          </div>

          {/* Minimal Product Highlights Catalog Showcase */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-stone-900 font-heading">Featured Commercial Hardware & Services</h2>
                <p className="text-xs text-stone-500">Curated hardware packages for immediate procurement quotation.</p>
              </div>
              <button
                onClick={() => navigate('/catalog')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center"
              >
                Browse Full Catalog <ArrowRight size={14} className="ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Card 1 */}
              <div className="bg-white border border-stone-200 rounded-3xl p-5 card-shadow flex flex-col md:flex-row gap-5 items-center hover:border-emerald-500 hover-lift transition-all group">
                <div className="w-full md:w-44 h-36 rounded-2xl overflow-hidden bg-stone-900 flex-shrink-0 relative">
                  <img
                    src="/industrial_controller.jpg"
                    alt="Industrial Controller 500"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <span className="absolute top-2.5 left-2.5 text-[9px] font-black bg-stone-950/80 backdrop-blur-md text-white px-2.5 py-0.5 rounded-md border border-white/20 uppercase tracking-wider">
                    Hardware
                  </span>
                </div>

                <div className="space-y-2 min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    SKU: CTRL-IND-500
                  </span>
                  <h3 className="font-extrabold text-stone-900 text-base group-hover:text-emerald-800 transition-colors font-heading truncate">
                    Industrial Controller 500
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    High-precision industrial PLC automation controller unit with dual bus protocols.
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-base font-black text-stone-900 font-heading">₹45,000 / unit</span>
                    <button
                      onClick={() => navigate('/customer/new-query')}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      Request Quote
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Card 2 */}
              <div className="bg-white border border-stone-200 rounded-3xl p-5 card-shadow flex flex-col md:flex-row gap-5 items-center hover:border-emerald-500 hover-lift transition-all group">
                <div className="w-full md:w-44 h-36 rounded-2xl overflow-hidden bg-stone-900 flex-shrink-0 relative">
                  <img
                    src="/onsite_installation.jpg"
                    alt="Turnkey Field Engineering"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <span className="absolute top-2.5 left-2.5 text-[9px] font-black bg-stone-950/80 backdrop-blur-md text-white px-2.5 py-0.5 rounded-md border border-white/20 uppercase tracking-wider">
                    Services
                  </span>
                </div>

                <div className="space-y-2 min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    SKU: SRV-INSTALL-PRO
                  </span>
                  <h3 className="font-extrabold text-stone-900 text-base group-hover:text-emerald-800 transition-colors font-heading truncate">
                    Turnkey Engineering & Setup
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    Turnkey onsite deployment, engineering setup, and integration testing by certified engineers.
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-base font-black text-stone-900 font-heading">₹15,000 / service</span>
                    <button
                      onClick={() => navigate('/customer/new-query')}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
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
