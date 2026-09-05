# 🚀 DealFlow360: Intelligent, Self-Governing Sales Operations Platform

> **Hackathon Edition** | *Transforming static B2B quotations into dynamic, self-governing deal engines.*

![DealFlow360 Header](https://img.shields.io/badge/Platform-DealFlow360-38bdf8?style=for-the-badge&logo=rocket)
![Build Status](https://img.shields.io/badge/Architecture-Full%20Stack%20MERN-818cf8?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Hackathon%20Ready-34d399?style=for-the-badge)
![Excalidraw Design](https://img.shields.io/badge/Design-Excalidraw%20Mockup-fbbf24?style=for-the-badge&logo=excalidraw)

---

## 📌 Executive Summary

Traditional B2B sales tools suffer from critical operational disconnects:
- **Uncontrolled Discounts**: Reps apply arbitrary discounts, eroding healthy product margins.
- **Fulfillment blindspots**: Orders are confirmed without visibility into warehouse stock spread across locations.
- **Fragmented Billing**: Recurring software subscriptions and one-time hardware purchases require separate systems.
- **Friction in Negotiation**: Back-and-forth email PDF redlines delay deal closure and stall revenue momentum.

**DealFlow360** eliminates these pain points by serving as a **self-governing sales engine**. It automates pricing discipline via a **Blended Discount Risk Score**, dynamically splits inventory across multiple warehouses, generates hybrid billing schedules with proration, and gives reps and customers a **live, negotiable quotation portal**.

---

## 🎨 System Mockups & Design Reference
Interactive wireframes and workflow mockups are modeled on Excalidraw:
🔗 **[View Live Excalidraw Architecture & UX Mockup](https://app.excalidraw.com/l/65VNwvy7c4X/7Fb5SR3WKu2)**

---

## 🌟 Core Platform Modules

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                      DEALFLOW360                        │
                    └────────────────────────────┬────────────────────────────┘
                                                 │
      ┌─────────────────────────┬────────────────┼─────────────────────────┬─────────────────────────┐
      ▼                         ▼                ▼                         ▼                         ▼
┌───────────┐            ┌─────────────┐  ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
│  Discount │            │   Upsell &  │  │ Multi-Stock │           │   Hybrid    │           │  Customer   │
│ Governance│            │ Cross-Sell  │  │ Auto-Split  │           │   Billing   │           │   Portal    │
└─────┬─────┘            └──────┬──────┘  └──────┬──────┘           └──────┬──────┘           └──────┬──────┘
      │                         │                │                         │                         │
      ▼                         ▼                ▼                         ▼                         ▼
  Blended Risk               Margin Delta    Cost-Optimized            Proration &               Line Commenting &
 Scoring Engine              Recalculator    Fulfillment               Credit Notes              Auto Re-Approval
```

### 1. 🛡️ Multi-Tier Discount Governance & Blended Risk Score
- **Category & Tier Ceilings**: Products belong to categories (`Hardware`, `Services`, `Subscriptions`) with unique discount limits mapped to customer tiers (`Bronze`, `Silver`, `Gold`).
- **Blended Discount Risk Score**: Looks at the overall discounting pattern across all line items rather than just single isolated items.
  $$\text{Line Excess} = \max(0, \text{Discount}_{\text{given}} - \text{Ceiling}_{\text{category}})$$
  $$\text{Blended Risk Score} = \sum \left( \text{Line Excess} \times \text{Quantity Weight} \times \text{Category Risk Factor} \right)$$
- **Automated Approval Chains**:
  - **Score = 0**: Instant Auto-Approval.
  - **0 < Score ≤ 25**: Requires **Sales Manager** review.
  - **Score > 25**: Triggers multi-stage approval (**Sales Manager** $\rightarrow$ **Finance**).
- **Audit Logging**: Every approval, rejection, or modification records timestamp, user ID, and justification.

### 2. ⚡ Live Upsell & Cross-Sell Recommendation Engine
- **Co-Purchase Pairing**: Suggests items based on historical purchase data (e.g., pairing servers with warranty extensions).
- **Margin Thresholding**: Filters recommendations so only items meeting minimum margin criteria (e.g. $\ge 20\%$) surface.
- **Instant Margin Indicator**: Displays live margin delta ($\Delta$) when adding items to the quote in real-time.

### 3. 📦 Multi-Warehouse Fulfillment Splitting & Backorders
- **Smart Allocation**: Evaluates live stock across warehouses (`Main Warehouse`, `East Depot`, `West Hub`).
- **Shipping Cost Weighting**: Calculates optimal warehouse splits to minimize shipment count and transit expense.
- **Backorder Consolidation Prompt**: Automatically prompts sales ops to consolidate backorders when incoming stock arrives mid-fulfillment.

### 4. 🔄 Hybrid Billing & Recurring Subscription Engine
- **Unified Quotation**: Single order containing one-time hardware, professional services, and recurring subscriptions.
- **Proration Calculator**: Handles mid-cycle quantity adjustments or mid-month plan upgrades seamlessly.
- **Cancellation & Partial Refund**: Triggers automatic credit note calculations upon subscription modification.

### 5. 🤝 Customer Negotiation Portal
- **Isolated Token Access**: Secure, link-based customer portal (`/portal/quote/:token`).
- **Line-Item Collaboration**: Customers add comments, ask questions, or counter-propose line discounts directly on live quotes.
- **Automated Threshold Re-Entry**: If customer counter-proposals push the blended risk score past allowed limits, the quotation automatically re-enters the manager approval queue.

### 6. 📊 Deal Health Monitoring & Anomaly Dashboard
- **Stalled Deal Alerts**: Identifies quotes inactive for over $N$ days with one-click escalation nudges.
- **Discount Anomaly Flags**: Highlights quote discounts exceeding a sales rep’s historical average.
- **Delivery Promise Slippage**: Tracks fulfillment delay risks.
- **Multi-Filter Analytics**: Filter performance reports by Period, Sales Rep, Approval Status, or Product Category with PDF/XLS export capabilities.

---

## 🗄️ Data Model Overview

| Model | Primary Purpose | Key Fields |
| :--- | :--- | :--- |
| **`User`** | RBAC & Customer Profiles | `name`, `email`, `role` (`sales_rep`, `sales_manager`, `finance`, `customer`, `admin`), `customerTier` (`Bronze`, `Silver`, `Gold`) |
| **`Product`** | Catalog & Co-purchase logic | `name`, `category`, `unitPrice`, `unitCost`, `taxPercent`, `isPromoted`, `pairedProductIds` |
| **`Warehouse`** | Stock & Shipping Weights | `name`, `location`, `shippingCostWeight`, `inventory` (`productId`, `stockLevel`) |
| **`DiscountPolicy`** | Governance Rules | `customerTier`, `categoryCeilings` (`Hardware`, `Services`, `Subscriptions`), `managerThresholdScore`, `financeThresholdScore` |
| **`Quotation`** | Living Deal Document | `quoteNumber`, `lines`, `totals`, `blendedRiskScore`, `approvalFlow`, `fulfillmentSplits`, `customerNegotiation`, `billingSchedule` |

---

## 🧪 8-Step Quick Test Flow (End-to-End Walkthrough)

To verify the business logic across the platform:

1. **Authentication & Config**: Log in as Admin / Sales Rep and ensure discount policy ceilings, warehouses, and products are initialized.
2. **Quotation Creation**: Create a new quotation for a customer and add a Service product line with an 18% discount (ceiling is 10%).
3. **Automated Approval Trigger**: Confirm that saving the quote flags it as `Pending Approval` and routes to Sales Manager + Finance due to high Blended Risk Score.
4. **Live Upsell Panel**: Accept a recommended hardware add-on and observe instant margin percentage update.
5. **Approval Workflow**: Log in as Manager/Finance to approve the quote; review full audit trail entry.
6. **Multi-Warehouse Auto-Split**: Proceed to fulfillment; verify stock auto-splits across `Main Warehouse` and `East Depot`.
7. **Hybrid Billing Check**: Inspect generated billing schedule displaying one-time line total alongside monthly recurring subscription schedule.
8. **Customer Portal Negotiation**: Open customer portal link, counter-proposal line discount as Customer $\rightarrow$ confirm quote automatically re-triggers approval if limits are exceeded.

---

## 🛠️ Technology Architecture

- **Frontend**: Vite 6, React 19, Lucide Icons, Glassmorphism Design System.
- **Backend**: Node.js, Express.js (ES Modules), Mongoose ODM, Dotenv, CORS.
- **Database**: MongoDB (Local or Atlas).
- **Concurrency**: `concurrently` for running frontend and backend simultaneously.

---

## 🔮 Future Roadmap

- 🌐 **Multi-Currency & Multi-Tenant Support**: FX rate auto-conversion and multi-entity organization support.
- 🤖 **AI Close Probability Engine**: Machine learning model predicting deal close probability based on negotiation velocity.
- 🔌 **Native ERP/CRM Connectors**: Two-way sync with Odoo, Salesforce, and HubSpot.

---

*Created for Hackathon Demonstration — DealFlow360 Sales Operations Platform.*
