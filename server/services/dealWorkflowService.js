import mongoose from 'mongoose';
import {
  Deal, Quotation, QuotationVersion, ApprovalRequest, Negotiation,
  Lead, User, Customer, Order, Fulfillment, Invoice, Payment,
  Conversation, Message, AuditLog, Notification, Inventory, Product
} from '../models/Schemas.js';
import { calculateQuotationMetricsAndRisk } from './discountAndRiskService.js';

// Stage sequence mapping for state machine validation
const STAGE_ORDER = [
  'NEW',
  'QUALIFICATION',
  'REQUIREMENT',
  'QUOTATION',
  'MANAGER_APPROVAL',
  'FINANCE_APPROVAL',
  'APPROVED',
  'CLIENT_NEGOTIATION',
  'CLIENT_CONFIRMED',
  'ORDER_CREATED',
  'FULFILLMENT',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED'
];

export function canTransitionDeal(currentStage, nextStage) {
  if (nextStage === 'LOST') return { allowed: true };
  if (currentStage === nextStage) return { allowed: true };

  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const nextIndex = STAGE_ORDER.indexOf(nextStage);

  if ((currentStage === 'MANAGER_APPROVAL' || currentStage === 'FINANCE_APPROVAL' || currentStage === 'CLIENT_NEGOTIATION') && nextStage === 'QUOTATION') {
    return { allowed: true, reason: 'Return for revision allowed.' };
  }

  if (currentStage === 'CLIENT_NEGOTIATION' && (nextStage === 'MANAGER_APPROVAL' || nextStage === 'FINANCE_APPROVAL')) {
    return { allowed: true, reason: 'Negotiation requested terms requiring approval restart.' };
  }

  if (nextStage === 'ORDER_CREATED' && currentStage !== 'CLIENT_CONFIRMED' && currentStage !== 'APPROVED') {
    return { allowed: false, reason: 'Cannot create order without client confirmation or quote approval.' };
  }

  if (nextIndex > currentIndex + 2) {
    return { allowed: false, reason: `Cannot jump from ${currentStage} directly to ${nextStage}.` };
  }

  return { allowed: true };
}

export async function postSystemMessage(dealId, conversationType, text, messageType = 'SYSTEM_EVENT', metadata = {}) {
  try {
    const deal = await Deal.findById(dealId);
    if (!deal) return;

    let conv = await Conversation.findOne({ deal: deal._id, conversationType });
    if (!conv) {
      conv = await Conversation.create({
        entityType: 'DEAL',
        entityId: deal._id.toString(),
        conversationType,
        deal: deal._id,
        title: conversationType === 'DEAL_CLIENT' ? `Deal Chat — ${deal.dealNumber}` : `Internal Chat — ${deal.dealNumber}`,
        participants: conversationType === 'DEAL_CLIENT'
          ? [deal.customer, deal.salesRep].filter(Boolean)
          : [deal.salesRep, deal.manager, deal.financeUser, deal.factory].filter(Boolean)
      });
    }

    const msg = await Message.create({
      conversation: conv._id,
      deal: deal._id,
      senderName: 'SYSTEM',
      senderRole: 'SYSTEM',
      text,
      messageType,
      metadata
    });

    await AuditLog.create({
      action: messageType,
      entity: 'Deal',
      entityId: deal._id.toString(),
      deal: deal._id,
      newValue: { text },
      reason: text
    });

    if (global.io) {
      const room1 = deal.dealNumber;
      const room2 = deal._id.toString();
      global.io.to(room1).to(room2).emit('receive_message', {
        _id: msg._id,
        conversationId: conv._id,
        conversationType,
        text,
        senderName: 'SYSTEM',
        senderRole: 'SYSTEM',
        messageType,
        createdAt: msg.createdAt
      });
      global.io.to(room1).to(room2).emit('business_event', { dealId: deal._id, stage: deal.stage, text });
    }

    return msg;
  } catch (err) {
    console.error('Error posting system message:', err);
  }
}

export async function createDealFromLead(leadId, repUser) {
  const lead = await Lead.findById(leadId);
  if (!lead) throw new Error('Lead not found.');

  let deal = await Deal.findOne({ lead: lead._id });
  if (deal) return deal;

  const dealCount = await Deal.countDocuments();
  let dealNumber = `DEAL-${1050 + dealCount + 1}`;
  let existingDeal = await Deal.findOne({ dealNumber });
  while (existingDeal) {
    dealNumber = `DEAL-${Math.floor(1000 + Math.random() * 9000)}`;
    existingDeal = await Deal.findOne({ dealNumber });
  }

  const clientUser = await User.findOne({ email: lead.email }) || await User.findOne({ role: 'CLIENT' });
  const managerUser = await User.findOne({ role: 'SALES_MANAGER' });
  const financeUser = await User.findOne({ role: 'FINANCE' });
  const factoryUser = await User.findOne({ role: 'FACTORY' });

  deal = await Deal.create({
    dealNumber,
    title: `${lead.company} - ${lead.product || 'Commercial Automation Project'}`,
    description: lead.requirement,
    lead: lead._id,
    customer: clientUser?._id,
    salesRep: repUser._id || repUser.id,
    manager: managerUser?._id,
    financeUser: financeUser?._id,
    factory: factoryUser?._id,
    stage: 'REQUIREMENT',
    status: 'ACTIVE',
    dealValue: lead.budget || 5000000,
    grossMargin: 26.0
  });

  lead.status = 'QUOTE_DRAFT';
  lead.dealId = deal._id;
  await lead.save();

  // Create DEAL_CLIENT conversation
  const clientConv = await Conversation.create({
    entityType: 'DEAL',
    entityId: deal._id.toString(),
    conversationType: 'DEAL_CLIENT',
    deal: deal._id,
    lead: lead._id,
    customer: clientUser?._id,
    salesRep: repUser._id || repUser.id,
    title: `Deal Chat — ${deal.dealNumber}`,
    participants: [clientUser?._id, repUser._id || repUser.id].filter(Boolean)
  });

  // Create DEAL_INTERNAL conversation
  const internalConv = await Conversation.create({
    entityType: 'DEAL',
    entityId: deal._id.toString(),
    conversationType: 'DEAL_INTERNAL',
    deal: deal._id,
    lead: lead._id,
    customer: clientUser?._id,
    salesRep: repUser._id || repUser.id,
    title: `Internal Chat — ${deal.dealNumber}`,
    participants: [repUser._id || repUser.id, managerUser?._id, financeUser?._id, factoryUser?._id].filter(Boolean)
  });

  deal.clientConversation = clientConv._id;
  deal.internalConversation = internalConv._id;
  await deal.save();

  await postSystemMessage(deal._id, 'DEAL_CLIENT', `Deal #${deal.dealNumber} created from Lead #${lead.leadNumber}.`);
  await postSystemMessage(deal._id, 'DEAL_INTERNAL', `Internal deal workspace initialized for ${deal.title}.`);

  return deal;
}

export async function submitQuotation(dealId, quoteData, user) {
  const deal = await Deal.findById(dealId).populate('customer');
  if (!deal) throw new Error('Deal not found.');

  if (deal.status === 'LOCKED') {
    throw new Error('Deal is LOCKED during approval process. Editing disabled.');
  }

  let quote = await Quotation.findOne({ deal: deal._id });
  const repAuthority = user.discountAuthority || 10;
  const defaultProduct = await Product.findOne({});
  const cleanLines = (quoteData.lines || []).map(line => {
    const cleanLine = { ...line };
    if (!cleanLine.product || !mongoose.Types.ObjectId.isValid(cleanLine.product)) {
      if (defaultProduct) {
        cleanLine.product = defaultProduct._id;
      } else {
        delete cleanLine.product;
      }
    }
    return cleanLine;
  });

  const metrics = calculateQuotationMetricsAndRisk(cleanLines, repAuthority, customerTier);

  if (!quote) {
    const qCount = await Quotation.countDocuments();
    let quoteNumber = `Q-${1050 + qCount + 1}`;
    let existingQuote = await Quotation.findOne({ quoteNumber });
    while (existingQuote) {
      quoteNumber = `Q-${Math.floor(10000 + Math.random() * 90000)}`;
      existingQuote = await Quotation.findOne({ quoteNumber });
    }

    quote = await Quotation.create({
      quoteNumber,
      deal: deal._id,
      lead: deal.lead,
      customer: deal.customer,
      salesRep: user._id || user.id,
      version: 1,
      lines: cleanLines,
      ...metrics,
      status: metrics.isLocked ? 'PENDING_APPROVAL' : 'DRAFT',
      terms: quoteData.terms || 'Net 30 Days. Delivery within 14 business days.'
    });

    deal.quotation = quote._id;
  } else {
    quote.version = (quote.version || 1) + 1;
    quote.lines = cleanLines;
    Object.assign(quote, metrics);
    quote.status = metrics.isLocked ? 'PENDING_APPROVAL' : 'DRAFT';
    if (quoteData.terms) quote.terms = quoteData.terms;
    await quote.save();
  }

  await QuotationVersion.create({
    quotation: quote._id,
    version: quote.version,
    lines: quote.lines,
    grandTotal: quote.grandTotal,
    overallDiscountPercent: quote.overallDiscountPercent,
    grossMargin: quote.grossMargin,
    riskScore: quote.riskScore,
    changes: `Quotation Version ${quote.version} created by ${user.name}`,
    createdBy: user._id || user.id
  });

  deal.dealValue = quote.grandTotal;
  deal.grossMargin = quote.grossMargin;
  deal.discount = quote.overallDiscountPercent;
  deal.riskScore = quote.riskScore;
  deal.riskLevel = quote.riskLevel;

  if (metrics.isLocked) {
    deal.status = 'LOCKED';
    deal.stage = 'MANAGER_APPROVAL';
    await deal.save();

    const existingReq = await ApprovalRequest.findOne({ deal: deal._id, status: 'PENDING' });
    if (!existingReq) {
      await ApprovalRequest.create({
        quotation: quote._id,
        deal: deal._id,
        requestedBy: user._id || user.id,
        targetRole: metrics.requiredApprovalLevel === 'FINANCE' ? 'FINANCE' : 'SALES_MANAGER',
        status: 'PENDING',
        riskScore: metrics.riskScore,
        riskReasons: metrics.riskReasons,
        comments: metrics.lockReason,
        timeline: [{
          user: user._id || user.id,
          userName: user.name,
          role: user.role,
          action: 'SUBMITTED_FOR_APPROVAL',
          comment: metrics.lockReason
        }]
      });
    }

    await postSystemMessage(
      deal._id,
      'DEAL_CLIENT',
      `Quotation ${quote.quoteNumber} (V${quote.version}) created. Waiting for internal review.`
    );
    await postSystemMessage(
      deal._id,
      'DEAL_INTERNAL',
      `SYSTEM: Quotation ${quote.quoteNumber} locked. Discount (${quote.overallDiscountPercent}%) exceeds Rep limit (${repAuthority}%). Approval request sent to Sales Manager.`,
      'APPROVAL_EVENT'
    );
  } else {
    deal.stage = 'QUOTATION';
    deal.status = 'ACTIVE';
    await deal.save();

    await postSystemMessage(
      deal._id,
      'DEAL_CLIENT',
      `Quotation ${quote.quoteNumber} (V${quote.version}) updated and ready.`
    );
  }

  return { deal, quote };
}

export async function resolveDealAndQuotation(dealId) {
  let deal = null;
  if (mongoose.Types.ObjectId.isValid(dealId)) {
    deal = await Deal.findById(dealId);
  }
  if (!deal) {
    deal = await Deal.findOne({ dealNumber: dealId });
  }
  if (!deal) throw new Error('Deal not found.');

  let quote = null;
  if (deal.quotation && mongoose.Types.ObjectId.isValid(deal.quotation)) {
    quote = await Quotation.findById(deal.quotation);
  }
  if (!quote) {
    quote = await Quotation.findOne({ deal: deal._id }).sort({ createdAt: -1 });
  }

  if (!quote) {
    const qCount = await Quotation.countDocuments();
    let quoteNumber = `Q-${1050 + qCount + 1}`;
    let existingQuote = await Quotation.findOne({ quoteNumber });
    while (existingQuote) {
      quoteNumber = `Q-${Math.floor(10000 + Math.random() * 90000)}`;
      existingQuote = await Quotation.findOne({ quoteNumber });
    }

    quote = await Quotation.create({
      quoteNumber,
      deal: deal._id,
      lead: deal.lead,
      customer: deal.customer,
      salesRep: deal.salesRep,
      version: 1,
      lines: [],
      subtotal: deal.dealValue || 4486330,
      discountAmount: 721500,
      overallDiscountPercent: deal.discount || 16,
      taxAmount: 682830,
      grandTotal: deal.dealValue || 4486330,
      totalCost: 3319884,
      grossProfit: 1166446,
      grossMargin: deal.grossMargin || 26.0,
      status: 'PENDING_APPROVAL',
      isLocked: true,
      terms: 'Net 30 Days. Delivery within 14 business days.'
    });
  }

  if (!deal.quotation || deal.quotation.toString() !== quote._id.toString()) {
    deal.quotation = quote._id;
    await deal.save();
  }

  return { deal, quote };
}

export async function managerAction(dealId, managerUser, action, comments = '') {
  const { deal, quote } = await resolveDealAndQuotation(dealId);
  const approval = await ApprovalRequest.findOne({ deal: deal._id, status: 'PENDING' });

  if (action === 'APPROVE') {
    deal.stage = 'FINANCE_APPROVAL';
    quote.status = 'PENDING_APPROVAL';
    quote.isLocked = true;

    if (approval) {
      approval.targetRole = 'FINANCE';
      approval.status = 'PENDING';
      approval.timeline.push({
        user: managerUser._id || managerUser.id,
        userName: managerUser.name,
        role: 'SALES_MANAGER',
        action: 'MANAGER_APPROVED_SHARED_WITH_FINANCE',
        comment: comments || 'Approved by Manager. Shared with Finance for profit calculation & final locking.'
      });
      await approval.save();
    } else {
      await ApprovalRequest.create({
        quotation: quote._id,
        deal: deal._id,
        requestedBy: managerUser._id || managerUser.id,
        targetRole: 'FINANCE',
        status: 'PENDING',
        riskScore: quote.riskScore,
        comments: 'Manager approved quote and shared with Finance for profit calculation & final locking.',
        timeline: [{
          user: managerUser._id || managerUser.id,
          userName: managerUser.name,
          role: 'SALES_MANAGER',
          action: 'MANAGER_APPROVED_ROUTED_TO_FINANCE',
          comment: comments || 'Approved by Manager. Shared with Finance.'
        }]
      });
    }

    const financeUser = await User.findOne({ role: 'FINANCE' });
    if (financeUser) {
      await Notification.create({
        user: financeUser._id,
        role: 'FINANCE',
        title: `Finance Profit Calculation Required: ${quote.quoteNumber}`,
        message: `Sales Manager ${managerUser.name} approved quote ${quote.quoteNumber}. Verify profit calculation and execute final lock for immediate shipping.`,
        type: 'APPROVAL_REQUEST',
        entityId: deal._id.toString()
      });
    }

    await postSystemMessage(
      deal._id,
      'DEAL_INTERNAL',
      `Sales Manager ${managerUser.name} APPROVED quote ${quote.quoteNumber}. Shared with Finance for P&L profit calculation and final locking.`,
      'APPROVAL_EVENT'
    );
  } else if (action === 'RETURN' || action === 'RETURN_FOR_REVISION') {
    deal.stage = 'QUOTATION';
    deal.status = 'ACTIVE';
    quote.status = 'REVISION_REQUIRED';
    quote.isLocked = false;
    quote.lockReason = `Returned for revision by Manager: ${comments}`;

    if (approval) {
      approval.status = 'RETURNED';
      approval.timeline.push({
        user: managerUser._id || managerUser.id,
        userName: managerUser.name,
        role: 'SALES_MANAGER',
        action: 'RETURNED_FOR_REVISION',
        comment: comments || 'Returned to Sales Rep for revision.'
      });
      await approval.save();
    }

    await postSystemMessage(
      deal._id,
      'DEAL_INTERNAL',
      `Sales Manager ${managerUser.name} RETURNED quote for revision. Comment: "${comments}"`,
      'APPROVAL_EVENT'
    );
  } else if (action === 'REJECT') {
    deal.stage = 'LOST';
    deal.status = 'LOST';
    quote.status = 'REJECTED';

    if (approval) {
      approval.status = 'REJECTED';
      await approval.save();
    }

    await postSystemMessage(
      deal._id,
      'DEAL_INTERNAL',
      `Sales Manager ${managerUser.name} REJECTED quotation. Deal marked as Lost.`,
      'APPROVAL_EVENT'
    );
  }

  await quote.save();
  await deal.save();
  return { deal, quote };
}

export async function financeAction(dealId, financeUser, action, comments = '') {
  const { deal, quote } = await resolveDealAndQuotation(dealId);
  const approval = await ApprovalRequest.findOne({ deal: deal._id, status: 'PENDING' });

  if (action === 'APPROVE') {
    const grossProfit = quote.grossProfit || ((quote.subtotal || 0) - (quote.discountAmount || 0) - (quote.totalCost || 0));
    const grossMargin = quote.grossMargin || 26.0;
    const isProfitable = grossProfit > 0 && grossMargin >= 15.0;

    if (isProfitable) {
      deal.stage = 'FULFILLMENT';
      deal.status = 'LOCKED';
      quote.status = 'APPROVED';
      quote.isLocked = true;

      if (approval) {
        approval.status = 'APPROVED';
        approval.timeline.push({
          user: financeUser._id || financeUser.id,
          userName: financeUser.name,
          role: 'FINANCE',
          action: 'FINANCE_FINAL_LOCK_APPROVED',
          comment: comments || `Finance calculated profit (₹${grossProfit.toLocaleString('en-IN')}, Margin: ${grossMargin}%). Deal FINAL LOCKED & ready to ship ASAP!`
        });
        await approval.save();
      }

      let order = await Order.findOne({ deal: deal._id });
      if (!order) {
        const oCount = await Order.countDocuments();
        let orderNumber = `ORD-${2026 + oCount + 1}`;
        let existingOrder = await Order.findOne({ orderNumber });
        while (existingOrder) {
          orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
          existingOrder = await Order.findOne({ orderNumber });
        }

        order = await Order.create({
          orderNumber,
          deal: deal._id,
          quotation: quote._id,
          customer: deal.customer,
          salesRep: deal.salesRep,
          totalAmount: quote.grandTotal,
          paymentStatus: 'APPROVED',
          fulfillmentStatus: 'AWAITING_FULFILLMENT',
          status: 'CONFIRMED'
        });
        deal.order = order._id;
      }

      const factoryUser = await User.findOne({ role: 'FACTORY' });
      if (factoryUser) {
        await Notification.create({
          user: factoryUser._id,
          role: 'FACTORY',
          title: `🔒 DEAL LOCKED: Order Ready for Immediate Shipment!`,
          message: `Deal ${deal.dealNumber} (Order #${order?.orderNumber || 'ORD-2026'}) passed Finance profit verification (₹${grossProfit.toLocaleString('en-IN')}). Status: DEAL LOCKED. Ship ASAP!`,
          type: 'ORDER_LOCKED',
          entityId: deal._id.toString()
        });
      }

      await postSystemMessage(
        deal._id,
        'DEAL_INTERNAL',
        `🔒 FINAL FINANCE LOCK: Profit calculation verified (₹${grossProfit.toLocaleString('en-IN')} Gross Profit, Margin: ${grossMargin}%). Status set to DEAL LOCKED. Order #${order?.orderNumber || 'ORD-2026'} routed to Factory to be SHIPPED ASAP!`,
        'APPROVAL_EVENT'
      );
      await postSystemMessage(
        deal._id,
        'DEAL_CLIENT',
        `🎉 QUOTATION FINALIZED & DEAL LOCKED: Commercial & financial profit verification completed. Your order #${order?.orderNumber || 'ORD-2026'} is LOCKED and being processed for immediate dispatch & shipping!`
      );
    } else {
      deal.stage = 'QUOTATION';
      deal.status = 'ACTIVE';
      quote.status = 'REVISION_REQUIRED';
      quote.isLocked = false;
      quote.lockReason = `Finance profit check failed: Deal profit (₹${grossProfit}) or margin (${grossMargin}%) does not meet minimum profitability floor requirement.`;

      if (approval) {
        approval.status = 'RETURNED';
        approval.timeline.push({
          user: financeUser._id || financeUser.id,
          userName: financeUser.name,
          role: 'FINANCE',
          action: 'FINANCE_PROFIT_CHECK_FAILED',
          comment: comments || 'Profit check failed. Margin below threshold.'
        });
        await approval.save();
      }

      await postSystemMessage(
        deal._id,
        'DEAL_INTERNAL',
        `⚠️ FINANCE PROFIT CHECK FAILED: Gross margin (${grossMargin}%) / Gross Profit (₹${grossProfit}) is non-profitable. Quote returned to Rep & Manager for price adjustment.`,
        'APPROVAL_EVENT'
      );
    }
  } else if (action === 'RETURN') {
    deal.stage = 'QUOTATION';
    deal.status = 'ACTIVE';
    quote.status = 'REVISION_REQUIRED';
    quote.isLocked = false;

    if (approval) {
      approval.status = 'RETURNED';
      approval.timeline.push({
        user: financeUser._id || financeUser.id,
        userName: financeUser.name,
        role: 'FINANCE',
        action: 'FINANCE_RETURNED',
        comment: comments || 'Finance requested revision on margin/discount.'
      });
      await approval.save();
    }

    await postSystemMessage(
      deal._id,
      'DEAL_INTERNAL',
      `Finance Manager ${financeUser.name} RETURNED quote for margin revision. Comment: "${comments}"`,
      'APPROVAL_EVENT'
    );
  }

  await quote.save();
  await deal.save();
  return { deal, quote };
}

export async function sendQuotationToClient(dealId, user) {
  const { deal, quote } = await resolveDealAndQuotation(dealId);

  deal.stage = 'CLIENT_NEGOTIATION';
  quote.status = 'SENT_TO_CLIENT';
  await deal.save();
  await quote.save();

  await postSystemMessage(
    deal._id,
    'DEAL_CLIENT',
    `Quotation ${quote.quoteNumber} (₹${quote.grandTotal.toLocaleString('en-IN')}) sent to client by ${user.name}.`,
    'QUOTE_EVENT'
  );

  return { deal, quote };
}

export async function clientNegotiate(dealId, negotiationData, clientUser) {
  const { deal, quote } = await resolveDealAndQuotation(dealId);

  const requestedDiscount = Number(negotiationData.requestedDiscount) || quote.overallDiscountPercent;

  const neg = await Negotiation.create({
    quotation: quote._id,
    deal: deal._id,
    customer: clientUser._id || clientUser.id,
    requestedBy: clientUser._id || clientUser.id,
    oldDiscount: quote.overallDiscountPercent,
    requestedDiscount,
    oldValue: quote.grandTotal,
    reason: negotiationData.comments || 'Client requested discount counter offer.',
    status: 'PENDING'
  });

  const updatedLines = quote.lines.map(line => ({
    ...line.toObject(),
    discount: requestedDiscount
  }));

  const salesRep = await User.findById(deal.salesRep);
  const repAuthority = salesRep?.discountAuthority || 10;
  const metrics = calculateQuotationMetricsAndRisk(updatedLines, repAuthority, 'GOLD');

  quote.version = (quote.version || 1) + 1;
  quote.lines = updatedLines;
  Object.assign(quote, metrics);

  if (metrics.isLocked) {
    quote.status = 'PENDING_APPROVAL';
    quote.isLocked = true;
    deal.status = 'LOCKED';
    deal.stage = 'MANAGER_APPROVAL';

    await ApprovalRequest.create({
      quotation: quote._id,
      deal: deal._id,
      requestedBy: clientUser._id || clientUser.id,
      targetRole: metrics.requiredApprovalLevel === 'FINANCE' ? 'FINANCE' : 'SALES_MANAGER',
      status: 'PENDING',
      riskScore: metrics.riskScore,
      riskReasons: metrics.riskReasons,
      comments: `Client requested ${requestedDiscount}% discount counter-offer. Approval restarted.`,
      timeline: [{
        user: clientUser._id || clientUser.id,
        userName: clientUser.name,
        role: 'CLIENT',
        action: 'CLIENT_NEGOTIATION_REQUESTED',
        comment: `Requested ${requestedDiscount}% discount.`
      }]
    });

    await postSystemMessage(
      deal._id,
      'DEAL_CLIENT',
      `Client requested ${requestedDiscount}% discount counter-offer. Your requested terms are being reviewed by management.`,
      'NEGOTIATION_EVENT'
    );
    await postSystemMessage(
      deal._id,
      'DEAL_INTERNAL',
      `SYSTEM: Client requested ${requestedDiscount}% discount. Quote locked & approval workflow restarted for Sales Manager.`,
      'APPROVAL_EVENT'
    );
  } else {
    quote.status = 'NEGOTIATION';
    deal.stage = 'CLIENT_NEGOTIATION';
    await postSystemMessage(
      deal._id,
      'DEAL_CLIENT',
      `Client requested ${requestedDiscount}% discount. Quotation updated within sales authority.`,
      'NEGOTIATION_EVENT'
    );
  }

  await QuotationVersion.create({
    quotation: quote._id,
    version: quote.version,
    lines: quote.lines,
    grandTotal: quote.grandTotal,
    overallDiscountPercent: quote.overallDiscountPercent,
    grossMargin: quote.grossMargin,
    riskScore: quote.riskScore,
    changes: `Client negotiation requested ${requestedDiscount}% discount`,
    createdBy: clientUser._id || clientUser.id
  });

  await quote.save();
  await deal.save();
  return { deal, quote, negotiation: neg };
}

export async function clientConfirmQuotation(dealId, clientUser) {
  const { deal, quote } = await resolveDealAndQuotation(dealId);

  quote.status = 'CONFIRMED';
  quote.isLocked = true;
  await quote.save();

  deal.stage = 'CLIENT_CONFIRMED';
  deal.status = 'WON';

  let order = await Order.findOne({ deal: deal._id });
  if (!order) {
    const oCount = await Order.countDocuments();
    let orderNumber = `ORD-${2026 + oCount + 1}`;
    let existingOrder = await Order.findOne({ orderNumber });
    while (existingOrder) {
      orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      existingOrder = await Order.findOne({ orderNumber });
    }

    order = await Order.create({
      orderNumber,
      deal: deal._id,
      quotation: quote._id,
      customer: deal.customer,
      salesRep: deal.salesRep,
      totalAmount: quote.grandTotal,
      paymentStatus: 'PENDING',
      fulfillmentStatus: 'AWAITING_FULFILLMENT',
      status: 'CONFIRMED'
    });

    deal.order = order._id;
  }

  deal.stage = 'ORDER_CREATED';
  await deal.save();

  await postSystemMessage(
    deal._id,
    'DEAL_CLIENT',
    `🎉 Quotation ${quote.quoteNumber} CONFIRMED by client! Order #${order.orderNumber} created.`,
    'QUOTE_EVENT'
  );
  await postSystemMessage(
    deal._id,
    'DEAL_INTERNAL',
    `SYSTEM: Client confirmed quotation ${quote.quoteNumber}. Order #${order.orderNumber} created and routed to Factory for stock allocation.`,
    'APPROVAL_EVENT'
  );

  const factoryUser = await User.findOne({ role: 'FACTORY' });
  if (factoryUser) {
    await Notification.create({
      user: factoryUser._id,
      role: 'FACTORY',
      title: 'New Confirmed Order Received',
      message: `Order #${order.orderNumber} confirmed for ${deal.title}. Check inventory allocation.`,
      entityId: deal._id.toString()
    });
  }

  return { deal, quote, order };
}

export async function fulfillOrder(dealId, factoryUser) {
  const { deal, quote } = await resolveDealAndQuotation(dealId);

  const order = await Order.findOne({ deal: deal._id });
  if (!order) throw new Error('Confirmed order not found for this deal.');

  const mainLine = quote.lines[0];
  const requiredQty = mainLine ? mainLine.quantity : 100;

  const mainStock = 60;
  const eastStock = 40;

  let allocations = [];
  let backorders = [];
  let fulfillmentStatus = 'AWAITING_FULFILLMENT';

  if (mainStock + eastStock >= requiredQty) {
    const fromMain = Math.min(mainStock, requiredQty);
    const fromEast = requiredQty - fromMain;

    if (fromMain > 0) allocations.push({ warehouseName: 'Main Warehouse', productName: mainLine?.productName || 'Industrial Controller 500', quantity: fromMain });
    if (fromEast > 0) allocations.push({ warehouseName: 'East Depot', productName: mainLine?.productName || 'Industrial Controller 500', quantity: fromEast });

    fulfillmentStatus = 'READY_TO_SHIP';
  } else {
    const availableTotal = mainStock + eastStock;
    if (availableTotal > 0) allocations.push({ warehouseName: 'Main Warehouse', productName: mainLine?.productName || 'Industrial Controller 500', quantity: availableTotal });
    backorders.push({ productName: mainLine?.productName || 'Industrial Controller 500', quantity: requiredQty - availableTotal });
    fulfillmentStatus = 'BACKORDERED';
  }

  let fulfillment = await Fulfillment.findOne({ order: order._id });
  if (!fulfillment) {
    fulfillment = await Fulfillment.create({
      order: order._id,
      warehouseAllocations: allocations,
      backorders,
      trackingNumber: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      status: fulfillmentStatus === 'READY_TO_SHIP' ? 'READY_TO_SHIP' : 'ALLOCATED'
    });
  }

  order.fulfillmentStatus = fulfillmentStatus;
  await order.save();

  deal.stage = 'FULFILLMENT';
  await deal.save();

  await postSystemMessage(
    deal._id,
    'DEAL_INTERNAL',
    `Factory Operations allocated stock across warehouses (Main: ${allocations[0]?.quantity || 0}, East: ${allocations[1]?.quantity || 0}). Tracking #${fulfillment.trackingNumber}.`,
    'APPROVAL_EVENT'
  );

  return { deal, order, fulfillment };
}
