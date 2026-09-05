export function calculateWarehouseSplit(requestedItems, warehousesStock) {
  // requestedItems: [{ productId, name, quantity }]
  // warehousesStock: [{ warehouseName, productId, available }]
  const allocations = [];
  const backorders = [];

  requestedItems.forEach(item => {
    let remainingNeeded = item.quantity;

    // Filter available stock for this product across warehouses
    const stockEntries = warehousesStock
      .filter(w => w.productId.toString() === item.productId.toString() || w.productName === item.name)
      .sort((a, b) => b.available - a.available); // Prioritize warehouse with higher stock

    for (const stock of stockEntries) {
      if (remainingNeeded <= 0) break;

      const allocateQty = Math.min(stock.available, remainingNeeded);
      if (allocateQty > 0) {
        allocations.push({
          warehouseName: stock.warehouseName,
          productName: item.name,
          productId: item.productId,
          quantity: allocateQty
        });
        remainingNeeded -= allocateQty;
        stock.available -= allocateQty; // mutate local available count for calculation
      }
    }

    if (remainingNeeded > 0) {
      backorders.push({
        productName: item.name,
        productId: item.productId,
        quantity: remainingNeeded
      });
    }
  });

  return {
    allocations,
    backorders,
    hasBackorder: backorders.length > 0
  };
}
