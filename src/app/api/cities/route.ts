import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const cities = await prisma.city.findMany({
    where: {
      isPublished: true,
      ...(q
        ? {
            OR: [
              { nameRu: { contains: q, mode: "insensitive" } },
              { nameEn: { contains: q, mode: "insensitive" } },
              { nameUz: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      slug: true,
      nameRu: true,
      nameEn: true,
      nameUz: true,
      coverImage: true,
      latitude: true,
      longitude: true,
      country: { select: { nameRu: true, nameEn: true, code: true } },
    },
    orderBy: { nameRu: "asc" },
    take: 10,
  });

  return NextResponse.json({ cities });
}
