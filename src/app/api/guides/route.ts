import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get("city");

  const guides = await prisma.guide.findMany({
    where: {
      isPublished: true,
      ...(citySlug ? { city: { slug: citySlug } } : {}),
    },
    select: {
      id: true,
      slug: true,
      name: true,
      avatar: true,
      languages: true,
      experienceYears: true,
      pricePerHour: true,
      currency: true,
      rating: true,
      reviewCount: true,
      isVerified: true,
      city: { select: { latitude: true, longitude: true, nameRu: true } },
      places: { select: { latitude: true, longitude: true, nameRu: true }, take: 1 },
    },
    orderBy: { rating: "desc" },
  });

  return NextResponse.json({ guides });
}
