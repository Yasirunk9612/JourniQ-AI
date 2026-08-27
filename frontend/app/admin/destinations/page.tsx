"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileCode2, Globe2, ImagePlus, MapPinned, Pencil, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { AdminDestinationInput, adminApi } from "@/lib/adminApi";
import { Destination } from "@/lib/public-types";

const blankForm: AdminDestinationInput = {
  name: "",
  slug: "",
  district: "",
  province: "",
  category: "Heritage",
  description: "",
  image: "",
  bestTime: "",
  tags: [],
  interests: [],
  rating: 4.6,
  status: "published",
  blogTitle: "",
  blogExcerpt: "",
  blogHtml: "",
  blogCss: "",
};

const categories = ["Beaches", "Heritage", "Wildlife", "Mountains", "Cultural villages", "Adventure", "Food", "Wellness"];
const preferenceHints = ["Beach", "Culture", "Wildlife", "Hiking", "Food", "Village life", "Adventure", "Luxury", "Budget", "Wellness", "Photography", "Family"];

const toCsv = (items?: string[]) => (items || []).join(", ");
const fromCsv = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [form, setForm] = useState<AdminDestinationInput>(blankForm);
  const [editingId, setEditingId] = useState("");
  const [tagText, setTagText] = useState("");
  const [interestText, setInterestText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getDestinations();
      setDestinations(res.destinations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load destinations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(id);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return destinations.filter((item) => !q || [item.name, item.district, item.category, item.description, ...(item.interests || [])].join(" ").toLowerCase().includes(q));
  }, [destinations, search]);

  const selectForEdit = (item: Destination) => {
    setEditingId(item.id || "");
    setForm({
      name: item.name,
      slug: item.slug || "",
      district: item.district,
      province: item.province || "",
      category: item.category,
      description: item.description,
      image: item.image || "",
      bestTime: item.bestTime || "",
      tags: item.tags || [],
      interests: item.interests || [],
      rating: item.rating || 4.6,
      status: item.status || "published",
      blogTitle: item.blogTitle || item.name,
      blogExcerpt: item.blogExcerpt || "",
      blogHtml: item.blogHtml || "",
      blogCss: item.blogCss || "",
    });
    setTagText(toCsv(item.tags));
    setInterestText(toCsv(item.interests));
    setMessage("");
    setError("");
  };

  const reset = () => {
    setEditingId("");
    setForm(blankForm);
    setTagText("");
    setInterestText("");
    setMessage("");
    setError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const payload = { ...form, tags: fromCsv(tagText), interests: fromCsv(interestText) };
    try {
      if (editingId) {
        await adminApi.updateDestination(editingId, payload);
        setMessage("Destination story updated.");
      } else {
        await adminApi.createDestination(payload);
        setMessage("Destination story published.");
      }
      reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save destination.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: Destination) => {
    if (!item.id) return;
    const ok = window.confirm(`Delete ${item.name}? This removes the public destination story.`);
    if (!ok) return;
    setError("");
    setMessage("");
    try {
      await adminApi.deleteDestination(item.id);
      setMessage("Destination deleted.");
      await load();
      if (editingId === item.id) reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete destination.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-emerald-100 bg-emerald-950 text-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-50">
              <Sparkles className="h-3.5 w-3.5" /> Personalized destination content
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">Destination stories and cards</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/78">
              Add Sri Lankan destinations once, connect them to tourist preference tags, and publish a matching blog-style story for the public destination page.
            </p>
          </div>
          <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/8 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-emerald-50/75">Published</span>
              <strong>{destinations.filter((item) => item.status !== "draft").length}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-50/75">Drafts</span>
              <strong>{destinations.filter((item) => item.status === "draft").length}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-50/75">Preference tags</span>
              <strong>{new Set(destinations.flatMap((item) => item.interests || [])).size}</strong>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <form onSubmit={submit} className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{editingId ? "Editing destination" : "New destination"}</p>
              <h2 className="mt-1 text-2xl font-semibold text-emerald-950">Card content and story editor</h2>
            </div>
            {editingId ? (
              <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50">
                <X className="h-4 w-4" /> New story
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-emerald-950">
              Destination name
              <input required value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-600" placeholder="Ella Rock" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-emerald-950">
              URL slug
              <input value={form.slug || ""} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} className="rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-600" placeholder="ella-rock" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-emerald-950">
              District
              <input required value={form.district} onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))} className="rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-600" placeholder="Badulla" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-emerald-950">
              Province
              <input value={form.province || ""} onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value }))} className="rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-600" placeholder="Uva Province" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-emerald-950">
              Category
              <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} className="rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-600">
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-emerald-950">
              Best time
              <input value={form.bestTime || ""} onChange={(e) => setForm((prev) => ({ ...prev, bestTime: e.target.value }))} className="rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-600" placeholder="December to March" />
            </label>
          </div>

          <label className="mt-4 grid gap-1.5 text-sm font-semibold text-emerald-950">
            Hero image URL
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 px-4 py-3 focus-within:border-emerald-600">
              <ImagePlus className="h-4 w-4 text-emerald-700" />
              <input value={form.image || ""} onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))} className="w-full bg-transparent outline-none" placeholder="Cloudinary or image URL" />
            </div>
          </label>

          <label className="mt-4 grid gap-1.5 text-sm font-semibold text-emerald-950">
            Destination card description
            <textarea required maxLength={900} rows={4} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} className="rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-600" placeholder="Short public card description..." />
            <span className="text-xs font-medium text-slate-500">{form.description.length}/900 characters</span>
          </label>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-emerald-950">
              Card tags
              <input value={tagText} onChange={(e) => setTagText(e.target.value)} className="rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-600" placeholder="Tea country, hiking, sunrise" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-emerald-950">
              Preference match tags
              <input value={interestText} onChange={(e) => setInterestText(e.target.value)} className="rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-600" placeholder="Culture, Hiking, Budget" />
            </label>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {preferenceHints.map((item) => (
              <button key={item} type="button" onClick={() => setInterestText((prev) => fromCsv(prev).includes(item) ? prev : [...fromCsv(prev), item].join(", "))} className="rounded-full border border-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50">
                + {item}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="mb-4 flex items-center gap-2 text-emerald-950">
              <FileCode2 className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Destination blog post</h3>
            </div>
            <label className="grid gap-1.5 text-sm font-semibold text-emerald-950">
              Blog title
              <input value={form.blogTitle || ""} onChange={(e) => setForm((prev) => ({ ...prev, blogTitle: e.target.value }))} className="rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-600" placeholder="A guide to Ella's slow mountain mornings" />
            </label>
            <label className="mt-4 grid gap-1.5 text-sm font-semibold text-emerald-950">
              Blog excerpt
              <textarea rows={3} value={form.blogExcerpt || ""} onChange={(e) => setForm((prev) => ({ ...prev, blogExcerpt: e.target.value }))} className="rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-600" placeholder="Short summary shown above the article..." />
            </label>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-emerald-950">
                HTML content
                <textarea rows={12} value={form.blogHtml || ""} onChange={(e) => setForm((prev) => ({ ...prev, blogHtml: e.target.value }))} className="font-mono rounded-2xl border border-emerald-100 px-4 py-3 text-xs outline-none focus:border-emerald-600" placeholder="<h2>Why visit</h2><p>...</p>" />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-emerald-950">
                CSS for this post
                <textarea rows={12} value={form.blogCss || ""} onChange={(e) => setForm((prev) => ({ ...prev, blogCss: e.target.value }))} className="font-mono rounded-2xl border border-emerald-100 px-4 py-3 text-xs outline-none focus:border-emerald-600" placeholder=".destination-post-scope h2 { color: #0C3B35; }" />
              </label>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-600">
              CSS is rendered inside the destination article area. For best control, prefix selectors with <strong>.destination-post-scope</strong>. Script tags and inline event handlers are removed by the backend.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <label className="grid gap-1 text-sm font-semibold text-emerald-950">
              Status
              <select value={form.status || "published"} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as "draft" | "published" }))} className="rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-600">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-emerald-950">
              Rating
              <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))} className="w-28 rounded-2xl border border-emerald-100 px-4 py-3 outline-none focus:border-emerald-600" />
            </label>
            <button disabled={saving} className="mt-auto inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-800 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60">
              {editingId ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {saving ? "Saving..." : editingId ? "Update destination" : "Publish destination"}
            </button>
          </div>

          {message ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p> : null}
          {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        </form>

        <aside className="space-y-4">
          <div className="sticky top-24 rounded-[28px] border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-100 px-3 py-2">
              <Search className="h-4 w-4 text-emerald-700" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find destination..." className="w-full bg-transparent text-sm outline-none" />
            </div>
            {loading ? <p className="text-sm text-emerald-800">Loading destination stories...</p> : null}
            <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
              {filtered.map((item) => (
                <div key={item.id || item.slug} className="rounded-3xl border border-emerald-100 bg-[#fbfdfb] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                        <MapPinned className="h-3 w-3" /> {item.category}
                      </div>
                      <h3 className="text-base font-semibold text-emerald-950">{item.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">{item.district}{item.province ? `, ${item.province}` : ""}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${item.status === "draft" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-800"}`}>{item.status || "published"}</span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.blogExcerpt || item.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(item.interests || []).slice(0, 4).map((tag) => <span key={tag} className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-emerald-100">{tag}</span>)}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => selectForEdit(item)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-800 px-3 py-2 text-xs font-bold text-white">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button type="button" onClick={() => void remove(item)} className="inline-flex items-center justify-center rounded-full border border-red-100 px-3 py-2 text-red-700 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {item.slug ? (
                      <a href={`/destinations/${item.slug}`} target="_blank" className="inline-flex items-center justify-center rounded-full border border-emerald-100 px-3 py-2 text-emerald-800 hover:bg-emerald-50" rel="noreferrer">
                        <Globe2 className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
              {!loading && filtered.length === 0 ? <p className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-800">No destinations found yet.</p> : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
