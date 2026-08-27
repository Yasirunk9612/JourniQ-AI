export interface Destination {
  id?: string;
  slug?: string;
  name: string;
  district: string;
  category: "Beaches" | "Heritage" | "Wildlife" | "Mountains" | "Cultural villages" | "Adventure" | string;
  description: string;
  rating: number;
  image?: string;
  province?: string;
  bestTime?: string;
  tags?: string[];
  interests?: string[];
  blogTitle?: string;
  blogExcerpt?: string;
  blogHtml?: string;
  blogCss?: string;
  status?: "draft" | "published";
  matchScore?: number | null;
  matchReasons?: string[];
  accent?: string;
}

export interface Experience {
  id?: string;
  ownerId?: string;
  name: string;
  category: "Village culture" | "Traditional food" | "Surfing" | "Hiking" | "Safari" | "Wellness" | "Cycling" | "Camping" | "village culture" | "traditional food" | "surfing" | "hiking" | "safari" | "wellness" | "cycling" | "camping";
  district: string;
  description: string;
  image?: string;
  images?: string[];
  price?: number;
  duration?: string;
  maxGuests?: number;
  rating?: number;
  bookingsCount?: number;
  ownerName?: string;
  includedItems?: string[];
  safetyNotes?: string;
  location?: string;
}

export interface Hotel {
  id?: string;
  ownerId?: string;
  name: string;
  district: string;
  type: "Boutique Villa" | "Resort" | "Guest House" | "Hotel" | string;
  rooms: number;
  rating: number;
  price: string;
  image?: string;
  images?: string[];
  facilities?: string[];
  description?: string;
  ownerName?: string;
  address?: string;
}

export interface PublicHotelRoom {
  id: string;
  roomType: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  availableRooms: number;
  images: string[];
  status: string;
}

export interface Recommendation {
  id?: string;
  name: string;
  district: string;
  category: string;
  type?: string;
  finalScore: number;
  contentScore: number;
  countryDemandScore: number;
  popularityScore?: number;
  season?: string;
  bestMonth?: string;
  country?: string;
  explanation: string | string[];
}

export interface AiModelSummary {
  selectedModel: string;
  modelUse: string;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1Score: number | null;
  note: string;
}

export interface PersonalizedRecommendationResponse {
  model: AiModelSummary;
  recommendations: Recommendation[];
  preferenceSummary: {
    country: string;
    budget: string;
    type: string;
    district: string;
    terms: string[];
  };
}
