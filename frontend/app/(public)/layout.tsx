import PublicNavbar from "@/components/public/PublicNavbar";
import SiteFooter from "@/components/public/SiteFooter";
import FloatingAiAssistant from "@/components/public/FloatingAiAssistant";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNavbar />
      {children}
      <FloatingAiAssistant />
      <SiteFooter />
    </>
  );
}
