import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import SalesDashboard from './components/dashboards/SalesDashboard';
import ManagerDashboard from './components/dashboards/ManagerDashboard';
import FinanceDashboard from './components/dashboards/FinanceDashboard';
import FactoryDashboard from './components/dashboards/FactoryDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import AdminDashboardOverview from './components/dashboards/AdminDashboardOverview';
import CentralDealWorkspace from './components/deals/CentralDealWorkspace';
import ClientPortal from './components/client/ClientPortal';
import ReportsView from './components/reports/ReportsView';
import QuotationBuilder from './components/quotations/QuotationBuilder';
import WarehouseSplitCard from './components/fulfillment/WarehouseSplitCard';

import AuthPage from './components/auth/AuthPage';

function MainLayout() {
  const { user, loading, toast, demoLogin, showToast } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading DEALFLOW360 Environment...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold transition-all ${
            toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-700' :
            toast.type === 'error' ? 'bg-red-600 text-white border-red-700' :
            'bg-slate-900 text-white border-slate-800'
          }`}>
            {toast.message}
          </div>
        )}
        <AuthPage />
      </>
    );
  }

  const handleTriggerScenario = (scenarioKey) => {
    if (scenarioKey === 'SCENARIO_1') {
      demoLogin('SALES_REP');
      navigate('/deals/DEAL-1042');
      showToast('Scenario 1 Triggered: Full End-to-End Query to Cash Deal!', 'info');
    } else if (scenarioKey === 'SCENARIO_2') {
      demoLogin('FACTORY');
      navigate('/deals/DEAL-1042');
      showToast('Scenario 2 Triggered: Multi-Warehouse Stock Split & Backorder Consolidation!', 'info');
    } else if (scenarioKey === 'SCENARIO_3') {
      demoLogin('FINANCE');
      navigate('/subscriptions');
      showToast('Scenario 3 Triggered: Hybrid Billing & Mid-Cycle Proration!', 'info');
    } else if (scenarioKey === 'SCENARIO_4') {
      demoLogin('SALES_MANAGER');
      navigate('/deal-health');
      showToast('Scenario 4 Triggered: Stalled Deal & Escalation Alert!', 'info');
    }
  };

  const renderDashboardByRole = () => {
    switch (user?.role) {
      case 'CLIENT':
        return <ClientPortal view="dashboard" />;
      case 'SALES_MANAGER':
        return <ManagerDashboard />;
      case 'FINANCE':
        return <FinanceDashboard />;
      case 'FACTORY':
        return <FactoryDashboard />;
      case 'ADMIN':
        return <AdminDashboardOverview />;
      default:
        return <SalesDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold transition-all ${
          toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-700' :
          toast.type === 'error' ? 'bg-red-600 text-white border-red-700' :
          'bg-slate-900 text-white border-slate-800'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onTriggerScenario={handleTriggerScenario} />

        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Routes>
            <Route path="/" element={renderDashboardByRole()} />
            <Route path="/leads" element={<SalesDashboard viewMode="leads" />} />
            <Route path="/deals" element={<CentralDealWorkspace />} />
            <Route path="/deals/:id" element={<CentralDealWorkspace />} />
            <Route path="/quotations" element={<div className="p-6"><QuotationBuilder /></div>} />
            <Route path="/customers" element={<SalesDashboard viewMode="customers" />} />
            <Route path="/products" element={<SalesDashboard viewMode="products" />} />
            <Route path="/tasks" element={<SalesDashboard viewMode="tasks" />} />
            <Route path="/approvals" element={<ManagerDashboard viewMode="approvals" />} />
            <Route path="/finance/approvals" element={<FinanceDashboard viewMode="approvals" />} />
            <Route path="/inventory" element={<div className="p-6"><WarehouseSplitCard /></div>} />
            <Route path="/warehouse" element={<div className="p-6"><WarehouseSplitCard /></div>} />
            <Route path="/fulfillment" element={<div className="p-6"><WarehouseSplitCard /></div>} />
            <Route path="/subscriptions" element={<FinanceDashboard viewMode="subscriptions" />} />
            <Route path="/invoices" element={<FinanceDashboard viewMode="invoices" />} />
            <Route path="/chat" element={<CentralDealWorkspace />} />
            <Route path="/deal-health" element={<ManagerDashboard viewMode="deal-health" />} />
            <Route path="/reports" element={<ReportsView />} />
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Client Portal Routes */}
            <Route path="/client/query/new" element={<ClientPortal view="new-query" />} />
            <Route path="/customer/dashboard" element={<ClientPortal view="dashboard" />} />
            <Route path="/customer/quotes" element={<ClientPortal view="quotes" />} />
            <Route path="/customer/orders" element={<ClientPortal view="dashboard" />} />
            <Route path="/customer/invoices" element={<ClientPortal view="dashboard" />} />
            <Route path="/customer/chat" element={<CentralDealWorkspace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

import { SocketProvider } from './context/SocketContext';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
