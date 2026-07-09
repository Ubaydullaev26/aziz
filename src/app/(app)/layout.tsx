import { AppTopbar } from "@/components/shared/app-topbar";
import { MobileTabbar } from "@/components/shared/mobile-tabbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <AppTopbar />
      <div className="relative flex-1 overflow-hidden pb-16 md:pb-0">{children}</div>
      <MobileTabbar />
    </div>
  );
}
