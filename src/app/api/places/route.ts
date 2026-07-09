import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get("city");
  const categoryKeys = searchParams.getAll("category");
  const featured = searchParams.get("featured");

  const places = await prisma.place.findMany({
    where: {
      isPublished: true,
      ...(citySlug ? { city: { slug: citySlug } } : {}),
      ...(categoryKeys.length ? { category: { key: { in: categoryKeys } } } : {}),
      ...(featured === "true" ? { isFeatured: true } : {}),
    },
    select: {
      id: true,
      slug: true,
      nameRu: true,
      nameEn: true,
      nameUz: true,
      shortDescriptionRu: true,
      latitude: true,
      longitude: true,
      address: true,
      coverImage: true,
      priceLevel: true,
      priceFrom: true,
      currency: true,
      rating: true,
      reviewCount: true,
      isFeatured: true,
      category: {
        select: { key: true, nameRu: true, nameEn: true, nameUz: true, icon: true, color: true },
      },
      _count: { select: { tours: true, guides: true } },
    },
    orderBy: { rating: "desc" },
  });

  return NextResponse.json({ places });
}
