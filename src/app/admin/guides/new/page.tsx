import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { GuideForm } from "@/features/admin/guides/guide-form";

export const metadata: Metadata = { title: "Новый гид · Админ" };

export default async function NewGuidePage() {
  const [cities, places, users] = await Promise.all([
    prisma.city.findMany({ select: { id: true, nameRu: true } }),
    prisma.place.findMany({ select: { id: true, nameRu: true } }),
    prisma.user.findMany({ where: { role: "GUIDE" }, select: { id: true, name: true, email: true } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Новый гид" />
      <GuideForm cities={cities} places={places} users={users} />
    </div>
  );
}
