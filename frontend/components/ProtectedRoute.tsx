"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getDashboardByRole, useAuth } from "@/context/AuthContext";
import { UserRole } from "@/lib/types";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace(getDashboardByRole(user.role));
    }
  }, [allowedRoles, loading, pathname, router, user]);

  if (loading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen grid place-items-center bg-[var(--color-sand)]">
        <div className="text-emerald-900 font-medium">Loading your JourniQ space...</div>
      </div>
    );
  }

  return <>{children}</>;
}
