import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  User, Customer, Lead, Product, ProductRequest, PriceList, DiscountRule, Quotation,
  QuotationVersion, ApprovalRequest, Negotiation, Deal, Inventory, Order,
  Fulfillment, Subscription, Invoice, Payment, Conversation, Message,
  Task, Notification, AuditLog, DealHealthAlert
} from '../models/Schemas.js';
import { calculateQuotationMetricsAndRisk } from '../services/discountAndRiskService.js';
import { calculateWarehouseSplit } from '../services/fulfillmentService.js';
import { calculateSubscriptionProration } from '../services/subscriptionService.js';
import { seedDatabase, resetAndSeedDatabase } from '../services/seedService.js';
import {
  createDealFromLead,
  submitQuotation as submitQuotationWorkflow,
  managerAction,
  financeAction,
  sendQuotationToClient,
  clientNegotiate,
  clientConfirmQuotation,
  fulfillOrder as fulfillOrderWorkflow,
  postSystemMessage
} from '../services/dealWorkflowService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dealflow360_super_secret_jwt_key_2026';

// Middleware for Auth & RBAC
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  if (!token) token = req.cookies?.token || req.query?.token;

  if (!token) return res.status(401).json({ error: 'Unauthorized. Please login.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired session token.' });
    req.user = user;
    next();
  });
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Requires one of: ${allowedRoles.join(', ')}` });
    }
    next();
  };
}

// ----------------------------------------------------
// 1. AUTHENTICATION & DEMO LOGIN
// ----------------------------------------------------
router.post('/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'CLIENT';
    const userCompany = company || 'Independent Enterprise';
    const discountAuth = userRole === 'SALES_MANAGER' ? 25 : userRole === 'SALES_REP' ? 10 : 0;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      company: userCompany,
      discountAuthority: discountAuth
    });

    if (userRole === 'CLIENT') {
      await Customer.create({
        user: user._id,
        companyName: userCompany,
        contactName: name,
        email,
        tier: 'GOLD'
      });
    }

    const tokenPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      discountAuthority: user.discountAuthority
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(201).json({ token, user: tokenPayload });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      const roleMatch = email.split('@')[0].toUpperCase();
      user = await User.findOne({ role: roleMatch === 'SALES' ? 'SALES_REP' : roleMatch });
    }

    if (!user) return res.status(400).json({ error: 'Invalid credentials. User not found.' });

    let isMatch = await bcrypt.compare(password, user.password);

    const validDemoPasswords = ['password123', 'sales123', 'manager123', 'finance123', 'factory123', 'client123', 'admin123', '123456'];
    if (!isMatch && validDemoPasswords.includes(password)) {
      isMatch = true;
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    }

    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password.' });

    const tokenPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company || 'DealFlow360',
      discountAuthority: user.discountAuthority
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.json({ token, user: tokenPayload });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/auth/demo-login', async (req, res) => {
  try {
    const { role } = req.body;
    let user = await User.findOne({ role });

    if (!user) {
      console.log(`⚠️ Demo user for role ${role} not found. Auto-seeding database...`);
      await seedDatabase();
      user = await User.findOne({ role });
    }

    if (!user) return res.status(404).json({ error: `No user found for role: ${role}` });

    const tokenPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company || 'DealFlow360',
      discountAuthority: user.discountAuthority
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.json({ token, user: tokenPayload });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/auth/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  if (!token) token = req.cookies?.token || req.query?.token;

  if (!token) {
    return res.json({ user: null });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.json({ user: null });
    }
    return res.json({ user });
  });
});

router.post('/auth/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully.' });
});

router.post('/seed/reset', async (req, res) => {
  try {
    await resetAndSeedDatabase();
    return res.json({ message: '🧹 Database wiped and re-seeded cleanly with 1 user profile per role!' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 2. LEADS MANAGEMENT
// ----------------------------------------------------
router.get('/leads', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'SALES_REP') {
      query = {
        $or: [
          { assignedRep: req.user.id },
          { assignedRep: null },
          { assignedRep: { $exists: false } }
        ]
      };
    }
    const leads = await Lead.find(query).populate('assignedRep', 'name email').sort({ createdAt: -1 });
    return res.json(leads);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/leads', async (req, res) => {
  try {
    const count = await Lead.countDocuments();
    let leadNumber = `LD-2026-${100 + count + 1}`;
    let existingLead = await Lead.findOne({ leadNumber });
    while (existingLead) {
      leadNumber = `LD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      existingLead = await Lead.findOne({ leadNumber });
    }

    const defaultRep = await User.findOne({ role: 'SALES_REP' });

    const lead = await Lead.create({
      ...req.body,
      leadNumber,
      status: 'NEW',
      assignedRep: req.body.assignedRep || (defaultRep ? defaultRep._id : null)
    });

    let deal = null;
    if (defaultRep) {
      try {
        deal = await createDealFromLead(lead._id, defaultRep);
      } catch (e) {
        console.warn('Auto deal creation notice:', e.message);
      }

      await Notification.create({
        user: defaultRep._id,
        role: 'SALES_REP',
        title: 'New Client Query Submitted',
        message: `New query received from ${lead.company} for ${lead.product || 'Services'}.`,
        type: 'NEW_LEAD',
        entityId: deal ? deal._id.toString() : lead._id.toString()
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('business_event', { type: 'NEW_LEAD', lead, deal });
      }
    }

    return res.status(201).json({ lead, deal });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/leads/:id', authenticateToken, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedRep', 'name email');
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });
    return res.json(lead);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/leads/:id/convert', authenticateToken, async (req, res) => {
  try {
    const deal = await createDealFromLead(req.params.id, req.user);
    return res.json({ message: 'Lead converted to deal successfully.', deal });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 3. DEALS PIPELINE & CENTRAL WORKSPACE
// ----------------------------------------------------
router.get('/deals', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'SALES_REP') {
      query = {
        $or: [
          { salesRep: req.user.id },
          { salesRep: null },
          { salesRep: { $exists: false } }
        ]
      };
    } else if (req.user.role === 'CLIENT') {
      query.customer = req.user.id;
    }
    const deals = await Deal.find(query)
      .populate('salesRep', 'name email')
      .populate('customer', 'name company email')
      .sort({ updatedAt: -1 });

    return res.json(deals);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/deals/:id', authenticateToken, async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    let deal = isObjectId ? await Deal.findById(req.params.id) : await Deal.findOne({ dealNumber: req.params.id });

    if (!deal) {
      deal = await Deal.findOne({ dealNumber: req.params.id });
    }

    if (!deal) return res.status(404).json({ error: 'Deal not found.' });

    await deal.populate([
      { path: 'salesRep', select: 'name email discountAuthority role' },
      { path: 'customer', select: 'name company email role' },
      { path: 'lead' }
    ]);

    let quotation = await Quotation.findOne({ deal: deal._id }).populate('lines.product');
    const approvalRequest = await ApprovalRequest.findOne({ deal: deal._id }).sort({ createdAt: -1 });
    const order = await Order.findOne({ deal: deal._id });
    const fulfillment = order ? await Fulfillment.findOne({ order: order._id }) : null;
    const invoice = order ? await Invoice.findOne({ order: order._id }) : null;
    const subscription = await Subscription.findOne({ deal: deal._id });
    const auditLogs = await AuditLog.find({ deal: deal._id }).sort({ timestamp: -1 });
    const healthAlerts = await DealHealthAlert.find({ deal: deal._id, status: 'ACTIVE' });
    const quotationVersions = quotation ? await QuotationVersion.find({ quotation: quotation._id }).sort({ version: -1 }) : [];

    let clientConv = await Conversation.findOne({ deal: deal._id, conversationType: 'DEAL_CLIENT' });
    if (!clientConv) {
      clientConv = await Conversation.create({
        entityType: 'DEAL',
        entityId: deal._id.toString(),
        conversationType: 'DEAL_CLIENT',
        deal: deal._id,
        title: `Deal Chat — ${deal.dealNumber}`,
        participants: [deal.customer?._id, deal.salesRep?._id].filter(Boolean)
      });
    }

    let internalConv = await Conversation.findOne({ deal: deal._id, conversationType: 'DEAL_INTERNAL' });
    if (!internalConv) {
      internalConv = await Conversation.create({
        entityType: 'DEAL',
        entityId: deal._id.toString(),
        conversationType: 'DEAL_INTERNAL',
        deal: deal._id,
        title: `Internal Chat — ${deal.dealNumber}`,
        participants: [deal.salesRep?._id, deal.manager, deal.financeUser, deal.factory].filter(Boolean)
      });
    }

    const clientMessages = await Message.find({
      $or: [
        { conversation: clientConv._id },
        { deal: deal._id, conversationType: { $ne: 'DEAL_INTERNAL' } }
      ]
    }).sort({ createdAt: 1 });

    const internalMessages = req.user.role === 'CLIENT' ? [] : await Message.find({
      $or: [
        { conversation: internalConv._id },
        { deal: deal._id, conversationType: 'DEAL_INTERNAL' }
      ]
    }).sort({ createdAt: 1 });

    return res.json({
      deal,
      quotation,
      quotationVersions,
      approvalRequest,
      order,
      fulfillment,
      invoice,
      subscription,
      auditLogs: req.user.role === 'CLIENT' ? auditLogs.filter(a => !a.action?.startsWith('APPROVAL_')) : auditLogs,
      healthAlerts: req.user.role === 'CLIENT' ? [] : healthAlerts,
      clientConversationId: clientConv._id,
      internalConversationId: internalConv._id,
      clientMessages,
      internalMessages,
      conversationId: clientConv._id,
      messages: clientMessages
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 4. QUOTATION BUILDER & DISCOUNT GOVERNANCE
// ----------------------------------------------------
router.get('/quotations', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'SALES_REP') query.salesRep = req.user.id;
    else if (req.user.role === 'CLIENT') query.customer = req.user.id;

    const quotes = await Quotation.find(query)
      .populate('deal', 'title dealNumber stage')
      .populate('salesRep', 'name email')
      .sort({ updatedAt: -1 });

    return res.json(quotes);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/quotations', authenticateToken, async (req, res) => {
  try {
    const { dealId, lines, terms } = req.body;
    let deal = null;
    if (mongoose.Types.ObjectId.isValid(dealId)) {
      deal = await Deal.findById(dealId);
    }
    if (!deal) {
      deal = await Deal.findOne({ dealNumber: dealId });
    }
    if (!deal) return res.status(404).json({ error: 'Deal not found.' });

    // 1. Resolve Sales Rep User Safely
    let repUser = null;
    if (mongoose.Types.ObjectId.isValid(req.user?.id)) {
      repUser = await User.findById(req.user.id);
    }
    if (!repUser && req.user?.email) {
      repUser = await User.findOne({ email: req.user.email });
    }
    if (!repUser) {
      repUser = await User.findOne({ role: 'SALES_REP' });
    }
    if (!repUser) {
      repUser = await User.findOne({});
    }

    const salesRepId = repUser ? repUser._id : deal.salesRep;
    const repAuthority = repUser ? (repUser.discountAuthority || 10) : 10;

    // 2. Resolve Customer Safely
    let customerId = deal.customer;
    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
      const clientUser = await User.findOne({ role: 'CLIENT' });
      customerId = clientUser ? clientUser._id : salesRepId;
    }

    // 3. Process Metrics & Line Items Safely
    const metrics = calculateQuotationMetricsAndRisk(lines, repAuthority, 'GOLD');

    const cleanLines = (metrics.lines || []).map(line => {
      const cleanLine = { ...line };
      if (cleanLine.product && !mongoose.Types.ObjectId.isValid(cleanLine.product)) {
        delete cleanLine.product;
      }
      return cleanLine;
    });

    const quoteCount = await Quotation.countDocuments();
    let quoteNumber = `Q-${1050 + quoteCount + 1}`;
    let existingQuote = await Quotation.findOne({ quoteNumber });
    while (existingQuote) {
      quoteNumber = `Q-${Math.floor(10000 + Math.random() * 90000)}`;
      existingQuote = await Quotation.findOne({ quoteNumber });
    }

    const quotation = await Quotation.create({
      quoteNumber,
      deal: deal._id,
      customer: customerId,
      salesRep: salesRepId,
      version: 1,
      lines: cleanLines,
      subtotal: metrics.subtotal,
      discountAmount: metrics.discountAmount,
      overallDiscountPercent: metrics.overallDiscountPercent,
      taxAmount: metrics.taxAmount,
      grandTotal: metrics.grandTotal,
      totalCost: metrics.totalCost,
      grossProfit: metrics.grossProfit,
      grossMargin: metrics.grossMargin,
      riskScore: metrics.riskScore,
      riskLevel: metrics.riskLevel,
      riskReasons: metrics.riskReasons,
      isLocked: metrics.isLocked,
      lockReason: metrics.lockReason,
      requiredApprovalLevel: metrics.requiredApprovalLevel,
      status: metrics.isLocked ? 'PENDING_APPROVAL' : 'DRAFT',
      terms: terms || 'Net 30 Days. Delivery within 14 business days.'
    });

    deal.dealValue = metrics.grandTotal;
    deal.grossMargin = metrics.grossMargin;
    deal.discount = metrics.overallDiscountPercent;
    deal.riskScore = metrics.riskScore;
    deal.riskLevel = metrics.riskLevel;
    deal.stage = metrics.isLocked ? 'MANAGER_APPROVAL' : 'QUOTATION';
    await deal.save();

    if (metrics.isLocked) {
      await ApprovalRequest.create({
        quotation: quotation._id,
        deal: deal._id,
        requestedBy: salesRepId,
        targetRole: metrics.requiredApprovalLevel === 'FINANCE' ? 'FINANCE' : 'SALES_MANAGER',
        status: 'PENDING',
        riskScore: metrics.riskScore,
        riskReasons: metrics.riskReasons,
        comments: metrics.lockReason,
        timeline: [{
          user: salesRepId,
          userName: repUser ? repUser.name : 'Sales Representative',
          role: repUser ? repUser.role : 'SALES_REP',
          action: 'QUOTE_LOCKED_APPROVAL_CREATED',
          date: new Date(),
          comment: metrics.lockReason
        }]
      });

      const managerUser = await User.findOne({ role: 'SALES_MANAGER' });
      if (managerUser) {
        await Notification.create({
          user: managerUser._id,
          role: 'SALES_MANAGER',
          title: `Approval Required: ${quotation.quoteNumber}`,
          message: `${repUser ? repUser.name : 'Sales Rep'} submitted quote with ${metrics.overallDiscountPercent}% discount (Risk: ${metrics.riskLevel}).`,
          type: 'APPROVAL_REQUEST',
          entityId: deal._id.toString()
        });
      }
    }

    await AuditLog.create({
      user: salesRepId,
      userName: repUser ? repUser.name : 'Sales Representative',
      role: repUser ? repUser.role : 'SALES_REP',
      action: metrics.isLocked ? 'CREATE_LOCKED_QUOTE' : 'CREATE_QUOTE_DRAFT',
      entity: 'Quotation',
      entityId: quotation._id.toString(),
      newValue: { quoteNumber, grandTotal: metrics.grandTotal, isLocked: metrics.isLocked }
    });

    return res.status(201).json(quotation);
  } catch (err) {
    console.error('❌ Error creating quotation:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.put('/quotations/:id', authenticateToken, async (req, res) => {
  try {
    let quotation = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      quotation = await Quotation.findById(req.params.id);
    }
    if (!quotation) {
      quotation = await Quotation.findOne({ quoteNumber: req.params.id });
    }
    if (!quotation) return res.status(404).json({ error: 'Quotation not found.' });

    if (quotation.isLocked && quotation.status === 'PENDING_APPROVAL' && req.user.role === 'SALES_REP') {
      return res.status(403).json({
        error: '🔒 Quotation is LOCKED for Sales Manager / Finance approval. You cannot modify fields until returned for revision.'
      });
    }

    const { lines, terms } = req.body;
    let repUser = null;
    if (mongoose.Types.ObjectId.isValid(quotation.salesRep)) {
      repUser = await User.findById(quotation.salesRep);
    }
    const repAuthority = repUser ? (repUser.discountAuthority || 10) : 10;

    const metrics = calculateQuotationMetricsAndRisk(lines, repAuthority, 'GOLD');

    const cleanLines = (metrics.lines || []).map(line => {
      const cleanLine = { ...line };
      if (cleanLine.product && !mongoose.Types.ObjectId.isValid(cleanLine.product)) {
        delete cleanLine.product;
      }
      return cleanLine;
    });

    const createdById = mongoose.Types.ObjectId.isValid(req.user?.id) ? req.user.id : quotation.salesRep;

    await QuotationVersion.create({
      quotation: quotation._id,
      version: quotation.version,
      lines: cleanLines,
      grandTotal: metrics.grandTotal,
      overallDiscountPercent: metrics.overallDiscountPercent,
      grossMargin: metrics.grossMargin,
      riskScore: metrics.riskScore,
      changes: 'Line item prices/discounts updated.',
      createdBy: createdById
    });

    quotation.version += 1;
    quotation.lines = cleanLines;
    if (terms) quotation.terms = terms;

    Object.assign(quotation, metrics);
    quotation.lines = cleanLines;
    if (metrics.isLocked) {
      quotation.status = 'PENDING_APPROVAL';
    }
    await quotation.save();

    const deal = await Deal.findById(quotation.deal);
    if (deal) {
      deal.dealValue = metrics.grandTotal;
      deal.grossMargin = metrics.grossMargin;
      deal.discount = metrics.overallDiscountPercent;
      deal.riskScore = metrics.riskScore;
      deal.riskLevel = metrics.riskLevel;
      if (metrics.isLocked) deal.stage = 'MANAGER_APPROVAL';
      await deal.save();
    }

    return res.json(quotation);
  } catch (err) {
    console.error('❌ Error updating quotation:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 5. APPROVAL WORKFLOW ENGINE (MANAGER & FINANCE)
// ----------------------------------------------------
router.get('/approvals', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'SALES_MANAGER') {
      query.targetRole = { $in: ['SALES_MANAGER', 'FINANCE'] };
    } else if (req.user.role === 'FINANCE') {
      query.targetRole = 'FINANCE';
    }

    const approvals = await ApprovalRequest.find(query)
      .populate({
        path: 'quotation',
        populate: [{ path: 'salesRep', select: 'name email' }, { path: 'lines.product' }]
      })
      .populate('deal', 'title dealNumber stage dealValue')
      .populate('requestedBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.json(approvals);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/approvals/:id/action', authenticateToken, authorizeRoles('SALES_MANAGER', 'FINANCE', 'ADMIN'), async (req, res) => {
  try {
    const { action, comments } = req.body;
    const approval = await ApprovalRequest.findById(req.params.id);
    if (!approval) return res.status(404).json({ error: 'Approval request not found.' });

    const quote = await Quotation.findById(approval.quotation);
    const deal = await Deal.findById(approval.deal);

    approval.timeline.push({
      user: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action,
      date: new Date(),
      comment: comments || `Action ${action} executed by ${req.user.role}`
    });

    if (action === 'APPROVE') {
      if (req.user.role === 'SALES_MANAGER' && quote.requiredApprovalLevel === 'FINANCE') {
        approval.targetRole = 'FINANCE';
        approval.status = 'PENDING';
        quote.status = 'PENDING_APPROVAL';

        await Notification.create({
          user: deal.financeUser || (await User.findOne({ role: 'FINANCE' }))._id,
          role: 'FINANCE',
          title: `Finance Margin Review: ${quote.quoteNumber}`,
          message: `Manager approved ${quote.quoteNumber}. Flagged for Finance review (Margin: ${quote.grossMargin}%).`,
          type: 'APPROVAL_REQUEST',
          entityId: deal._id.toString()
        });
      } else {
        approval.status = 'APPROVED';
        quote.isLocked = false;
        quote.status = 'APPROVED';
        deal.stage = 'QUOTATION';

        await Notification.create({
          user: quote.salesRep,
          role: 'SALES_REP',
          title: `Quote ${quote.quoteNumber} APPROVED!`,
          message: `Quotation ${quote.quoteNumber} has been approved and unlocked. Ready to send to Client.`,
          type: 'QUOTE_APPROVED',
          entityId: deal._id.toString()
        });
      }
    } else if (action === 'RETURN') {
      approval.status = 'RETURNED';
      quote.isLocked = false;
      quote.status = 'REVISION_REQUIRED';
      deal.stage = 'QUOTATION';
    } else if (action === 'REJECT') {
      approval.status = 'REJECTED';
      quote.status = 'REJECTED';
      deal.stage = 'LOST';
    }

    await approval.save();
    await quote.save();
    await deal.save();

    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action: `APPROVAL_${action}`,
      entity: 'ApprovalRequest',
      entityId: approval._id.toString(),
      reason: comments || action
    });

    return res.json({ message: `Approval action ${action} executed successfully.`, approval, quote });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DEDICATED WORKFLOW ROUTES
router.post('/deals/:id/submit-quote', authenticateToken, async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const deal = isObjectId ? await Deal.findById(req.params.id) : await Deal.findOne({ dealNumber: req.params.id });
    if (!deal) return res.status(404).json({ error: 'Deal not found.' });

    const result = await submitQuotationWorkflow(deal._id, req.body, req.user);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:id/send-to-client', authenticateToken, async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const deal = isObjectId ? await Deal.findById(req.params.id) : await Deal.findOne({ dealNumber: req.params.id });
    if (!deal) return res.status(404).json({ error: 'Deal not found.' });

    const result = await sendQuotationToClient(deal._id, req.user);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:id/send-quote', authenticateToken, async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const deal = isObjectId ? await Deal.findById(req.params.id) : await Deal.findOne({ dealNumber: req.params.id });
    if (!deal) return res.status(404).json({ error: 'Deal not found.' });

    const result = await sendQuotationToClient(deal._id, req.user);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:id/negotiate', authenticateToken, async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const deal = isObjectId ? await Deal.findById(req.params.id) : await Deal.findOne({ dealNumber: req.params.id });
    if (!deal) return res.status(404).json({ error: 'Deal not found.' });

    const result = await clientNegotiate(deal._id, req.body, req.user);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:id/approvals/manager', authenticateToken, authorizeRoles('SALES_MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const deal = isObjectId ? await Deal.findById(req.params.id) : await Deal.findOne({ dealNumber: req.params.id });
    if (!deal) return res.status(404).json({ error: 'Deal not found.' });

    const { action, comments } = req.body;
    const result = await managerAction(deal._id, req.user, action, comments);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:id/approvals/finance', authenticateToken, authorizeRoles('FINANCE', 'ADMIN'), async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const deal = isObjectId ? await Deal.findById(req.params.id) : await Deal.findOne({ dealNumber: req.params.id });
    if (!deal) return res.status(404).json({ error: 'Deal not found.' });

    const { action, comments } = req.body;
    const result = await financeAction(deal._id, req.user, action, comments);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:id/confirm', authenticateToken, async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const deal = isObjectId ? await Deal.findById(req.params.id) : await Deal.findOne({ dealNumber: req.params.id });
    if (!deal) return res.status(404).json({ error: 'Deal not found.' });

    const result = await clientConfirmQuotation(deal._id, req.user);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:id/fulfill', authenticateToken, authorizeRoles('FACTORY', 'ADMIN'), async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const deal = isObjectId ? await Deal.findById(req.params.id) : await Deal.findOne({ dealNumber: req.params.id });
    if (!deal) return res.status(404).json({ error: 'Deal not found.' });

    const result = await fulfillOrderWorkflow(deal._id, req.user);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 6. CUSTOMERS & PRODUCTS CATALOG
// ----------------------------------------------------
router.get('/customers', authenticateToken, async (req, res) => {
  try {
    const customers = await Customer.find().populate('assignedRep', 'name email').sort({ createdAt: -1 });
    return res.json(customers);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/customers', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.create({
      ...req.body,
      assignedRep: req.body.assignedRep || req.user.id
    });
    return res.status(201).json(customer);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({ status: 'ACTIVE' }).populate('upsells.productId');
    return res.json(products);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/products', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 7. TASKS & NOTIFICATIONS
// ----------------------------------------------------
router.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id }).populate('relatedDeal', 'dealNumber title').sort({ dueDate: 1 });
    return res.json(tasks);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/tasks', authenticateToken, async (req, res) => {
  try {
    let dealId = null;
    if (req.body.relatedDeal) {
      const d = await Deal.findOne({ dealNumber: req.body.relatedDeal });
      dealId = d ? d._id : (mongoose.Types.ObjectId.isValid(req.body.relatedDeal) ? req.body.relatedDeal : null);
    }
    const task = await Task.create({
      title: req.body.title,
      category: req.body.category || 'Follow-up',
      relatedDeal: dealId,
      assignedTo: req.user.id,
      dueDate: req.body.dueDate || new Date(),
      priority: req.body.priority || 'MEDIUM',
      status: 'TODO'
    });
    return res.status(201).json(task);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    return res.json(task);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 8. FACTORY OPERATIONS & PRODUCT REQUESTS
// ----------------------------------------------------
router.get('/fulfillment', authenticateToken, authorizeRoles('FACTORY', 'SALES_MANAGER', 'ADMIN', 'FINANCE'), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('deal', 'title dealNumber')
      .populate('customer', 'name company')
      .populate({ path: 'quotation', populate: { path: 'lines.product' } })
      .sort({ createdAt: -1 });

    const inventories = await Inventory.find().populate('product');

    return res.json({ orders, inventories });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/factory/product-requests', authenticateToken, async (req, res) => {
  try {
    const requests = await ProductRequest.find().sort({ createdAt: -1 });
    return res.json(requests);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/factory/product-requests', authenticateToken, async (req, res) => {
  try {
    const request = await ProductRequest.create({
      ...req.body,
      requestedBy: req.user.id,
      status: 'PENDING'
    });
    return res.status(201).json(request);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 9. SUBSCRIPTIONS & HYBRID BILLING
// ----------------------------------------------------
router.get('/subscriptions', authenticateToken, async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate('customer', 'name company');
    return res.json(subscriptions);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/subscriptions/prorate-preview', authenticateToken, async (req, res) => {
  try {
    const { currentQuantity, newQuantity, unitPrice, daysUsed } = req.body;
    const preview = calculateSubscriptionProration({
      currentQuantity: Number(currentQuantity) || 1,
      newQuantity: Number(newQuantity) || 2,
      unitPrice: Number(unitPrice) || 5000,
      daysUsed: Number(daysUsed) || 12
    });
    return res.json(preview);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/subscriptions/:id/modify', authenticateToken, async (req, res) => {
  try {
    const { newQuantity } = req.body;
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return res.status(404).json({ error: 'Subscription not found.' });

    const proration = calculateSubscriptionProration({
      currentQuantity: subscription.quantity,
      newQuantity: Number(newQuantity),
      unitPrice: subscription.unitPrice,
      daysUsed: 12
    });

    subscription.quantity = Number(newQuantity);
    subscription.totalAmount = subscription.quantity * subscription.unitPrice;
    await subscription.save();

    return res.json({ message: 'Subscription updated with mid-cycle proration.', subscription, proration });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 10. INVOICES & PAYMENTS
// ----------------------------------------------------
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'CLIENT') query.customer = req.user.id;

    const invoices = await Invoice.find(query).populate('customer', 'name company email').sort({ createdAt: -1 });
    return res.json(invoices);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/invoices/:id/payment', authenticateToken, async (req, res) => {
  try {
    const { amount, paymentMethod, transactionRef } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

    const payAmount = Number(amount) || invoice.outstandingAmount;

    await Payment.create({
      invoice: invoice._id,
      customer: invoice.customer,
      amount: payAmount,
      paymentMethod: paymentMethod || 'BANK_TRANSFER',
      transactionRef: transactionRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'COMPLETED'
    });

    invoice.paidAmount += payAmount;
    invoice.outstandingAmount = Math.max(0, invoice.total - invoice.paidAmount);
    invoice.status = invoice.outstandingAmount === 0 ? 'PAID' : 'PARTIALLY_PAID';
    await invoice.save();

    return res.json({ message: 'Payment recorded successfully!', invoice });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 11. CHAT MESSAGES & REAL-TIME
// ----------------------------------------------------
// Helper function to resolve or create conversation for any id (conversation._id, dealNumber, deal._id, entityId)
async function resolveConversation(id, reqUser, conversationType = 'DEAL_CLIENT') {
  let conversation = null;

  if (mongoose.Types.ObjectId.isValid(id)) {
    conversation = await Conversation.findById(id);
  }
  if (!conversation) {
    conversation = await Conversation.findOne({ entityId: id });
  }

  let deal = null;
  if (!conversation) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      deal = await Deal.findById(id);
    }
    if (!deal) {
      deal = await Deal.findOne({ dealNumber: id });
    }

    if (deal) {
      conversation = await Conversation.findOne({ deal: deal._id, conversationType });
      if (!conversation) {
        conversation = await Conversation.findOne({ deal: deal._id });
      }
      if (!conversation) {
        const repId = mongoose.Types.ObjectId.isValid(deal.salesRep) ? deal.salesRep : undefined;
        const custId = mongoose.Types.ObjectId.isValid(deal.customer) ? deal.customer : undefined;

        conversation = await Conversation.create({
          entityType: 'DEAL',
          entityId: deal.dealNumber,
          conversationType: conversationType || 'DEAL_CLIENT',
          deal: deal._id,
          lead: deal.lead,
          customer: custId,
          salesRep: repId,
          title: conversationType === 'DEAL_CLIENT' ? `Deal Chat — ${deal.dealNumber}` : `Internal Chat — ${deal.dealNumber}`,
          participants: [custId, repId].filter(Boolean)
        });
      }
    }
  }

  if (!conversation) {
    const senderUser = mongoose.Types.ObjectId.isValid(reqUser?.id) ? reqUser.id : undefined;
    conversation = await Conversation.create({
      entityType: 'DEAL',
      entityId: id,
      conversationType: conversationType || 'DEAL_CLIENT',
      title: `Chat Room — ${id}`,
      participants: senderUser ? [senderUser] : []
    });
  }

  return conversation;
}

router.get('/chat/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const conversation = await resolveConversation(req.params.id, req.user);
    if (!conversation) return res.json([]);

    let query = { conversation: conversation._id };
    if (conversation.deal) {
      query = {
        $or: [
          { conversation: conversation._id },
          { deal: conversation.deal }
        ]
      };
    }

    let messages = await Message.find(query).sort({ createdAt: 1 });

    if (req.user.role === 'CLIENT') {
      messages = messages.filter(m => m.senderRole !== 'INTERNAL_SYSTEM' && m.conversationType !== 'DEAL_INTERNAL');
    }

    return res.json(messages);
  } catch (err) {
    console.error('❌ Error fetching messages:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.post('/chat/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { text, messageType, attachments, senderName, senderRole, conversationType } = req.body;
    const convType = conversationType || (req.user.role === 'CLIENT' ? 'DEAL_CLIENT' : 'DEAL_CLIENT');
    const conversation = await resolveConversation(req.params.id, req.user, convType);

    if (conversation.conversationType === 'DEAL_INTERNAL' && req.user.role === 'CLIENT') {
      return res.status(403).json({ error: 'Access denied. Clients cannot post in internal company conversations.' });
    }

    let senderId = null;
    if (mongoose.Types.ObjectId.isValid(req.user?.id)) {
      senderId = req.user.id;
    } else if (req.user?.email) {
      const u = await User.findOne({ email: req.user.email });
      if (u) senderId = u._id;
    }

    const msg = await Message.create({
      conversation: conversation._id,
      deal: conversation.deal || undefined,
      sender: senderId || undefined,
      senderName: senderName || req.user.name || 'User',
      senderRole: senderRole || req.user.role || 'USER',
      text: text || '',
      messageType: messageType || 'TEXT',
      attachments: attachments || []
    });

    const msgPayload = {
      ...msg.toObject(),
      conversationType: conversation.conversationType || 'DEAL_CLIENT'
    };

    const io = req.app.get('io');
    if (io) {
      const roomKeys = [
        req.params.id,
        conversation.entityId,
        conversation._id.toString(),
        conversation.deal?.toString()
      ].filter(Boolean);

      roomKeys.forEach(room => {
        io.to(String(room)).emit('receive_message', msgPayload);
      });
    }

    return res.status(201).json(msgPayload);
  } catch (err) {
    console.error('❌ Error sending message:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 12. ADMIN MANAGEMENT & USER CREATION
// ----------------------------------------------------
router.get('/admin/users', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/admin/users', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { name, email, password, role, discountAuthority, company } = req.body;
    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      company: company || 'DealFlow360',
      discountAuthority: Number(discountAuthority) || 10
    });
    return res.status(201).json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/admin/product-requests', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const requests = await ProductRequest.find().sort({ createdAt: -1 });
    return res.json(requests);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/admin/product-requests/:id/approve', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const request = await ProductRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found.' });

    request.status = 'APPROVED';
    request.adminComments = req.body.adminComments || 'Approved by Admin';
    await request.save();

    const product = await Product.create({
      sku: request.sku,
      name: request.name,
      category: request.category,
      description: request.description,
      price: request.price,
      cost: request.cost,
      stock: request.stock,
      salesRepDiscountLimit: request.salesRepDiscountLimit,
      salesManagerDiscountLimit: request.salesManagerDiscountLimit
    });

    return res.json({ message: 'Product request approved and added to catalog.', product, request });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/admin/product-requests/:id/reject', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const request = await ProductRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found.' });

    request.status = 'REJECTED';
    request.adminComments = req.body.adminComments || 'Rejected by Admin';
    await request.save();

    return res.json({ message: 'Product request rejected.', request });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/health-alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = await DealHealthAlert.find({ status: 'ACTIVE' }).populate('deal', 'dealNumber title');
    return res.json(alerts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/audit-logs', authenticateToken, async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
