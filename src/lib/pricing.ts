export type PriceItem = { quantity: number; unitPrice: number };

export function calculateOrder(input: {
  items: PriceItem[];
  collectionFee?: number;
  deliveryFee?: number;
  coupon?: { type: "PERCENT" | "FIXED"; value: number } | null;
}) {
  const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  let discount = 0;
  if (input.coupon?.type === "PERCENT") discount = subtotal * Math.min(input.coupon.value, 100) / 100;
  if (input.coupon?.type === "FIXED") discount = Math.min(subtotal, input.coupon.value);
  const collectionFee = input.collectionFee ?? 0;
  const deliveryFee = input.deliveryFee ?? 0;
  const total = Math.max(0, subtotal - discount + collectionFee + deliveryFee);
  return { subtotal, discount, collectionFee, deliveryFee, total };
}
