import { UserRole } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5008/api";

export const roleDashboardMap: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  hotel_owner: "/hotel-owner/dashboard",
  activity_provider: "/activity-provider/dashboard",
  tourist: "/dashboard",
};
