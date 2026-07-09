import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const place = await prisma.place.findUnique({
    where: { slug },
    include: {
      city: { select: { nameRu: true, slug: true } },
      category: { select: { key: true, nameRu: true, icon: true, color: true } },
      images: { orderBy: { position: "asc" } },
      openingHours: { orderBy: { dayOfWeek: "asc" } },
      guides: {
        where: { isPublished: true },
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
        },
      },
      tours: {
        where: { isPublished: true },
        include: {
          availabilities: {
            where: { startAt: { gte: new Date() }, isActive: true },
            orderBy: { startAt: "asc" },
            take: 6,
          },
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true, image: true } } },
      },
    },
  });

  if (!place) {
    return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
  }

  return NextResponse.json({ place });
}
