"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BedDouble, Check, ImagePlus, Plus, Save, ShowerHead, Sparkles, UploadCloud, Users, X } from "lucide-react";
import { HotelRoom } from "@/types/hotelOwner";

const ROOM_AMENITIES = [
  "King bed",
  "Twin beds",
  "Private bathroom",
  "Bathtub",
  "Balcony",
  "Ocean view",
  "Garden view",
  "Air conditioning",
  "Fan",
  "Mini fridge",
  "Tea / coffee",
  "Desk",
  "Wardrobe",
  "Smart TV",
  "Safe box",
  "Soundproofing",
];

const roomSchema = z.object({
  roomType: z.string().min(2),
  description: z.string().min(8).max(1600, "Keep room specialty details concise."),
  pricePerNight: z.coerce.number().positive(),
  capacity: z.coerce.number().int().positive(),
  amenities: z.string().min(2),
  availableRooms: z.coerce.number().int().min(0),
  status: z.enum(["active", "maintenance", "inactive"]),
});

type RoomFormValues = z.infer<typeof roomSchema>;
export type RoomPayload = Omit<RoomFormValues, "amenities"> & { amenities: string[] };

export default function RoomForm({
  initialRoom = null,
  onSubmitRoom,
  onCancel,
}: {
  initialRoom?: HotelRoom | null;
  onSubmitRoom: (payload: RoomPayload, files: File[]) => Promise<void>;
  onCancel?: () => void;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema) as Resolver<RoomFormValues>,
    defaultValues: { status: "active", amenities: "" },
  });
  const descriptionField = register("description");
  const hiddenAmenities = register("amenities");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const editing = Boolean(initialRoom);
  const existingPhotoCount = initialRoom?.images?.length || 0;
  const remainingSlots = Math.max(0, 5 - existingPhotoCount);
  const previewUrls = useMemo(() => selectedFiles.map((file) => URL.createObjectURL(file)), [selectedFiles]);

  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  useEffect(() => {
    setValue("amenities", selectedAmenities.join(", "), { shouldValidate: selectedAmenities.length > 0 });
  }, [selectedAmenities, setValue]);

  useEffect(() => {
    if (!initialRoom) return undefined;
    const id = window.setTimeout(() => {
      setSelectedAmenities(initialRoom.amenities || []);
      setDescriptionText(initialRoom.description || "");
      setSelectedFiles([]);
      reset({
        roomType: initialRoom.roomType,
        description: initialRoom.description || "",
        pricePerNight: initialRoom.pricePerNight,
        capacity: initialRoom.capacity,
        amenities: (initialRoom.amenities || []).join(", "),
        availableRooms: initialRoom.availableRooms,
        status: initialRoom.status,
      });
    }, 0);
    return () => window.clearTimeout(id);
  }, [initialRoom, reset]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((current) => current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity]);
  };

  const addCustomAmenity = () => {
    const value = customAmenity.trim();
    if (!value) return;
    setSelectedAmenities((current) => current.includes(value) ? current : [...current, value]);
    setCustomAmenity("");
  };

  const removeAmenity = (amenity: string) => {
    setSelectedAmenities((current) => current.filter((item) => item !== amenity));
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const limit = editing ? remainingSlots : 5;
    setSelectedFiles(Array.from(event.target.files || []).slice(0, limit));
  };

  const onSubmit = async (data: RoomFormValues) => {
    await onSubmitRoom({ ...data, amenities: selectedAmenities }, selectedFiles);
    setSelectedAmenities([]);
    setCustomAmenity("");
    setDescriptionText("");
    setSelectedFiles([]);
    reset({ status: "active", amenities: "" });
  };

  const removeSelectedFile = (fileIndex: number) => {
    setSelectedFiles((files) => files.filter((_, index) => index !== fileIndex));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
      <div className="border-b border-emerald-100 bg-emerald-50/60 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800"><Sparkles size={14} /> Room details</p>
            <h3 className="mt-2 text-2xl font-extrabold text-emerald-950">{editing ? "Update room" : "Add room"}</h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-emerald-900/70">{editing ? "Update the room details and add more photos if slots are available." : "Simple room setup with price, capacity, amenities, specialty, and 5 photos."}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {onCancel ? <button type="button" onClick={onCancel} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-200 px-5 py-2.5 text-sm font-extrabold text-emerald-900">Cancel</button> : null}
            <button disabled={isSubmitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-60">
              <Save size={16} /> {isSubmitting ? "Saving room..." : editing ? "Update room" : "Save room"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Section title="Room essentials" icon={<BedDouble size={18} />}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Room type" error={errors.roomType?.message}><input {...register("roomType")} placeholder="Ocean View Deluxe" className={inputClass} /></Field>
              <Field label="Price per night" error={errors.pricePerNight?.message}><input {...register("pricePerNight")} placeholder="120" type="number" className={inputClass} /></Field>
              <Field label="Guest capacity" error={errors.capacity?.message}><input {...register("capacity")} placeholder="2" type="number" className={inputClass} /></Field>
              <Field label="Available rooms" error={errors.availableRooms?.message}><input {...register("availableRooms")} placeholder="4" type="number" className={inputClass} /></Field>
              <Field label="Status" error={errors.status?.message}>
                <select {...register("status")} className={inputClass}>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Room specialty" icon={<Users size={18} />}>
            <Field label="Description" error={errors.description?.message}>
              <textarea
                {...descriptionField}
                onChange={(e) => {
                  descriptionField.onChange(e);
                  setDescriptionText(e.target.value);
                }}
                placeholder="Describe the room view, bed setup, bathroom, balcony, privacy, workspace, family suitability, and anything that makes this room special."
                className={`${inputClass} min-h-40 leading-7`}
              />
            </Field>
            <p className="mt-2 text-xs text-emerald-700/75">{descriptionText.length}/1600 characters</p>
          </Section>

          <Section title="Room amenities" icon={<ShowerHead size={18} />}>
            <input type="hidden" {...hiddenAmenities} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ROOM_AMENITIES.map((amenity) => {
                const checked = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    aria-pressed={checked}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${checked ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-emerald-100 bg-white text-slate-600 hover:border-emerald-300"}`}
                  >
                    <span className={`grid size-5 place-items-center rounded-md border ${checked ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-300"}`}>{checked ? <Check size={13} /> : null}</span>
                    {amenity}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <input value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)} className={inputClass} placeholder="Add custom room amenity" />
              <button type="button" onClick={addCustomAmenity} className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-bold text-white"><Plus size={16} /> Add</button>
            </div>
            {errors.amenities?.message ? <p className="mt-2 text-xs text-red-700">{errors.amenities.message}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedAmenities.map((item) => (
                <button key={item} type="button" onClick={() => removeAmenity(item)} className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {item} <X size={13} />
                </button>
              ))}
            </div>
          </Section>
        </div>

        <aside>
          <Section title="Room photos" icon={<ImagePlus size={18} />}>
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-5 text-center">
              <ImagePlus className="mx-auto text-emerald-800" />
              <p className="mt-3 font-bold text-emerald-950">{editing ? `${existingPhotoCount}/5 uploaded` : `${selectedFiles.length}/5 selected`}</p>
              <p className="mt-1 text-xs leading-5 text-emerald-800/75">{editing ? `${remainingSlots} photo slot${remainingSlots === 1 ? "" : "s"} remaining. Remove old photos from the room card to add again.` : "Add bed, bathroom, view, balcony, and room-specialty photos. They upload after the room is created."}</p>
              <label className={`mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-sm ${editing && remainingSlots === 0 ? "bg-slate-200 text-slate-500" : "bg-white text-emerald-900"}`}>
                <UploadCloud size={16} /> Choose room photos
                <input type="file" accept="image/*" multiple onChange={handleFiles} disabled={editing && remainingSlots === 0} className="hidden" />
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
        <h4 className="text-lg font-extrabold">{title}</h4>
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
