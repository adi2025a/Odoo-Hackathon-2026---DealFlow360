import React, { useState } from 'react';
import {
  ShieldCheck, Lock, Mail, User, Building2, LogIn, UserPlus, Sparkles, CheckCircle2,
  ArrowRight, Eye, EyeOff, ArrowLeft, Users, TrendingUp, Zap, Globe, Package, Shield, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthPage({ onBack }) {
  const { login, signup, demoLogin, showToast } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      desc: 'Create quotes, manage customers, close deals',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
      btnColor: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-500/20'
    },
    {
      role: 'SALES_MANAGER',
      title: 'Sales Manager',
      email: 'manager@dealflow.com',
      password: 'manager123',
      badge: 'APPROVALS',
      desc: 'Approve deals, manage team, monitor pipeline',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
      btnColor: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/20'
    },
    {
      role: 'FINANCE',
      title: 'Finance Manager',
      email: 'finance@dealflow.com',
      password: 'finance123',
      badge: 'MARGINS',
      desc: 'Verify margins, manage invoices, financial control',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      btnColor: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20'
    },
    {
      role: 'FACTORY',
      title: 'Factory Operations',
      email: 'factory@dealflow.com',
      password: 'factory123',
      badge: 'LOGISTICS',
      desc: 'Manage production, inventory and fulfillment',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      btnColor: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-orange-500/20'
    },
    {
      role: 'CLIENT',
      title: 'Client / Customer',
      email: 'client@acme.com',
      password: 'client123',
      badge: 'PORTAL',
      desc: 'Submit queries, track orders, communicate',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
      btnColor: 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-rose-500/20'
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
    <div className="min-h-screen bg-[#111318] text-white flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden select-none">
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: Hero Branding + Value Props + Demo Accounts */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Top Brand Pill Header */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center space-x-3 bg-white text-slate-900 px-4 py-2 rounded-2xl shadow-xl border border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                D
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-slate-900 leading-none">
                  DEALFLOW<span className="text-blue-600">360</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold leading-none mt-0.5">
                  Enterprise Deal Governance Platform
                </p>
              </div>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            )}
          </div>

          {/* Headline & Sub-headline */}
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              From Opportunity to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Outcome</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed max-w-xl">
              Unify Sales, Finance, Operations and Clients in one intelligent platform. Drive profitable growth with complete deal visibility.
            </p>
          </div>

          {/* Value Props Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2 text-xs font-bold text-slate-200">
              <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg"><TrendingUp size={14} /></div>
              <span>Higher Profitability</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2 text-xs font-bold text-slate-200">
              <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg"><ShieldCheck size={14} /></div>
              <span>Stronger Governance</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2 text-xs font-bold text-slate-200">
              <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg"><Zap size={14} /></div>
              <span>Faster Approvals</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2 text-xs font-bold text-slate-200">
              <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg"><Globe size={14} /></div>
              <span>End-to-End Visibility</span>
            </div>
          </div>

          {/* CONDITIONAL LEFT SIDE CONTAINER: Demo Accounts for Sign In | Hero Feature Image for Sign Up */}
          {!isSignup ? (
            /* 1-CLICK DEMO ACCOUNTS BOX (SHOWN ON SIGN IN) */
            <div className="bg-white text-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <Users size={16} className="text-blue-600" />
                  <span className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                    1-Click Demo Accounts
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">
                  Explore pre-configured roles
                </span>
              </div>

              <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
                {demoAccounts.map((acc) => {
                  const isSelected = loginForm.email === acc.email;
                  return (
                    <div
                      key={acc.role}
                      onClick={() => handleSelectDemoAccount(acc)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-500 shadow-sm'
                          : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 ${
                          acc.role === 'SALES_REP' ? 'bg-blue-600 text-white' :
                          acc.role === 'SALES_MANAGER' ? 'bg-purple-600 text-white' :
                          acc.role === 'FINANCE' ? 'bg-emerald-600 text-white' :
                          acc.role === 'FACTORY' ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
                        }`}>
                          {acc.title[0]}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-xs text-slate-900 truncate">{acc.title}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${acc.badgeBg}`}>
                              {acc.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{acc.email}</p>
                          <p className="text-[10px] text-slate-400 truncate">{acc.desc}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickDemoLogin(acc.role);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black shadow-xs transition-all flex items-center flex-shrink-0 ${acc.btnColor}`}
                      >
                        Login <ArrowRight size={13} className="ml-1" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* HERO IMAGE & FEATURE HIGHLIGHTS CARD (SHOWN ON SIGN UP) */
            <div className="bg-white text-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md relative group">
                <img
                  src="/auth_hero.jpg"
                  alt="DEALFLOW360 Enterprise Governance Platform"
                  className="w-full h-56 object-cover object-center transform group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex items-end p-4 text-white">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-blue-600 px-2.5 py-0.5 rounded-full tracking-wider shadow-sm">
                      Enterprise Ready Platform
                    </span>
                    <h3 className="font-extrabold text-sm mt-1.5 leading-snug">
                      Unified Query-to-Cash Automation & Deal Governance
                    </h3>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-bold text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                {[
                  'Automated Discount & Risk Score Governance Engine',
                  'Multi-Tier Manager & Finance Margin Sign-Off Workflow',
                  'Real-Time WebSocket Deal Room & Customer Collaboration',
                  'Factory Stock Allocation & Multi-Warehouse Fulfillment'
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-slate-800 font-extrabold">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Auth Form + Glowing Container + Stats Bar  */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Top Right Header Navigation Bar */}
          <div className="flex justify-end items-center">
            <div className="inline-flex items-center space-x-2 bg-white text-slate-900 px-3 py-1.5 rounded-2xl shadow-md border border-slate-200 text-xs font-bold">
              <span className="text-slate-500">
                {isSignup ? 'Already have an account?' : 'New to DealFlow360?'}
              </span>
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition-all shadow-xs"
              >
                {isSignup ? 'Sign In' : '+ Create Account'}
              </button>
            </div>
          </div>

          {/* GLOWING AUTH CARD CONTAINER */}
          <div className="bg-white text-slate-900 rounded-3xl p-7 md:p-8 shadow-[0_0_60px_rgba(59,130,246,0.35)] border border-slate-100 relative space-y-5">
            
            {/* Header Title with 3D Growth Icon */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {isSignup ? 'Create Account' : 'Welcome Back'}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  {isSignup ? 'Register your deal governance account' : 'Sign in to your DealFlow360 account'}
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 flex-shrink-0">
                <TrendingUp size={24} />
              </div>
            </div>

            {/* FORM BODY */}
            {!isSignup ? (
              /* SIGN IN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => showToast('Demo credentials preset: sales123 / manager123 / finance123 / factory123 / client123 / admin123', 'info')}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? <RefreshCw size={18} className="animate-spin" /> : (
                    <>
                      <span>Sign In & Access Dashboard</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* SIGN UP FORM */
              <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={signupForm.company}
                      onChange={(e) => setSignupForm({ ...signupForm, company: e.target.value })}
                      placeholder="e.g. Nexus Automation Pvt Ltd"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Role</label>
                  <select
                    value={signupForm.role}
                    onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CLIENT">Client / Customer (Portal Access)</option>
                    <option value="SALES_REP">Sales Representative (10% Authority)</option>
                    <option value="SALES_MANAGER">Sales Manager (25% Authority)</option>
                    <option value="FINANCE">Finance Manager (Margin Review)</option>
                    <option value="FACTORY">Factory / Logistics Ops</option>
                    <option value="ADMIN">Platform Administrator</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? <RefreshCw size={18} className="animate-spin" /> : (
                    <>
                      <UserPlus size={18} />
                      <span>Create Account & Save to MongoDB</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Security Trust Footer Banner */}
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center space-x-3 text-xs text-blue-950">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Shield size={16} />
              </div>
              <div>
                <p className="font-extrabold text-blue-900">Secure • Reliable • Built for Enterprises</p>
                <p className="text-[10px] text-blue-700">Your data is protected with enterprise-grade security.</p>
              </div>
            </div>
          </div>

          {/* BOTTOM METRICS BAR */}
          <div className="bg-white text-slate-900 rounded-3xl p-4 shadow-xl border border-slate-200 grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1 font-bold">
                <TrendingUp size={14} />
              </div>
              <div className="text-sm font-black text-slate-900">500+</div>
              <div className="text-[10px] font-bold text-slate-500">Active Deals</div>
            </div>

            <div>
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-1 font-bold">
                <Users size={14} />
              </div>
              <div className="text-sm font-black text-slate-900">100+</div>
              <div className="text-[10px] font-bold text-slate-500">Global Clients</div>
            </div>

            <div>
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-1 font-bold">
                <Package size={14} />
              </div>
              <div className="text-sm font-black text-slate-900">5</div>
              <div className="text-[10px] font-bold text-slate-500">Business Roles</div>
            </div>

            <div>
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-1 font-bold">
                <Globe size={14} />
              </div>
              <div className="text-sm font-black text-slate-900">99.9%</div>
              <div className="text-[10px] font-bold text-slate-500">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
