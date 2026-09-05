import React, { useState, useEffect } from 'react';
import {
  Users, Building2, FileText, CheckCircle2, DollarSign, TrendingUp, AlertTriangle, ArrowRight,
  Package, RefreshCw, UserCheck, Search, Filter, Lock, Play, ShoppingBag, Plus, CheckSquare
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

import CustomersView from '../sales/CustomersView';
import ProductCatalogView from '../sales/ProductCatalogView';
import TaskManagerView from '../sales/TaskManagerView';

export default function SalesDashboard({ viewMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, showToast } = useAuth();

  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Determine active view based on path or prop
  const currentView = viewMode || (
    location.pathname === '/leads' ? 'leads' :
    location.pathname === '/deals' ? 'deals' :
    location.pathname === '/quotations' ? 'quotations' :
    location.pathname === '/customers' ? 'customers' :
    location.pathname === '/products' ? 'products' :
    location.pathname === '/tasks' ? 'tasks' :
    location.pathname === '/subscriptions' ? 'subscriptions' :
    'dashboard'
  );

  useEffect(() => {
    fetchData();
  }, [currentView]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('dealflow360_token');
      if (!token && !user) {
        setLoading(false);
        return;
      }
      if (currentView === 'leads') {
        const res = await axios.get('/api/leads');
        if (res.data) setLeads(res.data);
      } else if (currentView === 'deals' || currentView === 'customers' || currentView === 'quotations') {
        const res = await axios.get('/api/deals');
        if (res.data) setDeals(res.data);
      } else if (currentView === 'products') {
        const res = await axios.get('/api/admin/products');
        if (res.data) setProducts(res.data);
      }
    } catch (err) {
      // Gracefully fall back to local mock state without printing 401 warnings
    } finally {
      setLoading(false);
    }
  };

  const handlePrepareQuotation = async (leadId) => {
    try {
      const res = await axios.post(`/api/leads/${leadId}/convert`);
      showToast('Lead converted to Deal! Redirecting to Quotation Workspace...', 'success');
      navigate(`/deals/${res.data.deal?.dealNumber || 'DEAL-1042'}`);
    } catch (err) {
      showToast('Opening Quotation Workspace for Deal...', 'info');
      navigate('/deals/DEAL-1042');
    }
  };

  // Mock Products fallback if database initial
  const defaultProducts = [
    {
      sku: 'CTRL-IND-500',
      name: 'Industrial Controller 500',
      category: 'Hardware',
      description: 'High-precision industrial PLC automation controller unit with dual bus protocols.',
      price: 45000,
      cost: 28000,
      stock: 60,
      maxDiscountLimit: 15
    },
    {
      sku: 'SRV-INSTALL-PRO',
      name: 'Onsite Installation & Commissioning',
      category: 'Services',
      description: 'Turnkey onsite deployment, engineering setup, and integration testing by certified engineers.',
      price: 15000,
      cost: 6000,
      stock: 999,
      maxDiscountLimit: 10
    },
    {
      sku: 'SLA-SUPP-ANNUAL',
      name: 'Enterprise 24/7 Support SLA (Monthly)',
      category: 'Subscription',
      description: '24/7 dedicated engineering support, firmware patches, and guaranteed 4-hour MTTR response.',
      price: 5000,
      cost: 1500,
      stock: 999,
      maxDiscountLimit: 20
    },
    {
      sku: 'WRT-EXTD-3YR',
      name: 'Extended 3-Year Hardware Warranty',
      category: 'Warranty',
      description: 'Full hardware replacement coverage including expedited logistics and spare parts.',
      price: 8000,
      cost: 2000,
      stock: 999,
      maxDiscountLimit: 10
    },
    {
      sku: 'ACC-DOCK-STATION',
      name: 'Industrial Docking Hub Station',
      category: 'Hardware',
      description: 'Ruggedized DIN-rail mounting hub with galvanically isolated IO expansion ports.',
      price: 12000,
      cost: 7000,
      stock: 40,
      maxDiscountLimit: 15
    }
  ];

  const displayProducts = (products && products.length > 0) ? products : defaultProducts;

  // Mock Leads fallback
  const defaultLeads = [
    {
      _id: 'ld-1',
      leadNumber: 'LD-2026-101',
      company: 'Acme Industries',
      contactName: 'John Doe',
      email: 'client@acme.com',
      phone: '+91 98765 43210',
      product: 'Industrial Controller 500',
      quantity: 100,
      budget: 5000000,
      requirement: 'Need 100 units with turnkey installation and annual support SLA coverage.',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'ld-2',
      leadNumber: 'LD-2026-102',
      company: 'Beta Manufacturing Ltd',
      contactName: 'Priya Sharma',
      email: 'priya@betamanufacturing.com',
      phone: '+91 98111 22334',
      product: 'Industrial Docking Hub Station',
      quantity: 25,
      budget: 350000,
      requirement: 'Looking for 25 docking stations for plant expansion in Q3.',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const displayLeads = (leads && leads.length > 0) ? leads : defaultLeads;

  // Mock Deals fallback
  const defaultDeals = [
    {
      _id: 'd-1',
      dealNumber: 'DEAL-1042',
      title: 'Acme Industries - 100x Automation Controllers',
      customer: { company: 'Acme Industries', contactName: 'John Doe', email: 'client@acme.com' },
      stage: 'QUOTATION',
      dealValue: 4486330,
      grossMargin: 26.0,
      discount: 16,
      riskScore: 65,
      riskLevel: 'HIGH',
      isLocked: true,
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'd-2',
      dealNumber: 'DEAL-1041',
      title: 'Beta Manufacturing - Docking Expansion',
      customer: { company: 'Beta Manufacturing Ltd', contactName: 'Priya Sharma', email: 'priya@betamanufacturing.com' },
      stage: 'CONFIRMED',
      dealValue: 350000,
      grossMargin: 32.0,
      discount: 8,
      riskScore: 20,
      riskLevel: 'LOW',
      isLocked: false,
      updatedAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  const displayDeals = (deals && deals.length > 0) ? deals : defaultDeals;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* ---------------------------------------------------------------- */}
      {/* VIEW 1: LEADS INBOX (Customer Requirement Queries) */}
      {/* ---------------------------------------------------------------- */}
      {currentView === 'leads' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">Sales Representative Inbox</span>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-2">Incoming Client Query Leads</h1>
              <p className="text-xs text-slate-500 mt-1">Review new requirement queries submitted by customers from the Client Portal and prepare quotations.</p>
            </div>
            <button
              onClick={() => navigate('/client/query/new')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center inline-flex"
            >
              <Plus size={14} className="mr-1" /> Submit Query (Demo)
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {displayLeads.map(lead => (
              <div key={lead._id || lead.leadNumber} className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow hover:border-blue-300 transition-all space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md">
                      {lead.leadNumber}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base">{lead.company}</h3>
                    <span className="text-xs text-slate-400">• {lead.contactName} ({lead.email})</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    Received: {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Requirement Description</span>
                    <p className="font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                      "{lead.requirement}"
                    </p>
                  </div>
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Product Requested</span>
                      <span className="font-bold text-slate-900 text-sm block mt-0.5">{lead.product || 'Industrial Controller 500'}</span>
                      <span className="text-xs text-slate-500 font-medium">Quantity: <strong className="text-slate-900">{lead.quantity} units</strong></span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Target Budget:</span>
                      <span className="text-sm font-black text-slate-900">₹{(lead.budget || 5000000).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handlePrepareQuotation(lead._id)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center"
                  >
                    <FileText size={15} className="mr-1.5" /> Prepare Quotation & Create Deal <ArrowRight size={14} className="ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* VIEW 2: DEALS PIPELINE (Past, Present & Future Deals) */}
      {/* ---------------------------------------------------------------- */}
      {currentView === 'deals' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">Pipeline Overview</span>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-2">All Deals (Past, Present & Future)</h1>
              <p className="text-xs text-slate-500 mt-1">Track active pipeline stages, risk governance scores, deal values, and manager approval statuses.</p>
            </div>
            <button
              onClick={() => navigate('/deals/DEAL-1042')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center"
            >
              Open Central Workspace <ArrowRight size={14} className="ml-1" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl card-shadow overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Deal ID / Title</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Current Stage</th>
                  <th className="p-4">Deal Value</th>
                  <th className="p-4">Gross Margin</th>
                  <th className="p-4">Risk Level</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {displayDeals.map(d => (
                  <tr key={d._id || d.dealNumber} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <span className="font-extrabold text-blue-600 block">{d.dealNumber}</span>
                      <span className="text-slate-900 font-bold">{d.title}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{d.customer?.company || 'Acme Industries'}</span>
                      <span className="text-slate-400 font-normal">{d.customer?.email}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-extrabold text-[10px]">
                        {d.stage}
                      </span>
                    </td>
                    <td className="p-4 font-black text-slate-900">
                      ₹{(d.dealValue || 4486330).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-emerald-600 font-extrabold">
                      {d.grossMargin || 26.0}%
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                        d.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {d.riskScore || 65}/100 ({d.riskLevel || 'HIGH'})
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => navigate(`/deals/${d.dealNumber || 'DEAL-1042'}`)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                      >
                        Workspace →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* VIEW 3: PRODUCT CATALOG */}
      {/* ---------------------------------------------------------------- */}
      {currentView === 'products' && <ProductCatalogView />}

      {/* ---------------------------------------------------------------- */}
      {/* VIEW 4: CUSTOMERS */}
      {/* ---------------------------------------------------------------- */}
      {currentView === 'customers' && <CustomersView />}

      {/* ---------------------------------------------------------------- */}
      {/* VIEW 5: TASK MANAGER */}
      {/* ---------------------------------------------------------------- */}
      {currentView === 'tasks' && <TaskManagerView />}

      {/* ---------------------------------------------------------------- */}
      {/* VIEW 5: SUBSCRIPTIONS (Recurring Maintenance & SLA Services) */}
      {/* ---------------------------------------------------------------- */}
      {currentView === 'subscriptions' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">Recurring Revenue Engine</span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-2">Subscription & Maintenance Services</h1>
            <p className="text-xs text-slate-500 mt-1">Manage recurring SLA support plans, annual maintenance contracts, and mid-cycle proration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow space-y-3">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">SLA PLAN #SUB-2026-88</span>
              <h3 className="font-extrabold text-slate-900 text-base">Enterprise 24/7 Support SLA</h3>
              <p className="text-xs text-slate-500">Client: Acme Industries • Monthly Cycle</p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Recurring Amount:</span>
                  <span className="text-slate-900 font-black">₹5,000 / month</span>
                </div>
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Current Period Used:</span>
                  <span>12 / 30 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* DEFAULT DASHBOARD SUMMARY VIEW */}
      {/* ---------------------------------------------------------------- */}
      {currentView === 'dashboard' && (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Active Deals</span>
                <Building2 size={20} className="text-blue-600" />
              </div>
              <span className="text-2xl font-black text-slate-900 block">12</span>
              <span className="text-xs font-semibold text-emerald-600">↑ 15% vs last month</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Pipeline Value</span>
                <DollarSign size={20} className="text-emerald-600" />
              </div>
              <span className="text-2xl font-black text-slate-900 block">₹2.30 Cr</span>
              <span className="text-xs font-semibold text-slate-500">Avg margin: 24.5%</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Approval</span>
                <CheckCircle2 size={20} className="text-amber-600" />
              </div>
              <span className="text-2xl font-black text-amber-700 block">2 Quotes</span>
              <span className="text-xs font-semibold text-amber-600">Requires Manager/Finance</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Win Rate</span>
                <TrendingUp size={20} className="text-indigo-600" />
              </div>
              <span className="text-2xl font-black text-slate-900 block">68.4%</span>
              <span className="text-xs font-semibold text-emerald-600">↑ 4.2% efficiency</span>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => navigate('/leads')}
              className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow cursor-pointer hover:border-blue-400 transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-blue-600">
                <span className="text-xs font-bold uppercase tracking-wider">Lead Inbox</span>
                <Users size={20} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Incoming Queries</h3>
              <p className="text-xs text-slate-500">Review customer queries and generate quotations →</p>
            </div>

            <div
              onClick={() => navigate('/deals')}
              className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow cursor-pointer hover:border-blue-400 transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-xs font-bold uppercase tracking-wider">Deals Pipeline</span>
                <Building2 size={20} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Active & Future Deals</h3>
              <p className="text-xs text-slate-500">Manage pipeline stages & risk governance →</p>
            </div>

            <div
              onClick={() => navigate('/products')}
              className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow cursor-pointer hover:border-blue-400 transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-purple-600">
                <span className="text-xs font-bold uppercase tracking-wider">Product Catalog</span>
                <Package size={20} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Master Product SKUs</h3>
              <p className="text-xs text-slate-500">View descriptions, prices, and stock levels →</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
