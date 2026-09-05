import {
  Deal, Quotation, QuotationVersion, ApprovalRequest, Negotiation,
  Lead, User, Customer, Order, Fulfillment, Invoice, Payment,
  Conversation, Message, AuditLog, Notification, Inventory
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

/**
 * Validates whether a deal stage transition is valid under business rules.
 */
export function canTransitionDeal(currentStage, nextStage, context = {}) {
  if (nextStage === 'LOST') return { allowed: true };
  if (currentStage === nextStage) return { allowed: true };

  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const nextIndex = STAGE_ORDER.indexOf(nextStage);

  // Return for revision (going backward to QUOTATION)
  if ((currentStage === 'MANAGER_APPROVAL' || currentStage === 'FINANCE_APPROVAL' || currentStage === 'CLIENT_NEGOTIATION') && nextStage === 'QUOTATION') {
    return { allowed: true, reason: 'Return for revision allowed.' };
  }

  // Client negotiation restarting approval
  if (currentStage === 'CLIENT_NEGOTIATION' && (nextStage === 'MANAGER_APPROVAL' || nextStage === 'FINANCE_APPROVAL')) {
    return { allowed: true, reason: 'Negotiation requested terms requiring approval restart.' };
  }

  // Direct invalid jumps
  if (nextStage === 'ORDER_CREATED' && currentStage !== 'CLIENT_CONFIRMED' && currentStage !== 'APPROVED') {
    return { allowed: false, reason: 'Cannot create order without client confirmation or quote approval.' };
  }

  if (nextStage === 'COMPLETED' && currentStage !== 'DELIVERED' && currentStage !== 'FULFILLMENT') {
    return { allowed: false, reason: 'Deal can only be completed after delivery and payment.' };
  }

  if (nextIndex > currentIndex + 2) {
    return { allowed: false, reason: `Cannot jump from ${currentStage} directly to ${nextStage}.` };
  }

  return { allowed: true };
}

/**
 * Post a system message into DEAL_CLIENT or DEAL_INTERNAL chat and broadcast via Socket.IO.
 */
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

    // Write audit log
    await AuditLog.create({
      action: messageType,
      entity: 'Deal',
      entityId: deal._id.toString(),
      deal: deal._id,
      newValue: { text },
      reason: text
    });

    // Broadcast over WebSocket if available
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

/**
 * Create Deal from Lead (Converts Lead to Deal + Dual Conversations)
 */
export async function createDealFromLead(leadId, repUser) {
  const lead = await Lead.findById(leadId);
  if (!lead) throw new Error('Lead not found.');

  let deal = await Deal.findOne({ lead: lead._id });
  if (deal) return deal;

  const dealCount = await Deal.countDocuments();
  const dealNumber = `DL-${1040 + dealCount + 1}`;

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
    dealValue: lead.budget || 1000000,
    grossMargin: 25.0
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

/**
 * Submit or update quotation for a deal.
 */
export async function submitQuotation(dealId, quoteData, user) {
  const deal = await Deal.findById(dealId).populate('customer');
  if (!deal) throw new Error('Deal not found.');

  if (deal.status === 'LOCKED') {
    throw new Error('Deal is LOCKED during approval process. Editing disabled.');
  }

  let quote = await Quotation.findOne({ deal: deal._id });
  const repAuthority = user.discountAuthority || 10;
  const customerTier = deal.customer?.tier || 'BRONZE';

  const metrics = calculateQuotationMetricsAndRisk(quoteData.lines || [], repAuthority, customerTier);

  if (!quote) {
    const qCount = await Quotation.countDocuments();
    const quoteNumber = `Q-${1040 + qCount + 1}`;

    quote = await Quotation.create({
      quoteNumber,
      deal: deal._id,
      lead: deal.lead,
      customer: deal.customer,
      salesRep: user._id || user.id,
      version: 1,
      lines: quoteData.lines,
      ...metrics,
      status: metrics.isLocked ? 'LOCKED' : 'DRAFT',
      terms: quoteData.terms || 'Net 30 Days. Delivery within 14 business days.'
    });

    deal.quotation = quote._id;
  } else {
    // Increase version
    quote.version = (quote.version || 1) + 1;
    quote.lines = quoteData.lines;
    Object.assign(quote, metrics);
    quote.status = metrics.isLocked ? 'LOCKED' : 'DRAFT';
    if (quoteData.terms) quote.terms = quoteData.terms;
    await quote.save();
  }

  // Create Quotation Version Snapshot
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

    // Create Manager Approval Request
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

/**
 * Sales Manager Approve / Reject / Return
 */
export async function managerAction(dealId, managerUser, action, comments = '') {
  const deal = await Deal.findById(dealId);
  if (!deal) throw new Error('Deal not found.');

  const quote = await Quotation.findById(deal.quotation);
  if (!quote) throw new Error('Quotation not found.');

  const approval = await ApprovalRequest.findOne({ deal: deal._id, status: 'PENDING' });

  if (action === 'APPROVE') {
    // Check if Finance approval is required due to margin < 15% or high risk score >= 50
    const needsFinance = quote.grossMargin < 15 || quote.riskScore >= 50 || quote.overallDiscountPercent > 15;

    if (needsFinance) {
      deal.stage = 'FINANCE_APPROVAL';
      deal.status = 'LOCKED';
      quote.status = 'FINANCE_APPROVAL';

      if (approval) {
        approval.targetRole = 'FINANCE';
        approval.comments = comments || 'Manager approved. Escales to Finance for margin/risk review.';
        approval.timeline.push({
          user: managerUser._id || managerUser.id,
          userName: managerUser.name,
          role: 'SALES_MANAGER',
          action: 'MANAGER_APPROVED',
          comment: comments || 'Approved by Manager. Routed to Finance.'
        });
        await approval.save();
      }

      await postSystemMessage(
        deal._id,
        'DEAL_INTERNAL',
        `Sales Manager ${managerUser.name} APPROVED quote. High risk / low margin detected (${quote.grossMargin}%). Sent to Finance for financial review.`,
        'APPROVAL_EVENT'
      );
    } else {
      deal.stage = 'APPROVED';
      deal.status = 'ACTIVE';
      quote.status = 'APPROVED';
      quote.isLocked = false;

      if (approval) {
        approval.status = 'APPROVED';
        approval.timeline.push({
          user: managerUser._id || managerUser.id,
          userName: managerUser.name,
          role: 'SALES_MANAGER',
          action: 'MANAGER_APPROVED',
          comment: comments || 'Final approval granted by Manager.'
        });
        await approval.save();
      }

      await postSystemMessage(
        deal._id,
        'DEAL_INTERNAL',
        `Sales Manager ${managerUser.name} APPROVED quotation. Commercial terms validated.`,
        'APPROVAL_EVENT'
      );
      await postSystemMessage(
        deal._id,
        'DEAL_CLIENT',
        `Quotation ${quote.quoteNumber} approved internally and ready for review.`
      );
    }
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

/**
 * Finance Manager Approve / Reject / Return
 */
export async function financeAction(dealId, financeUser, action, comments = '') {
  const deal = await Deal.findById(dealId);
  if (!deal) throw new Error('Deal not found.');

  const quote = await Quotation.findById(deal.quotation);
  if (!quote) throw new Error('Quotation not found.');

  const approval = await ApprovalRequest.findOne({ deal: deal._id, status: 'PENDING' });

  if (action === 'APPROVE') {
    deal.stage = 'APPROVED';
    deal.status = 'ACTIVE';
    quote.status = 'APPROVED';
    quote.isLocked = false;

    if (approval) {
      approval.status = 'APPROVED';
      approval.timeline.push({
        user: financeUser._id || financeUser.id,
        userName: financeUser.name,
        role: 'FINANCE',
        action: 'FINANCE_APPROVED',
        comment: comments || 'Finance approved margin & payment terms.'
      });
      await approval.save();
    }

    await postSystemMessage(
      deal._id,
      'DEAL_INTERNAL',
      `Finance Manager ${financeUser.name} APPROVED financial terms & margin structure.`,
      'APPROVAL_EVENT'
    );
    await postSystemMessage(
      deal._id,
      'DEAL_CLIENT',
      `Quotation ${quote.quoteNumber} approved and finalized.`
    );
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

/**
 * Send Quotation to Client
 */
export async function sendQuotationToClient(dealId, user) {
  const deal = await Deal.findById(dealId);
  if (!deal) throw new Error('Deal not found.');

  const quote = await Quotation.findById(deal.quotation);
  if (!quote) throw new Error('Quotation not found.');

  if (quote.status !== 'APPROVED') {
    throw new Error('Quotation must be APPROVED before sending to client.');
  }

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

/**
 * Client Counter Negotiation Request
 */
export async function clientNegotiate(dealId, negotiationData, clientUser) {
  const deal = await Deal.findById(dealId);
  if (!deal) throw new Error('Deal not found.');

  const quote = await Quotation.findById(deal.quotation);
  if (!quote) throw new Error('Quotation not found.');

  const requestedDiscount = Number(negotiationData.requestedDiscount) || quote.overallDiscountPercent;

  // Create Negotiation Record
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

  // Calculate new metrics
  const updatedLines = quote.lines.map(line => ({
    ...line.toObject(),
    discount: requestedDiscount
  }));

  const salesRep = await User.findById(deal.salesRep);
  const repAuthority = salesRep?.discountAuthority || 10;
  const metrics = calculateQuotationMetricsAndRisk(updatedLines, repAuthority, 'GOLD');

  // Create Quotation Version
  quote.version = (quote.version || 1) + 1;
  quote.lines = updatedLines;
  Object.assign(quote, metrics);

  if (metrics.isLocked) {
    quote.status = 'LOCKED';
    quote.isLocked = true;
    deal.status = 'LOCKED';
    deal.stage = 'MANAGER_APPROVAL';

    // Create new Approval Request
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

/**
 * Client Confirm Quotation -> Creates Order & Notifies Factory
 */
export async function clientConfirmQuotation(dealId, clientUser) {
  const deal = await Deal.findById(dealId);
  if (!deal) throw new Error('Deal not found.');

  const quote = await Quotation.findById(deal.quotation);
  if (!quote) throw new Error('Quotation not found.');

  if (quote.status !== 'APPROVED' && quote.status !== 'SENT_TO_CLIENT' && quote.status !== 'NEGOTIATION') {
    throw new Error('Quotation is not in an approved state for confirmation.');
  }

  // Lock quote permanently
  quote.status = 'CONFIRMED';
  quote.isLocked = true;
  await quote.save();

  deal.stage = 'CLIENT_CONFIRMED';
  deal.status = 'WON';

  // Check if Order already exists
  let order = await Order.findOne({ deal: deal._id });
  if (!order) {
    const oCount = await Order.countDocuments();
    const orderNumber = `ORD-${2026 + oCount + 1}`;

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

  // Create Notification for Factory & Finance
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

/**
 * Factory Order Stock Allocation & Backorder Execution
 */
export async function fulfillOrder(dealId, factoryUser) {
  const deal = await Deal.findById(dealId);
  if (!deal) throw new Error('Deal not found.');

  const order = await Order.findOne({ deal: deal._id });
  if (!order) throw new Error('Confirmed order not found for this deal.');

  const quote = await Quotation.findById(deal.quotation);
  if (!quote) throw new Error('Quotation not found.');

  // Find product line
  const mainLine = quote.lines[0];
  const requiredQty = mainLine ? mainLine.quantity : 100;

  // Check inventory stock in Main Warehouse and East Depot
  const mainStock = 60; // Available stock in Main Warehouse
  const eastStock = 40; // Available stock in East Depot

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
    if (availableTotal > 0) {
      allocations.push({ warehouseName: 'Main Warehouse', productName: mainLine?.productName || 'Industrial Controller 500', quantity: mainStock });
    }
    const backorderQty = requiredQty - availableTotal;
    backorders.push({ productName: mainLine?.productName || 'Industrial Controller 500', quantity: backorderQty });

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

  const allocText = allocations.map(a => `${a.quantity} units from ${a.warehouseName}`).join(', ');
  const textMsg = backorders.length > 0
    ? `Factory stock allocation: ${allocText}. Backorder created for ${backorders[0].quantity} units.`
    : `Factory stock allocated: ${allocText}. Shipment prepared (Tracking #${fulfillment.trackingNumber}).`;

  await postSystemMessage(deal._id, 'DEAL_INTERNAL', textMsg);
  await postSystemMessage(deal._id, 'DEAL_CLIENT', `Order fulfillment update: Inventory allocated. ${textMsg}`);

  return { deal, order, fulfillment };
}

/**
 * Generate Invoice & Subscription Billing
 */
export async function createInvoiceForDeal(dealId, user) {
  const deal = await Deal.findById(dealId);
  if (!deal) throw new Error('Deal not found.');

  const quote = await Quotation.findById(deal.quotation);
  if (!quote) throw new Error('Quotation not found.');

  let invoice = await Invoice.findOne({ deal: deal._id });
  if (!invoice) {
    const iCount = await Invoice.countDocuments();
    const invNumber = `INV-${2026 + iCount + 1}`;

    invoice = await Invoice.create({
      invoiceNumber: invNumber,
      order: deal.order,
      customer: deal.customer,
      deal: deal._id,
      billingType: 'ONE_TIME',
      lineItems: quote.lines.map(l => ({
        description: l.productName || l.sku,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        total: l.total
      })),
      subtotal: quote.subtotal,
      tax: quote.taxAmount,
      total: quote.grandTotal,
      paidAmount: 0,
      outstandingAmount: quote.grandTotal,
      status: 'UNPAID',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  }

  deal.stage = 'BILLING';
  await deal.save();

  await postSystemMessage(
    deal._id,
    'DEAL_CLIENT',
    `Invoice #${invoice.invoiceNumber} generated for ₹${invoice.total.toLocaleString('en-IN')}. Due date: ${invoice.dueDate.toLocaleDateString()}`
  );

  return invoice;
}

/**
 * Record Invoice Payment
 */
export async function recordPaymentForDeal(dealId, paymentData, user) {
  const deal = await Deal.findById(dealId);
  if (!deal) throw new Error('Deal not found.');

  const invoice = await Invoice.findOne({ deal: deal._id });
  if (!invoice) throw new Error('Invoice not found.');

  const paymentAmount = Number(paymentData.amount) || invoice.total;

  const payment = await Payment.create({
    invoice: invoice._id,
    amount: paymentAmount,
    paymentMethod: paymentData.paymentMethod || 'BANK_TRANSFER',
    transactionRef: paymentData.transactionRef || `TXN-${Date.now()}`,
    status: 'COMPLETED'
  });

  invoice.paidAmount += paymentAmount;
  invoice.outstandingAmount = Math.max(0, invoice.total - invoice.paidAmount);
  if (invoice.outstandingAmount === 0) {
    invoice.status = 'PAID';
  } else {
    invoice.status = 'PARTIALLY_PAID';
  }
  await invoice.save();

  if (invoice.status === 'PAID') {
    deal.stage = 'COMPLETED';
    deal.status = 'WON';
    deal.closedAt = new Date();
    await deal.save();

    await postSystemMessage(
      deal._id,
      'DEAL_CLIENT',
      `Payment of ₹${paymentAmount.toLocaleString('en-IN')} received. Invoice #${invoice.invoiceNumber} is PAID. Deal Completed! 🎉`
    );
    await postSystemMessage(
      deal._id,
      'DEAL_INTERNAL',
      `SYSTEM: Full payment recorded. Deal #${deal.dealNumber} marked as COMPLETED.`
    );
  }

  return { deal, invoice, payment };
}
