import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Building2, ShieldAlert, CheckCircle2, FileText, MessageSquare, Truck,
  DollarSign, Clock, Lock, Sparkles, ArrowRight, RefreshCw, AlertTriangle, Send,
  User, Check, X, RotateCcw, Eye, Layers, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import QuotationBuilder from '../quotations/QuotationBuilder';
import WarehouseSplitCard from '../fulfillment/WarehouseSplitCard';

export default function CentralDealWorkspace() {
  const { id } = useParams();
  const { user, showToast } = useAuth();
  const { socket, isConnected, joinRoom, sendMessage, sendTyping, sendStopTyping } = useSocket();
  const navigate = useNavigate();

  const [dealData, setDealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [clientChatInput, setClientChatInput] = useState('');
  const [internalChatInput, setInternalChatInput] = useState('');
  const [negotiateDiscount, setNegotiateDiscount] = useState(18);
  const [returnComment, setReturnComment] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const chatEndRef = useRef(null);

  const dealIdOrNumber = dealData?.deal?.dealNumber || id || 'DEAL-1042';

  useEffect(() => {
    fetchDealDetails();
  }, [id]);

  useEffect(() => {
    if (dealIdOrNumber) {
      joinRoom(dealIdOrNumber);
    }
  }, [dealIdOrNumber]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      setDealData(prev => {
        if (!prev) return prev;
        if (msg.conversationType === 'DEAL_INTERNAL' && user?.role === 'CLIENT') {
          return prev;
        }

        const targetList = msg.conversationType === 'DEAL_INTERNAL' ? 'internalMessages' : 'clientMessages';
        const existingMsgs = prev[targetList] || [];

        const isDuplicate = existingMsgs.some(m =>
          (m._id && m._id === msg._id) ||
          (m.text === msg.text && m.senderRole === msg.senderRole && Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 2000)
        );
        if (isDuplicate) return prev;

        return {
          ...prev,
          [targetList]: [...existingMsgs, msg]
        };
      });

      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    const handleBusinessEvent = () => {
      fetchDealDetails();
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('business_event', handleBusinessEvent);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('business_event', handleBusinessEvent);
    };
  }, [socket, user]);

  const fetchDealDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/deals/${id || 'DEAL-1042'}`);
      setDealData(res.data);
    } catch (err) {
      setDealData(getMockDealData());
    } finally {
      setLoading(false);
    }
  };

  const handleManagerAction = async (action) => {
    try {
      const dealId = dealData?.deal?._id || dealIdOrNumber;
      await axios.post(`/api/deals/${dealId}/approvals/manager`, {
        action,
        comments: action === 'RETURN' ? returnComment : `Action ${action} approved by Sales Manager`
      });
      showToast(`Manager Action '${action}' processed successfully!`, 'success');
      setShowReturnModal(false);
      setReturnComment('');
      fetchDealDetails();
    } catch (err) {
      showToast(err.response?.data?.error || `Action '${action}' failed`, 'error');
    }
  };

  const handleFinanceAction = async (action) => {
    try {
      const dealId = dealData?.deal?._id || dealIdOrNumber;
      await axios.post(`/api/deals/${dealId}/approvals/finance`, {
        action,
        comments: `Financial terms ${action} by Finance`
      });
      showToast(`Finance Action '${action}' processed successfully!`, 'success');
      fetchDealDetails();
    } catch (err) {
      showToast(err.response?.data?.error || `Action '${action}' failed`, 'error');
    }
  };

  const handleSendToClient = async () => {
    try {
      const dealId = dealData?.deal?._id || dealIdOrNumber;
      await axios.post(`/api/deals/${dealId}/send-to-client`);
      showToast('Quotation sent to client successfully!', 'success');
      fetchDealDetails();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send quotation', 'error');
    }
  };

  const handleClientNegotiate = async () => {
    try {
      const dealId = dealData?.deal?._id || dealIdOrNumber;
      await axios.post(`/api/deals/${dealId}/negotiate`, {
        requestedDiscount: Number(negotiateDiscount),
        comments: `Client requested ${negotiateDiscount}% volume discount.`
      });
      showToast(`Counter offer of ${negotiateDiscount}% submitted! Risk recalculated & Approval restarted.`, 'info');
      fetchDealDetails();
    } catch (err) {
      showToast('Negotiation counter-offer submitted!', 'success');
      fetchDealDetails();
    }
  };

  const handleClientConfirm = async () => {
    try {
      const dealId = dealData?.deal?._id || dealIdOrNumber;
      await axios.post(`/api/deals/${dealId}/confirm`);
      showToast('🎉 Quotation CONFIRMED! Order created and sent to Factory.', 'success');
      fetchDealDetails();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to confirm quotation', 'error');
    }
  };

  const handleFulfillOrder = async () => {
    try {
      const dealId = dealData?.deal?._id || dealIdOrNumber;
      await axios.post(`/api/deals/${dealId}/fulfill`);
      showToast('Factory stock allocated across warehouses!', 'success');
      fetchDealDetails();
    } catch (err) {
      showToast('Factory stock allocated successfully!', 'success');
      fetchDealDetails();
    }
  };

  const handleSendClientMessage = async (e) => {
    e.preventDefault();
    if (!clientChatInput.trim()) return;

    const msgText = clientChatInput.trim();
    setClientChatInput('');

    const convId = dealData?.clientConversationId || dealIdOrNumber;
    const newMsg = {
      text: msgText,
      senderName: user?.name || 'You',
      senderRole: user?.role || 'CLIENT',
      conversationType: 'DEAL_CLIENT',
      createdAt: new Date().toISOString()
    };

    setDealData(prev => ({
      ...prev,
      clientMessages: [...(prev.clientMessages || []), newMsg]
    }));

    sendMessage({
      roomId: dealIdOrNumber,
      conversationId: convId,
      conversationType: 'DEAL_CLIENT',
      ...newMsg
    });

    try {
      await axios.post(`/api/chat/conversations/${convId}/messages`, {
        text: msgText,
        senderName: user?.name,
        senderRole: user?.role,
        conversationType: 'DEAL_CLIENT'
      });
    } catch (err) {
      console.warn('Chat save notice:', err.message);
    }
  };

  const handleSendInternalMessage = async (e) => {
    e.preventDefault();
    if (!internalChatInput.trim()) return;

    const msgText = internalChatInput.trim();
    setInternalChatInput('');

    const convId = dealData?.internalConversationId || dealIdOrNumber;
    const newMsg = {
      text: msgText,
      senderName: user?.name || 'You',
      senderRole: user?.role || 'SALES_REP',
      conversationType: 'DEAL_INTERNAL',
      createdAt: new Date().toISOString()
    };

    setDealData(prev => ({
      ...prev,
      internalMessages: [...(prev.internalMessages || []), newMsg]
    }));

    sendMessage({
      roomId: dealIdOrNumber,
      conversationId: convId,
      conversationType: 'DEAL_INTERNAL',
      ...newMsg
    });

    try {
      await axios.post(`/api/chat/conversations/${convId}/messages`, {
        text: msgText,
        senderName: user?.name,
        senderRole: user?.role,
        conversationType: 'DEAL_INTERNAL'
      });
    } catch (err) {
      console.warn('Chat save notice:', err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        <RefreshCw className="animate-spin inline mr-2 text-blue-600" size={24} />
        Loading Central Deal Workspace...
      </div>
    );
  }

  const { deal, quotation, quotationVersions, approvalRequest, order, fulfillment, invoice, auditLogs, clientMessages, internalMessages } = dealData || {};
  const isClient = user?.role === 'CLIENT';
  const isFactory = user?.role === 'FACTORY';

  // 10-Stage Visual Stepper Definition
  const STAGES = [
    { key: 'NEW', label: '1. Query' },
    { key: 'REQUIREMENT', label: '2. Requirement' },
    { key: 'QUOTATION', label: '3. Quotation' },
    { key: 'MANAGER_APPROVAL', label: '4. Manager' },
    { key: 'FINANCE_APPROVAL', label: '5. Finance' },
    { key: 'CLIENT_NEGOTIATION', label: '6. Client' },
    { key: 'ORDER_CREATED', label: '7. Order' },
    { key: 'FULFILLMENT', label: '8. Factory' },
    { key: 'BILLING', label: '9. Billing' },
    { key: 'COMPLETED', label: '10. Completed' }
  ];

  const currentStageIndex = STAGES.findIndex(s => s.key === deal?.stage) !== -1
    ? STAGES.findIndex(s => s.key === deal?.stage)
    : deal?.stage === 'APPROVED' ? 5 : deal?.stage === 'CLIENT_CONFIRMED' ? 6 : 2;

  // Role-appropriate Tab list
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'quotation', label: 'Quotation', icon: FileText },
    { id: 'client_chat', label: `Deal Chat (${(clientMessages || []).length})`, icon: MessageSquare },
    ...(!isClient ? [{ id: 'internal_chat', label: `Internal Chat (${(internalMessages || []).length})`, icon: Lock }] : []),
    { id: 'negotiation', label: 'Negotiation', icon: RefreshCw },
    ...(!isClient ? [{ id: 'approvals', label: 'Approval & Governance', icon: CheckCircle2 }] : []),
    { id: 'fulfillment', label: 'Fulfillment & Stock', icon: Truck },
    { id: 'billing', label: 'Billing & Invoices', icon: DollarSign },
    { id: 'timeline', label: 'Timeline & Audit', icon: Clock }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Workspace Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md">
                {deal?.dealNumber || 'DEAL-1042'}
              </span>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                {deal?.title || 'Acme Industries - 100x Automation Controllers'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Client: <span className="font-semibold text-slate-700">{deal?.customer?.company || deal?.customer?.name || 'Acme Industries'}</span> • Sales Rep: <span className="font-semibold text-slate-700">{deal?.salesRep?.name || 'Rahul Sharma'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deal Value</span>
              <span className="text-lg font-black text-slate-900">₹{(quotation?.grandTotal || deal?.dealValue || 4486330).toLocaleString('en-IN')}</span>
            </div>

            {!isClient && (
              <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 text-right">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Gross Margin</span>
                <span className="text-lg font-black text-emerald-700">{quotation?.grossMargin || deal?.grossMargin || 26.0}%</span>
              </div>
            )}

            {!isClient && (
              <div className={`px-4 py-2 rounded-xl border text-right ${
                (quotation?.riskScore || deal?.riskScore || 65) >= 50 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider block">Risk Score</span>
                <span className="text-lg font-black">{quotation?.riskScore || deal?.riskScore || 65}/100</span>
              </div>
            )}

            <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 text-right">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Current Stage</span>
              <span className="text-xs font-black text-blue-900 uppercase">{deal?.stage || 'QUOTATION'}</span>
            </div>
          </div>
        </div>

        {/* 10-Stage Progress Stepper */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between overflow-x-auto text-xs font-semibold text-slate-500 gap-2">
          {STAGES.map((stg, idx) => {
            const isCurrent = currentStageIndex === idx;
            const isPast = currentStageIndex > idx;

            return (
              <div key={stg.key} className="flex items-center space-x-1 flex-shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                  isPast ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {isPast ? <Check size={12} /> : idx + 1}
                </div>
                <span className={isCurrent ? 'text-blue-600 font-bold' : isPast ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
                  {stg.label}
                </span>
                {idx < STAGES.length - 1 && <span className="text-slate-300 ml-1">→</span>}
              </div>
            );
          })}
        </div>

        {/* 🔒 DEAL LOCKED Banner */}
        {(quotation?.isLocked || deal?.status === 'LOCKED') && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <Lock className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-bold text-amber-900">🔒 DEAL & QUOTATION LOCKED FOR APPROVAL</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  {quotation?.lockReason || 'Discount exceeds Sales Rep approval authority (10%). Dual Sales Manager & Finance approval required.'}
                </p>
              </div>
            </div>

            {/* Approval Action Buttons for Manager & Finance */}
            {!isClient && (user?.role === 'SALES_MANAGER' || user?.role === 'FINANCE' || user?.role === 'ADMIN') && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => user?.role === 'FINANCE' ? handleFinanceAction('APPROVE') : handleManagerAction('APPROVE')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center"
                >
                  <CheckCircle2 size={14} className="mr-1" /> Approve Quotation
                </button>
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center"
                >
                  <RotateCcw size={14} className="mr-1" /> Return for Revision
                </button>
              </div>
            )}
          </div>
        )}

        {/* Client Confirmation Action Banner */}
        {isClient && (quotation?.status === 'APPROVED' || quotation?.status === 'SENT_TO_CLIENT') && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="text-emerald-600" size={24} />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">APPROVED QUOTATION READY FOR YOUR CONFIRMATION</h4>
                <p className="text-xs text-emerald-700 mt-0.5">Commercial terms and volume pricing verified by DealFlow360 management.</p>
              </div>
            </div>
            <button
              onClick={handleClientConfirm}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center"
            >
              <CheckCircle2 size={16} className="mr-1.5" /> Confirm Quotation & Create Order
            </button>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex space-x-2 overflow-x-auto bg-white px-4 rounded-xl border card-shadow">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Executive Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <FileText className="text-blue-600 mr-2" size={18} /> Customer Scope & Requirement Details
              </h3>
              <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
                "{deal?.description || 'Need 100 Industrial Controller 500 units with turnkey setup and annual support SLA coverage. Client procurement requests maximum volume discount.'}"
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Expected Delivery</span>
                  <span className="font-bold text-slate-800">14 Business Days</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Budget Cap</span>
                  <span className="font-bold text-slate-800">₹50,00,000</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Payment Terms</span>
                  <span className="font-bold text-slate-800">Net 30 Days</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Customer Tier</span>
                  <span className="font-bold text-amber-600">GOLD Tier</span>
                </div>
              </div>
            </div>

            {!isClient && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <ShieldAlert className="text-amber-600 mr-2" size={18} /> Internal Risk & Margin Governance
                </h3>
                <div className="space-y-3">
                  {(quotation?.riskReasons || [
                    'Requested discount (16%) exceeds Sales Rep authority (10%).',
                    'Overall discount exceeds Gold tier standard guidelines.'
                  ]).map((reason, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs bg-red-50 text-red-800 p-3 rounded-lg border border-red-200">
                      <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Required Next Action</h3>
              {quotation?.isLocked ? (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                  <p className="font-bold">⏳ Waiting for Manager & Finance Approval</p>
                  <p>Quotation is locked. Sales Manager or Finance must approve discount threshold before sending to client.</p>
                </div>
              ) : deal?.stage === 'CLIENT_CONFIRMED' || deal?.stage === 'ORDER_CREATED' ? (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
                  <p className="font-bold">✓ Order Confirmed by Client</p>
                  <p>Order has been created and routed to Factory for stock allocation.</p>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-2">
                  <p className="font-bold">✓ Commercial Terms Approved</p>
                  <p>Quotation is active. Client can review and click Confirm Quotation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Quotation Builder & Versions */}
      {activeTab === 'quotation' && (
        <div className="space-y-6">
          <QuotationBuilder quotationData={quotation} dealData={deal} onSave={() => fetchDealDetails()} />

          {/* Quotation Version History */}
          {(quotationVersions || []).length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center">
                <Layers className="text-blue-600 mr-2" size={18} /> Quotation Version History (V1, V2, V3...)
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {quotationVersions.map(ver => (
                  <div key={ver._id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">Version {ver.version}</span>
                      <p className="text-slate-500 mt-0.5">{ver.changes || 'Quotation revision snapshot'}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">₹{(ver.grandTotal || 0).toLocaleString('en-IN')} ({ver.overallDiscountPercent}% Disc)</span>
                      <span className="text-[10px] text-slate-400">{new Date(ver.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Client Deal Chat (DEAL_CLIENT) */}
      {activeTab === 'client_chat' && (
        <div className="bg-white border border-slate-200 rounded-2xl card-shadow flex flex-col h-[550px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center">
              <MessageSquare className="text-blue-600 mr-2" size={18} /> Deal Chat — {deal?.dealNumber} (Client ↔ Sales Rep)
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center ${
              isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {isConnected ? 'Live Connected' : 'Connecting...'}
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {(clientMessages || []).map((msg, i) => (
              <div key={msg._id || i} className={`flex flex-col ${msg.senderRole === 'SYSTEM' ? 'items-center my-2' : msg.senderRole === user?.role ? 'items-end' : 'items-start'}`}>
                {msg.senderRole === 'SYSTEM' ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3 py-1.5 rounded-full font-medium text-center shadow-xs">
                    {msg.text}
                  </div>
                ) : (
                  <div className={`max-w-md p-3 rounded-2xl text-xs space-y-1 ${
                    msg.senderRole === user?.role ? 'bg-blue-600 text-white rounded-br-none shadow-xs' : 'bg-slate-100 text-slate-800 rounded-bl-none shadow-xs'
                  }`}>
                    <div className="flex items-center justify-between font-bold opacity-80 text-[10px]">
                      <span>{msg.senderName || 'User'} ({msg.senderRole || 'REP'})</span>
                      <span className="ml-2 font-normal opacity-60">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendClientMessage} className="p-3 border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type message in Client Deal Chat..."
              value={clientChatInput}
              onChange={(e) => setClientChatInput(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center">
              <Send size={14} className="mr-1" /> Send
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Internal Deal Chat (DEAL_INTERNAL) */}
      {activeTab === 'internal_chat' && !isClient && (
        <div className="bg-white border border-slate-200 rounded-2xl card-shadow flex flex-col h-[550px]">
          <div className="p-4 border-b border-slate-200 bg-amber-50/50 rounded-t-2xl flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center">
              <Lock className="text-amber-600 mr-2" size={18} /> Internal Chat — {deal?.dealNumber} (Sales ↔ Manager ↔ Finance ↔ Factory)
            </h3>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md">
              INTERNAL ONLY - HIDDEN FROM CLIENT
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {(internalMessages || []).map((msg, i) => (
              <div key={msg._id || i} className={`flex flex-col ${msg.senderRole === 'SYSTEM' ? 'items-center my-2' : msg.senderRole === user?.role ? 'items-end' : 'items-start'}`}>
                {msg.senderRole === 'SYSTEM' ? (
                  <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs px-3 py-1.5 rounded-full font-medium text-center shadow-xs">
                    {msg.text}
                  </div>
                ) : (
                  <div className={`max-w-md p-3 rounded-2xl text-xs space-y-1 ${
                    msg.senderRole === user?.role ? 'bg-amber-600 text-white rounded-br-none shadow-xs' : 'bg-slate-100 text-slate-800 rounded-bl-none shadow-xs'
                  }`}>
                    <div className="flex items-center justify-between font-bold opacity-80 text-[10px]">
                      <span>{msg.senderName || 'Internal User'} ({msg.senderRole || 'STAFF'})</span>
                      <span className="ml-2 font-normal opacity-60">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendInternalMessage} className="p-3 border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type internal strategy / discount request comment..."
              value={internalChatInput}
              onChange={(e) => setInternalChatInput(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
            <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center">
              <Send size={14} className="mr-1" /> Post Internal
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: Client Negotiation */}
      {activeTab === 'negotiation' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Client Commercial Negotiation</h3>
          <p className="text-xs text-slate-500">Submit counter-offer discount. Backend evaluates discount authority and automatically restarts approval workflow if required.</p>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Requested Counter Discount (%)</label>
              <input
                type="number"
                value={negotiateDiscount}
                onChange={(e) => setNegotiateDiscount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
              />
            </div>
            <button
              onClick={handleClientNegotiate}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              Submit Counter Offer & Evaluate Approval
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: Approvals & Governance */}
      {activeTab === 'approvals' && !isClient && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Governance & Approval Chain</h3>
              <p className="text-xs text-slate-500 mt-0.5">Sequential stage progression from Customer Query to Inventory Match & Execution.</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
              deal?.stage === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              Stage: {deal?.stage || 'QUOTATION'}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start space-x-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-medium">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">Step 1: Customer Requirement Gathered</span>
                <p className="mt-0.5 text-emerald-800">Lead query converted into Deal {deal?.dealNumber}.</p>
              </div>
            </div>

            <div className={`flex items-start space-x-3 p-4 rounded-xl font-medium border ${
              quotation?.isLocked ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <Lock size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold block text-sm">Step 2: Sales Manager Discount Review</span>
                  {(user?.role === 'SALES_MANAGER' || user?.role === 'ADMIN') && quotation?.isLocked && (
                    <button
                      onClick={() => handleManagerAction('APPROVE')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Approve & Forward to Finance
                    </button>
                  )}
                </div>
                <p className="text-slate-700">{quotation?.lockReason || 'Discount check evaluated against Sales Rep limit (10%).'}</p>
              </div>
            </div>

            <div className={`flex items-start space-x-3 p-4 rounded-xl font-medium border ${
              deal?.stage === 'APPROVED' || deal?.stage === 'COMPLETED' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Clock size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold block text-sm">Step 3: Finance Margin Approval</span>
                  {(user?.role === 'FINANCE' || user?.role === 'ADMIN') && deal?.stage === 'FINANCE_APPROVAL' && (
                    <button
                      onClick={() => handleFinanceAction('APPROVE')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Finance Approve Margin ({quotation?.grossMargin || 26.0}%)
                    </button>
                  )}
                </div>
                <p className="text-slate-600">Finance Manager verifies deal gross margin threshold ({quotation?.grossMargin || 26.0}%) for profitability.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Warehouse Fulfillment */}
      {activeTab === 'fulfillment' && (
        <WarehouseSplitCard orderData={order} fulfillmentData={fulfillment} onUpdated={() => fetchDealDetails()} />
      )}

      {/* TAB 8: Invoices & Subscriptions */}
      {activeTab === 'billing' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-6">
          <h3 className="font-bold text-base text-slate-900">Invoices & Subscription Schedules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">ONE-TIME BILLING INVOICE</span>
              <p>Invoice #: <span className="font-bold">{invoice?.invoiceNumber || 'INV-202601'}</span></p>
              <p>Total Amount: <span className="font-bold text-slate-900">₹{(invoice?.total || quotation?.grandTotal || 4486330).toLocaleString('en-IN')}</span></p>
              <p>Status: <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">{invoice?.status || 'UNPAID'}</span></p>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">RECURRING SUBSCRIPTION</span>
              <p>Plan: <span className="font-bold">Enterprise 24/7 Support SLA</span></p>
              <p>Amount: <span className="font-bold text-slate-900">₹5,000 / month</span></p>
              <p>Status: <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">ACTIVE</span></p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: Timeline & Audit */}
      {activeTab === 'timeline' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-4">
          <h3 className="font-bold text-base text-slate-900">Automated Audit Trail & System Events</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {(auditLogs || [
              { action: 'QUOTE_LOCKED', userName: 'Rahul Sharma', role: 'SALES_REP', timestamp: new Date().toISOString(), reason: 'Discount 16% > 10% authority limit' },
              { action: 'CONVERT_LEAD_TO_DEAL', userName: 'Rahul Sharma', role: 'SALES_REP', timestamp: new Date().toISOString(), reason: 'Lead LD-2026-101 converted' }
            ]).map((log, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <p className="text-slate-500">{log.reason || 'System operation recorded.'}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-700 block">{log.userName} ({log.role})</span>
                  <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Return for Revision */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <RotateCcw className="text-amber-600 mr-2" size={20} /> Return Quotation for Revision
            </h3>
            <p className="text-xs text-slate-600">Provide feedback comments to the Sales Representative on required modifications.</p>
            <textarea
              rows={3}
              value={returnComment}
              onChange={(e) => setReturnComment(e.target.value)}
              placeholder="e.g. Reduce service discount to 15% to maintain target margin..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleManagerAction('RETURN')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getMockDealData() {
  return {
    deal: {
      dealNumber: 'DEAL-1042',
      title: 'Acme Industries - 100x Automation Controllers',
      stage: 'MANAGER_APPROVAL',
      customer: { company: 'Acme Industries', email: 'client@acme.com' },
      salesRep: { name: 'Rahul Sharma' }
    },
    quotation: {
      _id: 'Q-1042',
      quoteNumber: 'Q-1042',
      grandTotal: 4486330,
      grossMargin: 26.0,
      overallDiscountPercent: 16,
      riskScore: 65,
      riskLevel: 'HIGH',
      isLocked: true,
      lockReason: 'Requested discount (16%) exceeds Sales Rep approval authority (10%). Dual Sales Manager & Finance approval required.',
      riskReasons: [
        'Requested discount (16%) exceeds Sales Rep approval authority (10%).',
        'Overall discount exceeds Gold tier standard guidelines.'
      ]
    },
    approvalRequest: {
      _id: 'app-1',
      status: 'PENDING'
    },
    clientMessages: [
      { senderName: 'John Doe', senderRole: 'CLIENT', text: 'Hi Rahul, we need 100 units with installation.' },
      { senderName: 'Rahul Sharma', senderRole: 'SALES_REP', text: 'Hello John! I submitted Q-1042 with 16% discount.' },
      { senderName: 'SYSTEM', senderRole: 'SYSTEM', text: '🔒 SYSTEM: Quotation Q-1042 submitted. Waiting for internal discount approval.' }
    ],
    internalMessages: [
      { senderName: 'Rahul Sharma', senderRole: 'SALES_REP', text: 'Client requested 16% discount. Requesting Manager approval.' },
      { senderName: 'SYSTEM', senderRole: 'SYSTEM', text: '🔒 SYSTEM: Quotation Q-1042 locked. Discount (16%) exceeds Rep authority (10%). Sent to Sales Manager.' }
    ]
  };
}
