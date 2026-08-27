import { Booking, HotelProfile, HotelRoom, MarketInsight, MonthlyRevenue } from "@/types/hotelOwner";

export const hotelOwnerName = "Saman Perera";

export const hotelProfileMock: HotelProfile = {
  hotelName: "Emerald Lagoon Boutique",
  description: "Luxury eco-boutique stay near the southern coastline with curated local experiences.",
  district: "Galle",
  address: "No 28, Temple Road, Unawatuna",
  latitude: 6.032,
  longitude: 80.217,
  category: "Boutique Villa",
  facilities: ["Pool", "Spa", "Airport Transfer", "Sea View", "Free WiFi"],
  images: ["/images/hotel-1.jpg", "/images/hotel-2.jpg"],
  verificationStatus: "approved",
};

export const roomsMock: HotelRoom[] = [
  { id: "R-101", roomType: "Deluxe Ocean Suite", description: "Ocean-facing suite with balcony and lounge.", pricePerNight: 210, capacity: 2, amenities: ["AC", "Mini Bar", "Balcony"], availableRooms: 4, images: [], status: "active" },
  { id: "R-102", roomType: "Family Garden Room", description: "Spacious family room with garden access.", pricePerNight: 145, capacity: 4, amenities: ["AC", "Garden View", "Work Desk"], availableRooms: 3, images: [], status: "active" },
  { id: "R-103", roomType: "Signature Villa Wing", description: "Private wing with curated premium services.", pricePerNight: 320, capacity: 3, amenities: ["Private Deck", "Butler", "Jacuzzi"], availableRooms: 1, images: [], status: "maintenance" },
];

export const bookingsMock: Booking[] = [
  { id: "BK-9001", guestName: "Emma Roberts", roomType: "Deluxe Ocean Suite", checkIn: "2026-06-12", checkOut: "2026-06-15", totalAmount: 630, status: "confirmed" },
  { id: "BK-9002", guestName: "Aarav Sharma", roomType: "Family Garden Room", checkIn: "2026-06-14", checkOut: "2026-06-17", totalAmount: 435, status: "pending" },
  { id: "BK-9003", guestName: "Lina Kraus", roomType: "Signature Villa Wing", checkIn: "2026-06-20", checkOut: "2026-06-22", totalAmount: 640, status: "completed" },
  { id: "BK-9004", guestName: "Wei Chen", roomType: "Deluxe Ocean Suite", checkIn: "2026-06-25", checkOut: "2026-06-27", totalAmount: 420, status: "rejected" },
];

export const monthlyRevenueMock: MonthlyRevenue[] = [
  { month: "Jan", totalRevenue: 8200, completedBookings: 34 },
  { month: "Feb", totalRevenue: 9100, completedBookings: 39 },
  { month: "Mar", totalRevenue: 10300, completedBookings: 43 },
  { month: "Apr", totalRevenue: 9800, completedBookings: 41 },
  { month: "May", totalRevenue: 11600, completedBookings: 47 },
  { month: "Jun", totalRevenue: 12400, completedBookings: 52 },
];

export const marketInsightsMock: MarketInsight[] = [
  { country: "India", bestMonths: "Dec - Mar", demandScore: 91, recommendation: "Increase family package availability and weekend bundles." },
  { country: "United Kingdom", bestMonths: "Jan - Apr", demandScore: 87, recommendation: "Promote heritage + coast itineraries with longer stays." },
  { country: "Russian Federation", bestMonths: "Nov - Feb", demandScore: 83, recommendation: "Highlight warm-weather beach and wellness packages." },
  { country: "Germany", bestMonths: "Feb - May", demandScore: 81, recommendation: "Feature eco-tourism and cycling experiences." },
  { country: "China", bestMonths: "Jan - Mar", demandScore: 79, recommendation: "Bundle group-friendly transport and guided excursions." },
];
