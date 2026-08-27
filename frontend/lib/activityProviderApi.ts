import { axiosClient } from "./axiosClient";
import { ActivityExperience, ProviderAiInsights, ProviderBooking, ProviderCalendarEvent, ProviderProfile, ProviderRevenueRow } from "@/types/activityProvider";

const unwrap = <T>(promise: Promise<{ data: T }>) => promise.then((res) => res.data);

export interface ActivityProviderDashboardResponse {
  stats: {
    totalExperiences: number;
    activeBookings: number;
    monthlyRevenue: number;
    platformCommission: number;
    averageRating: number;
  };
  revenueTrend: Array<{ month: string; totalRevenue: number; completed: number }>;
  upcomingBookings: ProviderBooking[];
  topExperience: ActivityExperience | null;
}

export const activityProviderApi = {
  getDashboard: () => unwrap<ActivityProviderDashboardResponse>(axiosClient.get("/activity-provider/dashboard")),
  getExperiences: () => unwrap<{ experiences: ActivityExperience[] }>(axiosClient.get("/activity-provider/experiences")),
  createExperience: (payload: Partial<ActivityExperience>) => unwrap<{ message: string; experience: ActivityExperience }>(axiosClient.post("/activity-provider/experiences", payload)),
  updateExperience: (id: string, payload: Partial<ActivityExperience>) => unwrap<{ message: string; experience: ActivityExperience }>(axiosClient.put(`/activity-provider/experiences/${id}`, payload)),
  deleteExperience: (id: string) => unwrap<{ message: string }>(axiosClient.delete(`/activity-provider/experiences/${id}`)),
  uploadExperienceImages: (id: string, formData: FormData) => unwrap<{ message: string; experience: ActivityExperience }>(axiosClient.post(`/activity-provider/experiences/${id}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } })),
  deleteExperienceImage: (id: string, imageUrl: string) => unwrap<{ message: string; experience: ActivityExperience }>(axiosClient.delete(`/activity-provider/experiences/${id}/images`, { data: { imageUrl } })),
  setExperienceMainImage: (id: string, imageUrl: string) => unwrap<{ message: string; experience: ActivityExperience }>(axiosClient.patch(`/activity-provider/experiences/${id}/images/main`, { imageUrl })),

  getBookings: () => unwrap<{ bookings: ProviderBooking[] }>(axiosClient.get("/activity-provider/bookings")),
  updateBookingStatus: (id: string, status: ProviderBooking["status"]) => unwrap<{ message: string; booking: ProviderBooking }>(axiosClient.patch(`/activity-provider/bookings/${id}/status`, { status })),

  getCalendar: () => unwrap<{ events: ProviderCalendarEvent[]; upcomingBookings: ProviderBooking[] }>(axiosClient.get("/activity-provider/calendar")),
  updateCalendar: (payload: Partial<ProviderCalendarEvent> & { experienceId?: string }) => unwrap<{ message: string; event: ProviderCalendarEvent }>(axiosClient.put("/activity-provider/calendar", payload)),
  deleteCalendarEvent: (id: string) => unwrap<{ message: string }>(axiosClient.delete(`/activity-provider/calendar/${id}`)),

  getRevenue: () => unwrap<{ summary: { totalRevenue: number; commissionPaid: number; netEarning: number; completedExperiences: number }; monthlyBreakdown: ProviderRevenueRow[] }>(axiosClient.get("/activity-provider/revenue")),
  getAiInsights: () => unwrap<{ insights: ProviderAiInsights }>(axiosClient.get("/activity-provider/ai-insights")),

  getProfile: () => unwrap<{ profile: ProviderProfile }>(axiosClient.get("/activity-provider/profile")),
  updateProfile: (payload: Partial<ProviderProfile>) => unwrap<{ message: string; profile: ProviderProfile }>(axiosClient.put("/activity-provider/profile", payload)),
  uploadProfileImages: (formData: FormData) => unwrap<{ message: string; profile: ProviderProfile }>(axiosClient.post("/activity-provider/profile/images", formData, { headers: { "Content-Type": "multipart/form-data" } })),
  deleteProfileImage: (imageUrl: string) => unwrap<{ message: string; profile: ProviderProfile }>(axiosClient.delete("/activity-provider/profile/images", { data: { imageUrl } })),
};
