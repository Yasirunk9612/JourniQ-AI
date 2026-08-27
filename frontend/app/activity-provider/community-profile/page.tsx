"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CommunityProfileForm from "@/components/activity-provider/CommunityProfileForm";
import { useActivityProfile } from "@/hooks/useActivityProvider";

export default function CommunityProfilePage() {
  // API-ready endpoint: PUT /api/activity-provider/profile
  const { profile, loading, error, save, uploadImages, deleteImage } = useActivityProfile();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const galleryImages = useMemo(() => {
    const images = profile?.images || [];
    const preview = profile?.previewImage;
    if (!preview) return images;
    return [preview, ...images.filter((img) => img !== preview)];
  }, [profile?.images, profile?.previewImage]);

  const safeIndex = Math.min(activeImageIndex, Math.max(galleryImages.length - 1, 0));
  const currentImage = galleryImages[safeIndex] || "";

  const goPrevImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const goNextImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  if (loading) return <p className="text-emerald-800">Loading profile...</p>;
  if (error) return <p className="text-red-700">{error}</p>;

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <CommunityProfileForm profile={profile} onSave={save} />
        <section className="mt-4 rounded-2xl border border-emerald-100 bg-white p-5">
          <h3 className="text-lg text-emerald-950">Upload Community Images</h3>
          <label className="mt-3 inline-block cursor-pointer rounded-lg border border-emerald-200 px-4 py-2 text-sm text-emerald-800 hover:bg-emerald-50">
            Select Images
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) uploadImages(files);
              }}
            />
          </label>
        </section>
      </div>

      <aside className="rounded-2xl border border-emerald-100 bg-white p-5">
        <h3 className="text-lg text-emerald-950">Preview</h3>
        <div className="relative mt-3 h-40 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-200 to-emerald-500">
          {currentImage ? (
            <img src={currentImage} alt="Profile preview" className="h-full w-full object-cover" />
          ) : null}
          {galleryImages.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-1.5 text-white hover:bg-black/60"
                aria-label="Previous image"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={goNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-1.5 text-white hover:bg-black/60"
                aria-label="Next image"
              >
                <ChevronRight size={16} />
              </button>
            </>
          ) : null}
        </div>
        <p className="mt-3 text-xl text-emerald-950">{profile?.businessName}</p>
        <p className="text-sm text-emerald-700">{profile?.district}</p>
        <p className="mt-2 text-sm text-emerald-900/80">{profile?.story}</p>
        <p className="mt-2 text-xs text-emerald-700">Languages: {profile?.languages.join(", ")}</p>
        <span className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${profile?.verificationStatus === "approved" ? "bg-emerald-100 text-emerald-800" : profile?.verificationStatus === "pending" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700"}`}>{profile?.verificationStatus}</span>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {profile?.images?.map((img) => (
            <div key={img} className="relative">
              <img src={img} alt="community" className="h-20 w-full rounded-lg object-cover" />
              <button onClick={() => deleteImage(img)} className="absolute right-1 top-1 rounded-md bg-black/55 p-1 text-white"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
