import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getEventTiming } from "@/features/events/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get("city");
  const categoryKeys = searchParams.getAll("category");
  const liveOnly = searchParams.get("live") === "true";
  const upcomingOnly = searchParams.get("upcoming") === "true";

  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      ...(citySlug ? { city: { slug: citySlug } } : {}),
      ...(categoryKeys.length ? { category: { key: { in: categoryKeys } } } : {}),
      ...(upcomingOnly ? { endAt: { gte: new Date() } } : {}),
    },
    select: {
      id: true,
      slug: true,
      titleRu: true,
      titleEn: true,
      titleUz: true,
      coverImage: true,
      organizer: true,
      address: true,
      latitude: true,
      longitude: true,
      startAt: true,
      endAt: true,
      isFeatured: true,
      rating: true,
      reviewCount: true,
      category: {
        select: { key: true, nameRu: true, nameEn: true, nameUz: true, icon: true, color: true },
      },
      ticketTypes: {
        select: { id: true, name: true, price: true, currency: true, totalQuantity: true, soldQuantity: true },
      },
    },
    orderBy: { startAt: "asc" },
  });

  const withTiming = events.map((event) => ({
    ...event,
    timing: getEventTiming(event.startAt, event.endAt),
  }));

  const filtered = liveOnly ? withTiming.filter((e) => e.timing.isLiveNow) : withTiming;

  return NextResponse.json({ events: filtered });
}
