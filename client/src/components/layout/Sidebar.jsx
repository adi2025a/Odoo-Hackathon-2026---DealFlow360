import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, CheckCircle2, Package, ShoppingCart,
  Layers, ShieldAlert, BarChart3, Settings, MessageSquare, CheckSquare,
  Building2, ChevronLeft, ChevronRight, HelpCircle, UserCheck, Truck, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const userRole = user?.role || 'SALES_REP';

  const clientNav = [
    { name: 'Client portal Home', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Submit Query', path: '/client/query/new', icon: FileText },
    { name: 'My Quotation', path: '/customer/quotes', icon: CheckCircle2 },
    { name: 'My Orders', path: '/customer/orders', icon: ShoppingCart }
  ];

  const salesRepNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Leads inbox', path: '/leads', icon: Users },
    { name: 'Customer', path: '/customers', icon: UserCheck },
    { name: 'Product Catalog', path: '/products', icon: Package },
    { name: 'Subscription', path: '/subscriptions', icon: RefreshCw },
    { name: 'Task manager', path: '/tasks', icon: CheckSquare }
  ];

  const salesManagerNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Approval Queue', path: '/approvals', icon: CheckCircle2, badge: '2' },
    { name: 'Customer', path: '/customers', icon: UserCheck },
    { name: 'Product catalog', path: '/products', icon: Package },
    { name: 'Deal Health', path: '/deal-health', icon: ShieldAlert, badge: 'High Risk' },
    { name: 'Task Manager', path: '/tasks', icon: CheckSquare },
    { name: 'Analysis Report', path: '/reports', icon: BarChart3 }
  ];

  const financeNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Final approval by margin calc.', path: '/finance/approvals', icon: CheckCircle2 },
    { name: 'Inventory', path: '/inventory', icon: Truck },
    { name: 'Warehouse mang.', path: '/warehouse', icon: Layers },
    { name: 'Report & analysis', path: '/reports', icon: BarChart3 }
  ];

  const adminNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Customer Directory', path: '/customers', icon: UserCheck },
    { name: 'Product Catalog', path: '/products', icon: Package },
    { name: 'Inventory & Stock', path: '/inventory', icon: Truck },
    { name: 'Warehouse Management', path: '/warehouse', icon: Layers },
    { name: 'User Profiles & Governance', path: '/admin', icon: Users },
    { name: 'Decision Reports & Analytics', path: '/reports', icon: BarChart3 }
  ];

  const factoryNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Inventory', path: '/inventory', icon: Truck },
    { name: 'Warehouse mang.', path: '/warehouse', icon: Layers }
  ];

  const navItems =
    userRole === 'CLIENT' ? clientNav :
    userRole === 'SALES_REP' ? salesRepNav :
    userRole === 'SALES_MANAGER' ? salesManagerNav :
    userRole === 'FINANCE' ? financeNav :
    userRole === 'FACTORY' ? factoryNav :
    adminNav;

  return (
    <aside className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-20 select-none ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              D
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">DEALFLOW<span className="text-blue-600">360</span></span>
              <p className="text-[10px] text-slate-500 font-medium leading-none">Deal Engine</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 mx-auto rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xl">
            D
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
            userRole === 'CLIENT' ? 'bg-amber-100 text-amber-800' :
            user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
            user?.role === 'FINANCE' ? 'bg-emerald-100 text-emerald-800' :
            user?.role === 'SALES_MANAGER' ? 'bg-indigo-100 text-indigo-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {user?.role ? user.role.replace('_', ' ') : 'SALES REP'}
          </span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon size={20} className={`${isActive ? 'text-blue-600' : 'text-slate-400'} flex-shrink-0`} />
              {!collapsed && <span className="ml-3 flex-1">{item.name}</span>}
              {!collapsed && item.badge && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
                  item.badge === 'High Risk' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer User Info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.company || 'DealFlow360'}</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto text-xs">
            {user?.name ? user.name[0] : 'U'}
          </div>
        )}
      </div>
    </aside>
  );
}
