"use client";

import { MapPin } from "lucide-react";

interface MapPreviewProps {
  address?: string;
  district?: string;
  latitude?: string | number;
  longitude?: string | number;
  title?: string;
}

const hasCoordinate = (value: string | number | undefined) => String(value ?? "").trim() !== "";

export default function MapPreview({ address = "", district = "", latitude = "", longitude = "", title = "Location preview" }: MapPreviewProps) {
  const hasCoords = hasCoordinate(latitude) && hasCoordinate(longitude);
  const query = hasCoords ? `${latitude},${longitude}` : [address, district, "Sri Lanka"].filter(Boolean).join(", ");
  const mapUrl = query ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed` : "";
  const externalUrl = query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : "";

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-[rgba(12,59,53,0.12)] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-emerald-100 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-extrabold text-[var(--color-midnight)]"><MapPin size={16} /> {title}</p>
        {externalUrl ? <a href={externalUrl} target="_blank" rel="noreferrer" className="text-xs font-extrabold text-[var(--color-teal)]">Open map</a> : null}
      </div>
      {mapUrl ? (
        <iframe title={title} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-56 w-full border-0" />
      ) : (
        <div className="grid h-56 place-items-center bg-[var(--color-muted)] px-4 text-center text-sm font-semibold text-slate-500">
          Add address or coordinates to preview the map.
        </div>
      )}
    </div>
  );
}

