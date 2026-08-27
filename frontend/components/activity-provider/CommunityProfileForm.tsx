"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ProviderProfile } from "@/types/activityProvider";

type FormValues = {
  providerName: string;
  businessName: string;
  story: string;
  district: string;
  contactNumber: string;
  address: string;
  languages: string;
};

export default function CommunityProfileForm({ profile, onSave }: { profile: ProviderProfile | null; onSave: (payload: Partial<ProviderProfile>) => Promise<void> }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormValues>();

  useEffect(() => {
    if (!profile) return;
    reset({
      providerName: profile.providerName,
      businessName: profile.businessName,
      story: profile.story,
      district: profile.district,
      contactNumber: profile.contactNumber,
      address: profile.address,
      languages: profile.languages.join(", "),
    });
  }, [profile, reset]);

  return (
    <form onSubmit={handleSubmit(async (values) => onSave({ ...values, languages: values.languages.split(",").map((v) => v.trim()).filter(Boolean) }))} className="rounded-2xl border border-emerald-100 bg-white p-5">
      <h2 className="text-xl text-emerald-950">Community Profile</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2"><input {...register("providerName")} placeholder="Provider name" className="rounded-xl border border-emerald-200 px-3 py-2" /><input {...register("businessName")} placeholder="Business/community name" className="rounded-xl border border-emerald-200 px-3 py-2" /><input {...register("district")} placeholder="District" className="rounded-xl border border-emerald-200 px-3 py-2" /><input {...register("contactNumber")} placeholder="Contact" className="rounded-xl border border-emerald-200 px-3 py-2" /><input {...register("address")} placeholder="Address" className="rounded-xl border border-emerald-200 px-3 py-2 md:col-span-2" /></div>
      <textarea {...register("story")} placeholder="Story/about" className="mt-3 min-h-24 w-full rounded-xl border border-emerald-200 px-3 py-2" />
      <input {...register("languages")} placeholder="Languages (comma separated)" className="mt-3 w-full rounded-xl border border-emerald-200 px-3 py-2" />
      <div className="mt-3 rounded-xl border border-dashed border-emerald-200 p-3 text-sm text-emerald-700">Verification documents upload UI placeholder</div>
      <button disabled={isSubmitting} className="mt-3 rounded-xl bg-emerald-800 px-4 py-2 text-white">{isSubmitting ? "Saving..." : "Save Profile"}</button>
    </form>
  );
}
