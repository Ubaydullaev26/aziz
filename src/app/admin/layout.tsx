import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/shared/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?callbackUrl=/admin");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") redirect("/map");

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</main>
    </div>
  );
}
