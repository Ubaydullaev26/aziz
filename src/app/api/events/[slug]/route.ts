import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getEventTiming } from "@/features/events/utils";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      city: { select: { nameRu: true, slug: true } },
      category: { select: { key: true, nameRu: true, icon: true, color: true } },
      place: { select: { slug: true, nameRu: true } },
      images: { orderBy: { position: "asc" } },
      ticketTypes: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true, image: true } } },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Событие не найдено" }, { status: 404 });
  }

  return NextResponse.json({ event: { ...event, timing: getEventTiming(event.startAt, event.endAt) } });
}
