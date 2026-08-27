import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[#f7faf9] text-emerald-950 lg:flex">
        <AdminSidebar />
        <main className="w-full p-4 md:p-6">
          <AdminTopbar />
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
