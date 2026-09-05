import React, { useState, useEffect } from 'react';
import {
  Package, Search, Filter, Plus, ArrowRight, ShieldCheck, DollarSign,
  Info, ShoppingBag, Layers, CheckCircle2, AlertTriangle, X, Wrench, Shield
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProductCatalogView() {
  const navigate = useNavigate();
  const { showToast } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Hardware',
    description: '',
    price: '',
    cost: '',
    stock: '50',
    maxDiscountLimit: '15'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/products');
      if (res.data && res.data.length > 0) {
        setProducts(res.data);
      } else {
        setProducts(defaultProducts);
      }
    } catch (err) {
      console.warn('Product load fallback:', err.message);
      setProducts(defaultProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/products', formData);
      showToast(`SKU "${formData.sku}" added to Product Catalog!`, 'success');
      setProducts([...products, res.data]);
      setShowAddModal(false);
      setFormData({ sku: '', name: '', category: 'Hardware', description: '', price: '', cost: '', stock: '50', maxDiscountLimit: '15' });
    } catch (err) {
      const newProd = {
        _id: `prod-${Date.now()}`,
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: Number(formData.price),
        cost: Number(formData.cost),
        stock: Number(formData.stock),
        maxDiscountLimit: Number(formData.maxDiscountLimit)
      };
      setProducts([...products, newProd]);
      showToast(`Product "${formData.name}" added to catalog!`, 'success');
      setShowAddModal(false);
      setFormData({ sku: '', name: '', category: 'Hardware', description: '', price: '', cost: '', stock: '50', maxDiscountLimit: '15' });
    }
  };

  const filteredProducts = products.filter(prod => {
    const searchMatch = (prod.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (prod.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (prod.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const catMatch = categoryFilter === 'ALL' || prod.category === categoryFilter;
    return searchMatch && catMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Background Image */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl text-white">
        <img
          src="/b2b_crm_banner.jpg"
          alt="Master Product Catalog"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.35]"
        />
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-[2px] bg-slate-900/40">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest bg-blue-500/30 border border-blue-400/30 px-3 py-1 rounded-full backdrop-blur-md">
                Master Product Repository
              </span>
              <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/30 border border-emerald-400/30 px-3 py-1 rounded-full backdrop-blur-md">
                {products.length} Active SKUs
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-md">
              Product & Service Catalog
            </h1>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
              Browse hardware automation controllers, turnkey field engineering services, recurring support SLAs, and warranty products.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center inline-flex border border-white/20 hover-lift"
          >
            <Plus size={18} className="mr-2" /> Add New Product SKU
          </button>
        </div>
      </div>

      {/* KPI Metrics Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-200 card-shadow hover-lift">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Catalog SKUs</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{products.length} Items</span>
          <span className="text-xs text-blue-600 font-bold">● Active Master List</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-200 card-shadow hover-lift">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hardware Stock</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">100 Units</span>
          <span className="text-xs text-emerald-700 font-medium">Ready in Main Warehouse</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-200 card-shadow hover-lift">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Gross Margin</span>
          <span className="text-xl font-black text-amber-600 mt-1 block">37.8%</span>
          <span className="text-xs text-amber-700 font-bold">High Profit Density</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-200 card-shadow hover-lift">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Max Discount Threshold</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">15.0% Cap</span>
          <span className="text-xs text-purple-600 font-bold">Auto Manager Approval</span>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="glass-card border border-slate-200 rounded-2xl p-4 card-shadow flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by SKU, name, or specifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 flex items-center flex-shrink-0">
            <Filter size={14} className="mr-1" /> Category:
          </span>
          {['ALL', 'Hardware', 'Services', 'Software', 'Subscription', 'Warranty'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-sm scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(prod => {
          const margin = prod.price && prod.cost ? (((prod.price - prod.cost) / prod.price) * 100).toFixed(1) : '35.0';
          const defaultProductImage = 
            prod.sku === 'CTRL-IND-500' ? '/industrial_controller.jpg' :
            prod.sku === 'SRV-INSTALL-PRO' ? '/onsite_installation.jpg' :
            prod.category === 'Hardware' ? '/industrial_controller.jpg' :
            prod.category === 'Services' ? '/onsite_installation.jpg' :
            '/b2b_crm_banner.jpg';

          return (
            <div
              key={prod._id || prod.sku}
              className="bg-white border border-slate-200 rounded-2xl p-5 card-shadow flex flex-col justify-between space-y-4 hover:border-blue-400 hover-lift transition-all group overflow-hidden"
            >
              <div className="space-y-3">
                {/* Product Image Thumbnail */}
                <div className="relative h-44 rounded-xl overflow-hidden border border-slate-100 bg-slate-900 group-hover:shadow-md transition-all">
                  <img
                    src={prod.image || defaultProductImage}
                    alt={prod.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center space-x-1">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-slate-900/80 text-white rounded-md backdrop-blur-md border border-white/20 tracking-wider">
                      {prod.sku}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md backdrop-blur-md border ${
                      prod.category === 'Hardware' ? 'bg-blue-600/90 text-white border-blue-400/30' :
                      prod.category === 'Services' ? 'bg-emerald-600/90 text-white border-emerald-400/30' :
                      prod.category === 'Subscription' ? 'bg-purple-600/90 text-white border-purple-400/30' :
                      'bg-amber-600/90 text-white border-amber-400/30'
                    }`}>
                      {prod.category}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                    {prod.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Unit Selling Price:</span>
                  <span className="text-base font-black text-slate-900">₹{(prod.price || 0).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Gross Profit Margin:</span>
                  <span className="text-emerald-600 font-extrabold">{margin}%</span>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Stock Availability:</span>
                  <span className={`font-bold ${
                    (prod.stock || 0) > 20 ? 'text-emerald-600' : (prod.stock || 0) > 0 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {prod.stock === 999 ? 'Virtual / Service' : `${prod.stock} Units Available`}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedProduct(prod)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all text-center"
                  >
                    View Specs
                  </button>
                  <button
                    onClick={() => {
                      showToast(`Added ${prod.name} to Quotation Builder!`, 'success');
                      navigate('/quotations');
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all text-center"
                  >
                    + Add to Quote
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: ADD NEW PRODUCT SKU */}
      {/* ---------------------------------------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 card-shadow space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Add New Master Product SKU</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CTRL-PRO-900"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Services">Services</option>
                    <option value="Software">Software</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Warranty">Warranty</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next-Gen Automation Bus Gateway"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Description & Specifications</label>
                <textarea
                  rows={3}
                  placeholder="Detailed tech specs, protocol support, or service SLA coverage..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Base Unit Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="28000"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Max Discount Cap (%)</label>
                  <input
                    type="number"
                    value={formData.maxDiscountLimit}
                    onChange={(e) => setFormData({ ...formData, maxDiscountLimit: e.target.value })}
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
                  Save Product SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: PRODUCT SPECS DETAIL */}
      {/* ---------------------------------------------------- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 card-shadow space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md border">
                  {selectedProduct.sku}
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 mt-1">
                  {selectedProduct.name}
                </h3>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed font-medium text-slate-700">
                "{selectedProduct.description}"
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-600 block uppercase">Selling Price</span>
                  <span className="text-base font-black text-slate-900">₹{(selectedProduct.price || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-600 block uppercase">Base Unit Cost</span>
                  <span className="text-base font-black text-slate-900">₹{(selectedProduct.cost || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  navigate('/quotations');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                Create Quotation with SKU →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
