import { axiosClient } from "./axiosClient";
import { Destination, Experience, Hotel, PersonalizedRecommendationResponse, PublicHotelRoom } from "./public-types";

const unwrap = <T>(promise: Promise<{ data: T }>) => promise.then((res) => res.data);

export const publicApi = {
  getHotels: (params?: { district?: string; type?: string }) => unwrap<{ hotels: Hotel[] }>(axiosClient.get("/public/hotels", { params })),
  getDestinations: (params?: { category?: string; region?: string; search?: string }) =>
    unwrap<{ destinations: Destination[]; personalized: boolean; count: number }>(axiosClient.get("/public/destinations", { params })),
  getDestination: (slug: string) => unwrap<{ destination: Destination }>(axiosClient.get(`/public/destinations/${slug}`)),
  getHotel: (id: string) => unwrap<{ hotel: Hotel; rooms: PublicHotelRoom[] }>(axiosClient.get(`/public/hotels/${id}`)),
  getExperiences: (params?: { district?: string; category?: string }) => unwrap<{ experiences: Experience[] }>(axiosClient.get("/public/experiences", { params })),
  getExperience: (id: string) => unwrap<{ experience: Experience }>(axiosClient.get(`/public/experiences/${id}`)),
  getPersonalizedRecommendations: (payload: { preferences: string; country?: string; budget?: string; type?: string; district?: string; limit?: number }) =>
    unwrap<PersonalizedRecommendationResponse>(axiosClient.post("/public/recommendations", payload)),
  getTouristAiProfile: () => unwrap<{ profile: { style: string; terms: string[]; completeness: number; preferences: Record<string, unknown>; behavior: Record<string, unknown>; recommendations: PersonalizedRecommendationResponse["recommendations"]; model: PersonalizedRecommendationResponse["model"] } }>(axiosClient.get("/public/tourist-ai-profile")),
  chatWithAiAssistant: (payload: { message: string }) =>
    unwrap<{
      reply: {
        intent: string;
        answer: string;
        actions: Array<{ label: string; href: string; type: string }>;
        items: Array<{ title: string; subtitle: string; description: string; href: string }>;
        recommendations?: PersonalizedRecommendationResponse["recommendations"];
        model?: PersonalizedRecommendationResponse["model"];
      };
    }>(axiosClient.post("/public/ai-assistant/chat", payload)),
  trackTripPlanner: (payload: { destination: string; startDate: string; endDate: string; travellers: number; budget: string; interests: string; pace: string; accommodation: string; activities: string; start: string; notes: string }) =>
    unwrap<{ message: string }>(axiosClient.post("/public/trip-planner/track", payload)),
  bookHotel: (payload: { hotelId: string; roomId?: string; checkIn: string; checkOut: string; guests?: number }) => unwrap<{ message: string }>(axiosClient.post("/public/bookings/hotel", payload)),
  bookExperience: (payload: { experienceId: string; date: string; guests?: number }) => unwrap<{ message: string }>(axiosClient.post("/public/bookings/experience", payload)),
};
