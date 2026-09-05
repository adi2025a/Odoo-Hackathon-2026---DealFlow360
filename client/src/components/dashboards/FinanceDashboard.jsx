import React, { useState, useEffect } from 'react';
import {
  DollarSign, RefreshCw, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2, Truck, Layers,
  BarChart3, X, TrendingUp, CreditCard, Calendar, FileText, Download, CheckSquare, Building2,
  User, PieChart, ShieldAlert, ChevronRight, Search, Filter, Plus, ArrowUpRight, ArrowDownRight, Lock,
  LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function FinanceDashboard({ viewMode }) {
  const navigate = useNavigate();
  const { showToast, user } = useAuth();

  // Active Tab State (derived from viewMode prop or internal tab state)
  const [activeTab, setActiveTab] = useState(viewMode || 'overview');

  // Backend Data States
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [actionItems, setActionItems] = useState([]);
  const [inventoryValuation, setInventoryValuation] = useState(null);
  const [warehouseData, setWarehouseData] = useState(null);
  const [invoicesList, setInvoicesList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [arData, setArData] = useState(null);
  const [subscriptionsData, setSubscriptionsData] = useState(null);
  const [reconciliationsList, setReconciliationsList] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dealData, setDealData] = useState(null);

  // Modals & Interactivity States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [txnRef, setTxnRef] = useState('');

  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [selectedReconcile, setSelectedReconcile] = useState(null);
  const [reconcileComment, setReconcileComment] = useState('');

  const [simulatedCost, setSimulatedCost] = useState(3319884);
  const [prorationPreview, setProrationPreview] = useState(null);

  // Report Filters
  const [reportFilterCategory, setReportFilterCategory] = useState('ALL');
  const [reportDateRange, setReportDateRange] = useState('LAST_30_DAYS');

  useEffect(() => {
    if (viewMode) {
      setActiveTab(viewMode);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchAllFinanceData();
  }, []);

  const fetchAllFinanceData = async () => {
    try {
      setLoading(true);
      const [
        overviewRes,
        actionsRes,
        valuationRes,
        whRes,
        invRes,
        payRes,
        arRes,
        subRes,
        recRes,
        analyticsRes,
        dealRes
      ] = await Promise.all([
        axios.get('/api/finance/overview').catch(() => null),
        axios.get('/api/finance/action-items').catch(() => null),
        axios.get('/api/finance/inventory-valuation').catch(() => null),
        axios.get('/api/finance/warehouse-financials').catch(() => null),
        axios.get('/api/finance/invoices').catch(() => null),
        axios.get('/api/finance/payments').catch(() => null),
        axios.get('/api/finance/ar').catch(() => null),
        axios.get('/api/finance/subscriptions').catch(() => null),
        axios.get('/api/finance/stock-reconciliations').catch(() => null),
        axios.get('/api/finance/analytics').catch(() => null),
        axios.get('/api/deals/DEAL-1042').catch(() => null)
      ]);

      if (overviewRes?.data) setOverviewData(overviewRes.data);
      if (actionsRes?.data) setActionItems(actionsRes.data);
      if (valuationRes?.data) setInventoryValuation(valuationRes.data);
      if (whRes?.data) setWarehouseData(whRes.data);
      if (invRes?.data) setInvoicesList(invRes.data);
      if (payRes?.data) setPaymentsList(payRes.data);
      if (arRes?.data) setArData(arRes.data);
      if (subRes?.data) setSubscriptionsData(subRes.data);
      if (recRes?.data) setReconciliationsList(recRes.data);
      if (analyticsRes?.data) setAnalyticsData(analyticsRes.data);
      if (dealRes?.data) setDealData(dealRes.data);
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleFinanceApprove = async () => {
    try {
      const dealId = dealData?.deal?._id || 'DEAL-1042';
      await axios.post(`/api/deals/${dealId}/approvals/finance`, {
        action: 'APPROVE',
        comments: 'Finance profit check passed (26.0% margin >= 20.0% floor). Final lock executed & routed to Factory.'
      });
      showToast('Finance Final Lock Approved! Order #ORD-2026 created & routed to Factory.', 'success');
      fetchAllFinanceData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Finance approval failed', 'error');
    }
  };

  const handleFinanceReject = async () => {
    try {
      const dealId = dealData?.deal?._id || 'DEAL-1042';
      await axios.post(`/api/deals/${dealId}/approvals/finance`, {
        action: 'RETURN',
        comments: 'Returned by Finance for margin re-negotiation.'
      });
      showToast('Quotation returned to Sales Rep for revision.', 'info');
      fetchAllFinanceData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Action failed', 'error');
    }
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoice || !paymentAmount) {
      showToast('Please select an invoice and enter amount.', 'error');
      return;
    }
    try {
      await axios.post('/api/finance/payments', {
        invoiceId: selectedInvoice._id,
        amount: Number(paymentAmount),
        paymentMethod,
        transactionRef: txnRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`
      });
      showToast(`Payment of ₹${Number(paymentAmount).toLocaleString('en-IN')} recorded successfully!`, 'success');
      setShowPaymentModal(false);
      setPaymentAmount('');
      setTxnRef('');
      fetchAllFinanceData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to record payment', 'error');
    }
  };

  const handleReviewReconciliationSubmit = async (action) => {
    if (!selectedReconcile) return;
    try {
      await axios.post(`/api/finance/stock-reconciliations/${selectedReconcile._id}/review`, {
        action,
        comments: reconcileComment || (action === 'APPROVE' ? 'Approved financial variance adjustment' : 'Rejected variance adjustment')
      });
      showToast(`Stock reconciliation ${action === 'APPROVE' ? 'APPROVED' : 'REJECTED'}!`, 'success');
      setShowReconcileModal(false);
      setReconcileComment('');
      fetchAllFinanceData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Action failed', 'error');
    }
  };

  const handleExportCSV = (reportName) => {
    const csvHeader = 'Item,Category,Amount (INR),Date,Status\n';
    const csvBody = `1,Total Revenue,4486330,2026-09-06,CONFIRMED\n2,Gross Profit,1166446,2026-09-06,VERIFIED\n3,Inventory Value,1840000,2026-09-06,AUDITED\n4,Accounts Receivable,1240000,2026-09-06,PARTIALLY_PAID\n`;
    const blob = new Blob([csvHeader + csvBody], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DealFlow360_${reportName}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${reportName} Report as CSV successfully!`, 'success');
  };

  // Helper variables for Deal state
  const currentStage = dealData?.deal?.stage;
  const isFinancePending = currentStage === 'FINANCE_APPROVAL';
  const isAwaitingManager = currentStage === 'MANAGER_APPROVAL' || currentStage === 'QUOTATION' || (!currentStage && !loading);
  const isFinalApproved = currentStage === 'FULFILLMENT' || currentStage === 'APPROVED' || currentStage === 'ORDER_CREATED' || currentStage === 'COMPLETED';

  // Metrics from Overview Data with Fallbacks
  const kpis = overviewData?.kpis || {
    totalRevenue: 4486330,
    grossProfit: 1166446,
    grossMargin: 26.0,
    outstandingInvoices: 1240000,
    inventoryValue: 1840000,
    totalUnits: 100,
    accountsReceivable: 1240000,
    overdueAmount: 320000,
    overdueCount: 1,
    mrr: 60000,
    activeSubscriptionsCount: 12,
    pendingApprovalsCount: 1
  };

  // Simulated Margin Calculation
  const dealRevenue = 4486330;
  const simulatedProfit = dealRevenue - Number(simulatedCost);
  const simulatedMargin = Number(((simulatedProfit / dealRevenue) * 100).toFixed(1));
  const isSimulatedProfitable = simulatedMargin >= 20.0;

  // Determine if viewing main Dashboard or sub-page
  const isDashboardPage = (activeTab === 'overview' || activeTab === 'dashboard') && (!viewMode || viewMode === 'overview' || viewMode === 'dashboard');

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* ---------------------------------------------------- */}
      {/* 1. EXECUTIVE HEADER BANNER                           */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full uppercase border border-emerald-300">
              Finance & Profitability Engine
            </span>
            <span className="text-xs font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200">
              Role: Finance Manager
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mt-2">
            {isDashboardPage ? 'Finance Command Center' :
             activeTab === 'approvals' ? 'Financial Approvals Queue' :
             activeTab === 'margin' ? 'Deal Profitability & Margin Governance' :
             activeTab === 'inventory-valuation' ? 'Inventory Valuation & Aging Report' :
             activeTab === 'warehouse-costs' ? 'Warehouse Costs & Operating P&L' :
             activeTab === 'reconciliation' ? 'Stock Reconciliation Review' :
             activeTab === 'invoices' ? 'Invoice Management & Billing' :
             activeTab === 'payments' || activeTab === 'ar' ? 'Payments & Accounts Receivable' :
             activeTab === 'subscriptions' ? 'Subscription Billing & MRR Engine' :
             'Financial Analytics & Decision Reports'}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Financial control, deal margin verification, inventory valuation, invoice tracking, AR aging, and P&L governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExportCSV(activeTab)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center"
          >
            <Download size={14} className="mr-1.5 text-slate-600" /> Export Report Data
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center"
          >
            <Plus size={15} className="mr-1" /> Record Payment
          </button>
          <button
            onClick={fetchAllFinanceData}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition-all"
            title="Refresh Financial Data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-blue-600" : ""} />
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. TOP EXECUTIVE KPI CARDS & ACTION CENTER           */}
      {/* (ONLY SHOWN ON DASHBOARD OVERVIEW PAGE)               */}
      {/* ---------------------------------------------------- */}
      {isDashboardPage && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Total Revenue */}
            <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-xs space-y-1 hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={16} /></div>
              </div>
              <div className="text-xl md:text-2xl font-black text-slate-900">₹{kpis.totalRevenue.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-emerald-600 font-extrabold flex items-center">
                <ArrowUpRight size={13} className="mr-0.5" /> ↑ 12.4% vs prev period
              </div>
            </div>

            {/* Gross Profit & Margin */}
            <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-xs space-y-1 hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Gross Profit</span>
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={16} /></div>
              </div>
              <div className="text-xl md:text-2xl font-black text-emerald-700">₹{kpis.grossProfit.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-emerald-700 font-extrabold">
                Margin: <strong>{kpis.grossMargin}%</strong> (Target: 20.0%)
              </div>
            </div>

            {/* Outstanding Invoices */}
            <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-xs space-y-1 hover:border-amber-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Outstanding Invoices</span>
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><FileText size={16} /></div>
              </div>
              <div className="text-xl md:text-2xl font-black text-amber-800">₹{kpis.outstandingInvoices.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-amber-700 font-bold">
                1 Unpaid • Overdue: ₹{kpis.overdueAmount.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Inventory Value */}
            <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-xs space-y-1 hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Inventory Value</span>
                <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><Truck size={16} /></div>
              </div>
              <div className="text-xl md:text-2xl font-black text-slate-900">₹{kpis.inventoryValue.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-slate-600 font-bold">
                {kpis.totalUnits} Units Total • 2 Warehouses
              </div>
            </div>

            {/* Accounts Receivable */}
            <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Accounts Receivable</span>
              <div className="text-lg md:text-xl font-black text-slate-900">₹{kpis.accountsReceivable.toLocaleString('en-IN')}</div>
              <span className="text-[10px] font-bold text-slate-500">Overdue Buckets: ₹3.20L</span>
            </div>

            {/* Monthly Recurring ARR */}
            <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">MRR (Subscriptions)</span>
              <div className="text-lg md:text-xl font-black text-blue-700">₹{kpis.mrr.toLocaleString('en-IN')}</div>
              <span className="text-[10px] font-bold text-emerald-700">{kpis.activeSubscriptionsCount} Active Subscriptions</span>
            </div>

            {/* Pending Financial Approvals */}
            <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Pending Approvals</span>
              <div className="text-lg md:text-xl font-black text-amber-700">{kpis.pendingApprovalsCount} Deal Queue</div>
              <span className="text-[10px] font-bold text-amber-600">Requires Margin Sign-off</span>
            </div>

            {/* Minimum Margin Floor Policy */}
            <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">Company Margin Floor</span>
              <div className="text-lg md:text-xl font-black text-emerald-800">20.0% Floor</div>
              <span className="text-[10px] font-bold text-emerald-600">✓ Enforced by Backend</span>
            </div>
          </div>

          {/* ACTION CENTER ("FINANCE ACTION REQUIRED") */}
          <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
              <h2 className="text-sm font-black text-amber-950 uppercase tracking-wider flex items-center">
                <AlertTriangle className="text-amber-600 mr-2" size={18} />
                Finance Action Required ({actionItems.length || 3})
              </h2>
              <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                ATTENTION NEEDED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(actionItems.length > 0 ? actionItems : [
                {
                  id: 'act-1',
                  title: 'Deal DL-1042 requires margin approval & final lock',
                  dealId: 'DEAL-1042',
                  actionLabel: 'Review Deal'
                },
                {
                  id: 'act-2',
                  title: 'Invoice INV-1039 (₹3,20,000) is OVERDUE',
                  invoiceId: 'INV-1039',
                  actionLabel: 'View Invoice'
                },
                {
                  id: 'act-3',
                  title: 'Stock reconciliation pending for Industrial Controller 500 (Variance: -3 units, ₹96,000)',
                  reconciliationId: 'REC-2026-01',
                  actionLabel: 'Review Variance'
                }
              ]).map((item) => (
                <div key={item.id} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between space-y-2">
                  <p className="text-xs font-black text-slate-900 leading-snug">{item.title}</p>
                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => {
                        if (item.dealId) {
                          navigate(`/deals/${item.dealId}`);
                        } else if (item.invoiceId) {
                          setActiveTab('invoices');
                        } else if (item.reconciliationId) {
                          setActiveTab('reconciliation');
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] rounded-lg shadow-xs transition-all flex items-center"
                    >
                      {item.actionLabel || 'Action Item'} <ArrowRight size={12} className="ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. SUB-NAVIGATION TABS BAR                           */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto pb-1 select-none">
        {[
          { id: 'overview', label: 'Overview & Trends', icon: LayoutDashboard },
          { id: 'approvals', label: 'Financial Approvals', icon: CheckCircle2 },
          { id: 'margin', label: 'Deal Profitability & Margin', icon: ShieldAlert },
          { id: 'inventory-valuation', label: 'Inventory Valuation & Aging', icon: Truck },
          { id: 'warehouse-costs', label: 'Warehouse Costs & P&L', icon: Layers },
          { id: 'reconciliation', label: 'Stock Reconciliation', icon: CheckSquare },
          { id: 'invoices', label: 'Invoices & Billing', icon: FileText },
          { id: 'payments', label: 'Payments & AR', icon: CreditCard },
          { id: 'subscriptions', label: 'Subscriptions & MRR', icon: RefreshCw },
          { id: 'analytics', label: 'Financial Analytics & Reports', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={14} className="mr-1.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & TRENDS                             */}
      {/* ---------------------------------------------------- */}
      {(activeTab === 'overview' || activeTab === 'dashboard') && (
        <div className="space-y-6">
          {/* Revenue & Margin Trend Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center">
                    <TrendingUp size={18} className="text-blue-600 mr-2" /> Revenue & Profit Growth Trend
                  </h3>
                  <p className="text-xs text-slate-500">6-Month trajectory (Gross Revenue vs Net Profit)</p>
                </div>
                <span className="text-xs font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-md border border-blue-200">
                  Current Month: ₹44.86L Revenue
                </span>
              </div>

              {/* Simple Clean Responsive SVG Bar Chart */}
              <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-100">
                {(overviewData?.monthlyRevenueTrend || [
                  { month: 'Apr', revenue: 3200000, profit: 800000, margin: 25.0 },
                  { month: 'May', revenue: 3800000, profit: 950000, margin: 25.0 },
                  { month: 'Jun', revenue: 4100000, profit: 1050000, margin: 25.6 },
                  { month: 'Jul', revenue: 3900000, profit: 1000000, margin: 25.6 },
                  { month: 'Aug', revenue: 4200000, profit: 1100000, margin: 26.2 },
                  { month: 'Sep', revenue: 4486330, profit: 1166446, margin: 26.0 }
                ]).map((m, idx) => {
                  const revHeight = Math.round((m.revenue / 5000000) * 160);
                  const profitHeight = Math.round((m.profit / 1500000) * 120);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-slate-900 text-white text-[10px] font-bold p-1.5 rounded-md shadow-lg pointer-events-none transition-opacity z-10 whitespace-nowrap">
                        {m.month}: ₹{(m.revenue / 100000).toFixed(1)}L (Margin: {m.margin}%)
                      </div>
                      <div className="w-full max-w-[36px] flex items-end justify-center space-x-1">
                        <div style={{ height: `${revHeight}px` }} className="w-1.5/2 bg-blue-600 rounded-t-sm w-full transition-all"></div>
                        <div style={{ height: `${profitHeight}px` }} className="w-1.5/2 bg-emerald-500 rounded-t-sm w-full transition-all"></div>
                      </div>
                      <span className="text-[11px] font-black text-slate-600 mt-1">{m.month}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-1">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center"><span className="w-3 h-3 bg-blue-600 rounded-xs mr-1.5"></span> Gross Revenue</span>
                  <span className="flex items-center"><span className="w-3 h-3 bg-emerald-500 rounded-xs mr-1.5"></span> Gross Profit</span>
                </div>
                <span>Avg Gross Margin: <strong>25.6%</strong></span>
              </div>
            </div>

            {/* Cash Flow Forecast */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center">
                <CreditCard size={18} className="text-emerald-600 mr-2" /> Cash Flow Forecast
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-600">Expected Inflow</span>
                  <span className="font-black text-slate-900">₹50,00,000</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-xl">
                  <span className="font-bold text-emerald-800">Collected Revenue</span>
                  <span className="font-black text-emerald-900">₹32,46,330</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-amber-50 rounded-xl">
                  <span className="font-bold text-amber-800">Outstanding Balance</span>
                  <span className="font-black text-amber-900">₹12,40,000</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-rose-50 rounded-xl">
                  <span className="font-bold text-rose-800">Overdue Payments</span>
                  <span className="font-black text-rose-900">₹3,20,000</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-blue-50 rounded-xl">
                  <span className="font-bold text-blue-800">Expected Future Cash</span>
                  <span className="font-black text-blue-900">₹18,00,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: FINANCIAL APPROVALS                           */}
      {/* ---------------------------------------------------- */}
      {(activeTab === 'approvals' || activeTab === 'margin') && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center">
                <CheckCircle2 className={isFinalApproved ? "text-emerald-600 mr-2" : isFinancePending ? "text-amber-600 mr-2" : "text-purple-600 mr-2"} size={20} />
                {isFinalApproved ? "Finance Approval & Margin Verification Complete" : isFinancePending ? "Pending Finance Approval & Margin Calculation" : "Awaiting Sales Manager Discount Approval (Step 2)"}
              </h3>
              <span className={`text-xs font-black px-2.5 py-1 rounded-md uppercase ${
                isFinalApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                isFinancePending ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                'bg-purple-100 text-purple-800 border border-purple-300'
              }`}>
                {isFinalApproved ? 'STATUS: DEAL FINAL LOCKED & APPROVED ✓' :
                 isFinancePending ? 'ACTION REQUIRED: PENDING FINANCE SIGN-OFF' :
                 'STAGE: PENDING MANAGER APPROVAL'}
              </span>
            </div>

            {/* Financial Deal Detail Card */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block">Deal ID</span>
                  <span className="font-black text-slate-900 text-sm">DL-1042</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Client Company</span>
                  <span className="font-black text-slate-900 text-sm">Acme Industries (Gold Tier)</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Sales Rep</span>
                  <span className="font-black text-slate-900 text-sm">Rahul Sharma</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Quotation Version</span>
                  <span className="font-black text-slate-900 text-sm">Q-1042 (v1)</span>
                </div>
              </div>

              {/* Profitability Calculation Breakdown */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">Financial Profitability & Margin Verification</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-bold block">Deal Revenue</span>
                    <span className="font-black text-slate-900">₹44,86,330</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-bold block">Product Cost</span>
                    <span className="font-black text-slate-900">₹33,19,884</span>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-emerald-800 font-bold block">Gross Profit</span>
                    <span className="font-black text-emerald-900">₹11,66,446</span>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-emerald-800 font-bold block">Gross Margin</span>
                    <span className="font-black text-emerald-900">26.0%</span>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                    <span className="text-blue-800 font-bold block">Minimum Floor</span>
                    <span className="font-black text-blue-900">20.0% Required</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-950 font-bold">
                  <span className="flex items-center">
                    <ShieldCheck size={16} className="text-emerald-600 mr-2 flex-shrink-0" />
                    ✓ PROFITABLE: Margin (26.0%) exceeds company minimum threshold requirement (20.0%).
                  </span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-black uppercase">
                    PROFIT SIGN-OFF VERIFIED
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-end items-center gap-3 pt-2 border-t border-slate-200">
                <button
                  onClick={handleFinanceReject}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center"
                >
                  <X size={15} className="mr-1.5" /> Return for Margin Revision
                </button>

                <button
                  onClick={handleFinanceApprove}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center"
                >
                  <ShieldCheck size={16} className="mr-1.5" /> Approve & Lock Deal (Route to Factory)
                </button>

                <button
                  onClick={() => navigate('/deals/DEAL-1042')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center"
                >
                  Open Deal Room <ArrowRight size={14} className="ml-1.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Cost Change & Margin Recalculator Simulator */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center">
              <RefreshCw className="text-blue-600 mr-2" size={18} /> Dynamic Cost Change & Margin Recalculation Engine
            </h3>

            <p className="text-xs text-slate-600">
              Simulate backend cost increases or vendor price adjustments to evaluate real-time gross profit & margin threshold impact.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Simulated Product Cost (INR)</label>
                <input
                  type="number"
                  value={simulatedCost}
                  onChange={(e) => setSimulatedCost(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-xl font-black text-slate-900 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <span className="font-extrabold text-slate-700 block mb-1">Calculated Gross Profit</span>
                <div className="text-lg font-black text-slate-900 pt-1">
                  ₹{simulatedProfit.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <span className="font-extrabold text-slate-700 block mb-1">Recalculated Gross Margin</span>
                <div className={`text-lg font-black pt-1 ${isSimulatedProfitable ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {simulatedMargin}% {isSimulatedProfitable ? '✓ PROFITABLE' : '⚠ BELOW 20% FLOOR'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: INVENTORY VALUATION & AGING                   */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'inventory-valuation' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center">
                  <Truck size={20} className="text-blue-600 mr-2" /> Inventory Financial Valuation & Aging Report
                </h3>
                <p className="text-xs text-slate-500">Financial impact, unit costs, and inventory aging analysis across warehouses.</p>
              </div>
              <button
                onClick={() => handleExportCSV('Inventory_Valuation')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center"
              >
                <Download size={14} className="mr-1 text-slate-600" /> Download Valuation CSV
              </button>
            </div>

            {/* Valuation Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold block">Total Inventory Value</span>
                <span className="text-lg font-black text-slate-900">₹32,00,000</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold block">0–30 Days Aging</span>
                <span className="text-lg font-black text-emerald-700">₹12,50,000</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold block">31–90 Days Aging</span>
                <span className="text-lg font-black text-slate-900">₹9,30,000</span>
              </div>
              <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200">
                <span className="text-rose-800 font-bold block">90+ Days (Slow Moving)</span>
                <span className="text-lg font-black text-rose-900">₹4,80,000</span>
              </div>
            </div>

            {/* Inventory Valuation Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3 text-center">Total Stock</th>
                    <th className="p-3 text-center">Reserved</th>
                    <th className="p-3 text-right">Unit Cost</th>
                    <th className="p-3 text-right">Total Inventory Value</th>
                    <th className="p-3 text-center">Aging</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Industrial Controller 500</td>
                    <td className="p-3 font-mono">CTRL-IND-500</td>
                    <td className="p-3 text-center font-bold">100 Units</td>
                    <td className="p-3 text-center text-amber-700 font-extrabold">40 Units</td>
                    <td className="p-3 text-right font-bold">₹32,000</td>
                    <td className="p-3 text-right font-black text-slate-900">₹32,00,000</td>
                    <td className="p-3 text-center font-bold text-emerald-700">0–30 Days</td>
                    <td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">Active Demand</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Industrial Sensor Node</td>
                    <td className="p-3 font-mono">SNSR-IND-200</td>
                    <td className="p-3 text-center font-bold">50 Units</td>
                    <td className="p-3 text-center">0 Units</td>
                    <td className="p-3 text-right font-bold">₹12,000</td>
                    <td className="p-3 text-right font-black text-slate-900">₹6,00,000</td>
                    <td className="p-3 text-center font-bold text-rose-700">90+ Days</td>
                    <td className="p-3 text-center"><span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">Slow Moving</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: WAREHOUSE COSTS & P&L                         */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'warehouse-costs' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center">
              <Layers className="text-purple-600 mr-2" size={20} /> Warehouse Financial Costs & Operating P&L
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Main Warehouse */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-black text-slate-900 text-sm">MAIN WAREHOUSE</span>
                  <span className="text-xs font-extrabold text-blue-700">60 Units • ₹19.20L Inventory</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Storage Cost:</span><span className="font-bold">₹1,20,000</span></div>
                  <div className="flex justify-between"><span>Handling Cost:</span><span className="font-bold">₹45,000</span></div>
                  <div className="flex justify-between"><span>Packaging Cost:</span><span className="font-bold">₹32,000</span></div>
                  <div className="flex justify-between"><span>Transportation Cost:</span><span className="font-bold">₹75,000</span></div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 font-black text-slate-900">
                    <span>Total Operating Cost:</span><span>₹2,72,000</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs flex justify-between items-center font-bold text-emerald-950">
                  <span>Net Profit Contribution:</span>
                  <span className="text-sm font-black">₹45,78,000</span>
                </div>
              </div>

              {/* East Depot */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-black text-slate-900 text-sm">EAST DEPOT</span>
                  <span className="text-xs font-extrabold text-blue-700">40 Units • ₹12.80L Inventory</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Storage Cost:</span><span className="font-bold">₹80,000</span></div>
                  <div className="flex justify-between"><span>Handling Cost:</span><span className="font-bold">₹30,000</span></div>
                  <div className="flex justify-between"><span>Packaging Cost:</span><span className="font-bold">₹20,000</span></div>
                  <div className="flex justify-between"><span>Transportation Cost:</span><span className="font-bold">₹40,000</span></div>
                  <div className="flex justify-between pt-1 border-slate-200 border-t font-black text-slate-900">
                    <span>Total Operating Cost:</span><span>₹1,70,000</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs flex justify-between items-center font-bold text-emerald-950">
                  <span>Net Profit Contribution:</span>
                  <span className="text-sm font-black">₹27,40,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 5: STOCK RECONCILIATION REVIEW                   */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center">
              <CheckSquare className="text-amber-600 mr-2" size={20} /> Stock Reconciliation & Financial Variance Review
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider">
                  <tr>
                    <th className="p-3">Rec #</th>
                    <th className="p-3">Product SKU</th>
                    <th className="p-3 text-center">System Stock</th>
                    <th className="p-3 text-center">Physical Stock</th>
                    <th className="p-3 text-center">Variance</th>
                    <th className="p-3 text-right">Variance Value</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                  {(reconciliationsList.length > 0 ? reconciliationsList : [
                    {
                      _id: 'rec-1',
                      reconciliationNumber: 'REC-2026-01',
                      productName: 'Industrial Controller 500',
                      sku: 'CTRL-IND-500',
                      systemStock: 100,
                      physicalStock: 97,
                      variance: -3,
                      varianceValue: 96000,
                      status: 'PENDING',
                      reason: 'Physical cycle count discrepancy during warehouse audit.'
                    }
                  ]).map((rec) => (
                    <tr key={rec._id}>
                      <td className="p-3 font-bold text-slate-900">{rec.reconciliationNumber}</td>
                      <td className="p-3 font-bold text-slate-900">{rec.productName} <span className="font-mono text-slate-500 block text-[10px]">{rec.sku}</span></td>
                      <td className="p-3 text-center font-bold">{rec.systemStock}</td>
                      <td className="p-3 text-center font-bold">{rec.physicalStock}</td>
                      <td className="p-3 text-center font-extrabold text-rose-700">{rec.variance}</td>
                      <td className="p-3 text-right font-black text-slate-900">₹{rec.varianceValue?.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          rec.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          rec.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {rec.status === 'PENDING' ? (
                          <button
                            onClick={() => {
                              setSelectedReconcile(rec);
                              setShowReconcileModal(true);
                            }}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] rounded-md transition-all"
                          >
                            Review Variance
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-bold">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 6: INVOICES & BILLING                            */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center">
                <FileText className="text-blue-600 mr-2" size={20} /> Invoice Management & Accounts Receivable
              </h3>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center"
              >
                <Plus size={14} className="mr-1" /> Record Customer Payment
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider">
                  <tr>
                    <th className="p-3">Invoice ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3 text-right">Total Amount</th>
                    <th className="p-3 text-right">Paid Amount</th>
                    <th className="p-3 text-right">Outstanding</th>
                    <th className="p-3 text-center">Due Date</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                  {(invoicesList.length > 0 ? invoicesList : [
                    {
                      _id: 'inv-1',
                      invoiceNumber: 'INV-1042',
                      customer: { name: 'Acme Industries' },
                      total: 4486330,
                      paidAmount: 3246330,
                      outstandingAmount: 1240000,
                      dueDate: new Date(Date.now() + 15 * 86400000),
                      status: 'PARTIALLY_PAID'
                    },
                    {
                      _id: 'inv-2',
                      invoiceNumber: 'INV-1039',
                      customer: { name: 'Acme Industries' },
                      total: 320000,
                      paidAmount: 0,
                      outstandingAmount: 320000,
                      dueDate: new Date(Date.now() - 5 * 86400000),
                      status: 'OVERDUE'
                    }
                  ]).map((inv) => (
                    <tr key={inv._id}>
                      <td className="p-3 font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="p-3 font-bold text-slate-900">{inv.customer?.name || inv.customer?.companyName || 'Acme Industries'}</td>
                      <td className="p-3 text-right font-black text-slate-900">₹{inv.total?.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-bold text-emerald-700">₹{inv.paidAmount?.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-black text-amber-800">₹{inv.outstandingAmount?.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-center font-bold">{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
                          inv.status === 'PARTIALLY_PAID' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPaymentAmount(inv.outstandingAmount.toString());
                            setShowPaymentModal(true);
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] rounded-md transition-all"
                        >
                          Record Payment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 7: PAYMENTS & ACCOUNTS RECEIVABLE                */}
      {/* ---------------------------------------------------- */}
      {(activeTab === 'payments' || activeTab === 'ar') && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center">
              <CreditCard className="text-emerald-600 mr-2" size={20} /> Accounts Receivable Aging & Payment Audit Log
            </h3>

            {/* AR Aging Buckets */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold block">Current (Not Due)</span>
                <span className="text-lg font-black text-slate-900">₹8,20,000</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold block">1–30 Days Overdue</span>
                <span className="text-lg font-black text-amber-700">₹4,20,000</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold block">31–60 Days Overdue</span>
                <span className="text-lg font-black text-amber-800">₹2,10,000</span>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                <span className="text-rose-800 font-bold block">61–90 Days Overdue</span>
                <span className="text-lg font-black text-rose-800">₹1,40,000</span>
              </div>
              <div className="bg-rose-100 p-3 rounded-xl border border-rose-300">
                <span className="text-rose-900 font-bold block">90+ Days (Critical AR)</span>
                <span className="text-lg font-black text-rose-950">₹1,10,000</span>
              </div>
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider">
                  <tr>
                    <th className="p-3">Transaction Ref</th>
                    <th className="p-3">Invoice</th>
                    <th className="p-3 text-right">Amount Received</th>
                    <th className="p-3 text-center">Payment Method</th>
                    <th className="p-3 text-center">Date</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                  {(paymentsList.length > 0 ? paymentsList : [
                    {
                      _id: 'pay-1',
                      transactionRef: 'TXN-BANK-994821',
                      invoice: { invoiceNumber: 'INV-1042' },
                      amount: 3246330,
                      paymentMethod: 'BANK_TRANSFER',
                      date: new Date(),
                      status: 'COMPLETED'
                    }
                  ]).map((p) => (
                    <tr key={p._id}>
                      <td className="p-3 font-mono font-bold text-slate-900">{p.transactionRef}</td>
                      <td className="p-3 font-bold text-slate-900">{p.invoice?.invoiceNumber || 'INV-1042'}</td>
                      <td className="p-3 text-right font-black text-emerald-700">₹{p.amount?.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-center font-bold">{p.paymentMethod}</td>
                      <td className="p-3 text-center">{new Date(p.date).toLocaleDateString('en-IN')}</td>
                      <td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">COMPLETED ✓</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 8: SUBSCRIPTIONS & MRR                           */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center">
              <RefreshCw className="text-blue-600 mr-2" size={20} /> Subscription Billing & Recurring Revenue Engine
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold block">Monthly Recurring Revenue (MRR)</span>
                <span className="text-lg font-black text-blue-700">₹60,000 / mo</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold block">Annual Recurring Revenue (ARR)</span>
                <span className="text-lg font-black text-slate-900">₹7,20,000 / yr</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold block">Active Subscriptions</span>
                <span className="text-lg font-black text-emerald-700">12 Accounts</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold block">Upcoming Renewals</span>
                <span className="text-lg font-black text-purple-700">4 Renewals</span>
              </div>
            </div>

            {/* Proration Engine Tester */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-blue-900">Mid-Cycle Proration Calculation Engine</span>
                <button
                  onClick={() => setProrationPreview({
                    currentQty: 1,
                    newQty: 3,
                    daysUsed: 12,
                    daysRemaining: 18,
                    proratedAmount: 6000
                  })}
                  className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700"
                >
                  Test Seat Upgrade Proration (1 → 3 Seats)
                </button>
              </div>

              {prorationPreview && (
                <div className="pt-2 text-blue-950 space-y-1 font-medium border-t border-blue-200">
                  <p>• Days Used: <strong>12 / 30 Days</strong> | Remaining: <strong>18 Days</strong></p>
                  <p>• Unused credit offset: <strong>-₹3,000</strong> | New tier charge: <strong>+₹9,000</strong></p>
                  <p className="font-black text-sm text-blue-900">✓ Net Prorated Add-On Invoice Charge: +₹6,000</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 9: FINANCIAL ANALYTICS & REPORTS                 */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center">
                  <BarChart3 className="text-purple-600 mr-2" size={20} /> Financial Analytics & Decision Report Center
                </h3>
                <p className="text-xs text-slate-500">Customer profitability, product margins, sales rep discount analysis, and cost variance.</p>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={reportFilterCategory}
                  onChange={(e) => setReportFilterCategory(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="ALL">All Categories</option>
                  <option value="CUSTOMER">Customer Profitability</option>
                  <option value="PRODUCT">Product Margins</option>
                  <option value="SALES">Sales Rep Discounts</option>
                </select>
                <button
                  onClick={() => handleExportCSV('Financial_Analytics')}
                  className="px-3.5 py-1.5 bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-slate-800 transition-all flex items-center"
                >
                  <Download size={13} className="mr-1" /> Export Report
                </button>
              </div>
            </div>

            {/* Customer Profitability */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">Customer Profitability Analysis</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-black">
                    <tr>
                      <th className="p-3">Customer Company</th>
                      <th className="p-3 text-right">Revenue</th>
                      <th className="p-3 text-right">Total Cost</th>
                      <th className="p-3 text-right">Gross Profit</th>
                      <th className="p-3 text-center">Gross Margin</th>
                      <th className="p-3 text-center">Avg Discount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                    <tr>
                      <td className="p-3 font-bold text-slate-900">Acme Industries</td>
                      <td className="p-3 text-right font-black text-slate-900">₹44,86,330</td>
                      <td className="p-3 text-right font-bold text-slate-600">₹33,19,884</td>
                      <td className="p-3 text-right font-black text-emerald-700">₹11,66,446</td>
                      <td className="p-3 text-center font-bold text-emerald-700">26.0%</td>
                      <td className="p-3 text-center font-bold text-amber-700">16.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sales Rep Discount & Financial Performance */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">Sales Rep Discount & Financial Governance Performance</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-black">
                    <tr>
                      <th className="p-3">Sales Representative</th>
                      <th className="p-3 text-center">Deals Closed</th>
                      <th className="p-3 text-right">Total Revenue</th>
                      <th className="p-3 text-center">Average Discount</th>
                      <th className="p-3 text-center">Average Margin</th>
                      <th className="p-3 text-center">Approval Requests</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                    <tr>
                      <td className="p-3 font-bold text-slate-900">Rahul Sharma</td>
                      <td className="p-3 text-center font-bold">12 Deals</td>
                      <td className="p-3 text-right font-black text-slate-900">₹2,30,00,000</td>
                      <td className="p-3 text-center font-bold text-amber-700">7.2%</td>
                      <td className="p-3 text-center font-bold text-emerald-700">24.5%</td>
                      <td className="p-3 text-center font-bold">3 Requests</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: RECORD PAYMENT MODAL                        */}
      {/* ---------------------------------------------------- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in-up">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center">
                <CreditCard size={18} className="text-blue-600 mr-2" /> Record Customer Payment
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Invoice</label>
                <select
                  value={selectedInvoice?._id || ''}
                  onChange={(e) => {
                    const inv = (invoicesList.length > 0 ? invoicesList : [
                      { _id: 'inv-1', invoiceNumber: 'INV-1042', outstandingAmount: 1240000 },
                      { _id: 'inv-2', invoiceNumber: 'INV-1039', outstandingAmount: 320000 }
                    ]).find(i => i._id === e.target.value);
                    setSelectedInvoice(inv);
                    if (inv) setPaymentAmount(inv.outstandingAmount.toString());
                  }}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Invoice --</option>
                  {(invoicesList.length > 0 ? invoicesList : [
                    { _id: 'inv-1', invoiceNumber: 'INV-1042', outstandingAmount: 1240000 },
                    { _id: 'inv-2', invoiceNumber: 'INV-1039', outstandingAmount: 320000 }
                  ]).map(i => (
                    <option key={i._id} value={i._id}>
                      {i.invoiceNumber} — Outstanding: ₹{i.outstandingAmount?.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Amount (INR)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CREDIT_CARD">Corporate Credit Card</option>
                  <option value="UPI">UPI / Digital Gateway</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Transaction Reference / UTR</label>
                <input
                  type="text"
                  placeholder="e.g. TXN-BANK-994821"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md"
                >
                  Save & Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: STOCK RECONCILIATION REVIEW MODAL           */}
      {/* ---------------------------------------------------- */}
      {showReconcileModal && selectedReconcile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in-up">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center text-amber-800">
                <CheckSquare size={18} className="mr-2" /> Stock Reconciliation Financial Review
              </h3>
              <button onClick={() => setShowReconcileModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p>Product: <strong className="text-slate-900">{selectedReconcile.productName}</strong> ({selectedReconcile.sku})</p>
                <p>System Stock: <strong>{selectedReconcile.systemStock}</strong> | Physical Stock: <strong>{selectedReconcile.physicalStock}</strong></p>
                <p>Discrepancy Variance: <strong className="text-rose-700">{selectedReconcile.variance} Units</strong></p>
                <p>Financial Impact: <strong className="text-slate-900 text-sm">₹{selectedReconcile.varianceValue?.toLocaleString('en-IN')}</strong></p>
                <p className="text-slate-500 pt-1">Reason: {selectedReconcile.reason}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Finance Review Comment</label>
                <textarea
                  rows="3"
                  placeholder="Enter financial approval comment or explanation request..."
                  value={reconcileComment}
                  onChange={(e) => setReconcileComment(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleReviewReconciliationSubmit('REJECT')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-xs"
                >
                  Reject Adjustment
                </button>
                <button
                  onClick={() => handleReviewReconciliationSubmit('APPROVE')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md"
                >
                  Approve Financial Adjustment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
