import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, ArrowRight, CheckCircle2, Sparkles, Menu, X,
  Percent, GitBranch, MessageSquare, FileText, Truck, LineChart,
  Users, UserCog, Wallet, Factory, UserSquare2, Settings,
  Zap, Clock, Lock, Star
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Platform', href: '#features' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Roles', href: '#roles' },
];

const FEATURES = [
  {
    icon: Percent,
    color: 'blue',
    title: 'Automated Discount & Risk Governance',
    desc: 'Every quote is scored in real time against margin and risk thresholds, so out-of-policy deals are flagged before they ever reach a customer.',
  },
  {
    icon: GitBranch,
    color: 'indigo',
    title: 'Multi-Tier Approval Engine',
    desc: 'Discount authority routes automatically from Sales Rep to Manager to Finance, with a full audit trail on every escalation and sign-off.',
  },
  {
    icon: MessageSquare,
    color: 'purple',
    title: 'Real-Time Deal Room Chat',
    desc: 'Negotiate, clarify, and close inside a live WebSocket deal room — no more losing context across email threads and spreadsheets.',
  },
  {
    icon: FileText,
    color: 'sky',
    title: 'Instant Quotation Builder',
    desc: 'Generate accurate, branded quotations from your live product and pricing catalog in seconds, ready for one-click approval routing.',
  },
  {
    icon: Truck,
    color: 'teal',
    title: 'Multi-Warehouse Fulfillment',
    desc: 'Automatically split stock across warehouses, consolidate backorders, and track every shipment from factory floor to doorstep.',
  },
  {
    icon: LineChart,
    color: 'emerald',
    title: 'Finance Command Center',
    desc: 'Inventory valuation, AR aging, reconciliation, and P&L sign-off in one executive dashboard — close the books with confidence.',
  },
];

const WORKFLOW_STEPS = [
  { step: '01', title: 'Query', desc: 'Client submits a request through the self-serve portal.' },
  { step: '02', title: 'Quote', desc: 'Sales builds a priced, policy-checked quotation instantly.' },
  { step: '03', title: 'Approve', desc: 'Discounts route through manager & finance governance.' },
  { step: '04', title: 'Fulfill', desc: 'Factory splits and ships stock across warehouses.' },
  { step: '05', title: 'Invoice', desc: 'Billing triggers automatically on delivery milestones.' },
  { step: '06', title: 'Cash', desc: 'Finance reconciles payment and signs off the P&L.' },
];

const ROLES = [
  { icon: Users, name: 'Sales Rep', color: 'blue', desc: 'Own the pipeline, build quotes, and track every deal in flight.' },
  { icon: UserCog, name: 'Sales Manager', color: 'purple', desc: 'Approve discounts, monitor deal health, and clear stalled deals.' },
  { icon: Wallet, name: 'Finance', color: 'emerald', desc: 'Review margins, manage AR, and sign off the executive P&L.' },
  { icon: Factory, name: 'Factory Ops', color: 'teal', desc: 'Split warehouse stock and consolidate multi-site backorders.' },
  { icon: UserSquare2, name: 'Client Portal', color: 'amber', desc: 'Submit queries, track orders, and chat directly with the deal team.' },
  { icon: Settings, name: 'Admin', color: 'rose', desc: 'Full system oversight, user governance, and platform configuration.' },
];

const STATS = [
  { value: '360°', label: 'Query-to-Cash Visibility' },
  { value: '6', label: 'Role-Tailored Workspaces' },
  { value: '100%', label: 'Approval Audit Trail' },
  { value: 'Real-Time', label: 'Deal Room Collaboration' },
];

const COLOR_MAP = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'group-hover:ring-blue-200', chip: 'bg-blue-100 text-blue-700' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'group-hover:ring-indigo-200', chip: 'bg-indigo-100 text-indigo-700' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'group-hover:ring-purple-200', chip: 'bg-purple-100 text-purple-700' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-600', ring: 'group-hover:ring-sky-200', chip: 'bg-sky-100 text-sky-700' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', ring: 'group-hover:ring-teal-200', chip: 'bg-teal-100 text-teal-700' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'group-hover:ring-emerald-200', chip: 'bg-emerald-100 text-emerald-700' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'group-hover:ring-amber-200', chip: 'bg-amber-100 text-amber-700' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'group-hover:ring-rose-200', chip: 'bg-rose-100 text-rose-700' },
};

function WorkflowStepCard({ step, index, isLast }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 22;
    const rotateX = (0.5 - py) * 22;
    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px)`;
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  };

  return (
    <div className="relative">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="workflow-card-3d bg-white/5 border border-white/10 rounded-2xl p-5 h-full"
      >
        <span className="workflow-number-3d text-3xl font-black text-blue-400/90">{step.step}</span>
        <h3 className="font-extrabold text-sm mt-2 mb-1.5">{step.title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
      </div>
      {!isLast && (
        <div className="hidden lg:block absolute top-1/2 -right-4 w-8 -translate-y-1/2 z-10">
          <div className="flow-connector">
            <span className="flow-connector-dot" style={{ animationDelay: `${index * 0.35}s` }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function LandingPage({ onGetStarted, onSignIn }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const spotlightRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleMouseMove = (e) => {
    const el = spotlightRef.current;
    if (!el) return;
    el.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
  };

  return (
    <div className="relative min-h-screen text-slate-900 font-sans overflow-x-hidden" onMouseMove={handleMouseMove}>

      {/* ============ AMBIENT AURORA GRADIENT BACKGROUND ============ */}
      <div className="landing-aurora" aria-hidden="true">
        <span className="aurora-blob aurora-blob-1" />
        <span className="aurora-blob aurora-blob-2" />
        <span className="aurora-blob aurora-blob-3" />
        <span className="aurora-blob aurora-blob-4" />
        <span ref={spotlightRef} className="aurora-spotlight" />
      </div>

      {/* ============ NAVBAR ============ */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm' : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              DEALFLOW<span className="text-blue-600">360</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href} className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <button onClick={onSignIn} className="text-sm font-bold text-slate-700 hover:text-slate-900 px-3 py-2 transition-colors">
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center space-x-1.5"
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <button className="md:hidden text-slate-700" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle menu">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-5 py-4 space-y-3">
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block text-sm font-bold text-slate-700 py-1.5">
                {link.label}
              </a>
            ))}
            <div className="flex space-x-3 pt-2">
              <button onClick={onSignIn} className="flex-1 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl py-2.5">
                Sign In
              </button>
              <button onClick={onGetStarted} className="flex-1 text-sm font-extrabold text-white bg-blue-600 rounded-xl py-2.5">
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ============ HERO ============ */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-5 md:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-7 animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
              <Sparkles size={13} />
              <span>Enterprise Deal Governance Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black tracking-tight leading-[1.08] text-slate-900">
              Query to Cash,<br />
              <span className="gradient-text-blue">Unified in One Platform.</span>
            </h1>

            <p className="text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
              DEALFLOW360 connects sales, approvals, fulfillment, and finance into a single governed
              workflow — so every deal moves from first query to reconciled cash without falling through
              the cracks.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={onGetStarted}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight size={17} />
              </button>
              <button
                onClick={onSignIn}
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold rounded-2xl border border-slate-200 transition-all flex items-center justify-center space-x-2"
              >
                <span>Explore Demo Accounts</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-bold text-slate-500">
              <span className="flex items-center space-x-1.5"><CheckCircle2 size={15} className="text-emerald-500" /><span>No credit card required</span></span>
              <span className="flex items-center space-x-1.5"><CheckCircle2 size={15} className="text-emerald-500" /><span>1-click demo accounts</span></span>
              <span className="flex items-center space-x-1.5"><CheckCircle2 size={15} className="text-emerald-500" /><span>Role-based workspaces</span></span>
            </div>
          </div>

          <div className="lg:col-span-6 relative perspective-1400">
            <div className="hero-tilt-3d relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-900/10 group">
              <img
                src="/auth_hero.jpg"
                alt="DEALFLOW360 platform preview"
                className="w-full h-[280px] sm:h-[360px] md:h-[420px] object-cover object-center transform group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/10 to-transparent" />

              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase bg-blue-600 text-white px-2.5 py-1 rounded-full tracking-wider shadow">
                  Live Deal Room
                </span>
                <span className="flex items-center space-x-1.5 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-black text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Synced</span>
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-extrabold text-lg">DEAL-1042 &middot; Nexus Automation</h3>
                <p className="text-xs text-slate-200 font-semibold">Awaiting Finance sign-off &bull; Margin 34.2%</p>
              </div>
            </div>

            {/* Floating stat card */}
            <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 items-center space-x-3 animate-float">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Wallet size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">P&amp;L Signed Off</p>
                <p className="text-sm font-black text-slate-900">$1.24M this quarter</p>
              </div>
            </div>

            <div className="hidden sm:flex absolute -top-6 -right-6 bg-white rounded-2xl border border-slate-200 shadow-xl px-4 py-3 items-center space-x-2.5">
              <Zap size={16} className="text-blue-600" />
              <span className="text-xs font-black text-slate-800">Auto-Routed in 12s</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS STRIP ============ */}
      <section className="border-y border-slate-200 bg-white/40 backdrop-blur-sm py-10 px-5 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <div key={i} className="text-center md:text-left">
              <p className="text-2xl md:text-3xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Platform Capabilities</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              Everything your revenue engine needs, in one place
            </h2>
            <p className="text-slate-600 font-medium">
              Purpose-built modules for governance, fulfillment, and finance — connected end-to-end so no deal stalls in a handoff.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const c = COLOR_MAP[f.color];
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className={`feature-card-3d group p-6 rounded-3xl border border-slate-200 bg-white ring-1 ring-transparent ${c.ring} transition-all`}
                >
                  <div className={`feature-icon-3d w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center mb-5`}>
                    <Icon size={24} className={c.text} />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ WORKFLOW ============ */}
      <section id="workflow" className="py-20 md:py-28 px-5 md:px-8 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 -z-0 opacity-40" style={{
          background: 'radial-gradient(at 20% 20%, rgba(37,99,235,0.25) 0px, transparent 45%), radial-gradient(at 80% 80%, rgba(147,51,234,0.2) 0px, transparent 45%)'
        }} />
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400">The Workflow</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              From first query to reconciled cash
            </h2>
            <p className="text-slate-300 font-medium">
              A single governed pipeline that every role sees from their own lens — nothing gets lost between teams.
            </p>
          </div>

          <div className="relative perspective-1400">
            <div className="workflow-floor" />
            <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {WORKFLOW_STEPS.map((s, i) => (
                <WorkflowStepCard key={i} step={s} index={i} isLast={i === WORKFLOW_STEPS.length - 1} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ ROLES ============ */}
      <section id="roles" className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Built For Every Role</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              A tailored workspace for everyone on the deal
            </h2>
            <p className="text-slate-600 font-medium">
              Six dedicated dashboards, one shared source of truth — nobody works from a stale spreadsheet again.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROLES.map((r, i) => {
              const c = COLOR_MAP[r.color];
              const Icon = r.icon;
              return (
                <div key={i} className="p-6 rounded-3xl border border-slate-200 hover-lift transition-all">
                  <div className={`w-11 h-11 rounded-2xl ${c.bg} flex items-center justify-center mb-4`}>
                    <Icon size={22} className={c.text} />
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-extrabold text-slate-900">{r.name}</h3>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${c.chip}`}>Workspace</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ SOCIAL PROOF / TRUST ============ */}
      <section className="py-16 px-5 md:px-8 bg-white/40 backdrop-blur-sm border-y border-slate-200">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="flex justify-center space-x-1">
            {[...Array(5)].map((_, i) => <Star key={i} size={18} className="text-amber-400 fill-amber-400" />)}
          </div>
          <p className="text-xl md:text-2xl font-bold text-slate-800 leading-snug max-w-3xl mx-auto">
            &ldquo;DEALFLOW360 collapsed six disconnected handoffs into one governed pipeline. Our finance
            close time dropped and nothing slips through anymore.&rdquo;
          </p>
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm">VM</div>
            <div className="text-left">
              <p className="text-sm font-extrabold text-slate-900">Vikram Malhotra</p>
              <p className="text-xs text-slate-500 font-semibold">Operations Director, Nexus Automation</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '28px 28px'
          }} />
          <div className="relative space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/15 border border-white/20 text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
              <Lock size={13} />
              <span>Enterprise-Grade Governance</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight max-w-2xl mx-auto">
              Ready to unify your revenue engine?
            </h2>
            <p className="text-blue-100 font-medium max-w-xl mx-auto">
              Spin up a workspace in minutes, or jump straight into a role-based demo account — no setup required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={onGetStarted}
                className="px-6 py-3.5 bg-white text-blue-700 font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 hover:bg-blue-50"
              >
                <span>Create Free Account</span>
                <ArrowRight size={17} />
              </button>
              <button
                onClick={onSignIn}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-extrabold rounded-2xl transition-all"
              >
                Try a Demo Account
              </button>
            </div>
            <p className="text-xs text-blue-200 font-bold flex items-center justify-center space-x-1.5 pt-1">
              <Clock size={13} />
              <span>Average setup time: under 2 minutes</span>
            </p>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-slate-200 py-10 px-5 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="text-white" size={16} />
            </div>
            <span className="text-sm font-black tracking-tight text-slate-900">
              DEALFLOW<span className="text-blue-600">360</span>
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400">
            &copy; {new Date().getFullYear()} DEALFLOW360. Enterprise Deal Governance Platform.
          </p>
          <div className="flex items-center space-x-5 text-xs font-bold text-slate-500">
            <a href="#features" className="hover:text-slate-800">Platform</a>
            <a href="#workflow" className="hover:text-slate-800">Workflow</a>
            <a href="#roles" className="hover:text-slate-800">Roles</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
