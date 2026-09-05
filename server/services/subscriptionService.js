/**
 * Mid-Cycle Subscription Proration Engine
 */
export function calculateSubscriptionProration({ currentQuantity = 1, newQuantity = 2, unitPrice = 5000, daysUsed = 12, totalDaysInCycle = 30 }) {
  const curQty = Number(currentQuantity);
  const newQty = Number(newQuantity);
  const price = Number(unitPrice);
  const days = Number(daysUsed);
  const totalDays = Number(totalDaysInCycle);

  const daysRemaining = Math.max(0, totalDays - days);
  const dailyRate = price / totalDays;

  // Unused portion refund credit for current seats
  const unusedCredit = Math.round(curQty * dailyRate * daysRemaining);

  // Charge for new seats for remaining period
  const newChargeProrated = Math.round(newQty * dailyRate * daysRemaining);

  // Net prorated add-on charge
  const netProratedAmount = newChargeProrated - unusedCredit;

  return {
    currentQuantity: curQty,
    newQuantity: newQty,
    unitPrice: price,
    daysUsed: days,
    daysRemaining,
    dailyRate: Math.round(dailyRate * 100) / 100,
    unusedCredit,
    newChargeProrated,
    netProratedAmount,
    newMonthlyTotal: newQty * price
  };
}
