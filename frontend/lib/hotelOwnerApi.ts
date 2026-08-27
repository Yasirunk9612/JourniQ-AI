import { axiosClient } from "./axiosClient";
import { Booking, HotelProfile, HotelRoom, MarketInsight, MonthlyRevenue } from "@/types/hotelOwner";

export interface DashboardResponse {
  stats: {
    totalRooms: number;
    activeBookings: number;
    monthlyRevenue: number;
    platformCommission: number;
    availableRooms: number;
  };
  revenueTrend: MonthlyRevenue[];
  recentBookings: Booking[];
  topInsight: MarketInsight;
}

export interface RevenueResponse {
  summary: {
    totalRevenue: number;
    platformCommission: number;
    netEarnings: number;
    completedBookings: number;
  };
  monthlyBreakdown: MonthlyRevenue[];
}

export interface HotelAiInsightsResponse {
  insights: {
    model?: { selectedModel: string; accuracy: number | null; precision: number | null; recall: number | null; f1Score: number | null; note: string };
    targetCountries: string[];
    bestMonths: string[];
    trendingCategories: string[];
    demandScore: number;
    suggestedPriceRange: string;
    cards: string[];
    datasetRowsUsed: number;
    roomCount: number;
    activeRooms: number;
    photoSlots: { hotel: string; rooms: string };
    listingQuality: { score: number; grade: string; actions: string[]; checks: Array<{ key: string; label: string; complete: boolean; weight: number }> };
  };
}

const unwrap = <T>(promise: Promise<{ data: T }>) => promise.then((res) => res.data);

export const hotelOwnerApi = {
  getDashboard: () => unwrap<DashboardResponse>(axiosClient.get("/hotel-owner/dashboard")),
  getHotel: () => unwrap<{ hotel: HotelProfile }>(axiosClient.get("/hotel-owner/hotel")),
  updateHotel: (payload: Partial<HotelProfile>) => unwrap<{ message: string; hotel: HotelProfile }>(axiosClient.put("/hotel-owner/hotel", payload)),
  uploadHotelImages: (formData: FormData) =>
    unwrap<{ message: string; images: string[]; hotel: HotelProfile }>(
      axiosClient.post("/hotel-owner/hotel/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ),
  deleteHotelImage: (imageUrl: string) =>
    unwrap<{ message: string; hotel: HotelProfile }>(
      axiosClient.delete("/hotel-owner/hotel/images", { data: { imageUrl } })
    ),

  getRooms: () => unwrap<{ rooms: HotelRoom[] }>(axiosClient.get("/hotel-owner/rooms")),
  createRoom: (payload: Partial<HotelRoom>) => unwrap<{ message: string; room: HotelRoom }>(axiosClient.post("/hotel-owner/rooms", payload)),
  updateRoom: (id: string, payload: Partial<HotelRoom>) => unwrap<{ message: string; room: HotelRoom }>(axiosClient.put(`/hotel-owner/rooms/${id}`, payload)),
  deleteRoom: (id: string) => unwrap<{ message: string }>(axiosClient.delete(`/hotel-owner/rooms/${id}`)),
  uploadRoomImages: (id: string, formData: FormData) =>
    unwrap<{ message: string; images: string[]; room: HotelRoom }>(
      axiosClient.post(`/hotel-owner/rooms/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ),
  deleteRoomImage: (id: string, imageUrl: string) =>
    unwrap<{ message: string; room: HotelRoom }>(
      axiosClient.delete(`/hotel-owner/rooms/${id}/images`, { data: { imageUrl } })
    ),

  updateAvailability: (payload: { roomId: string; fromDate: string; toDate: string; availableRooms: number; blocked?: boolean; seasonalPrice?: number | null }) =>
    unwrap<{ message: string }>(axiosClient.post("/hotel-owner/availability", payload)),

  getBookings: () => unwrap<{ bookings: Booking[] }>(axiosClient.get("/hotel-owner/bookings")),
  updateBookingStatus: (id: string, status: Booking["status"]) => unwrap<{ message: string; booking: Booking }>(axiosClient.patch(`/hotel-owner/bookings/${id}/status`, { status })),

  getRevenue: () => unwrap<RevenueResponse>(axiosClient.get("/hotel-owner/revenue")),
  getMarketInsights: () => unwrap<{ insights: MarketInsight[]; note?: string }>(axiosClient.get("/hotel-owner/market-insights")),
  getAiInsights: () => unwrap<HotelAiInsightsResponse>(axiosClient.get("/hotel-owner/ai-insights")),
};
