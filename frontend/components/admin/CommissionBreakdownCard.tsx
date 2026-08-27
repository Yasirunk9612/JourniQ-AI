import { formatLkr } from "@/lib/currency";

export default function CommissionBreakdownCard({ total }: { total: number }) {
  const commission = total * 0.03;
  const payout = total * 0.97;
  return <section className="rounded-2xl border border-emerald-100 bg-white p-4"><h3 className="text-lg text-emerald-950">Commission Formula</h3><p className="mt-2 text-sm">`platformCommission = totalAmount * 0.03`</p><p className="text-sm">`providerEarning = totalAmount * 0.97`</p><div className="mt-3 grid gap-2 text-sm"><p>Total Booking Value: <strong>{formatLkr(total)}</strong></p><p>Platform 3% Revenue: <strong>{formatLkr(commission)}</strong></p><p>Provider 97% Payout: <strong>{formatLkr(payout)}</strong></p></div></section>;
}
