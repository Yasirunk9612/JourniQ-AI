"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest } from "@/lib/api";
import { roleDashboardMap } from "@/lib/constants";
import { User, UserRole } from "@/lib/types";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  role: UserRole;
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
}

type TouristPreferencesInput = NonNullable<User["touristPreferences"]>;

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<{ message: string; user: User }>;
  updateProfile: (input: Partial<Pick<User, "name" | "phone" | "country" | "profileImage">>) => Promise<User>;
  updateTouristPreferences: (input: TouristPreferencesInput) => Promise<User>;
  deleteAccount: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "journiq_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const localToken = localStorage.getItem(TOKEN_KEY);

    if (!localToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      setToken(localToken);
      const data = await apiRequest<{ user: User }>("/auth/me", {
        token: localToken,
      });
      setUser(data.user);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiRequest<{ message: string; token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const data = await apiRequest<{ message: string; token: string | null; user: User }>(
      "/auth/register",
      {
        method: "POST",
        body: input,
      }
    );

    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
    }

    return { message: data.message, user: data.user };
  }, []);

  const updateProfile = useCallback(async (input: Partial<Pick<User, "name" | "phone" | "country" | "profileImage">>) => {
    const data = await apiRequest<{ message: string; user: User }>("/auth/me", {
      method: "PATCH",
      token,
      body: input,
    });
    setUser(data.user);
    return data.user;
  }, [token]);

  const updateTouristPreferences = useCallback(async (input: TouristPreferencesInput) => {
    const data = await apiRequest<{ message: string; user: User }>("/auth/me/preferences", {
      method: "PATCH",
      token,
      body: { touristPreferences: input },
    });
    setUser(data.user);
    return data.user;
  }, [token]);

  const deleteAccount = useCallback(async () => {
    await apiRequest<{ message: string }>("/auth/me", {
      method: "DELETE",
      token,
    });
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  }, [token]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await apiRequest("/auth/logout", {
          method: "POST",
          token,
        });
      }
    } catch {
      // Client-side token cleanup is still required even if API fails.
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setToken(null);
    }
  }, [token]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, updateProfile, updateTouristPreferences, deleteAccount, logout, refreshUser }),
    [user, token, loading, login, register, updateProfile, updateTouristPreferences, deleteAccount, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function getDashboardByRole(role: UserRole) {
  return roleDashboardMap[role];
}
