import { axiosClient } from "./axiosClient";
import { Destination } from "./public-types";

const unwrap = <T>(promise: Promise<{ data: T }>) => promise.then((res) => res.data);

export type AdminDestinationInput = Omit<Destination, "id" | "matchScore" | "matchReasons" | "accent"> & {
  status?: "draft" | "published";
};

export interface AiModelSummary {
  selectedModel: string;
  modelUse?: string;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1Score: number | null;
  note?: string;
}

export interface TourismAnalyticsResponse {
  analytics: {
    model: AiModelSummary;
    datasetRows: number;
    avgAiScore: number;
    recommendedRows: number;
    countries: Array<{ name: string; value: number }>;
    districts: Array<{ name: string; value: number }>;
    categories: Array<{ name: string; value: number }>;
    months: Array<{ name: string; value: number }>;
  };
}

export const adminApi = {
  getDashboard: () => unwrap<Record<string, unknown>>(axiosClient.get("/admin/dashboard")),

  getUsers: (params?: { role?: string; status?: string; search?: string }) => unwrap<{ users?: unknown[] }>(axiosClient.get("/admin/users", { params })),
  blockUser: (id: string) => unwrap<Record<string, unknown>>(axiosClient.patch(`/admin/users/${id}/block`)),
  unblockUser: (id: string) => unwrap<Record<string, unknown>>(axiosClient.patch(`/admin/users/${id}/unblock`)),
  deleteUser: (id: string) => unwrap<Record<string, unknown>>(axiosClient.delete(`/admin/users/${id}`)),

  getApprovals: () => unwrap<{ users?: unknown[] }>(axiosClient.get("/admin/approvals")),
  approveRequest: (id: string) => unwrap<Record<string, unknown>>(axiosClient.patch(`/admin/approvals/${id}/approve`)),
  rejectRequest: (id: string) => unwrap<Record<string, unknown>>(axiosClient.patch(`/admin/approvals/${id}/reject`)),

  getHotels: () => unwrap<{ hotels?: unknown[] }>(axiosClient.get("/admin/hotels")),
  updateHotelStatus: (id: string, status: string) => unwrap<Record<string, unknown>>(axiosClient.patch(`/admin/hotels/${id}/status`, { status })),

  getExperiences: () => unwrap<{ experiences?: unknown[] }>(axiosClient.get("/admin/experiences")),
  updateExperienceStatus: (id: string, status: string) => unwrap<Record<string, unknown>>(axiosClient.patch(`/admin/experiences/${id}/status`, { status })),

  getDestinations: () => unwrap<{ destinations?: Destination[] }>(axiosClient.get("/admin/destinations")),
  createDestination: (payload: AdminDestinationInput) => unwrap<{ destination: Destination; message: string }>(axiosClient.post("/admin/destinations", payload)),
  updateDestination: (id: string, payload: AdminDestinationInput) => unwrap<{ destination: Destination; message: string }>(axiosClient.put(`/admin/destinations/${id}`, payload)),
  deleteDestination: (id: string) => unwrap<{ message: string }>(axiosClient.delete(`/admin/destinations/${id}`)),

  getBookings: (params?: { status?: string; type?: string }) => unwrap<{ bookings?: unknown[] }>(axiosClient.get("/admin/bookings", { params })),
  getAnalytics: () => unwrap<Record<string, unknown>>(axiosClient.get("/admin/analytics")),

  testAiMonitoring: (payload: { preferences: string; country: string; top_n: number }) => unwrap<Record<string, unknown>>(axiosClient.post("/admin/ai-monitoring/test", payload)),
  getTourismAnalytics: () => unwrap<TourismAnalyticsResponse>(axiosClient.get("/admin/tourism-analytics")),
  getDataQuality: () => unwrap<Record<string, unknown>>(axiosClient.get("/admin/data-quality")),
  recommendationAudit: (payload: { preferences: string; country?: string; budget?: string; type?: string; district?: string; limit?: number }) => unwrap<Record<string, unknown>>(axiosClient.post("/admin/recommendation-audit", payload)),

  getCommission: () => unwrap<Record<string, unknown>>(axiosClient.get("/admin/commission")),
  getReports: () => unwrap<Record<string, unknown>>(axiosClient.get("/admin/reports")),
};
