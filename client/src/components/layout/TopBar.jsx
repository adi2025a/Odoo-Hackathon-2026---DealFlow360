import React, { useState } from 'react';
import { Search, Bell, User, LogOut, ChevronDown, Sparkles, AlertCircle, PlayCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ onTriggerScenario }) {
  const { user, demoLogin, logout, showToast } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const mockNotifications = [
    { id: 'n1', title: 'Approval Required', msg: 'Quote Q-1042 submitted with 16% discount (Risk: HIGH)', time: '5m ago' },
    { id: 'n2', title: 'Negotiation Alert', msg: 'Acme requested 18% counter-discount. Re-approval needed.', time: '20m ago' },
    { id: 'n3', title: 'Deal Health Warning', msg: 'Discount anomaly (+8.8%) detected on DEAL-1042.', time: '1h ago' }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/deals');
      showToast(`Searching for "${searchQuery}"...`, 'info');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between z-10 sticky top-0 shadow-sm">
      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md hidden sm:block">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Global Search (Deals, Quotes, Invoices, Clients, SKUs)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
      </form>

      {/* Header Right Actions */}
      <div className="flex items-center space-x-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-800">Notifications</span>
                <span className="text-xs text-blue-600 font-semibold cursor-pointer">Mark all read</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {mockNotifications.map(n => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{n.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 bg-white transition-all shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-extrabold text-slate-800 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] font-bold text-blue-600 leading-tight">{user?.role ? user.role.replace('_', ' ') : 'USER'}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-extrabold text-slate-900">{user?.name || 'Logged User'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'user@dealflow.com'}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">
                  Role: {user?.role ? user.role.replace('_', ' ') : 'USER'}
                </span>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { logout(); setShowRoleMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-bold rounded-xl flex items-center transition-all"
                >
                  <LogOut size={15} className="mr-2" /> Sign Out Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
