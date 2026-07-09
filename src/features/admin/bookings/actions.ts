"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/features/admin/require-admin";

const statusSchema = z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]);

export async function updateBookingStatus(id: string, status: unknown) {
  await requireAdmin();
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { error: "Некорректный статус" };

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return { error: "Бронирование не найдено" };

  const isCancelling = parsed.data === "CANCELLED" && booking.status !== "CANCELLED";
  const isRestoring = booking.status === "CANCELLED" && parsed.data !== "CANCELLED";

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({ where: { id }, data: { status: parsed.data } });

    const delta = isCancelling ? -booking.quantity : isRestoring ? booking.quantity : 0;
    if (delta !== 0) {
      if (booking.type === "TOUR" && booking.tourAvailabilityId) {
        await tx.tourAvailability.update({ where: { id: booking.tourAvailabilityId }, data: { bookedCount: { increment: delta } } });
      }
      if (booking.type === "EVENT" && booking.eventTicketTypeId) {
        await tx.eventTicketType.update({ where: { id: booking.eventTicketTypeId }, data: { soldQuantity: { increment: delta } } });
      }
      if (booking.type === "GUIDE" && booking.guideAvailabilityId) {
        await tx.guideAvailability.update({ where: { id: booking.guideAvailabilityId }, data: { bookedCount: { increment: delta } } });
      }
    }
  });

  revalidatePath("/admin/bookings");
  return { success: true as const };
}
