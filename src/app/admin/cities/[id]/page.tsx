import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { CityForm } from "@/features/admin/cities/city-form";

export const metadata: Metadata = { title: "Редактировать город · Админ" };

export default async function EditCityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [city, countries] = await Promise.all([
    prisma.city.findUnique({ where: { id } }),
    prisma.country.findMany({ select: { id: true, nameRu: true } }),
  ]);
  if (!city) notFound();

  return (
    <div>
      <AdminPageHeader title={`Редактировать: ${city.nameRu}`} />
      <CityForm
        countries={countries}
        cityId={city.id}
        defaultValues={{
          slug: city.slug,
          countryId: city.countryId,
          nameRu: city.nameRu,
          nameEn: city.nameEn,
          nameUz: city.nameUz,
          descriptionRu: city.descriptionRu ?? "",
          descriptionEn: city.descriptionEn ?? "",
          descriptionUz: city.descriptionUz ?? "",
          coverImage: city.coverImage ?? "",
          latitude: city.latitude,
          longitude: city.longitude,
          defaultZoom: city.defaultZoom,
          timezone: city.timezone,
          isPublished: city.isPublished,
        }}
      />
    </div>
  );
}
