"use client";
/* eslint-disable @next/next/no-img-element */

import { ChangeEvent } from "react";
import { ActivityExperience } from "@/types/activityProvider";
import ProviderStatusBadge from "./ProviderStatusBadge";
import { formatLkr } from "@/lib/currency";

export default function ExperienceCard({
  exp,
  onDelete,
  onEdit,
  onUploadImages,
}: {
  exp: ActivityExperience;
  onDelete?: (id: string) => void;
  onEdit?: (exp: ActivityExperience) => void;
  onUploadImages?: (id: string, files: File[]) => void;
}) {
  const id = exp._id || exp.id || "";
  const coverImage = exp.previewImage || exp.images?.[0] || "";

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (id && files.length > 0) onUploadImages?.(id, files);
  };

  return (
    <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="mb-3 h-32 overflow-hidden rounded-xl bg-gradient-to-br from-amber-200 via-emerald-200 to-emerald-500">
        {coverImage ? <img src={coverImage} alt={exp.title} className="h-full w-full object-cover" /> : null}
      </div>
      <div className="flex items-start justify-between"><div><h3 className="text-lg text-emerald-950">{exp.title}</h3><p className="text-sm text-emerald-700">{exp.category} • {exp.district}</p></div><ProviderStatusBadge status={exp.status} /></div>
      <p className="mt-2 text-sm text-emerald-900/80">{exp.description}</p>
      <p className="mt-3 text-sm">{formatLkr(exp.price)} • {exp.duration} • {exp.maxGuests} guests</p>
      <p className="mt-1 text-xs text-emerald-700">Rating {exp.rating || 0} • {exp.bookingsCount || 0} bookings</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => onEdit?.(exp)} className="rounded-lg border border-emerald-200 px-3 py-1.5 text-sm">Edit</button>
        <button onClick={() => id && onDelete?.(id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700">Delete</button>
        <label className="cursor-pointer rounded-lg border border-emerald-200 px-3 py-1.5 text-sm text-emerald-800 hover:bg-emerald-50">
          Upload Images
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        </label>
      </div>
    </article>
  );
}
