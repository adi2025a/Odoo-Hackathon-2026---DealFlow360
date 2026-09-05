/**
 * Multi-Warehouse Split & Stock Allocation Engine
 */
export function calculateWarehouseSplit(requestedItems = [], inventories = []) {
  let allocations = [];
  let backorders = [];
  let hasBackorder = false;

  for (const item of requestedItems) {
    const qtyNeeded = Number(item.quantity) || 1;
    let remainingNeeded = qtyNeeded;

    const prodInventories = inventories.filter(inv =>
      inv.product && (inv.product._id?.toString() === item.productId?.toString() || inv.product.sku === item.sku)
    );

    for (const inv of prodInventories) {
      if (remainingNeeded <= 0) break;

      const avail = inv.available || 0;
      if (avail > 0) {
        const allocated = Math.min(avail, remainingNeeded);
        allocations.push({
          warehouseName: inv.warehouseName,
          productName: item.name || inv.product.name,
          quantity: allocated
        });
        remainingNeeded -= allocated;
      }
    }

    if (remainingNeeded > 0) {
      hasBackorder = true;
      backorders.push({
        productName: item.name,
        quantity: remainingNeeded
      });
    }
  }

  return {
    allocations,
    backorders,
    hasBackorder
  };
}
