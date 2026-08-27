"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { hotelOwnerApi, type DashboardResponse, type RevenueResponse } from "@/lib/hotelOwnerApi";
import { Booking, HotelProfile, HotelRoom, MarketInsight } from "@/types/hotelOwner";

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error && "response" in error) {
    const maybeResponse = error as { response?: { data?: { message?: string } } };
    return maybeResponse.response?.data?.message || "Request failed";
  }
  if (error instanceof Error) return error.message;
  return "Request failed";
};

export function useHotelOwnerDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await hotelOwnerApi.getDashboard();
      setData(result);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useHotelOwnerProfile() {
  const [hotel, setHotel] = useState<HotelProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await hotelOwnerApi.getHotel();
      setHotel(data.hotel);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const save = useCallback(async (payload: Partial<HotelProfile>) => {
    try {
      const res = await hotelOwnerApi.updateHotel(payload);
      setHotel(res.hotel);
      toast.success("Hotel profile updated");
      return res.hotel;
    } catch (e) {
      toast.error(getErrorMessage(e));
      throw e;
    }
  }, []);

  const uploadImages = useCallback(async (files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      const res = await hotelOwnerApi.uploadHotelImages(formData);
      setHotel(res.hotel);
      toast.success("Images uploaded");
    } catch (e) {
      toast.error(getErrorMessage(e));
      throw e;
    }
  }, []);

  const deleteImage = useCallback(async (imageUrl: string) => {
    try {
      const res = await hotelOwnerApi.deleteHotelImage(imageUrl);
      setHotel(res.hotel);
      toast.success("Image deleted");
    } catch (e) {
      toast.error(getErrorMessage(e));
      throw e;
    }
  }, []);

  return { hotel, loading, error, load, save, uploadImages, deleteImage };
}

export function useHotelOwnerRooms() {
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await hotelOwnerApi.getRooms();
      setRooms(data.rooms);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const createRoom = useCallback(async (payload: Partial<HotelRoom>) => {
    try {
      const res = await hotelOwnerApi.createRoom(payload);
      toast.success("Room created");
      await load();
      return res.room;
    } catch (e) {
      toast.error(getErrorMessage(e));
      throw e;
    }
  }, [load]);

  const updateRoom = useCallback(async (id: string, payload: Partial<HotelRoom>) => {
    try {
      await hotelOwnerApi.updateRoom(id, payload);
      toast.success("Room updated");
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
      throw e;
    }
  }, [load]);

  const deleteRoom = useCallback(async (id: string) => {
    try {
      await hotelOwnerApi.deleteRoom(id);
      toast.success("Room deleted");
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
      throw e;
    }
  }, [load]);

  const uploadRoomImages = useCallback(async (id: string, files: File[]) => {
    try {
      const formData = new FormData();
      files.slice(0, 5).forEach((file) => formData.append("images", file));
      await hotelOwnerApi.uploadRoomImages(id, formData);
      toast.success("Room images uploaded");
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
      throw e;
    }
  }, [load]);

  const deleteRoomImage = useCallback(async (id: string, imageUrl: string) => {
    try {
      await hotelOwnerApi.deleteRoomImage(id, imageUrl);
      toast.success("Room image deleted");
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
      throw e;
    }
  }, [load]);

  return { rooms, loading, error, load, createRoom, updateRoom, deleteRoom, uploadRoomImages, deleteRoomImage };
}

export function useHotelOwnerBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await hotelOwnerApi.getBookings();
      setBookings(data.bookings);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const setStatus = useCallback(async (id: string, status: Booking["status"]) => {
    try {
      await hotelOwnerApi.updateBookingStatus(id, status);
      toast.success(`Booking marked ${status}`);
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
      throw e;
    }
  }, [load]);

  return { bookings, loading, error, load, setStatus };
}

export function useHotelOwnerRevenue() {
  const [data, setData] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await hotelOwnerApi.getRevenue());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, load };
}

export function useHotelOwnerMarketInsights() {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await hotelOwnerApi.getMarketInsights();
      setInsights(res.insights);
      setNote(res.note || "");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { insights, note, loading, error, load };
}

export function useHotelOwnerAiInsights() {
  const [data, setData] = useState<import("@/lib/hotelOwnerApi").HotelAiInsightsResponse["insights"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await hotelOwnerApi.getAiInsights();
      setData(result.insights);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, load };
}
