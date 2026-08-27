"use client";

import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminModelResult } from "@/types/admin";

const schema = z.object({ preferences: z.string().min(6), country: z.string().min(2), top_n: z.coerce.number().int().min(1).max(20) });
type FormValues = z.infer<typeof schema>;

export default function AIModelTestPanel({
  results,
  onRun,
  running,
}: {
  results: AdminModelResult[];
  onRun?: (payload: FormValues) => void;
  running?: boolean;
}) {
  const { register, handleSubmit } = useForm<FormValues>({ resolver: zodResolver(schema) as Resolver<FormValues>, defaultValues: { top_n: 5 } });

  return <section className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-4"><h3 className="text-lg text-emerald-950">AI Model Test</h3><form onSubmit={handleSubmit((v) => onRun?.(v))} className="grid gap-3 md:grid-cols-3"><input {...register("country")} className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Country" /><input {...register("top_n")} type="number" className="rounded-xl border border-emerald-200 px-3 py-2" placeholder="Top N" /><button disabled={running} className="rounded-xl bg-emerald-800 px-4 py-2 text-white">{running ? "Running..." : "Run Model Test"}</button><textarea {...register("preferences")} className="md:col-span-3 min-h-24 rounded-xl border border-emerald-200 px-3 py-2" placeholder="Travel preferences" /></form><div className="grid gap-3 md:grid-cols-2">{results.map((r) => <article key={r.id} className="rounded-xl border border-emerald-100 p-3"><h4 className="font-semibold text-emerald-950">{r.entityName}</h4><p className="text-sm">Final: {r.finalScore} | Content: {r.contentScore} | Demand: {r.demandScore}</p><p className="mt-1 text-sm text-emerald-800/80">{r.explanation}</p></article>)}</div></section>;
}
