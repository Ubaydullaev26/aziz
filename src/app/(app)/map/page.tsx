import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { MapShell } from "@/features/map/components/map-shell";

export const metadata: Metadata = { title: "Карта" };

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city: citySlugParam } = await searchParams;

  const [city, cities] = await Promise.all([
    citySlugParam
      ? prisma.city.findUnique({ where: { slug: citySlugParam } })
      : prisma.city.findFirst({ where: { isPublished: true }, orderBy: { createdAt: "asc" } }),
    prisma.city.findMany({
      where: { isPublished: true },
      select: { slug: true, nameRu: true },
      orderBy: { nameRu: "asc" },
    }),
  ]);

  if (!city) notFound();

  return (
    <MapShell
      citySlug={city.slug}
      center={{ latitude: city.latitude, longitude: city.longitude }}
      zoom={city.defaultZoom}
      cities={cities}
    />
  );
}
