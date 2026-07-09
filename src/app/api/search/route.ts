import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ cities: [], places: [], events: [], guides: [] });
  }

  const contains = { contains: q, mode: "insensitive" as const };

  const [cities, places, events, guides] = await Promise.all([
    prisma.city.findMany({
      where: { isPublished: true, OR: [{ nameRu: contains }, { nameEn: contains }] },
      select: { id: true, slug: true, nameRu: true, coverImage: true },
      take: 5,
    }),
    prisma.place.findMany({
      where: {
        isPublished: true,
        OR: [{ nameRu: contains }, { nameEn: contains }, { address: contains }],
      },
      select: {
        id: true,
        slug: true,
        nameRu: true,
        coverImage: true,
        category: { select: { nameRu: true, icon: true } },
        city: { select: { slug: true } },
      },
      take: 8,
    }),
    prisma.event.findMany({
      where: { isPublished: true, OR: [{ titleRu: contains }, { titleEn: contains }] },
      select: {
        id: true,
        slug: true,
        titleRu: true,
        coverImage: true,
        startAt: true,
        category: { select: { nameRu: true, icon: true } },
      },
      take: 8,
    }),
    prisma.guide.findMany({
      where: { isPublished: true, name: contains },
      select: { id: true, slug: true, name: true, avatar: true, languages: true },
      take: 8,
    }),
  ]);

  return NextResponse.json({ cities, places, events, guides });
}
