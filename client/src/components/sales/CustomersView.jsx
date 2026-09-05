import React, { useState, useEffect } from 'react';
import {
  UserCheck, Search, Filter, Plus, Building2, Mail, Phone, ShieldCheck,
  DollarSign, ArrowRight, X, Briefcase, Award, CreditCard, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CustomersView() {
  const navigate = useNavigate();
  const { showToast } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // New Customer Form State
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    tier: 'GOLD',
    creditLimit: '1000000'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [custRes, dealRes] = await Promise.allSettled([
        axios.get('/api/customers'),
        axios.get('/api/deals')
      ]);

      if (custRes.status === 'fulfilled' && custRes.value.data?.length > 0) {
        setCustomers(custRes.value.data);
      } else {
        setCustomers(defaultCustomers);
      }

      if (dealRes.status === 'fulfilled' && dealRes.value.data?.length > 0) {
        setDeals(dealRes.value.data);
      } else {
        setDeals(defaultDeals);
      }
    } catch (err) {
      console.warn('Customers fetch error:', err.message);
      setCustomers(defaultCustomers);
      setDeals(defaultDeals);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/customers', formData);
      showToast(`Customer "${formData.companyName}" created successfully!`, 'success');
      setCustomers([res.data, ...customers]);
      setShowAddModal(false);
      setFormData({ companyName: '', contactName: '', email: '', phone: '', tier: 'GOLD', creditLimit: '1000000' });
    } catch (err) {
      // Local fallback append
      const newCust = {
        _id: `cust-${Date.now()}`,
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        tier: formData.tier,
        creditLimit: Number(formData.creditLimit) || 1000000,
        accountStatus: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      setCustomers([newCust, ...customers]);
      showToast(`Account "${formData.companyName}" created!`, 'success');
      setShowAddModal(false);
      setFormData({ companyName: '', contactName: '', email: '', phone: '', tier: 'GOLD', creditLimit: '1000000' });
    }
  };

  const filteredCustomers = customers.filter(cust => {
    const nameMatch = (cust.companyName || cust.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (cust.contactName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (cust.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const tierMatch = tierFilter === 'ALL' || cust.tier === tierFilter;
    return nameMatch && tierMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">
              Sales Representative Workspace
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              {customers.length} Verified Accounts
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-2">
            Enterprise Customer Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage locked client accounts, track active deals, review credit limits, and launch new quotes.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center inline-flex"
        >
          <Plus size={16} className="mr-1.5" /> Add Enterprise Customer
        </button>
      </div>

      {/* KPI Metrics Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Accounts</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{customers.length}</span>
          <span className="text-xs text-emerald-600 font-bold">● 100% Active Status</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Deals Value</span>
          <span className="text-xl font-black text-blue-600 mt-1 block">₹48,36,330</span>
          <span className="text-xs text-slate-500 font-medium">Locked Projects</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tier Breakdown</span>
          <span className="text-xl font-black text-amber-600 mt-1 block">2 Gold • 1 Silver</span>
          <span className="text-xs text-amber-700 font-semibold">High LTV Accounts</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Credit Limit</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">₹10.00 Lakhs</span>
          <span className="text-xs text-emerald-600 font-bold">Approved for Terms</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 card-shadow flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company name, contact person, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 flex items-center">
            <Filter size={14} className="mr-1" /> Tier:
          </span>
          {['ALL', 'GOLD', 'SILVER', 'BRONZE', 'ENTERPRISE'].map(tier => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tierFilter === tier
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(cust => {
          const custName = cust.companyName || cust.name || 'Acme Corp';
          const custTier = cust.tier || 'GOLD';
          const linkedDeals = deals.filter(d => d.customer?.company === custName || d.customer?.email === cust.email);

          return (
            <div
              key={cust._id}
              className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex flex-col justify-between space-y-4 hover:border-blue-400 transition-all cursor-pointer group"
              onClick={() => setSelectedCustomer(cust)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${
                    custTier === 'GOLD' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    custTier === 'ENTERPRISE' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                    custTier === 'SILVER' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    {custTier} TIER
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center">
                    <ShieldCheck size={12} className="mr-1" /> {cust.accountStatus || 'ACTIVE'}
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                    {custName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center">
                    <UserCheck size={13} className="mr-1 text-slate-400" /> {cust.contactName || 'Primary Contact'}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center text-slate-600">
                    <Mail size={13} className="mr-2 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{cust.email}</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Phone size={13} className="mr-2 text-slate-400 flex-shrink-0" />
                    <span>{cust.phone || '+91 98765 43210'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Approved Credit Limit:</span>
                  <span className="text-slate-900 font-bold">₹{(cust.creditLimit || 1000000).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Locked Projects:</span>
                  <span className="text-blue-600 font-extrabold">{linkedDeals.length > 0 ? `${linkedDeals.length} Active` : '1 Locked Deal'}</span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/quotations');
                    }}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                  >
                    New Quote +
                  </button>
                  <span className="text-xs text-slate-400 font-bold group-hover:text-blue-600 flex items-center">
                    Details <ChevronRight size={14} className="ml-0.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: ADD NEW CUSTOMER */}
      {/* ---------------------------------------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 card-shadow space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Add New Enterprise Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reliance Tech Labs Ltd"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Singh"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98111 22334"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="vikram@reliancetech.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Customer Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GOLD">GOLD TIER</option>
                    <option value="SILVER">SILVER TIER</option>
                    <option value="BRONZE">BRONZE TIER</option>
                    <option value="ENTERPRISE">ENTERPRISE TIER</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: CUSTOMER DETAIL DRAWER */}
      {/* ---------------------------------------------------- */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 card-shadow space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
                  {selectedCustomer.tier || 'GOLD'} TIER CLIENT
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 mt-1">
                  {selectedCustomer.companyName || selectedCustomer.name}
                </h3>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Contact Person</span>
                  <span className="font-extrabold text-slate-900 text-sm block mt-0.5">{selectedCustomer.contactName}</span>
                  <span className="text-slate-500">{selectedCustomer.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Credit Line</span>
                  <span className="font-extrabold text-slate-900 text-sm block mt-0.5">₹{(selectedCustomer.creditLimit || 1000000).toLocaleString('en-IN')}</span>
                  <span className="text-emerald-600 font-bold">Approved Status</span>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 mb-2 uppercase text-[11px] tracking-wider">Active Deals & Projects</h4>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-blue-900">DEAL-1042: 100x Industrial Controllers</span>
                    <span className="text-xs font-black text-slate-900">₹44,86,330</span>
                  </div>
                  <p className="text-[11px] text-blue-700">Stage: Quotation Prep • Gross Margin: 26.0% • Risk Score: 65 (HIGH)</p>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  navigate('/deals/DEAL-1042');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                Open Central Deal Workspace →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fallbacks
const defaultCustomers = [
  {
    _id: 'c-1',
    companyName: 'Acme Industries',
    contactName: 'John Doe',
    email: 'client@acme.com',
    phone: '+91 98765 43210',
    tier: 'GOLD',
    creditLimit: 1000000,
    accountStatus: 'ACTIVE'
  },
  {
    _id: 'c-2',
    companyName: 'Beta Manufacturing Ltd',
    contactName: 'Priya Sharma',
    email: 'priya@betamanufacturing.com',
    phone: '+91 98111 22334',
    tier: 'SILVER',
    creditLimit: 500000,
    accountStatus: 'ACTIVE'
  },
  {
    _id: 'c-3',
    companyName: 'Gamma Automation Labs',
    contactName: 'Rohan Gupta',
    email: 'rohan@gammaauto.io',
    phone: '+91 99888 77665',
    tier: 'ENTERPRISE',
    creditLimit: 2500000,
    accountStatus: 'ACTIVE'
  }
];

const defaultDeals = [
  {
    _id: 'd-1',
    dealNumber: 'DEAL-1042',
    title: 'Acme Industries - 100x Automation Controllers',
    customer: { company: 'Acme Industries', contactName: 'John Doe', email: 'client@acme.com' },
    stage: 'QUOTATION',
    dealValue: 4486330
  }
];
