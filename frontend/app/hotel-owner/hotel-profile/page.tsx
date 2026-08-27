"use client";

import { Camera, Hotel, ImagePlus, ShieldCheck } from "lucide-react";
import HotelProfileForm from "@/components/hotel-owner/HotelProfileForm";
import { useHotelOwnerProfile } from "@/hooks/useHotelOwner";

export default function HotelProfilePage() {
  const { hotel, loading, error, save, uploadImages, deleteImage } = useHotelOwnerProfile();
  const photoCount = hotel?.images?.length || 0;
  const status = hotel?.verificationStatus || "pending";

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-56 animate-pulse rounded-[2rem] bg-emerald-100" />
        <div className="h-[42rem] animate-pulse rounded-[2rem] bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-800">
        <p className="font-bold">Hotel profile could not load.</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm md:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">
              <Hotel size={14} /> Hotel owner studio
            </p>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-emerald-950 md:text-4xl">
              Hotel profile setup
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-900/70">
              Manage the hotel information, amenities, and photos tourists see on the public website.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Metric icon={<Camera size={17} />} label="Photos" value={`${photoCount}/15`} />
            <Metric icon={<ImagePlus size={17} />} label="Facilities" value={String(hotel?.facilities?.length || 0)} />
            <Metric icon={<ShieldCheck size={17} />} label="Status" value={status} />
          </div>
        </div>
      </section>

      <HotelProfileForm profile={hotel} onSave={save} onUploadImages={uploadImages} onDeleteImage={deleteImage} />
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
      <div className="flex items-center justify-between gap-2 text-emerald-800">
        {icon}
        <p className="truncate text-lg font-extrabold text-emerald-950">{value}</p>
      </div>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700/70">{label}</p>
    </div>
  );
}
