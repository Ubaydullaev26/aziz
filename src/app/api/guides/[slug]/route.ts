import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const guide = await prisma.guide.findUnique({
    where: { slug },
    include: {
      city: { select: { nameRu: true, slug: true } },
      places: { select: { slug: true, nameRu: true, coverImage: true } },
      availabilities: {
        where: { startAt: { gte: new Date() }, isActive: true },
        orderBy: { startAt: "asc" },
        take: 10,
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true, image: true } } },
      },
    },
  });

  if (!guide) {
    return NextResponse.json({ error: "Гид не найден" }, { status: 404 });
  }

  return NextResponse.json({ guide });
}
