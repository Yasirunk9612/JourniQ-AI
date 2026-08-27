const lkrFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

export function formatLkr(amount?: number | null) {
  if (amount == null || Number.isNaN(amount)) return "LKR 0";
  return lkrFormatter.format(amount).replace("LKR", "LKR ");
}

export function formatLkrPrice(value?: string | number | null, fallback = "Ask provider") {
  if (value == null || value === "") return fallback;
  if (typeof value === "number") return formatLkr(value);

  const numeric = Number(value.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return value.replace(/\$/g, "LKR ");
  }

  const suffix = value.toLowerCase().includes("night")
    ? " / night"
    : value.toLowerCase().includes("person")
      ? " / person"
      : "";

  return `${formatLkr(numeric)}${suffix}`;
}
