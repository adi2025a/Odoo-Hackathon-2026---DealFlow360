import mongoose from 'mongoose';

const { Schema } = mongoose;

// 1. USER SCHEMA
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['CLIENT', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'FACTORY', 'ADMIN'],
    required: true
  },
  company: { type: String, default: 'DealFlow360 Enterprise' },
  avatar: { type: String },
  discountAuthority: { type: Number, default: 10 }, // e.g. 10%
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

// 2. CUSTOMER SCHEMA
const CustomerSchema = new Schema({
  companyName: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  tier: { type: String, enum: ['BRONZE', 'SILVER', 'GOLD', 'ENTERPRISE'], default: 'BRONZE' },
  creditLimit: { type: Number, default: 500000 },
  assignedRep: { type: Schema.Types.ObjectId, ref: 'User' },
  accountStatus: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' }
}, { timestamps: true });

// 3. LEAD SCHEMA
const LeadSchema = new Schema({
  leadNumber: { type: String, required: true, unique: true },
  company: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  requirement: { type: String, required: true },
  product: { type: String },
  quantity: { type: Number, default: 1 },
  expectedDeliveryDate: { type: Date },
  budget: { type: Number },
  additionalMessage: { type: String },
  status: {
    type: String,
    enum: ['NEW', 'ASSIGNED', 'CONTACTED', 'REQUIREMENT_GATHERING', 'QUOTE_DRAFT', 'QUOTE_SENT', 'NEGOTIATION', 'WON', 'LOST', 'ON_HOLD'],
    default: 'NEW'
  },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  assignedRep: { type: Schema.Types.ObjectId, ref: 'User' },
  dealId: { type: Schema.Types.ObjectId, ref: 'Deal' },
  isEscalated: { type: Boolean, default: false },
  escalationReason: { type: String },
  escalatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedManager: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// 4. PRODUCT SCHEMA
const ProductSchema = new Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  taxRate: { type: Number, default: 18 },
  unit: { type: String, default: 'Units' },
  status: { type: String, enum: ['ACTIVE', 'DISCONTINUED'], default: 'ACTIVE' },
  stock: { type: Number, default: 100 },
  maxDiscountLimit: { type: Number, default: 15 },
  salesRepDiscountLimit: { type: Number, default: 10 },
  salesManagerDiscountLimit: { type: Number, default: 20 },
  upsells: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    reason: { type: String },
    promotion: { type: String },
    confidence: { type: Number, default: 95 }
  }]
}, { timestamps: true });

// 5. PRICE LIST SCHEMA
const PriceListSchema = new Schema({
  name: { type: String, required: true },
  tier: { type: String, enum: ['BRONZE', 'SILVER', 'GOLD', 'ENTERPRISE'], required: true },
  currency: { type: String, default: 'INR' },
  adjustments: { type: Number, default: 0 }
}, { timestamps: true });

// 6. DISCOUNT RULE SCHEMA
const DiscountRuleSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String },
  customerTier: { type: String },
  maxAllowedDiscount: { type: Number, required: true },
  minAllowedMargin: { type: Number, required: true }
}, { timestamps: true });

// 7. QUOTATION SCHEMA
const QuotationLineSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String },
  sku: { type: String },
  category: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  cost: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 18 },
  total: { type: Number, required: true },
  margin: { type: Number, required: true },
  discountLimit: { type: Number, default: 15 }
});

const QuotationSchema = new Schema({
  quoteNumber: { type: String, required: true, unique: true },
  deal: { type: Schema.Types.ObjectId, ref: 'Deal', required: true },
  lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
  customer: { type: Schema.Types.ObjectId, ref: 'User' },
  salesRep: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  version: { type: Number, default: 1 },
  lines: [QuotationLineSchema],
  subtotal: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  overallDiscountPercent: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  grossProfit: { type: Number, default: 0 },
  grossMargin: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'LOCKED', 'MANAGER_APPROVAL', 'FINANCE_APPROVAL', 'APPROVED', 'SENT_TO_CLIENT', 'NEGOTIATION', 'REVISION_REQUIRED', 'CONFIRMED', 'REJECTED', 'EXPIRED'],
    default: 'DRAFT'
  },
  isLocked: { type: Boolean, default: false },
  lockReason: { type: String },
  requiredApprovalLevel: { type: String, enum: ['NONE', 'MANAGER', 'FINANCE'], default: 'NONE' },
  riskScore: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
  riskReasons: [{ type: String }],
  terms: { type: String, default: 'Net 30 Days. Delivery within 14 business days.' }
}, { timestamps: true });

// 8. QUOTATION VERSION SCHEMA
const QuotationVersionSchema = new Schema({
  quotation: { type: Schema.Types.ObjectId, ref: 'Quotation', required: true },
  version: { type: Number, required: true },
  lines: [QuotationLineSchema],
  grandTotal: { type: Number },
  overallDiscountPercent: { type: Number },
  grossMargin: { type: Number },
  riskScore: { type: Number },
  changes: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// 9. APPROVAL REQUEST SCHEMA
const ApprovalRequestSchema = new Schema({
  quotation: { type: Schema.Types.ObjectId, ref: 'Quotation', required: true },
  deal: { type: Schema.Types.ObjectId, ref: 'Deal', required: true },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, enum: ['SALES_MANAGER', 'FINANCE'], required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'RETURNED'], default: 'PENDING' },
  riskScore: { type: Number },
  riskReasons: [{ type: String }],
  comments: { type: String },
  timeline: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    role: { type: String },
    action: { type: String },
    date: { type: Date, default: Date.now },
    comment: { type: String }
  }]
}, { timestamps: true });

// 10. NEGOTIATION SCHEMA
const NegotiationSchema = new Schema({
  quotation: { type: Schema.Types.ObjectId, ref: 'Quotation', required: true },
  deal: { type: Schema.Types.ObjectId, ref: 'Deal', required: true },
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  customer: { type: Schema.Types.ObjectId, ref: 'User' },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  oldDiscount: { type: Number, default: 0 },
  requestedDiscount: { type: Number, default: 0 },
  oldValue: { type: Number, default: 0 },
  newValue: { type: Number, default: 0 },
  requestedQuantity: { type: Number },
  requestedTerms: { type: String },
  reason: { type: String },
  comments: { type: String },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'RE_APPROVAL_REQUIRED'], default: 'PENDING' }
}, { timestamps: true });

// 11. DEAL SCHEMA
const DealSchema = new Schema({
  dealNumber: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
  customer: { type: Schema.Types.ObjectId, ref: 'User' },
  salesRep: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  manager: { type: Schema.Types.ObjectId, ref: 'User' },
  financeUser: { type: Schema.Types.ObjectId, ref: 'User' },
  factory: { type: Schema.Types.ObjectId, ref: 'User' },
  stage: {
    type: String,
    enum: ['NEW', 'QUALIFICATION', 'REQUIREMENT', 'QUOTATION', 'MANAGER_APPROVAL', 'FINANCE_APPROVAL', 'APPROVED', 'CLIENT_NEGOTIATION', 'CLIENT_CONFIRMED', 'ORDER_CREATED', 'FULFILLMENT', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'LOST'],
    default: 'NEW'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'ON_HOLD', 'LOCKED', 'WON', 'LOST', 'CANCELLED'],
    default: 'ACTIVE'
  },
  healthScore: { type: Number, default: 90 },
  healthStatus: { type: String, enum: ['HEALTHY', 'AT_RISK', 'CRITICAL'], default: 'HEALTHY' },
  dealValue: { type: Number, default: 0 },
  grossMargin: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  riskScore: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
  currentApprovalLevel: { type: String, enum: ['NONE', 'MANAGER', 'FINANCE'], default: 'NONE' },
  isEscalated: { type: Boolean, default: false },
  escalationReason: { type: String },
  escalatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  quotation: { type: Schema.Types.ObjectId, ref: 'Quotation' },
  order: { type: Schema.Types.ObjectId, ref: 'Order' },
  clientConversation: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  internalConversation: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  lastActivity: { type: Date, default: Date.now },
  closedAt: { type: Date }
}, { timestamps: true });

// 12. INVENTORY SCHEMA
const InventorySchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseName: { type: String, required: true },
  location: { type: String },
  totalStock: { type: Number, default: 100 },
  reserved: { type: Number, default: 0 },
  available: { type: Number, default: 100 },
  backordered: { type: Number, default: 0 }
}, { timestamps: true });

// 13. ORDER SCHEMA
const OrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  deal: { type: Schema.Types.ObjectId, ref: 'Deal', required: true },
  quotation: { type: Schema.Types.ObjectId, ref: 'Quotation', required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User' },
  salesRep: { type: Schema.Types.ObjectId, ref: 'User' },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['PENDING', 'PARTIALLY_PAID', 'PAID'], default: 'PENDING' },
  fulfillmentStatus: {
    type: String,
    enum: ['AWAITING_FULFILLMENT', 'SPLIT_PENDING', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'BACKORDERED'],
    default: 'AWAITING_FULFILLMENT'
  },
  status: { type: String, enum: ['CONFIRMED', 'PROCESSING', 'FULFILLED', 'COMPLETED', 'CANCELLED'], default: 'CONFIRMED' }
}, { timestamps: true });

// 14. FULFILLMENT SCHEMA
const FulfillmentSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  warehouseAllocations: [{
    warehouseName: { type: String },
    productName: { type: String },
    quantity: { type: Number }
  }],
  backorders: [{
    productName: { type: String },
    quantity: { type: Number }
  }],
  trackingNumber: { type: String },
  status: { type: String, enum: ['ALLOCATED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'], default: 'ALLOCATED' }
}, { timestamps: true });

// 15. SUBSCRIPTION SCHEMA
const SubscriptionSchema = new Schema({
  subscriptionNumber: { type: String, required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  deal: { type: Schema.Types.ObjectId, ref: 'Deal' },
  planName: { type: String, required: true },
  billingCycle: { type: String, enum: ['MONTHLY', 'QUARTERLY', 'YEARLY'], default: 'MONTHLY' },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED'], default: 'ACTIVE' },
  currentPeriodStart: { type: Date, default: Date.now },
  currentPeriodEnd: { type: Date }
}, { timestamps: true });

// 16. INVOICE SCHEMA
const InvoiceSchema = new Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  order: { type: Schema.Types.ObjectId, ref: 'Order' },
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  deal: { type: Schema.Types.ObjectId, ref: 'Deal' },
  billingType: { type: String, enum: ['ONE_TIME', 'RECURRING'], default: 'ONE_TIME' },
  lineItems: [{
    description: { type: String },
    quantity: { type: Number },
    unitPrice: { type: Number },
    total: { type: Number }
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  outstandingAmount: { type: Number, required: true },
  status: { type: String, enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'REFUNDED'], default: 'UNPAID' },
  dueDate: { type: Date }
}, { timestamps: true });

// 17. PAYMENT SCHEMA
const PaymentSchema = new Schema({
  invoice: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'BANK_TRANSFER' },
  transactionRef: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['COMPLETED', 'FAILED'], default: 'COMPLETED' }
}, { timestamps: true });

// 18. CONVERSATION SCHEMA
const ConversationSchema = new Schema({
  entityType: { type: String, enum: ['LEAD', 'DEAL', 'QUOTE', 'ORDER'], required: true },
  entityId: { type: String, required: true },
  conversationType: { type: String, enum: ['DEAL_CLIENT', 'DEAL_INTERNAL'], default: 'DEAL_CLIENT' },
  deal: { type: Schema.Types.ObjectId, ref: 'Deal' },
  lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
  customer: { type: Schema.Types.ObjectId, ref: 'User' },
  salesRep: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// 19. MESSAGE SCHEMA
const MessageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  deal: { type: Schema.Types.ObjectId, ref: 'Deal' },
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  senderName: { type: String },
  senderRole: { type: String },
  text: { type: String, required: true },
  messageType: {
    type: String,
    enum: ['TEXT', 'FILE', 'IMAGE', 'DOCUMENT', 'SYSTEM_EVENT', 'QUOTE_EVENT', 'APPROVAL_EVENT', 'NEGOTIATION_EVENT'],
    default: 'TEXT'
  },
  attachments: [{ name: String, url: String }],
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// 20. TASK SCHEMA
const TaskSchema = new Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'Follow-up' },
  relatedDeal: { type: Schema.Types.ObjectId, ref: 'Deal' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  dueDate: { type: Date },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'], default: 'TODO' }
}, { timestamps: true });

// 21. NOTIFICATION SCHEMA
const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'INFO' },
  entityId: { type: String },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

// 22. AUDIT LOG SCHEMA
const AuditLogSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  role: { type: String },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: String },
  deal: { type: Schema.Types.ObjectId, ref: 'Deal' },
  previousValue: { type: Schema.Types.Mixed },
  newValue: { type: Schema.Types.Mixed },
  reason: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// 23. DEAL HEALTH ALERT SCHEMA
const DealHealthAlertSchema = new Schema({
  deal: { type: Schema.Types.ObjectId, ref: 'Deal', required: true },
  alertType: {
    type: String,
    enum: ['STALLED_DEAL', 'DISCOUNT_ANOMALY', 'MARGIN_DROP', 'APPROVAL_DELAY', 'DELIVERY_RISK'],
    required: true
  },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  metrics: { type: Schema.Types.Mixed },
  status: { type: String, enum: ['ACTIVE', 'RESOLVED', 'SNOOZED'], default: 'ACTIVE' }
}, { timestamps: true });

// 24. FACTORY PRODUCT REQUEST SCHEMA
const ProductRequestSchema = new Schema({
  sku: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, default: 'Hardware' },
  description: { type: String },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  stock: { type: Number, default: 50 },
  salesRepDiscountLimit: { type: Number, default: 10 },
  salesManagerDiscountLimit: { type: Number, default: 20 },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  adminComments: { type: String }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
export const Customer = mongoose.model('Customer', CustomerSchema);
export const Lead = mongoose.model('Lead', LeadSchema);
export const Product = mongoose.model('Product', ProductSchema);
export const ProductRequest = mongoose.model('ProductRequest', ProductRequestSchema);
export const PriceList = mongoose.model('PriceList', PriceListSchema);
export const DiscountRule = mongoose.model('DiscountRule', DiscountRuleSchema);
export const Quotation = mongoose.model('Quotation', QuotationSchema);
export const QuotationVersion = mongoose.model('QuotationVersion', QuotationVersionSchema);
export const ApprovalRequest = mongoose.model('ApprovalRequest', ApprovalRequestSchema);
export const Negotiation = mongoose.model('Negotiation', NegotiationSchema);
export const Deal = mongoose.model('Deal', DealSchema);
export const Inventory = mongoose.model('Inventory', InventorySchema);
export const Order = mongoose.model('Order', OrderSchema);
export const Fulfillment = mongoose.model('Fulfillment', FulfillmentSchema);
export const Subscription = mongoose.model('Subscription', SubscriptionSchema);
export const Invoice = mongoose.model('Invoice', InvoiceSchema);
export const Payment = mongoose.model('Payment', PaymentSchema);
export const Conversation = mongoose.model('Conversation', ConversationSchema);
export const Message = mongoose.model('Message', MessageSchema);
export const Task = mongoose.model('Task', TaskSchema);
export const Notification = mongoose.model('Notification', NotificationSchema);
export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export const DealHealthAlert = mongoose.model('DealHealthAlert', DealHealthAlertSchema);
