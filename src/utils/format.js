export function formatMoney(amount, currency = "so'm") {
  const n = Number(amount) || 0;
  return `${n.toLocaleString("uz-UZ")} ${currency}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
