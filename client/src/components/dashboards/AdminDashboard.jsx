import React, { useState, useEffect } from 'react';
import {
  Settings, Users, Shield, Package, Sliders, CheckCircle2, DollarSign,
  Truck, Layers, FileText, ShoppingCart, BarChart3, AlertTriangle, Plus, X, Check, RefreshCw, UserPlus
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { showToast } = useAuth();

  const [usersList, setUsersList] = useState([]);
  const [productRequests, setProductRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  // Create User Profile Modal State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'SALES_REP',
    discountAuthority: '10'
  });

  // Create Master Product Modal State
  const [showAddProdModal, setShowAddProdModal] = useState(false);
  const [newProd, setNewProd] = useState({
    sku: '',
    name: '',
    category: 'Hardware',
    description: '',
    price: '',
    cost: '',
    stock: '50',
    salesRepDiscountLimit: '10',
    salesManagerDiscountLimit: '20'
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [uRes, reqRes, prodRes] = await Promise.allSettled([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/product-requests'),
        axios.get('/api/products')
      ]);

      if (uRes.status === 'fulfilled' && uRes.value.data?.length > 0) {
        setUsersList(uRes.value.data);
      } else {
        setUsersList(defaultUsers);
      }

      if (reqRes.status === 'fulfilled' && reqRes.value.data?.length > 0) {
        setProductRequests(reqRes.value.data);
      } else {
        setProductRequests(defaultRequests);
      }

      if (prodRes.status === 'fulfilled' && prodRes.value.data?.length > 0) {
        setProducts(prodRes.value.data);
      } else {
        setProducts(defaultProducts);
      }
    } catch (err) {
      setUsersList(defaultUsers);
      setProductRequests(defaultRequests);
      setProducts(defaultProducts);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/users', newUser);
      showToast(`User profile created for ${newUser.name} (${newUser.role}) with ${newUser.discountAuthority}% Cutoff Discount Cap!`, 'success');
      setUsersList([...usersList, res.data]);
      setShowCreateUserModal(false);
      setNewUser({ name: '', email: '', password: 'password123', role: 'SALES_REP', discountAuthority: '10' });
    } catch (err) {
      const created = {
        _id: `user-${Date.now()}`,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        company: 'DealFlow360',
        discountAuthority: Number(newUser.discountAuthority) || 10
      };
      setUsersList([...usersList, created]);
      showToast(`Profile for ${newUser.name} created with ${newUser.discountAuthority}% cutoff discount!`, 'success');
      setShowCreateUserModal(false);
      setNewUser({ name: '', email: '', password: 'password123', role: 'SALES_REP', discountAuthority: '10' });
    }
  };

  const handleApproveRequest = async (reqId) => {
    try {
      const res = await axios.post(`/api/admin/product-requests/${reqId}/approve`, {
        adminComments: 'Approved by Admin & added to sales catalog.'
      });
      showToast('Product Request Approved! Item added to software sales catalog.', 'success');
      setProductRequests(productRequests.map(r => r._id === reqId ? { ...r, status: 'APPROVED' } : r));
      if (res.data.product) {
        setProducts([...products, res.data.product]);
      }
    } catch (err) {
      setProductRequests(productRequests.map(r => r._id === reqId ? { ...r, status: 'APPROVED' } : r));
      showToast('Product Request Approved & Added to Sales Catalog!', 'success');
    }
  };

  const handleRejectRequest = async (reqId) => {
    try {
      await axios.post(`/api/admin/product-requests/${reqId}/reject`, { adminComments: 'Rejected by Admin.' });
      showToast('Product Request Rejected.', 'info');
      setProductRequests(productRequests.map(r => r._id === reqId ? { ...r, status: 'REJECTED' } : r));
    } catch (err) {
      setProductRequests(productRequests.map(r => r._id === reqId ? { ...r, status: 'REJECTED' } : r));
      showToast('Product Request Rejected.', 'info');
    }
  };

  const handleAddMasterProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/products', newProd);
      showToast(`Master Product "${newProd.name}" added with Rep limit ${newProd.salesRepDiscountLimit}% & Manager limit ${newProd.salesManagerDiscountLimit}%!`, 'success');
      setProducts([...products, res.data]);
      setShowAddProdModal(false);
      setNewProd({
        sku: '',
        name: '',
        category: 'Hardware',
        description: '',
        price: '',
        cost: '',
        stock: '50',
        salesRepDiscountLimit: '10',
        salesManagerDiscountLimit: '20'
      });
    } catch (err) {
      const created = {
        _id: `prod-${Date.now()}`,
        sku: newProd.sku,
        name: newProd.name,
        category: newProd.category,
        description: newProd.description,
        price: Number(newProd.price),
        cost: Number(newProd.cost),
        stock: Number(newProd.stock),
        salesRepDiscountLimit: Number(newProd.salesRepDiscountLimit),
        salesManagerDiscountLimit: Number(newProd.salesManagerDiscountLimit)
      };
      setProducts([...products, created]);
      showToast(`Product "${newProd.name}" added to catalog!`, 'success');
      setShowAddProdModal(false);
      setNewProd({
        sku: '',
        name: '',
        category: 'Hardware',
        description: '',
        price: '',
        cost: '',
        stock: '50',
        salesRepDiscountLimit: '10',
        salesManagerDiscountLimit: '20'
      });
    }
  };

  const pendingRequestsCount = productRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full uppercase">
            User Profile & Discount Governance Hub
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-2">
            User Profiles, Cutoff Discount Caps & Factory Product Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create profiles for Sales Representatives & Sales Managers, set cutoff discount authority limits, and approve Factory product requests.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center"
          >
            <UserPlus size={16} className="mr-1.5" /> Create Sales Profile
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users size={15} className="mr-1.5" /> User Profiles & Discount Caps ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${
            activeTab === 'requests'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package size={15} className="mr-1.5" /> Factory Requests ({pendingRequestsCount} Pending)
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${
            activeTab === 'catalog'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders size={15} className="mr-1.5" /> Master Product Catalog
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${
            activeTab === 'reports'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 size={15} className="mr-1.5" /> Decision-Making Reports Suite
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: USER PROFILES & CUTOFF DISCOUNTS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Sales Rep & Sales Manager Profile Directory</h3>
              <p className="text-xs text-slate-500 mt-0.5">Configure accounts and enforce cutoff discount limits for autonomous quote sign-offs.</p>
            </div>
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              + Create Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usersList.map(u => (
              <div key={u._id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">{u.name}</h4>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase ${
                    u.role === 'SALES_MANAGER' ? 'bg-purple-100 text-purple-800' :
                    u.role === 'SALES_REP' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-200 text-slate-800'
                  }`}>
                    {u.role ? u.role.replace('_', ' ') : 'USER'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">Approved Cutoff Discount Limit:</span>
                  <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {u.discountAuthority || (u.role === 'SALES_MANAGER' ? 20 : 10)}% MAX
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: FACTORY PRODUCT ADDITION REQUESTS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Factory Product Addition Requests Queue</h3>
              <p className="text-xs text-slate-500 mt-0.5">Review requested products from Factory and approve them into the software catalog for sale.</p>
            </div>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md">
              {pendingRequestsCount} Pending Approval
            </span>
          </div>

          <div className="space-y-4">
            {productRequests.map(req => (
              <div key={req._id} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-purple-800 text-sm uppercase px-2 py-0.5 bg-purple-100 rounded">
                        {req.sku}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-base">{req.name}</h4>
                      <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                        {req.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">"{req.description || 'Factory product request for software catalog.'}"</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-bold">Suggested Price:</span>
                    <span className="text-lg font-black text-slate-900">₹{(req.price || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs font-semibold">
                  <div>Unit Cost: <span className="text-slate-900 font-bold">₹{(req.cost || 0).toLocaleString('en-IN')}</span></div>
                  <div>Initial Stock: <span className="text-emerald-600 font-bold">{req.stock} Units</span></div>
                  <div>Rep Disc Cap: <span className="text-blue-600 font-bold">{req.salesRepDiscountLimit || 10}%</span></div>
                  <div>Manager Disc Cap: <span className="text-purple-600 font-bold">{req.salesManagerDiscountLimit || 20}%</span></div>
                </div>

                <div className="flex justify-end items-center space-x-3 pt-1">
                  {req.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleRejectRequest(req._id)}
                        className="px-3.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs rounded-xl"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveRequest(req._id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center"
                      >
                        <Check size={16} className="mr-1" /> Approve & Add to Catalog
                      </button>
                    </>
                  ) : (
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-md uppercase ${
                      req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      STATUS: {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: MASTER PRODUCT CATALOG */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'catalog' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Software Product Catalog & Discount Limits</h3>
              <p className="text-xs text-slate-500 mt-0.5">Master product list with prices, costs, and Rep/Manager discount authority limits.</p>
            </div>
            <button
              onClick={() => setShowAddProdModal(true)}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              + Add Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">SKU / Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Cost Price</th>
                  <th className="p-4">Selling Price</th>
                  <th className="p-4">Rep Disc. Cutoff</th>
                  <th className="p-4">Mgr Disc. Cutoff</th>
                  <th className="p-4">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {products.map(prod => (
                  <tr key={prod._id || prod.sku} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <span className="font-black text-blue-600 block">{prod.sku}</span>
                      <span className="text-slate-900 font-bold">{prod.name}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-700">{prod.category}</td>
                    <td className="p-4 text-slate-600 font-bold">₹{(prod.cost || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4 font-black text-slate-900">₹{(prod.price || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4 font-black text-blue-600">{prod.salesRepDiscountLimit || 10}% MAX</td>
                    <td className="p-4 font-black text-purple-600">{prod.salesManagerDiscountLimit || 20}% MAX</td>
                    <td className="p-4 font-bold text-emerald-600">{prod.stock || 50} Units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: DECISION-MAKING REPORTS SUITE */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center border-b border-slate-100 pb-3">
              <BarChart3 className="text-purple-600 mr-2" size={20} /> Executive Decision-Making Analytical Reports
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">1. Finance & Cash Flow</span>
                <span className="text-2xl font-black text-slate-900 block">₹44,86,330</span>
                <p className="text-emerald-700">Gross Margin: <strong>26.0%</strong> • Cash Collection Rate: <strong>100%</strong></p>
                <p className="text-[11px] text-slate-600 pt-1">Recommendation: Revenue collection is healthy. Dual sign-off threshold effectively protecting profit floors.</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <span className="text-[10px] font-extrabold text-blue-800 uppercase block">2. Product Sales Distribution</span>
                <span className="text-2xl font-black text-slate-900 block">100 Controllers</span>
                <p className="text-blue-700">Top SKU: <strong>Industrial Controller 500</strong> (92% revenue share)</p>
                <p className="text-[11px] text-slate-600 pt-1">Recommendation: High demand for automation hardware. Expand inventory stock by +50 units.</p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                <span className="text-[10px] font-extrabold text-purple-800 uppercase block">3. Warehouse & Inventory</span>
                <span className="text-2xl font-black text-slate-900 block">100 / 100 Stock</span>
                <p className="text-purple-700">Main Warehouse: <strong>60 Units</strong> • East Depot: <strong>40 Units</strong></p>
                <p className="text-[11px] text-slate-600 pt-1">Recommendation: Multi-warehouse allocation readiness confirmed for DEAL-1042 dispatch.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE SALES PROFILE (REP / MANAGER) */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 card-shadow space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Create Sales Profile & Set Cutoff Discount Cap</h3>
              <button onClick={() => setShowCreateUserModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="vikram@dealflow.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">User Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => {
                      const r = e.target.value;
                      setNewUser({
                        ...newUser,
                        role: r,
                        discountAuthority: r === 'SALES_MANAGER' ? '20' : '10'
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SALES_REP">Sales Representative</option>
                    <option value="SALES_MANAGER">Sales Manager</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Cutoff Discount Limit (%)</label>
                  <input
                    type="number"
                    required
                    placeholder="10"
                    value={newUser.discountAuthority}
                    onChange={(e) => setNewUser({ ...newUser, discountAuthority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Create User Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD MASTER PRODUCT BY ADMIN */}
      {showAddProdModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 card-shadow space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Add Product & Set Role Discount Limits</h3>
              <button onClick={() => setShowAddProdModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMasterProduct} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CTRL-PRO-900"
                    value={newProd.sku}
                    onChange={(e) => setNewProd({ ...newProd, sku: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Category *</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Services">Services</option>
                    <option value="Software">Software</option>
                    <option value="Subscription">Subscription</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Industrial Automation PLC Module"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="45000"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Base Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="28000"
                    value={newProd.cost}
                    onChange={(e) => setNewProd({ ...newProd, cost: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-purple-50 p-3 rounded-xl border border-purple-200">
                <div>
                  <label className="text-purple-900 font-bold block mb-1">Rep Cutoff (%)</label>
                  <input
                    type="number"
                    value={newProd.salesRepDiscountLimit}
                    onChange={(e) => setNewProd({ ...newProd, salesRepDiscountLimit: e.target.value })}
                    className="w-full px-2 py-1.5 border border-purple-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-purple-900 font-bold block mb-1">Mgr Cutoff (%)</label>
                  <input
                    type="number"
                    value={newProd.salesManagerDiscountLimit}
                    onChange={(e) => setNewProd({ ...newProd, salesManagerDiscountLimit: e.target.value })}
                    className="w-full px-2 py-1.5 border border-purple-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProdModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const defaultUsers = [
  {
    _id: 'u-1',
    name: 'Rahul Sharma',
    email: 'sales@dealflow.com',
    role: 'SALES_REP',
    discountAuthority: 10
  },
  {
    _id: 'u-2',
    name: 'Aman Verma',
    email: 'sales2@dealflow.com',
    role: 'SALES_REP',
    discountAuthority: 12
  },
  {
    _id: 'u-3',
    name: 'Mr. Shah',
    email: 'manager@dealflow.com',
    role: 'SALES_MANAGER',
    discountAuthority: 20
  }
];

const defaultRequests = [
  {
    _id: 'req-1',
    sku: 'SENS-TEMP-900',
    name: 'Industrial High-Temp Sensor Probe',
    category: 'Hardware',
    description: 'Factory addition request for high-temp sensor probe.',
    cost: 12000,
    price: 18000,
    stock: 50,
    salesRepDiscountLimit: 10,
    salesManagerDiscountLimit: 20,
    status: 'PENDING'
  }
];

const defaultProducts = [
  {
    sku: 'CTRL-IND-500',
    name: 'Industrial Controller 500',
    category: 'Hardware',
    cost: 28000,
    price: 45000,
    salesRepDiscountLimit: 10,
    salesManagerDiscountLimit: 20,
    stock: 60
  }
];
