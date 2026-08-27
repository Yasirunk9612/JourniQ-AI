"use client";
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActivityExperience } from "@/types/activityProvider";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(8).max(3500, "Keep the experience description around 500 words or less."),
  category: z.enum(["village culture", "traditional food", "surfing", "hiking", "safari", "wellness", "cycling", "camping"]),
  district: z.string().min(2),
  location: z.string().min(2),
  duration: z.string().min(2),
  price: z.coerce.number().positive(),
  maxGuests: z.coerce.number().int().positive(),
  includedItems: z.string().optional(),
  safetyNotes: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "active"]),
});

type FormValues = z.infer<typeof schema>;

export default function ExperienceForm({
  initialValues,
  onSubmit,
  onUploadImages,
  onDeleteImage,
  onSetMainImage,
}: {
  initialValues?: Partial<ActivityExperience> | null;
  onSubmit: (payload: Omit<FormValues, "includedItems"> & { includedItems: string[] }) => Promise<void>;
  onUploadImages?: (id: string, files: File[]) => Promise<void>;
  onDeleteImage?: (id: string, imageUrl: string) => Promise<void>;
  onSetMainImage?: (id: string, imageUrl: string) => Promise<void>;
}) {
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<FormValues>({ resolver: zodResolver(schema) as Resolver<FormValues>, defaultValues: { status: "pending", category: "village culture" } });
  const descriptionField = register("description");
  const includedField = register("includedItems");
  const [descriptionText, setDescriptionText] = useState("");
  const [includedText, setIncludedText] = useState("");
  const wordCount = useMemo(() => descriptionText.trim().split(/\s+/).filter(Boolean).length, [descriptionText]);
  const includedChips = useMemo(() => includedText.split(",").map((v) => v.trim()).filter(Boolean), [includedText]);

  useEffect(() => {
    if (!initialValues) {
      reset({ status: "pending", category: "village culture" });
      return;
    }
    reset({
      title: initialValues.title || "",
      description: initialValues.description || "",
      category: initialValues.category || "village culture",
      district: initialValues.district || "",
      location: initialValues.location || "",
      duration: initialValues.duration || "",
      price: initialValues.price || 0,
      maxGuests: initialValues.maxGuests || 1,
      includedItems: initialValues.includedItems?.join(", ") || "",
      safetyNotes: initialValues.safetyNotes || "",
      status: initialValues.status || "pending",
    });
    setDescriptionText(initialValues.description || "");
    setIncludedText(initialValues.includedItems?.join(", ") || "");
  }, [initialValues, reset]);

  const submit = async (values: FormValues) => onSubmit({ ...values, includedItems: (values.includedItems || "").split(",").map((v) => v.trim()).filter(Boolean) });
  const experienceId = initialValues?._id || initialValues?.id || "";
  const images = initialValues?.images || [];
  const mainImage = initialValues?.previewImage || images[0] || "";

  return (
    <form onSubmit={handleSubmit(submit)} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="border-b border-emerald-100 pb-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700">Tripadvisor-style experience builder</p>
        <h3 className="text-xl font-extrabold text-emerald-950">{initialValues ? "Edit Experience" : "Add Experience"}</h3>
        <p className="mt-1 text-sm text-emerald-900/70">Tell tourists what happens, who hosts it, what is included, and what they should know before booking.</p>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input {...register("title")} placeholder="Experience title" className={inputClass} />
        <input {...register("district")} placeholder="District" className={inputClass} />
        <select {...register("category")} className={inputClass}><option>village culture</option><option>traditional food</option><option>surfing</option><option>hiking</option><option>safari</option><option>wellness</option><option>cycling</option><option>camping</option></select>
        <input {...register("location")} placeholder="Exact meeting location" className={inputClass} />
        <input {...register("duration")} placeholder="Duration, e.g. 3 hours" className={inputClass} />
        <input type="number" {...register("price")} placeholder="Price per person" className={inputClass} />
        <input type="number" {...register("maxGuests")} placeholder="Max guests" className={inputClass} />
        <select {...register("status")} className={inputClass}><option>pending</option><option>approved</option><option>rejected</option><option>active</option></select>
      </div>
      <textarea {...descriptionField} onChange={(e) => { descriptionField.onChange(e); setDescriptionText(e.target.value); }} placeholder={`Description (${wordCount}/500 words): itinerary flow, host story, cultural value, terrain, food, and what makes it memorable.`} className={`${inputClass} mt-3 min-h-52 leading-7`} />
      <input {...includedField} onChange={(e) => { includedField.onChange(e); setIncludedText(e.target.value); }} placeholder="Included items (comma separated): guide, snacks, equipment, pickup..." className={`${inputClass} mt-3`} />
      <div className="mt-2 flex flex-wrap gap-2">{includedChips.map((item) => <span key={item} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{item}</span>)}</div>
      <input {...register("safetyNotes")} placeholder="Safety notes, accessibility, what to bring" className={`${inputClass} mt-3`} />
      {experienceId ? (
        <div className="mt-4 rounded-xl border border-emerald-100 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-950">Uploaded Photos</p>
              <p className="text-xs text-emerald-700/75">Up to 15 Cloudinary-hosted photos shown on the public experience page.</p>
            </div>
            <label className="cursor-pointer rounded-lg border border-emerald-200 px-3 py-1.5 text-sm text-emerald-800 hover:bg-emerald-50">
              Upload More
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) onUploadImages?.(experienceId, files.slice(0, 15));
                }}
              />
            </label>
          </div>
          {images.length === 0 ? <p className="text-sm text-emerald-700">No images uploaded yet.</p> : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((imageUrl) => (
              <div key={imageUrl} className="rounded-lg border border-emerald-100 p-2">
                <div className="mb-2 h-28 overflow-hidden rounded-md bg-emerald-50">
                  <img src={imageUrl} alt="Experience" className="h-full w-full object-cover" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSetMainImage?.(experienceId, imageUrl)}
                    className={`rounded-md px-2 py-1 text-xs ${mainImage === imageUrl ? "bg-emerald-700 text-white" : "border border-emerald-200 text-emerald-800 hover:bg-emerald-50"}`}
                  >
                    {mainImage === imageUrl ? "Main Image" : "Make Main"}
                  </button>
                  <button type="button" onClick={() => onDeleteImage?.(experienceId, imageUrl)} className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <button disabled={isSubmitting} className="mt-3 rounded-xl bg-emerald-800 px-4 py-2 text-white">{isSubmitting ? "Saving..." : initialValues ? "Update Experience" : "Save Experience"}</button>
    </form>
  );
}

const inputClass = "rounded-xl border border-emerald-200 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-200";
