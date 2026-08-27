import ProtectedRoute from "@/components/ProtectedRoute";
import ActivityProviderSidebar from "@/components/activity-provider/ActivityProviderSidebar";
import ActivityProviderTopbar from "@/components/activity-provider/ActivityProviderTopbar";

export default function ActivityProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["activity_provider"]}>
      <div className="min-h-screen bg-[var(--color-sand)] lg:flex">
        <ActivityProviderSidebar />
        <section className="flex-1">
          <ActivityProviderTopbar />
          <main className="p-4 md:p-6">{children}</main>
        </section>
      </div>
    </ProtectedRoute>
  );
}
