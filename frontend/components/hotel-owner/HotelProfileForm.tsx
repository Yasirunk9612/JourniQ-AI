"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BedDouble,
  Building2,
  Camera,
  Car,
  Check,
  Coffee,
  ConciergeBell,
  Dumbbell,
  ImagePlus,
  MapPin,
  Mountain,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Trees,
  UploadCloud,
  Utensils,
  Waves,
  Wifi,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HotelProfile } from "@/types/hotelOwner";

const HOTEL_FACILITY_GROUPS: Array<{
  title: string;
  helper: string;
  icon: LucideIcon;
  items: Array<{ label: string; hint: string }>;
}> = [
  {
    title: "Room comfort",
    helper: "Essentials guests expect before booking.",
    icon: Wifi,
    items: [
      { label: "Free WiFi", hint: "Strong connection for every guest" },
      { label: "Air conditioning", hint: "Climate controlled rooms" },
      { label: "Family rooms", hint: "More space for families" },
      { label: "Soundproof rooms", hint: "Quiet sleep and privacy" },
      { label: "Private balcony", hint: "Outdoor seating or view" },
      { label: "Daily housekeeping", hint: "Fresh rooms during stays" },
    ],
  },
  {
    title: "Food and service",
    helper: "Dining, arrival support, and guest care.",
    icon: Utensils,
    items: [
      { label: "Breakfast included", hint: "Morning meal included" },
      { label: "Restaurant", hint: "On-site dining available" },
      { label: "Room service", hint: "Food delivered to room" },
      { label: "Airport shuttle", hint: "Pickup or drop-off support" },
      { label: "Tour desk", hint: "Local tours and guidance" },
      { label: "24-hour front desk", hint: "Support at any hour" },
    ],
  },
  {
    title: "Leisure and views",
    helper: "Experiences that make the stay memorable.",
    icon: Waves,
    items: [
      { label: "Swimming pool", hint: "Pool access for guests" },
      { label: "Sea view", hint: "Ocean-facing rooms or areas" },
      { label: "Mountain view", hint: "Hill-country or nature outlook" },
      { label: "Garden", hint: "Outdoor green spaces" },
      { label: "Spa", hint: "Wellness and treatments" },
      { label: "Yoga deck", hint: "Space for wellness sessions" },
    ],
  },
  {
    title: "Practical needs",
    helper: "Useful facilities for easier travel.",
    icon: Car,
    items: [
      { label: "Parking", hint: "On-site or nearby parking" },
      { label: "Pet friendly", hint: "Allows selected pets" },
      { label: "Accessibility support", hint: "Helpful access features" },
      { label: "Laundry", hint: "Washing or laundry service" },
      { label: "Luggage storage", hint: "Hold bags before check-in" },
      { label: "Non-smoking rooms", hint: "Cleaner air preference" },
    ],
  },
];

const FEATURED_FACILITIES = ["Free WiFi", "Breakfast included", "Air conditioning", "Parking"];
const FACILITY_PRESETS = [
  { name: "Essentials", icon: ShieldCheck, items: FEATURED_FACILITIES },
  { name: "Family stay", icon: BedDouble, items: ["Family rooms", "Breakfast included", "Laundry", "Parking"] },
  { name: "Beach escape", icon: Waves, items: ["Sea view", "Swimming pool", "Airport shuttle", "Restaurant"] },
  { name: "Wellness", icon: Trees, items: ["Spa", "Yoga deck", "Garden", "Breakfast included"] },
  { name: "Business ready", icon: Building2, items: ["Free WiFi", "Air conditioning", "24-hour front desk", "Luggage storage"] },
];

const HOTEL_CATEGORIES = ["Hotel", "Resort", "Boutique Villa", "Guest House", "Eco Lodge", "Beach Hotel", "Heritage Stay"];

const schema = z.object({
  hotelName: z.string().min(2),
  description: z.string().min(10).max(3500, "Keep the hotel description around 500 words or less."),
  district: z.string().min(2),
  address: z.string().min(4),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  category: z.string().min(2),
  facilities: z.string().min(2),
});

type FormValues = z.infer<typeof schema>;

export default function HotelProfileForm({
  profile,
  onSave,
  onUploadImages,
  onDeleteImage,
}: {
  profile: HotelProfile | null;
  onSave: (payload: Partial<HotelProfile>) => Promise<void | HotelProfile>;
  onUploadImages: (files: File[]) => Promise<void>;
  onDeleteImage: (imageUrl: string) => Promise<void>;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { category: "Hotel", facilities: "" },
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [descriptionText, setDescriptionText] = useState("");
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [customFacility, setCustomFacility] = useState("");
  const [facilitySearch, setFacilitySearch] = useState("");
  const descriptionField = register("description");
  const hiddenFacilities = register("facilities");

  const uploadedCount = profile?.images?.length || 0;
  const remainingPhotos = Math.max(0, 15 - uploadedCount);
  const wordCount = useMemo(() => descriptionText.trim().split(/\s+/).filter(Boolean).length, [descriptionText]);
  const previewUrls = useMemo(() => selectedFiles.map((file) => URL.createObjectURL(file)), [selectedFiles]);
  const filteredFacilityGroups = useMemo(() => {
    const query = facilitySearch.trim().toLowerCase();
    if (!query) return HOTEL_FACILITY_GROUPS;
    return HOTEL_FACILITY_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(query)),
    })).filter((group) => group.items.length > 0);
  }, [facilitySearch]);

  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  useEffect(() => {
    if (!profile) return;
    const facilities = profile.facilities || [];
    reset({
      hotelName: profile.hotelName,
      description: profile.description,
      district: profile.district,
      address: profile.address,
      latitude: profile.latitude,
      longitude: profile.longitude,
      category: profile.category,
      facilities: facilities.join(", "),
    });
    setDescriptionText(profile.description || "");
    setSelectedFacilities(facilities);
  }, [profile, reset]);

  useEffect(() => {
    setValue("facilities", selectedFacilities.join(", "), { shouldValidate: selectedFacilities.length > 0 });
  }, [selectedFacilities, setValue]);

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((current) => current.includes(facility) ? current.filter((item) => item !== facility) : [...current, facility]);
  };

  const selectFeaturedFacilities = () => {
    setSelectedFacilities((current) => Array.from(new Set([...current, ...FEATURED_FACILITIES])));
  };

  const applyFacilityPreset = (items: string[]) => {
    setSelectedFacilities((current) => Array.from(new Set([...current, ...items])));
  };

  const clearFacilities = () => {
    setSelectedFacilities([]);
  };

  const addCustomFacility = () => {
    const value = customFacility.trim();
    if (!value) return;
    setSelectedFacilities((current) => current.includes(value) ? current : [...current, value]);
    setCustomFacility("");
  };

  const removeFacility = (facility: string) => {
    setSelectedFacilities((current) => current.filter((item) => item !== facility));
  };

  const onSubmit = async (values: FormValues) => {
    await onSave({
      ...values,
      facilities: selectedFacilities,
    });
  };

  const handleSelectFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, remainingPhotos);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      await onUploadImages(selectedFiles);
      setSelectedFiles([]);
    } finally {
      setUploading(false);
    }
  };

  const removeSelectedFile = (fileIndex: number) => {
    setSelectedFiles((files) => files.filter((_, index) => index !== fileIndex));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
      <div className="border-b border-emerald-100 bg-emerald-50/60 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800"><Sparkles size={14} /> Listing details</p>
            <h2 className="mt-2 text-2xl font-extrabold text-emerald-950">Hotel information</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-emerald-900/70">Fill the fields, tick amenities, add custom items, then save.</p>
          </div>
          <button disabled={isSubmitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-60">
            <Save size={16} /> {isSubmitting ? "Saving..." : "Save hotel"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Section title="Hotel basics" icon={<MapPin size={18} />}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Hotel name" error={errors.hotelName?.message}><input {...register("hotelName")} className={inputClass} placeholder="Cinnamon Cove Villa" /></Field>
              <Field label="District" error={errors.district?.message}><input {...register("district")} className={inputClass} placeholder="Galle" /></Field>
              <Field label="Category" error={errors.category?.message}>
                <select {...register("category")} className={inputClass}>
                  {HOTEL_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                </select>
              </Field>
              <Field label="Full address" error={errors.address?.message}><input {...register("address")} className={inputClass} placeholder="Street, town, district" /></Field>
              <Field label="Latitude" error={errors.latitude?.message}><input {...register("latitude")} className={inputClass} placeholder="6.0329" /></Field>
              <Field label="Longitude" error={errors.longitude?.message}><input {...register("longitude")} className={inputClass} placeholder="80.2168" /></Field>
            </div>
          </Section>

          <Section title="Hotel story" icon={<Sparkles size={18} />}>
            <Field label={`Description (${wordCount}/500 words)`} error={errors.description?.message}>
              <textarea
                {...descriptionField}
                onChange={(e) => {
                  descriptionField.onChange(e);
                  setDescriptionText(e.target.value);
                }}
                className={`${inputClass} min-h-64 leading-7`}
                placeholder="Describe the arrival experience, view, architecture, food, rooms, nearby attractions, and why tourists should choose this hotel."
              />
            </Field>
          </Section>

          <Section title="Amenities and facilities" icon={<Check size={18} />}>
            <input type="hidden" {...hiddenFacilities} />
            <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white">
              <div className="grid gap-5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-5 text-white lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-amber-100">
                    <Sparkles size={13} /> Guest comfort studio
                  </p>
                  <h4 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">Choose what makes your stay easier to book.</h4>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                    Add the facilities tourists compare first. The selected items appear on the public hotel page and search cards.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-4xl font-black leading-none">{selectedFacilities.length}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/60">Selected</p>
                    </div>
                    <button type="button" onClick={clearFacilities} className="rounded-full bg-white/10 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-white/20">
                      Clear all
                    </button>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: `${Math.min(100, selectedFacilities.length * 5)}%` }} />
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-4 sm:p-5">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700" size={17} />
                    <input
                      value={facilitySearch}
                      onChange={(e) => setFacilitySearch(e.target.value)}
                      className="min-h-12 w-full rounded-2xl border border-emerald-100 bg-emerald-50/60 pl-11 pr-4 text-sm font-semibold text-emerald-950 outline-none transition placeholder:text-emerald-900/40 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-200"
                      placeholder="Search WiFi, pool, parking..."
                    />
                  </div>
                  <button type="button" onClick={selectFeaturedFacilities} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-100 px-4 text-sm font-extrabold text-amber-900 transition hover:bg-amber-200">
                    <ShieldCheck size={17} /> Add essential set
                  </button>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-800">Quick presets</p>
                    <span className="text-xs font-semibold text-slate-500">Tap a set, then adjust below</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {FACILITY_PRESETS.map((preset) => {
                      const PresetIcon = preset.icon;
                      const selectedCount = preset.items.filter((item) => selectedFacilities.includes(item)).length;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => applyFacilityPreset(preset.items)}
                          className="group min-h-28 rounded-3xl border border-emerald-100 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-emerald-800 shadow-sm">
                              <PresetIcon size={18} />
                            </span>
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-black text-emerald-800">{selectedCount}/{preset.items.length}</span>
                          </div>
                          <p className="mt-3 text-sm font-extrabold leading-tight text-emerald-950">{preset.name}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{preset.items.slice(0, 2).join(", ")}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 2xl:grid-cols-2">
              {filteredFacilityGroups.map((group) => {
                const GroupIcon = group.icon;
                const selectedInGroup = group.items.filter((item) => selectedFacilities.includes(item.label)).length;
                return (
                  <div key={group.title} className="rounded-[2rem] border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-800">
                          <GroupIcon size={20} />
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-lg font-extrabold leading-tight text-emerald-950">{group.title}</h4>
                          <p className="mt-1 text-xs leading-5 text-emerald-900/65">{group.helper}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{selectedInGroup}/{group.items.length}</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {group.items.map((facility) => {
                        const checked = selectedFacilities.includes(facility.label);
                        return (
                          <button
                            key={facility.label}
                            type="button"
                            onClick={() => toggleFacility(facility.label)}
                            className={`flex min-h-[4.75rem] items-start gap-3 rounded-2xl border p-3 text-left transition ${
                              checked
                                ? "border-emerald-800 bg-emerald-950 text-white shadow-md"
                                : "border-emerald-100 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                            }`}
                            aria-pressed={checked}
                          >
                            <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-xl border ${checked ? "border-white/40 bg-white text-emerald-800" : "border-slate-300 bg-white text-transparent"}`}>
                              <Check size={14} />
                            </span>
                            <span className="min-w-0">
                              <span className="block break-words text-sm font-extrabold leading-snug">{facility.label}</span>
                              <span className={`mt-1 block break-words text-xs leading-5 ${checked ? "text-white/70" : "text-slate-500"}`}>{facility.hint}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredFacilityGroups.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-dashed border-emerald-200 bg-white p-6 text-center">
                <p className="text-sm font-extrabold text-emerald-950">No matching facility found.</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Add it as a custom facility below and it will still appear on the public hotel page.</p>
              </div>
            ) : null}

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-[2rem] border border-dashed border-emerald-200 bg-emerald-50/50 p-4 sm:p-5">
                <div className="mb-4 flex flex-wrap gap-2 text-emerald-700">
                  {[Coffee, Trees, Mountain, ConciergeBell, Dumbbell].map((Icon, index) => (
                    <span key={index} className="grid size-10 place-items-center rounded-2xl bg-white shadow-sm">
                      <Icon size={17} />
                    </span>
                  ))}
                </div>
                <p className="text-base font-extrabold leading-tight text-emerald-950">Add anything unique</p>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-emerald-900/65">Examples: lagoon deck, yoga shala, rooftop cafe, surfboard storage, ayurveda doctor.</p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input value={customFacility} onChange={(e) => setCustomFacility(e.target.value)} className={inputClass} placeholder="Add custom facility" />
                  <button type="button" onClick={addCustomFacility} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-bold text-white"><Plus size={16} /> Add</button>
                </div>
              </div>
              <div className="rounded-[2rem] border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-extrabold leading-tight text-emerald-950">Selected for public page</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Click any item to remove it.</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-800">{selectedFacilities.length}</span>
                </div>
                <div className="flex max-h-72 flex-wrap gap-2 overflow-y-auto pr-1">
                  {selectedFacilities.map((item) => (
                    <button key={item} type="button" onClick={() => removeFacility(item)} className="inline-flex max-w-full items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold leading-snug text-emerald-800 transition hover:bg-red-50 hover:text-red-700">
                      <span className="min-w-0 break-words text-left">{item}</span> <X size={13} className="shrink-0" />
                    </button>
                  ))}
                  {selectedFacilities.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm leading-6 text-slate-500">No facilities selected yet. Use a preset or choose from the cards.</p> : null}
                </div>
              </div>
            </div>
            {errors.facilities?.message ? <p className="mt-2 text-xs text-red-700">{errors.facilities.message}</p> : null}
          </Section>
        </div>

        <aside className="space-y-5">
          <Section title="Hotel gallery" icon={<Camera size={18} />}>
            {profile?.images?.length ? (
              <div className="mb-4 grid grid-cols-2 gap-3">
                {profile.images.map((image, index) => (
                  <div key={image} className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={`${profile.hotelName} photo ${index + 1}`} className="h-28 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => void onDeleteImage(image)}
                      className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-bold text-white opacity-100 transition hover:bg-red-700 md:opacity-0 md:group-hover:opacity-100"
                    >
                      <X size={12} /> Remove
                    </button>
                    {profile.previewImage === image ? <span className="absolute bottom-2 left-2 rounded-full bg-amber-300 px-2 py-1 text-[10px] font-black text-emerald-950">Main</span> : null}
                  </div>
                ))}
              </div>
            ) : null}
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-5 text-center">
              <ImagePlus className="mx-auto text-emerald-800" />
              <p className="mt-3 font-bold text-emerald-950">{uploadedCount}/15 photos uploaded</p>
              <p className="mt-1 text-xs leading-5 text-emerald-800/75">Upload exterior, rooms, views, dining, pool, lobby, and nearby atmosphere. Files go to Cloudinary through the backend.</p>
              <label className={`mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${remainingPhotos === 0 ? "bg-slate-200 text-slate-500" : "bg-white text-emerald-900 shadow-sm"}`}>
                <UploadCloud size={16} /> Choose photos
                <input type="file" accept="image/*" multiple onChange={handleSelectFiles} disabled={remainingPhotos === 0} className="hidden" />
              </label>
            </div>
            {selectedFiles.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${file.size}`} className="relative overflow-hidden rounded-xl border border-emerald-100 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrls[index]} alt={file.name} className="h-24 w-full object-cover" />
                    <button type="button" onClick={() => removeSelectedFile(index)} className="absolute right-1 top-1 rounded-full bg-black/65 p-1 text-white" aria-label={`Remove ${file.name}`}>
                      <X size={13} />
                    </button>
                    <p className="truncate px-2 py-1.5 text-xs font-semibold text-emerald-900">{file.name}</p>
                  </div>
                ))}
              </div>
            ) : null}
            <button type="button" onClick={handleUpload} disabled={uploading || selectedFiles.length === 0} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
              <UploadCloud size={16} /> {uploading ? "Uploading..." : `Upload ${selectedFiles.length || ""}`.trim()}
            </button>
          </Section>
        </aside>
      </div>
    </form>
  );
}

const inputClass = "w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200";

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-slate-50/55 p-5">
      <div className="mb-4 flex items-center gap-2 text-emerald-950">
        <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-800">{icon}</span>
        <h3 className="text-lg font-extrabold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-emerald-900">
      <span className="mb-1.5 block font-bold">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
