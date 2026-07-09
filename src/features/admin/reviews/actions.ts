"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/features/admin/require-admin";

export async function deleteReview(id: string) {
  await requireAdmin();

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return { error: "Отзыв не найден" };

  await prisma.review.delete({ where: { id } });

  const where = { placeId: review.placeId, eventId: review.eventId, guideId: review.guideId };
  const aggregate = await prisma.review.aggregate({ where, _avg: { rating: true }, _count: true });
  const data = { rating: aggregate._avg.rating ?? 0, reviewCount: aggregate._count };

  if (review.placeId) await prisma.place.update({ where: { id: review.placeId }, data });
  if (review.eventId) await prisma.event.update({ where: { id: review.eventId }, data });
  if (review.guideId) await prisma.guide.update({ where: { id: review.guideId }, data });

  revalidatePath("/admin/reviews");
  return { success: true as const };
}
