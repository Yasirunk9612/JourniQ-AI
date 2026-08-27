import { ActivityExperience, ProviderAiInsights, ProviderBooking, ProviderProfile, ProviderRevenueRow } from "@/types/activityProvider";

export const mockExperiences: ActivityExperience[] = [
  { title: "Village Cooking Circle", description: "Hands-on traditional food with local hosts.", category: "traditional food", district: "Galle", location: "Ahangama", duration: "3 hours", price: 45, maxGuests: 8, images: [], includedItems: ["Ingredients", "Tea"], safetyNotes: "Food allergy info required", status: "active", rating: 4.8, bookingsCount: 18 },
  { title: "Sunrise Surf Basics", description: "Beginner-friendly surf lesson on south coast.", category: "surfing", district: "Matara", location: "Weligama", duration: "2 hours", price: 35, maxGuests: 6, images: [], includedItems: ["Board", "Instructor"], safetyNotes: "Life jacket available", status: "active", rating: 4.7, bookingsCount: 22 },
];

export const mockBookings: ProviderBooking[] = [
  { bookingId: "APB-001", touristName: "Emma Roberts", experienceTitle: "Village Cooking Circle", date: "2026-06-12", guests: 2, totalAmount: 90, status: "confirmed" },
  { bookingId: "APB-002", touristName: "Aarav Sharma", experienceTitle: "Sunrise Surf Basics", date: "2026-06-14", guests: 3, totalAmount: 105, status: "pending" },
];

export const mockRevenueRows: ProviderRevenueRow[] = [
  { month: "Jan", totalRevenue: 2800, commissionPaid: 84, netEarning: 2716 },
  { month: "Feb", totalRevenue: 3200, commissionPaid: 96, netEarning: 3104 },
  { month: "Mar", totalRevenue: 3900, commissionPaid: 117, netEarning: 3783 },
];

export const mockProfile: ProviderProfile = {
  providerName: "Kasun Fernando",
  businessName: "Weligama Wave Collective",
  story: "We create authentic activity experiences blending community and adventure.",
  district: "Matara",
  contactNumber: "+94 77 456 7890",
  address: "Beach Road, Weligama",
  languages: ["English", "Sinhala"],
  verificationDocuments: [],
  images: [],
  verificationStatus: "approved",
};

export const mockInsights: ProviderAiInsights = {
  targetCountries: ["India", "United Kingdom", "Germany", "Russian Federation", "China"],
  bestMonths: ["December", "January", "February", "March"],
  trendingCategories: ["village culture", "surfing", "traditional food"],
  suggestedPriceRange: "LKR 9,000 - LKR 28,500 per guest",
  demandScore: 88,
  cards: [
    "Village culture is trending for European tourists",
    "Surfing experiences perform well during winter season",
    "Traditional food experiences match cultural tourists",
  ],
};
