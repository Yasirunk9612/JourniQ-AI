"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/adminApi";

const getError = (e: unknown) => {
  if (typeof e === "object" && e && "response" in e) {
    const err = e as { response?: { data?: { message?: string } } };
    return err.response?.data?.message || "Request failed";
  }
  if (e instanceof Error) return e.message;
  return "Request failed";
};

export const useAdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setData(await adminApi.getDashboard()); } catch (e) { setError(getError(e)); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, load };
};

export const useAdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (params?: { role?: string; status?: string; search?: string }) => {
    setLoading(true);
    setError("");
    try {
      const d = await adminApi.getUsers(params);
      setUsers((d.users || []).map((u: any) => ({ ...u, id: u.id || u._id })));
    } catch (e) {
      setError(getError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const blockUser = useCallback(async (id: string) => { await adminApi.blockUser(id); toast.success("User blocked"); await load(); }, [load]);
  const unblockUser = useCallback(async (id: string) => { await adminApi.unblockUser(id); toast.success("User unblocked"); await load(); }, [load]);
  const deleteUser = useCallback(async (id: string) => { await adminApi.deleteUser(id); toast.success("User deleted"); await load(); }, [load]);

  return { users, loading, error, load, blockUser, unblockUser, deleteUser };
};

export const useAdminApprovals = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const d = await adminApi.getApprovals(); setUsers((d.users || []).map((u: any) => ({ ...u, id: u.id || u._id }))); }
    catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = useCallback(async (id: string) => { await adminApi.approveRequest(id); toast.success("Approved"); await load(); }, [load]);
  const reject = useCallback(async (id: string) => { await adminApi.rejectRequest(id); toast.success("Rejected"); await load(); }, [load]);

  return { users, loading, error, load, approve, reject };
};

export const useAdminHotels = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const d = await adminApi.getHotels(); setHotels(d.hotels || []); }
    catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const setStatus = useCallback(async (id: string, status: string) => { await adminApi.updateHotelStatus(id, status); toast.success("Hotel updated"); await load(); }, [load]);
  return { hotels, loading, error, load, setStatus };
};

export const useAdminExperiences = () => {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const d = await adminApi.getExperiences(); setExperiences(d.experiences || []); }
    catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const setStatus = useCallback(async (id: string, status: string) => { await adminApi.updateExperienceStatus(id, status); toast.success("Experience updated"); await load(); }, [load]);
  return { experiences, loading, error, load, setStatus };
};

export const useAdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async (params?: { status?: string; type?: string }) => {
    setLoading(true); setError("");
    try { const d = await adminApi.getBookings(params); setBookings(d.bookings || []); }
    catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { bookings, loading, error, load };
};

export const useAdminAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await adminApi.getAnalytics()); }
    catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { data, loading, error, load };
};

export const useAdminAiMonitoring = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const runTest = useCallback(async (payload: { preferences: string; country: string; top_n: number }) => {
    setLoading(true);
    try {
      const data = await adminApi.testAiMonitoring(payload);
      setResult(data);
      toast.success("Model test completed");
    } catch (e) {
      toast.error(getError(e));
    } finally {
      setLoading(false);
    }
  }, []);
  return { result, loading, runTest };
};

export const useAdminCommission = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await adminApi.getCommission()); }
    catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { data, loading, error, load };
};

export const useAdminReports = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await adminApi.getReports()); }
    catch (e) { setError(getError(e)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { data, loading, error, load };
};
