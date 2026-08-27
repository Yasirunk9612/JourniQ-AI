import { AdminBooking, AdminExperience, AdminHotel, AdminModelResult, AdminUser } from "@/types/admin";

export const adminUsers: AdminUser[] = [
  { id: "u1", name: "Nimal Perera", email: "nimal@mail.com", role: "tourist", status: "active", createdAt: "2026-05-01" },
  { id: "u2", name: "Cinnamon Crest", email: "hotel@crest.com", role: "hotel_owner", status: "pending", businessName: "Cinnamon Crest", district: "Galle", createdAt: "2026-05-05" },
  { id: "u3", name: "Surf Tribe Lanka", email: "surf@tribe.com", role: "activity_provider", status: "pending", businessName: "Surf Tribe", district: "Matara", createdAt: "2026-05-07" },
  { id: "u4", name: "Platform Admin", email: "admin@journiq.ai", role: "admin", status: "active", createdAt: "2026-01-01" },
  { id: "u5", name: "Helena Ross", email: "helena@mail.com", role: "tourist", status: "blocked", createdAt: "2026-04-17" },
];

export const adminBookings: AdminBooking[] = [
  { id: "BKG-1001", customer: "Arjun Rao", provider: "Ceylon Bay Resort", type: "hotel", district: "Galle", totalAmount: 420, status: "completed", date: "2026-05-02" },
  { id: "BKG-1002", customer: "Emma Reed", provider: "Surf Tribe", type: "activity", district: "Matara", totalAmount: 120, status: "confirmed", date: "2026-05-06" },
  { id: "BKG-1003", customer: "Max Weber", provider: "Hill Mist Villas", type: "hotel", district: "Nuwara Eliya", totalAmount: 550, status: "pending", date: "2026-05-09" },
  { id: "BKG-1004", customer: "Li Wei", provider: "Village Craft Walk", type: "activity", district: "Kandy", totalAmount: 90, status: "completed", date: "2026-05-10" },
];

export const adminHotels: AdminHotel[] = [
  { id: "h1", hotelName: "Ceylon Bay Resort", owner: "R. Fernando", district: "Galle", category: "resort", rooms: 26, status: "approved", bookings: 84, revenue: 31800 },
  { id: "h2", hotelName: "Hill Mist Villas", owner: "D. Senanayake", district: "Nuwara Eliya", category: "villa", rooms: 14, status: "pending", bookings: 41, revenue: 19400 },
  { id: "h3", hotelName: "Lotus Lagoon Hotel", owner: "M. Silva", district: "Kalutara", category: "hotel", rooms: 38, status: "active", bookings: 112, revenue: 46200 },
];

export const adminExperiences: AdminExperience[] = [
  { id: "e1", title: "Village Pottery Trail", provider: "Kandyan Roots", category: "village culture", district: "Kandy", price: 45, status: "active", bookings: 76 },
  { id: "e2", title: "Sunrise Reef Surf Session", provider: "Surf Tribe", category: "surfing", district: "Matara", price: 60, status: "pending", bookings: 29 },
  { id: "e3", title: "Herbal Wellness Ritual", provider: "Ayu Path", category: "wellness", district: "Gampaha", price: 55, status: "approved", bookings: 52 },
];

export const monthlyRevenue = [
  { month: "Jan", revenue: 18200, commission: 546 },
  { month: "Feb", revenue: 21900, commission: 657 },
  { month: "Mar", revenue: 24800, commission: 744 },
  { month: "Apr", revenue: 27200, commission: 816 },
  { month: "May", revenue: 30100, commission: 903 },
];

export const touristMarkets = [
  { name: "India", value: 38 },
  { name: "United Kingdom", value: 21 },
  { name: "Russian Federation", value: 16 },
  { name: "Germany", value: 14 },
  { name: "China", value: 11 },
];

export const aiResults: AdminModelResult[] = [
  { id: "r1", entityName: "Ceylon Bay Resort", finalScore: 0.93, contentScore: 0.9, demandScore: 0.95, explanation: "Strong coastal interest and high seasonal demand match." },
  { id: "r2", entityName: "Village Pottery Trail", finalScore: 0.88, contentScore: 0.92, demandScore: 0.83, explanation: "Cultural interest cluster aligns with experience profile." },
];
