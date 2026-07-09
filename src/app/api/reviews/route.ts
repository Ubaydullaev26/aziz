import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const reviewSchema = z
  .object({
    placeId: z.string().optional(),
    eventId: z.string().optional(),
    guideId: z.string().optional(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional(),
  })
  .refine((d) => [d.placeId, d.eventId, d.guideId].filter(Boolean).length === 1, {
    message: "Укажите ровно одну цель отзыва",
  });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const { placeId, eventId, guideId, rating, comment } = parsed.data;

  const review = await prisma.review.create({
    data: { userId: session.user.id, placeId, eventId, guideId, rating, comment },
  });

  const target = placeId
    ? ({ model: "place", id: placeId } as const)
    : eventId
      ? ({ model: "event", id: eventId } as const)
      : ({ model: "guide", id: guideId! } as const);

  const aggregate = await prisma.review.aggregate({
    where: { placeId, eventId, guideId },
    _avg: { rating: true },
    _count: true,
  });

  const data = {
    rating: aggregate._avg.rating ?? rating,
    reviewCount: aggregate._count,
  };

  if (target.model === "place") await prisma.place.update({ where: { id: target.id }, data });
  if (target.model === "event") await prisma.event.update({ where: { id: target.id }, data });
  if (target.model === "guide") await prisma.guide.update({ where: { id: target.id }, data });

  return NextResponse.json({ review }, { status: 201 });
}
