import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const toggleSchema = z.object({
  targetType: z.enum(["PLACE", "EVENT"]),
  targetId: z.string().min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  const [places, events] = await Promise.all([
    prisma.favoritePlace.findMany({
      where: { userId: session.user.id },
      include: { place: { include: { category: true, city: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.favoriteEvent.findMany({
      where: { userId: session.user.id },
      include: { event: { include: { category: true, city: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ places, events });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const { targetType, targetId } = parsed.data;
  const userId = session.user.id;

  if (targetType === "PLACE") {
    const existing = await prisma.favoritePlace.findUnique({
      where: { userId_placeId: { userId, placeId: targetId } },
    });
    if (existing) {
      await prisma.favoritePlace.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    }
    await prisma.favoritePlace.create({ data: { userId, placeId: targetId } });
    return NextResponse.json({ favorited: true });
  }

  const existing = await prisma.favoriteEvent.findUnique({
    where: { userId_eventId: { userId, eventId: targetId } },
  });
  if (existing) {
    await prisma.favoriteEvent.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }
  await prisma.favoriteEvent.create({ data: { userId, eventId: targetId } });
  return NextResponse.json({ favorited: true });
}
