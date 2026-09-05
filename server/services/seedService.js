import bcrypt from 'bcryptjs';
import {
  User, Customer, Lead, Product, PriceList, DiscountRule, Quotation,
  ApprovalRequest, Deal, Inventory, Order, Fulfillment, Subscription,
  Invoice, Payment, Conversation, Message, Task, Notification, AuditLog, DealHealthAlert
} from '../models/Schemas.js';

export async function resetAndSeedDatabase() {
  try {
    console.log('🧹 Clearing all database collections...');
    await Promise.all([
      User.deleteMany({}),
      Customer.deleteMany({}),
      Lead.deleteMany({}),
      Product.deleteMany({}),
      PriceList.deleteMany({}),
      DiscountRule.deleteMany({}),
      Quotation.deleteMany({}),
      QuotationVersion.deleteMany({}),
      ApprovalRequest.deleteMany({}),
      Negotiation.deleteMany({}),
      Deal.deleteMany({}),
      Inventory.deleteMany({}),
      Order.deleteMany({}),
      Fulfillment.deleteMany({}),
      Subscription.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Task.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      DealHealthAlert.deleteMany({})
    ]);

    return await seedDatabase(true);
  } catch (err) {
    console.error('❌ Error resetting database:', err);
    throw err;
  }
}

export async function seedDatabase(force = false) {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0 && !force) {
      console.log('⚡ Database already contains seed data.');
      return;
    }

    console.log('🌱 Seeding DEALFLOW360 Enterprise Data...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Users for 6 Roles
    const users = await User.insertMany([
      { name: 'Acme Procurement (Client)', email: 'client@acme.com', password: hashedPassword, role: 'CLIENT', company: 'Acme Industries' },
      { name: 'Rahul Sharma (Sales Rep)', email: 'sales@dealflow.com', password: hashedPassword, role: 'SALES_REP', company: 'DealFlow360', discountAuthority: 10 },
      { name: 'Aman Verma (Sales Rep B)', email: 'sales2@dealflow.com', password: hashedPassword, role: 'SALES_REP', company: 'DealFlow360', discountAuthority: 12 },
      { name: 'Mr. Shah (Sales Manager)', email: 'manager@dealflow.com', password: hashedPassword, role: 'SALES_MANAGER', company: 'DealFlow360' },
      { name: 'R. Iyer (Finance Manager)', email: 'finance@dealflow.com', password: hashedPassword, role: 'FINANCE', company: 'DealFlow360' },
      { name: 'Main Factory (Operations)', email: 'factory@dealflow.com', password: hashedPassword, role: 'FACTORY', company: 'DealFlow360' },
      { name: 'System Admin', email: 'admin@dealflow.com', password: hashedPassword, role: 'ADMIN', company: 'DealFlow360' }
    ]);

    const clientUser = users.find(u => u.role === 'CLIENT');
    const salesRep = users.find(u => u.email === 'sales@dealflow.com');
    const salesManager = users.find(u => u.role === 'SALES_MANAGER');
    const financeUser = users.find(u => u.role === 'FINANCE');
    const factoryUser = users.find(u => u.role === 'FACTORY');

    // 2. Customers
    const customer = await Customer.create({
      companyName: 'Acme Industries',
      contactName: 'John Doe',
      email: 'client@acme.com',
      phone: '+91 98765 43210',
      tier: 'GOLD',
      creditLimit: 1000000,
      assignedRep: salesRep._id
    });

    // 3. Products
    const products = await Product.insertMany([
      {
        sku: 'CTRL-IND-500',
        name: 'Industrial Controller 500',
        category: 'Hardware',
        description: 'High-precision industrial PLC automation controller unit.',
        price: 45000,
        cost: 28000,
        stock: 60,
        maxDiscountLimit: 15
      },
      {
        sku: 'SRV-INSTALL-PRO',
        name: 'Onsite Installation & Setup',
        category: 'Services',
        description: 'Turnkey onsite deployment and engineering configuration.',
        price: 15000,
        cost: 6000,
        stock: 999,
        maxDiscountLimit: 10
      },
      {
        sku: 'SLA-SUPP-ANNUAL',
        name: 'Enterprise 24/7 Support SLA (Monthly)',
        category: 'Software',
        description: '24/7 dedicated engineering support and firmware patches.',
        price: 5000,
        cost: 1500,
        stock: 999,
        maxDiscountLimit: 20
      },
      {
        sku: 'WRT-EXTD-3YR',
        name: 'Extended 3-Year Hardware Warranty',
        category: 'Warranty',
        description: 'Full replacement coverage including shipping.',
        price: 8000,
        cost: 2000,
        stock: 999,
        maxDiscountLimit: 10
      },
      {
        sku: 'ACC-DOCK-STATION',
        name: 'Industrial Docking Station',
        category: 'Hardware',
        description: 'Ruggedized mounting hub with isolated IO ports.',
        price: 12000,
        cost: 7000,
        stock: 40,
        maxDiscountLimit: 15
      }
    ]);

    // Attach upsells
    products[0].upsells = [
      { productId: products[1]._id, reason: 'Essential for fast commissioning', promotion: 'Save 10% on bundled setup', confidence: 98 },
      { productId: products[2]._id, reason: 'Ensures zero-downtime operations', promotion: '24/7 SLA Guarantee', confidence: 92 },
      { productId: products[3]._id, reason: 'High reliability protection', promotion: '3-Year Replacement Coverage', confidence: 85 }
    ];
    await products[0].save();

    // 4. Warehouse Inventories
    await Inventory.insertMany([
      { product: products[0]._id, warehouseName: 'Main Warehouse', totalStock: 60, available: 60, reserved: 0, backordered: 0 },
      { product: products[0]._id, warehouseName: 'East Depot', totalStock: 40, available: 40, reserved: 0, backordered: 0 },
      { product: products[1]._id, warehouseName: 'Main Warehouse', totalStock: 500, available: 500, reserved: 0, backordered: 0 }
    ]);

    // 5. Price Lists & Rules
    await PriceList.create({ name: 'Gold Tier Standard List', tier: 'GOLD', currency: 'INR', adjustments: -5 });
    await DiscountRule.create({ name: 'Services Max Cap', category: 'Services', maxAllowedDiscount: 10, minAllowedMargin: 20 });

    // 6. Primary Lead & Deal
    const lead = await Lead.create({
      leadNumber: 'LD-2026-101',
      company: 'Acme Industries',
      contactName: 'John Doe',
      email: 'client@acme.com',
      phone: '+91 98765 43210',
      requirement: 'Need 100 Industrial Controllers with turnkey installation and annual support SLA.',
      product: 'Industrial Controller 500',
      quantity: 100,
      budget: 5000000,
      status: 'QUOTE_DRAFT',
      assignedRep: salesRep._id
    });

    const deal = await Deal.create({
      dealNumber: 'DEAL-1042',
      title: 'Acme Industries - 100x Automation Controllers',
      lead: lead._id,
      customer: clientUser._id,
      salesRep: salesRep._id,
      manager: salesManager._id,
      financeUser: financeUser._id,
      factory: factoryUser._id,
      stage: 'QUOTATION',
      dealValue: 5000000,
      grossMargin: 24.5,
      discount: 16,
      riskScore: 65,
      riskLevel: 'HIGH',
      healthScore: 88,
      healthStatus: 'HEALTHY'
    });

    lead.dealId = deal._id;
    await lead.save();

    // 7. Quotation (Initial Demo Locked Quotation exceeding authority)
    const quote = await Quotation.create({
      quoteNumber: 'Q-1042',
      deal: deal._id,
      lead: lead._id,
      customer: clientUser._id,
      salesRep: salesRep._id,
      version: 1,
      lines: [
        {
          product: products[0]._id,
          productName: products[0].name,
          sku: products[0].sku,
          category: products[0].category,
          quantity: 100,
          unitPrice: 45000,
          cost: 28000,
          discount: 16, // > 10% Rep limit -> Locked!
          tax: 18,
          total: 3780000,
          margin: 25.9,
          discountLimit: 15
        },
        {
          product: products[1]._id,
          productName: products[1].name,
          sku: products[1].sku,
          category: products[1].category,
          quantity: 1,
          unitPrice: 15000,
          cost: 6000,
          discount: 10,
          tax: 18,
          total: 13500,
          margin: 55.5,
          discountLimit: 10
        }
      ],
      subtotal: 4515000,
      discountAmount: 721500,
      overallDiscountPercent: 16,
      taxAmount: 682830,
      shipping: 10000,
      grandTotal: 4486330,
      totalCost: 2806000,
      grossProfit: 987500,
      grossMargin: 26.0,
      status: 'PENDING_APPROVAL',
      isLocked: true,
      lockReason: 'Requested discount (16%) exceeds Sales Rep authority (10%). Flagged for Manager & Finance review.',
      requiredApprovalLevel: 'FINANCE',
      riskScore: 65,
      riskLevel: 'HIGH',
      riskReasons: [
        'Requested discount (16%) exceeds Sales Rep approval authority (10%).',
        'Overall discount exceeds Gold tier standard guidelines.'
      ]
    });

    // 8. Approval Request
    await ApprovalRequest.create({
      quotation: quote._id,
      deal: deal._id,
      requestedBy: salesRep._id,
      targetRole: 'SALES_MANAGER',
      status: 'PENDING',
      riskScore: 65,
      riskReasons: quote.riskReasons,
      comments: 'Client requested bulk volume discount for order of 100 controllers.',
      timeline: [
        {
          user: salesRep._id,
          userName: salesRep.name,
          role: 'SALES_REP',
          action: 'SUBMITTED_FOR_APPROVAL',
          date: new Date(),
          comment: 'Quotation Q-1042 submitted for approval (16% discount requested).'
        }
      ]
    });

    // 9. Dual Conversations & Chat Messages
    const clientConv = await Conversation.create({
      entityType: 'DEAL',
      entityId: deal._id.toString(),
      conversationType: 'DEAL_CLIENT',
      deal: deal._id,
      lead: lead._id,
      customer: clientUser._id,
      salesRep: salesRep._id,
      title: `Deal Chat — ${deal.dealNumber}`,
      participants: [clientUser._id, salesRep._id]
    });

    const internalConv = await Conversation.create({
      entityType: 'DEAL',
      entityId: deal._id.toString(),
      conversationType: 'DEAL_INTERNAL',
      deal: deal._id,
      lead: lead._id,
      customer: clientUser._id,
      salesRep: salesRep._id,
      title: `Internal Chat — ${deal.dealNumber}`,
      participants: [salesRep._id, salesManager._id, financeUser._id, factoryUser._id]
    });

    deal.quotation = quote._id;
    deal.clientConversation = clientConv._id;
    deal.internalConversation = internalConv._id;
    await deal.save();

    // Client Chat Messages
    await Message.insertMany([
      {
        conversation: clientConv._id,
        deal: deal._id,
        sender: clientUser._id,
        senderName: clientUser.name,
        senderRole: 'CLIENT',
        text: 'Hi Rahul, we need 100 units of Industrial Controller 500 with setup. Can you offer a volume discount?',
        messageType: 'TEXT'
      },
      {
        conversation: clientConv._id,
        deal: deal._id,
        sender: salesRep._id,
        senderName: salesRep.name,
        senderRole: 'SALES_REP',
        text: 'Hello John! I have put together Quotation Q-1042 with 16% volume discount for your order.',
        messageType: 'TEXT'
      },
      {
        conversation: clientConv._id,
        deal: deal._id,
        senderName: 'SYSTEM',
        senderRole: 'SYSTEM',
        text: '🔒 SYSTEM: Quotation Q-1042 submitted. Waiting for internal discount approval.',
        messageType: 'SYSTEM_EVENT'
      }
    ]);

    // Internal Chat Messages
    await Message.insertMany([
      {
        conversation: internalConv._id,
        deal: deal._id,
        sender: salesRep._id,
        senderName: salesRep.name,
        senderRole: 'SALES_REP',
        text: 'Client requested 16% discount for bulk order of 100 units. My limit is 10%. Requesting Manager approval.',
        messageType: 'TEXT'
      },
      {
        conversation: internalConv._id,
        deal: deal._id,
        senderName: 'SYSTEM',
        senderRole: 'SYSTEM',
        text: '🔒 SYSTEM: Quotation Q-1042 locked. Discount (16%) exceeds Rep authority (10%). Sent to Sales Manager for approval.',
        messageType: 'APPROVAL_EVENT'
      }
    ]);

    // 10. Audit Logs & Notifications
    await AuditLog.create({
      user: salesRep._id,
      userName: salesRep.name,
      role: 'SALES_REP',
      action: 'QUOTE_LOCKED',
      entity: 'Quotation',
      entityId: quote._id.toString(),
      previousValue: { discount: 10 },
      newValue: { discount: 16, status: 'PENDING_APPROVAL' },
      reason: 'Requested discount (16%) exceeded personal authority (10%).',
      timestamp: new Date()
    });

    await Notification.create({
      user: salesManager._id,
      role: 'SALES_MANAGER',
      title: 'Approval Required: Quote Q-1042',
      message: 'Sales Rep Rahul Sharma submitted Q-1042 with 16% discount (Risk Score: 65/100).',
      type: 'APPROVAL_REQUEST',
      entityId: deal._id.toString()
    });

    // 11. Subscription seed for hybrid billing demo
    await Subscription.create({
      subscriptionNumber: 'SUB-2026-88',
      customer: clientUser._id,
      deal: deal._id,
      planName: 'Enterprise 24/7 SLA Support Plan',
      billingCycle: 'MONTHLY',
      unitPrice: 5000,
      quantity: 1,
      totalAmount: 5000,
      status: 'ACTIVE',
      currentPeriodStart: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      currentPeriodEnd: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000)
    });

    // 12. Deal Health Alert seed for Stalled Deal & Anomaly Demos
    await DealHealthAlert.create({
      deal: deal._id,
      alertType: 'DISCOUNT_ANOMALY',
      severity: 'HIGH',
      title: 'Discount Anomaly Flagged',
      description: 'Sales Rep historical avg discount is 7.2%, but requested discount is 16.0% (+8.8% anomaly).',
      metrics: { historicalAvg: 7.2, currentDiscount: 16.0, delta: 8.8 },
      status: 'ACTIVE'
    });

    console.log('✅ DEALFLOW360 Seed Completed Successfully!');
  } catch (err) {
    console.error('❌ Error Seeding Database:', err);
  }
}
