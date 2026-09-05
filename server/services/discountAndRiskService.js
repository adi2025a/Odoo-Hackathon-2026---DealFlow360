/**
 * Discount Governance & Risk Evaluation Engine
 */
export function calculateQuotationMetricsAndRisk(lines = [], repDiscountAuthority = 10, customerTier = 'BRONZE') {
  let subtotal = 0;
  let totalCost = 0;
  let totalDiscountAmount = 0;
  let totalTax = 0;

  const processedLines = lines.map(line => {
    const qty = Number(line.quantity) || 1;
    const price = Number(line.unitPrice) || 0;
    const cost = Number(line.cost) || 0;
    const discPercent = Number(line.discount) || 0;
    const taxRate = Number(line.tax) || 18;

    const lineSubtotal = qty * price;
    const lineDiscount = lineSubtotal * (discPercent / 100);
    const lineNet = lineSubtotal - lineDiscount;
    const lineTax = lineNet * (taxRate / 100);
    const lineTotal = lineNet + lineTax;
    const lineCostTotal = qty * cost;
    const lineProfit = lineNet - lineCostTotal;
    const lineMargin = lineNet > 0 ? (lineProfit / lineNet) * 100 : 0;

    subtotal += lineSubtotal;
    totalCost += lineCostTotal;
    totalDiscountAmount += lineDiscount;
    totalTax += lineTax;

    return {
      ...line,
      quantity: qty,
      unitPrice: price,
      cost,
      discount: discPercent,
      tax: taxRate,
      total: Math.round(lineTotal),
      margin: Math.round(lineMargin * 10) / 10
    };
  });

  const grandTotal = Math.round((subtotal - totalDiscountAmount) + totalTax);
  const overallDiscountPercent = subtotal > 0 ? Math.round((totalDiscountAmount / subtotal) * 1000) / 10 : 0;
  const netRevenue = subtotal - totalDiscountAmount;
  const grossProfit = netRevenue - totalCost;
  const grossMargin = netRevenue > 0 ? Math.round((grossProfit / netRevenue) * 1000) / 10 : 0;

  // Risk Score Calculation Algorithm (0 to 100)
  let riskScore = 0;
  const riskReasons = [];

  // 1. Discount vs Personal Authority Risk (+35)
  if (overallDiscountPercent > repDiscountAuthority) {
    const excess = overallDiscountPercent - repDiscountAuthority;
    riskScore += Math.min(35, Math.round(excess * 5));
    riskReasons.push(`Requested discount (${overallDiscountPercent}%) exceeds Sales Rep approval authority (${repDiscountAuthority}%).`);
  }

  // 2. Gross Margin Threshold Risk (+35)
  if (grossMargin < 15.0) {
    riskScore += 35;
    riskReasons.push(`Gross margin (${grossMargin}%) falls below 15.0% threshold requirement.`);
  } else if (grossMargin < 20.0) {
    riskScore += 20;
    riskReasons.push(`Gross margin (${grossMargin}%) is below standard target (20.0%).`);
  }

  // 3. Customer Tier Alignment Risk (+20)
  const tierLimits = { BRONZE: 5, SILVER: 10, GOLD: 15, ENTERPRISE: 25 };
  const tierCap = tierLimits[customerTier] || 10;
  if (overallDiscountPercent > tierCap) {
    riskScore += 20;
    riskReasons.push(`Discount exceeds ${customerTier} tier standard limit (${tierCap}%).`);
  }

  // 4. Low Volume High Discount Anomaly (+10)
  if (subtotal < 100000 && overallDiscountPercent > 12) {
    riskScore += 10;
    riskReasons.push('High discount requested on small volume order.');
  }

  riskScore = Math.min(100, Math.max(0, riskScore));

  let riskLevel = 'LOW';
  if (riskScore >= 75) riskLevel = 'CRITICAL';
  else if (riskScore >= 50) riskLevel = 'HIGH';
  else if (riskScore >= 25) riskLevel = 'MEDIUM';

  // Evaluate Lock Status and Required Approval Level
  const isLocked = overallDiscountPercent > repDiscountAuthority || grossMargin < 15.0 || riskScore >= 50;

  let requiredApprovalLevel = 'NONE';
  if (isLocked) {
    if (grossMargin < 15.0 || riskScore >= 50 || overallDiscountPercent > 20) {
      requiredApprovalLevel = 'FINANCE';
    } else {
      requiredApprovalLevel = 'MANAGER';
    }
  }

  let lockReason = '';
  if (isLocked) {
    if (overallDiscountPercent > repDiscountAuthority) {
      lockReason = `Requested discount (${overallDiscountPercent}%) exceeds Sales Rep authority (${repDiscountAuthority}%). Flagged for Sales Manager & Finance review.`;
    } else if (grossMargin < 15.0) {
      lockReason = `Gross margin (${grossMargin}%) drops below minimum 15.0% floor. Requires Finance approval.`;
    } else {
      lockReason = `High Risk Score (${riskScore}/100) detected. Dual Manager & Finance review required.`;
    }
  }

  return {
    lines: processedLines,
    subtotal,
    discountAmount: totalDiscountAmount,
    overallDiscountPercent,
    taxAmount: totalTax,
    grandTotal,
    totalCost,
    grossProfit,
    grossMargin,
    riskScore,
    riskLevel,
    riskReasons,
    isLocked,
    lockReason,
    requiredApprovalLevel
  };
}
