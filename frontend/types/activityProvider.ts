export type ExperienceCategory = "village culture" | "traditional food" | "surfing" | "hiking" | "safari" | "wellness" | "cycling" | "camping";
export type ExperienceStatus = "pending" | "approved" | "rejected" | "active";
export type ProviderBookingStatus = "pending" | "confirmed" | "rejected" | "completed";

export interface ActivityExperience {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: ExperienceCategory;
  district: string;
  location: string;
  duration: string;
  price: number;
  maxGuests: number;
  images: string[];
  previewImage?: string;
  includedItems: string[];
  safetyNotes: string;
  status: ExperienceStatus;
  rating?: number;
  bookingsCount?: number;
}

export interface ProviderBooking {
  _id?: string;
  bookingId: string;
  touristName: string;
  experienceTitle: string;
  date: string;
  guests: number;
  totalAmount: number;
  status: ProviderBookingStatus;
}

export interface ProviderCalendarEvent {
  _id?: string;
  experience?: string;
  fromDate: string;
  toDate: string;
  isBlocked: boolean;
  notes?: string;
}

export interface ProviderProfile {
  providerName: string;
  businessName: string;
  story: string;
  district: string;
  contactNumber: string;
  address: string;
  languages: string[];
  verificationDocuments: string[];
  images: string[];
  previewImage?: string;
  verificationStatus: "pending" | "approved" | "rejected";
}

export interface ProviderRevenueRow {
  month: string;
  totalRevenue: number;
  commissionPaid: number;
  netEarning: number;
}

export interface ProviderAiInsights {
  model?: {
    selectedModel: string;
    modelUse: string;
    accuracy: number | null;
    precision: number | null;
    recall: number | null;
    f1Score: number | null;
    note: string;
  };
  targetCountries: string[];
  bestMonths: string[];
  trendingCategories: string[];
  suggestedPriceRange: string;
  demandScore: number;
  cards: string[];
  listingQuality?: {
    averageScore: number;
    rows: Array<{
      id: string;
      title: string;
      score: number;
      grade: string;
      actions: string[];
    }>;
  };
}
