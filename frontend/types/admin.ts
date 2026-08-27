export type AdminRole = "tourist" | "hotel_owner" | "activity_provider" | "admin";
export type AdminStatus = "active" | "pending" | "blocked" | "approved" | "rejected" | "suspended";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  businessName?: string;
  district?: string;
  createdAt: string;
}

export interface AdminBooking {
  id: string;
  customer: string;
  provider: string;
  type: "hotel" | "activity";
  district: string;
  totalAmount: number;
  status: "pending" | "confirmed" | "rejected" | "completed";
  date: string;
}

export interface AdminHotel {
  id: string;
  hotelName: string;
  owner: string;
  district: string;
  category: "villa" | "resort" | "guest_house" | "hotel";
  rooms: number;
  status: AdminStatus;
  bookings: number;
  revenue: number;
}

export interface AdminExperience {
  id: string;
  title: string;
  provider: string;
  category: string;
  district: string;
  price: number;
  status: AdminStatus;
  bookings: number;
}

export interface AdminInsightPoint {
  name: string;
  value: number;
}

export interface AdminModelResult {
  id: string;
  entityName: string;
  finalScore: number;
  contentScore: number;
  demandScore: number;
  explanation: string;
}
