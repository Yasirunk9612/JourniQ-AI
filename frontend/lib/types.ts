export type UserRole = "tourist" | "admin" | "hotel_owner" | "activity_provider";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  role: UserRole;
  status: "active" | "pending" | "blocked";
  isEmailVerified?: boolean;
  emailVerifiedAt?: string | null;
  profileImage?: string;
  businessName?: string;
  businessRegistrationNumber?: string;
  district?: string;
  activityCategory?: string;
  touristPreferences?: {
    interests?: string[];
    travelStyles?: string[];
    budgets?: string[];
    preferredDistricts?: string[];
    activityTypes?: string[];
    accommodationTypes?: string[];
    pace?: string;
  };
  touristBehavior?: {
    hotelBookings?: number;
    experienceBookings?: number;
    lastBookedDistricts?: string[];
    lastBookedCategories?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  message: string;
}
