"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import ExperienceCard from "@/components/activity-provider/ExperienceCard";
import ExperienceForm from "@/components/activity-provider/ExperienceForm";
import { useActivityExperiences } from "@/hooks/useActivityProvider";
import { ActivityExperience } from "@/types/activityProvider";

export default function ExperiencesPage() {
  // API-ready endpoints: GET/POST/PUT/DELETE /api/activity-provider/experiences
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityExperience | null>(null);
  const { experiences, loading, error, createExperience, updateExperience, deleteExperience, uploadExperienceImages, deleteExperienceImage, setExperienceMainImage } = useActivityExperiences();

  const formInitial = useMemo(() => editing, [editing]);

  const submit = async (payload: {
    title: string;
    description: string;
    category: ActivityExperience["category"];
    district: string;
    location: string;
    duration: string;
    price: number;
    maxGuests: number;
    includedItems: string[];
    safetyNotes?: string;
    status: ActivityExperience["status"];
  }) => {
    const editId = editing?._id || editing?.id || "";
    if (editId) {
      await updateExperience(editId, payload);
      setEditing(null);
      setOpen(false);
      return;
    }
    if (editing && !editId) {
      toast.error("Unable to update: missing experience ID.");
      return;
    }
    await createExperience(payload);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl text-emerald-950">Experiences</h1><button onClick={() => { setOpen((v) => !v); if (open) setEditing(null); }} className="rounded-xl bg-emerald-800 px-4 py-2 text-white">{open ? "Close" : "Add Experience"}</button></div>
      {open ? (
        <ExperienceForm
          initialValues={formInitial}
          onSubmit={submit}
          onUploadImages={uploadExperienceImages}
          onDeleteImage={deleteExperienceImage}
          onSetMainImage={setExperienceMainImage}
        />
      ) : null}
      {loading ? <p className="text-emerald-800">Loading experiences...</p> : null}
      {error ? <p className="text-red-700">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{experiences.map((exp) => <ExperienceCard key={exp._id || exp.id || exp.title} exp={exp} onDelete={deleteExperience} onEdit={(e) => { setEditing(e); setOpen(true); }} onUploadImages={uploadExperienceImages} />)}</div>
    </div>
  );
}
