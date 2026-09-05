import React, { useState } from 'react';
import {
  ShieldCheck, Lock, Mail, User, Building2, LogIn, UserPlus, Sparkles, CheckCircle2, ArrowRight, Layers, Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthPage() {
  const { login, signup, demoLogin, showToast } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: 'sales@dealflow.com',
    password: 'sales123'
  });

  const [signupForm, setSignupForm] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    role: 'CLIENT'
  });

  const demoAccounts = [
    {
      role: 'SALES_REP',
      title: 'Sales Representative',
      email: 'sales@dealflow.com',
      password: 'sales123',
      badge: 'SALES',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      role: 'SALES_MANAGER',
      title: 'Sales Manager',
      email: 'manager@dealflow.com',
      password: 'manager123',
      badge: 'APPROVALS',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    },
    {
      role: 'FINANCE',
      title: 'Finance Manager',
      email: 'finance@dealflow.com',
      password: 'finance123',
      badge: 'MARGINS',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      role: 'FACTORY',
      title: 'Factory Operations',
      email: 'factory@dealflow.com',
      password: 'factory123',
      badge: 'LOGISTICS',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      role: 'CLIENT',
      title: 'Client / Customer',
      email: 'client@acme.com',
      password: 'client123',
      badge: 'PORTAL',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    {
      role: 'ADMIN',
      title: 'System Administrator',
      email: 'admin@dealflow.com',
      password: 'admin123',
      badge: 'ADMIN',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
    }
  ];

  const handleSelectDemoAccount = (acc) => {
    setIsSignup(false);
    setLoginForm({
      email: acc.email,
      password: acc.password
    });
    showToast(`Loaded ${acc.title} credentials (${acc.email})`, 'info');
  };

  const handleQuickDemoLogin = (role) => {
    demoLogin(role);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(loginForm.email, loginForm.password);
    if (!success) {
      const matchedDemo = demoAccounts.find(a => a.email.toLowerCase() === loginForm.email.toLowerCase());
      if (matchedDemo) {
        demoLogin(matchedDemo.role);
      }
    }
    setLoading(false);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setLoading(true);
    await signup(signupForm);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* LEFT PANEL: Hero Illustration on Signup / Demo Quick-Fill on Login */}
        <div className="lg:col-span-6 bg-slate-50 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between space-y-6 relative overflow-hidden">
          
          {/* Top Brand Header */}
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">DEALFLOW<span className="text-blue-600">360</span></h1>
                <p className="text-xs text-slate-500 font-bold">Enterprise Deal Governance Platform</p>
              </div>
            </div>
          </div>

          {/* Conditional Left Content: Image Illustration on Sign Up OR Demo Accounts Box on Sign In */}
          {isSignup || !showDemoAccounts ? (
            /* HERO IMAGE ILLUSTRATION */
            <div className="space-y-4 my-auto">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md relative group">
                <img
                  src="/auth_hero.jpg"
                  alt="DEALFLOW360 Enterprise Dashboard"
                  className="w-full h-64 object-cover object-center transform group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-4 text-white">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-blue-600 px-2.5 py-0.5 rounded-full tracking-wider">Enterprise Ready</span>
                    <h3 className="font-extrabold text-base mt-1">Unified Query-to-Cash Automation</h3>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  'Automated Discount & Risk Score Governance',
                  'Multi-Tier Manager & Finance Approval Engine',
                  'Real-Time WebSocket Deal Room Chat & Negotiation'
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {!isSignup && (
                <button
                  onClick={() => setShowDemoAccounts(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <Sparkles size={14} />
                  <span>Show Demo Account Shortcuts</span>
                </button>
              )}
            </div>
          ) : (
            /* DEMO ACCOUNTS QUICK-FILL PANEL */
            <div className="space-y-3 my-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center">
                  <Sparkles size={14} className="text-blue-600 mr-1.5" /> 1-Click Demo Accounts
                </span>
                <button
                  onClick={() => setShowDemoAccounts(false)}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
                >
                  Hide Demo Box
                </button>
              </div>

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {demoAccounts.map(acc => {
                  const isSelected = loginForm.email === acc.email;
                  return (
                    <div
                      key={acc.role}
                      onClick={() => handleSelectDemoAccount(acc)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 text-slate-900 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {acc.title[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-xs text-slate-900 truncate">{acc.title}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${acc.badgeColor}`}>
                              {acc.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{acc.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickDemoLogin(acc.role);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white rounded-xl text-[10px] font-bold border border-slate-200 transition-all flex items-center"
                      >
                        Instant <ArrowRight size={12} className="ml-1" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-200 flex items-center justify-between">
            <span>Offline Local Storage</span>
            <span>DEALFLOW360 v2.0</span>
          </div>
        </div>

        {/* RIGHT PANEL: White Theme Sign In / Sign Up Form */}
        <div className="lg:col-span-6 p-6 md:p-10 flex flex-col justify-center space-y-6 bg-white">
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center space-x-2 ${
                !isSignup ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn size={15} className="text-blue-600" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center space-x-2 ${
                isSignup ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus size={15} className="text-blue-600" />
              <span>Create Account</span>
            </button>
          </div>

          {!isSignup ? (
            /* SIGN IN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Sign In to Platform</h2>
                <p className="text-xs text-slate-500 font-medium">Access your deal pipeline and governance workspace.</p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="user@dealflow.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {loading ? <span>Signing In...</span> : (
                  <>
                    <span>Sign In & Access Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Create New Account</h2>
                <p className="text-xs text-slate-500 font-medium">Register a user account saved directly into MongoDB.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-2.5 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-2.5 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={signupForm.company}
                      onChange={(e) => setSignupForm({ ...signupForm, company: e.target.value })}
                      placeholder="e.g. Nexus Automation Pvt Ltd"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      placeholder="vikram@nexus.com"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Password</label>
                    <input
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">User Role</label>
                  <select
                    value={signupForm.role}
                    onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="CLIENT">Client / Customer (Portal Access)</option>
                    <option value="SALES_REP">Sales Representative (10% Authority)</option>
                    <option value="SALES_MANAGER">Sales Manager (25% Authority)</option>
                    <option value="FINANCE">Finance Manager (Margin Review)</option>
                    <option value="FACTORY">Factory / Logistics Ops</option>
                    <option value="ADMIN">Platform Administrator</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {loading ? <span>Creating Account...</span> : (
                  <>
                    <UserPlus size={16} />
                    <span>Create Account & Save to MongoDB</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
