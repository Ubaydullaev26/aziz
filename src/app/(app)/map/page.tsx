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

  const city = citySlugParam
    ? await prisma.city.findUnique({ where: { slug: citySlugParam } })
    : await prisma.city.findFirst({ where: { isPublished: true }, orderBy: { createdAt: "asc" } });

  if (!city) notFound();

  return (
    <MapShell
      citySlug={city.slug}
      center={{ latitude: city.latitude, longitude: city.longitude }}
      zoom={city.defaultZoom}
    />
  );
}
