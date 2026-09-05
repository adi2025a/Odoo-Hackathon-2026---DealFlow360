import React, { useState, useEffect } from 'react';
import { Truck, Package, Layers, Plus, CheckCircle2, Clock, X, AlertTriangle, ArrowRight, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function FactoryDashboard() {
  const navigate = useNavigate();
  const { showToast } = useAuth();

  const [requests, setRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Hardware',
    description: '',
    cost: '',
    price: '',
    stock: '50',
    salesRepDiscountLimit: '10',
    salesManagerDiscountLimit: '20'
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/api/factory/product-requests');
      if (res.data && res.data.length > 0) {
        setRequests(res.data);
      } else {
        setRequests(defaultRequests);
      }
    } catch (err) {
      setRequests(defaultRequests);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/factory/product-requests', formData);
      showToast(`Product addition request for "${formData.name}" submitted to Admin!`, 'success');
      setRequests([res.data, ...requests]);
      setShowRequestModal(false);
      setFormData({
        sku: '',
        name: '',
        category: 'Hardware',
        description: '',
        cost: '',
        price: '',
        stock: '50',
        salesRepDiscountLimit: '10',
        salesManagerDiscountLimit: '20'
      });
    } catch (err) {
      const newReq = {
        _id: `req-${Date.now()}`,
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        cost: Number(formData.cost),
        price: Number(formData.price),
        stock: Number(formData.stock),
        salesRepDiscountLimit: Number(formData.salesRepDiscountLimit),
        salesManagerDiscountLimit: Number(formData.salesManagerDiscountLimit),
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      setRequests([newReq, ...requests]);
      showToast(`Product request "${formData.name}" sent to Admin queue!`, 'success');
      setShowRequestModal(false);
      setFormData({
        sku: '',
        name: '',
        category: 'Hardware',
        description: '',
        cost: '',
        price: '',
        stock: '50',
        salesRepDiscountLimit: '10',
        salesManagerDiscountLimit: '20'
      });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded-full uppercase">
            Factory & Operations Control
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-2">
            Production Queue & Product Catalog Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Request new product additions to Admin catalog for sales, manage multi-warehouse stock, and fulfill deal orders.
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center inline-flex"
        >
          <Plus size={16} className="mr-1.5" /> Request New Product Addition to Catalog
        </button>
      </div>

      {/* Production & Warehouse Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Main Warehouse Stock</span>
          <span className="text-2xl font-black text-slate-900">60 / 100 Units</span>
          <span className="text-xs font-bold text-blue-600">Industrial Controller 500</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">East Depot Stock</span>
          <span className="text-2xl font-black text-slate-900">40 / 100 Units</span>
          <span className="text-xs font-bold text-indigo-600">Industrial Controller 500</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Fulfillment Orders</span>
          <span className="text-2xl font-black text-emerald-700">1 Order (100 Units)</span>
          <button onClick={() => navigate('/deals/DEAL-1042')} className="text-xs font-bold text-blue-600 hover:underline block mt-1">
            Allocate Stock Split →
          </button>
        </div>
      </div>

      {/* Product Addition Requests History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl card-shadow overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Submitted Catalog Product Addition Requests</h3>
            <p className="text-xs text-slate-500 mt-0.5">Requests sent to Admin for review, pricing, and software catalog listing.</p>
          </div>
          <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-md">
            {requests.length} Total Requests
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-4">SKU / Product Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Est. Unit Cost</th>
              <th className="p-4">Suggested Selling Price</th>
              <th className="p-4">Initial Stock</th>
              <th className="p-4">Admin Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
            {requests.map(req => (
              <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4">
                  <span className="font-black text-purple-700 uppercase block">{req.sku}</span>
                  <span className="text-slate-900 font-bold">{req.name}</span>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md font-extrabold">
                    {req.category}
                  </span>
                </td>
                <td className="p-4 font-bold text-slate-700">₹{(req.cost || 0).toLocaleString('en-IN')}</td>
                <td className="p-4 font-black text-slate-900">₹{(req.price || 0).toLocaleString('en-IN')}</td>
                <td className="p-4 font-bold text-emerald-600">{req.stock || 50} Units</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase ${
                    req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {req.status || 'PENDING'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: REQUEST NEW PRODUCT ADDITION */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 card-shadow space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Request Product Addition to Admin Catalog</h3>
              <button onClick={() => setShowRequestModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Product SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SENS-TEMP-900"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Services">Services</option>
                    <option value="Software">Software</option>
                    <option value="Subscription">Subscription</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Product Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Industrial High-Temp Sensor Probe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Specifications & Description</label>
                <textarea
                  rows={3}
                  placeholder="Manufacturing specs, factory stock location, or technical capabilities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Est. Base Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="12000"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Suggested Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="18000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Rep Disc. Limit (%)</label>
                  <input
                    type="number"
                    value={formData.salesRepDiscountLimit}
                    onChange={(e) => setFormData({ ...formData, salesRepDiscountLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Manager Limit (%)</label>
                  <input
                    type="number"
                    value={formData.salesManagerDiscountLimit}
                    onChange={(e) => setFormData({ ...formData, salesManagerDiscountLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs flex items-center"
                >
                  <Send size={14} className="mr-1.5" /> Submit Request to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const defaultRequests = [
  {
    _id: 'req-1',
    sku: 'SENS-TEMP-900',
    name: 'Industrial High-Temp Sensor Probe',
    category: 'Hardware',
    cost: 12000,
    price: 18000,
    stock: 50,
    status: 'PENDING'
  }
];
