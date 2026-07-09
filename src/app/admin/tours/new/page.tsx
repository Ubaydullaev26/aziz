import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { TourForm } from "@/features/admin/tours/tour-form";

export const metadata: Metadata = { title: "Новая экскурсия · Админ" };

export default async function NewTourPage() {
  const [places, guides] = await Promise.all([
    prisma.place.findMany({ select: { id: true, nameRu: true } }),
    prisma.guide.findMany({ select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Новая экскурсия" />
      <TourForm places={places} guides={guides} />
    </div>
  );
}
