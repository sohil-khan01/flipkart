const ORDER_KEY = 'fk_orders_v1';

export function readOrders() {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function writeOrders(orders) {
  localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
}

export function addOrder(order) {
  const orders = readOrders();
  const next = [order, ...orders];
  writeOrders(next);
  return next;
}

export function clearOrders() {
  localStorage.removeItem(ORDER_KEY);
}
