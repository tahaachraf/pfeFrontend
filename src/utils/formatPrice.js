export function formatPrice(amount) {
  if (amount === undefined || amount === null) return "0,000 DT";
  const num = parseFloat(amount);
  const formatted = num
    .toFixed(3)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} DT`;
}
