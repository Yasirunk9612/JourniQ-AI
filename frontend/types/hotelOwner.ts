export type VerificationStatus = "pending" | "approved" | "rejected";
export type RoomStatus = "active" | "maintenance" | "inactive";
export type BookingStatus = "pending" | "confirmed" | "rejected" | "completed";

export interface HotelProfile {
  hotelName: string;
  description: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  facilities: string[];
  images: string[];
  previewImage?: string;
  verificationStatus: VerificationStatus;
}

export interface HotelRoom {
  _id?: string;
  id: string;
  roomType: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  availableRooms: number;
  images: string[];
  status: RoomStatus;
}

export interface Booking {
  _id?: string;
  bookingId?: string;
  id: string;
  guestName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: BookingStatus;
}

export interface MonthlyRevenue {
  month: string;
  totalRevenue: number;
  completedBookings: number;
}

export interface MarketInsight {
  country: string;
  bestMonths: string;
  demandScore: number;
  recommendation: string;
  model?: string;
}
