"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { activityProviderApi, type ActivityProviderDashboardResponse } from "@/lib/activityProviderApi";
import { ActivityExperience, ProviderAiInsights, ProviderBooking, ProviderCalendarEvent, ProviderProfile, ProviderRevenueRow } from "@/types/activityProvider";

const getError = (e: unknown) => {
  if (typeof e === "object" && e && "response" in e) {
    const err = e as { response?: { data?: { message?: string } } };
    return err.response?.data?.message || "Request failed";
  }
  if (e instanceof Error) return e.message;
  return "Request failed";
};

export const useActivityProviderDashboard = () => {
  const [data, setData] = useState<ActivityProviderDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await activityProviderApi.getDashboard()); }
    catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, load };
};

export const useActivityExperiences = () => {
  const [experiences, setExperiences] = useState<ActivityExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const d = await activityProviderApi.getExperiences(); setExperiences(d.experiences); }
    catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const createExperience = useCallback(async (payload: Partial<ActivityExperience>) => {
    await activityProviderApi.createExperience(payload); toast.success("Experience created"); await load();
  }, [load]);

  const updateExperience = useCallback(async (id: string, payload: Partial<ActivityExperience>) => {
    if (!id) throw new Error("Experience ID is missing.");
    await activityProviderApi.updateExperience(id, payload); toast.success("Experience updated"); await load();
  }, [load]);

  const deleteExperience = useCallback(async (id: string) => {
    await activityProviderApi.deleteExperience(id); toast.success("Experience deleted"); await load();
  }, [load]);

  const uploadExperienceImages = useCallback(async (id: string, files: File[]) => {
    if (!id) throw new Error("Experience ID is missing.");
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    await activityProviderApi.uploadExperienceImages(id, formData);
    toast.success("Experience images uploaded");
    await load();
  }, [load]);

  const deleteExperienceImage = useCallback(async (id: string, imageUrl: string) => {
    if (!id) throw new Error("Experience ID is missing.");
    await activityProviderApi.deleteExperienceImage(id, imageUrl);
    toast.success("Image deleted");
    await load();
  }, [load]);

  const setExperienceMainImage = useCallback(async (id: string, imageUrl: string) => {
    if (!id) throw new Error("Experience ID is missing.");
    await activityProviderApi.setExperienceMainImage(id, imageUrl);
    toast.success("Main image updated");
    await load();
  }, [load]);

  return { experiences, loading, error, load, createExperience, updateExperience, deleteExperience, uploadExperienceImages, deleteExperienceImage, setExperienceMainImage };
};

export const useActivityBookings = () => {
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const d = await activityProviderApi.getBookings(); setBookings(d.bookings); }
    catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const setStatus = useCallback(async (id: string, status: ProviderBooking["status"]) => {
    await activityProviderApi.updateBookingStatus(id, status); toast.success(`Booking ${status}`); await load();
  }, [load]);

  return { bookings, loading, error, load, setStatus };
};

export const useActivityCalendar = () => {
  const [events, setEvents] = useState<ProviderCalendarEvent[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<ProviderBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const d = await activityProviderApi.getCalendar(); setEvents(d.events); setUpcomingBookings(d.upcomingBookings); }
    catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const updateCalendar = useCallback(async (payload: Partial<ProviderCalendarEvent> & { experienceId?: string }) => {
    await activityProviderApi.updateCalendar(payload); toast.success("Calendar updated"); await load();
  }, [load]);

  const deleteCalendarEvent = useCallback(async (id: string) => {
    await activityProviderApi.deleteCalendarEvent(id);
    toast.success("Calendar event deleted");
    await load();
  }, [load]);

  return { events, upcomingBookings, loading, error, load, updateCalendar, deleteCalendarEvent };
};

export const useActivityRevenue = () => {
  const [summary, setSummary] = useState<{ totalRevenue: number; commissionPaid: number; netEarning: number; completedExperiences: number } | null>(null);
  const [rows, setRows] = useState<ProviderRevenueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const d = await activityProviderApi.getRevenue(); setSummary(d.summary); setRows(d.monthlyBreakdown); }
    catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { summary, rows, loading, error, load };
};

export const useActivityProfile = () => {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const d = await activityProviderApi.getProfile(); setProfile(d.profile); }
    catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const save = useCallback(async (payload: Partial<ProviderProfile>) => {
    const d = await activityProviderApi.updateProfile(payload);
    setProfile(d.profile);
    toast.success("Profile updated");
  }, []);

  const uploadImages = useCallback(async (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    const d = await activityProviderApi.uploadProfileImages(formData);
    setProfile(d.profile);
    toast.success("Profile images uploaded");
  }, []);

  const deleteImage = useCallback(async (imageUrl: string) => {
    const d = await activityProviderApi.deleteProfileImage(imageUrl);
    setProfile(d.profile);
    toast.success("Image deleted");
  }, []);

  return { profile, loading, error, load, save, uploadImages, deleteImage };
};

export const useActivityAiInsights = () => {
  const [insights, setInsights] = useState<ProviderAiInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const d = await activityProviderApi.getAiInsights(); setInsights(d.insights); }
    catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { insights, loading, error, load };
};
