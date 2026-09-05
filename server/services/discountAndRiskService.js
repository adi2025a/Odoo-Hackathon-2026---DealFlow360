export function calculateQuotationMetricsAndRisk(lines, repAuthority = 10, customerTier = 'BRONZE') {
  let subtotal = 0;
  let totalCost = 0;
  let totalDiscountAmount = 0;
  let totalTax = 0;
  const riskReasons = [];
  let riskScore = 10; // base risk

  // Category limits
  const categoryLimits = {
    'Hardware': 15,
    'Software': 20,
    'Services': 10,
    'Warranty': 10
  };

  // Tier limits
  const tierMaxDiscount = {
    'BRONZE': 10,
    'SILVER': 12,
    'GOLD': 15,
    'ENTERPRISE': 20
  };

  let maxLineDiscount = 0;

  lines.forEach(line => {
    const qty = Number(line.quantity) || 1;
    const price = Number(line.unitPrice) || 0;
    const cost = Number(line.cost) || 0;
    const discountPct = Number(line.discount) || 0;
    const taxRate = Number(line.tax) || 18;

    if (discountPct > maxLineDiscount) maxLineDiscount = discountPct;

    const baseLineTotal = qty * price;
    const lineDiscountVal = baseLineTotal * (discountPct / 100);
    const afterDiscountTotal = baseLineTotal - lineDiscountVal;
    const lineTaxVal = afterDiscountTotal * (taxRate / 100);

    const lineCostTotal = qty * cost;
    const lineMargin = afterDiscountTotal > 0 ? ((afterDiscountTotal - lineCostTotal) / afterDiscountTotal) * 100 : 0;

    line.total = Math.round(afterDiscountTotal);
    line.margin = Math.round(lineMargin * 10) / 10;

    subtotal += baseLineTotal;
    totalDiscountAmount += lineDiscountVal;
    totalCost += lineCostTotal;
    totalTax += lineTaxVal;

    // Check category rule violation
    const catLimit = categoryLimits[line.category] || 15;
    if (discountPct > catLimit) {
      riskScore += 25;
      riskReasons.push(`${line.category || 'Product'} discount (${discountPct}%) exceeds category limit (${catLimit}%).`);
    }

    // Check margin
    if (lineMargin < 12) {
      riskScore += 20;
      riskReasons.push(`Product line "${line.productName || line.sku || 'Item'}" gross margin (${line.margin}%) is below 12% target.`);
    }
  });

  const grandTotal = Math.round(subtotal - totalDiscountAmount + totalTax);
  const overallDiscountPercent = subtotal > 0 ? Math.round((totalDiscountAmount / subtotal) * 100 * 10) / 10 : 0;
  const grossProfit = Math.round(subtotal - totalDiscountAmount - totalCost);
  const grossMargin = (subtotal - totalDiscountAmount) > 0 ? Math.round((grossProfit / (subtotal - totalDiscountAmount)) * 100 * 10) / 10 : 0;

  // Rep authority check
  let isLocked = false;
  let lockReason = '';
  let requiredApprovalLevel = 'NONE';

  if (overallDiscountPercent > repAuthority || maxLineDiscount > repAuthority) {
    isLocked = true;
    riskScore += 30;
    lockReason = `Requested discount (${Math.max(overallDiscountPercent, maxLineDiscount)}%) exceeds Sales Rep approval authority (${repAuthority}%).`;
    riskReasons.push(lockReason);
    requiredApprovalLevel = 'MANAGER';
  }

  // Customer tier limit check
  const tierLimit = tierMaxDiscount[customerTier] || 10;
  if (overallDiscountPercent > tierLimit) {
    riskScore += 15;
    riskReasons.push(`Overall discount (${overallDiscountPercent}%) exceeds ${customerTier} tier max allowance (${tierLimit}%).`);
  }

  // Finance level approval if risk score >= 50 or margin < 15%
  if (riskScore >= 50 || grossMargin < 15 || overallDiscountPercent > 15) {
    requiredApprovalLevel = 'FINANCE';
    if (isLocked) {
      lockReason += ' Requires dual Manager & Finance approval due to elevated margin risk.';
    } else {
      isLocked = true;
      lockReason = `Quotation flagged for Finance review due to low gross margin (${grossMargin}%) or high risk score (${riskScore}/100).`;
    }
  }

  // Determine risk level
  let riskLevel = 'LOW';
  if (riskScore >= 75) riskLevel = 'CRITICAL';
  else if (riskScore >= 50) riskLevel = 'HIGH';
  else if (riskScore >= 25) riskLevel = 'MEDIUM';

  return {
    subtotal: Math.round(subtotal),
    discountAmount: Math.round(totalDiscountAmount),
    overallDiscountPercent,
    taxAmount: Math.round(totalTax),
    grandTotal,
    totalCost: Math.round(totalCost),
    grossProfit,
    grossMargin,
    isLocked,
    lockReason,
    requiredApprovalLevel,
    riskScore: Math.min(100, riskScore),
    riskLevel,
    riskReasons: [...new Set(riskReasons)]
  };
}
