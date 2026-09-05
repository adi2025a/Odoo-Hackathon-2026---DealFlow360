export function calculateSubscriptionProration({
  currentQuantity,
  newQuantity,
  unitPrice,
  billingCycleDays = 30,
  daysUsed = 12,
  startDate,
  endDate
}) {
  const oldMonthlyCost = currentQuantity * unitPrice;
  const newMonthlyCost = newQuantity * unitPrice;

  const daysRemaining = billingCycleDays - daysUsed;
  const dailyOldRate = oldMonthlyCost / billingCycleDays;
  const dailyNewRate = newMonthlyCost / billingCycleDays;

  const usedAmount = Math.round(dailyOldRate * daysUsed);
  const unusedOldCredit = Math.round(dailyOldRate * daysRemaining);
  const newPeriodCharge = Math.round(dailyNewRate * daysRemaining);

  const proratedAdjustment = newPeriodCharge - unusedOldCredit;

  return {
    currentQuantity,
    newQuantity,
    unitPrice,
    oldMonthlyCost,
    newMonthlyCost,
    billingCycleDays,
    daysUsed,
    daysRemaining,
    usedAmount,
    unusedOldCredit,
    newPeriodCharge,
    proratedAdjustment, // Positive means additional charge, negative means credit refund
    summaryMessage: proratedAdjustment >= 0
      ? `Prorated add-on charge: ₹${proratedAdjustment.toLocaleString('en-IN')} for remaining ${daysRemaining} days.`
      : `Prorated credit refund: ₹${Math.abs(proratedAdjustment).toLocaleString('en-IN')} applied for remaining ${daysRemaining} days.`
  };
}
