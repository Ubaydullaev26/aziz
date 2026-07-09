import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { GuideForm } from "@/features/admin/guides/guide-form";

export const metadata: Metadata = { title: "Редактировать гида · Админ" };

export default async function EditGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [guide, cities, places, users] = await Promise.all([
    prisma.guide.findUnique({ where: { id }, include: { places: { select: { id: true } } } }),
    prisma.city.findMany({ select: { id: true, nameRu: true } }),
    prisma.place.findMany({ select: { id: true, nameRu: true } }),
    prisma.user.findMany({ where: { role: "GUIDE" }, select: { id: true, name: true, email: true } }),
  ]);
  if (!guide) notFound();

  return (
    <div>
      <AdminPageHeader title={`Редактировать: ${guide.name}`} />
      <GuideForm
        cities={cities}
        places={places}
        users={users}
        guideId={guide.id}
        defaultValues={{
          slug: guide.slug,
          cityId: guide.cityId,
          userId: guide.userId ?? "",
          name: guide.name,
          avatar: guide.avatar,
          bioRu: guide.bioRu ?? "",
          bioEn: guide.bioEn ?? "",
          bioUz: guide.bioUz ?? "",
          languages: guide.languages.join(", "),
          experienceYears: guide.experienceYears,
          pricePerHour: guide.pricePerHour ?? undefined,
          currency: guide.currency,
          isVerified: guide.isVerified,
          isPublished: guide.isPublished,
          placeIds: guide.places.map((p) => p.id),
        }}
      />
    </div>
  );
}
