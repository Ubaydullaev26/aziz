"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function cancelBooking(bookingId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Требуется вход" };

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== session.user.id) {
    return { error: "Бронирование не найдено" };
  }
  if (booking.status === "CANCELLED") {
    return { error: "Бронирование уже отменено" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });

    if (booking.type === "TOUR" && booking.tourAvailabilityId) {
      await tx.tourAvailability.update({
        where: { id: booking.tourAvailabilityId },
        data: { bookedCount: { decrement: booking.quantity } },
      });
    }
    if (booking.type === "EVENT" && booking.eventTicketTypeId) {
      await tx.eventTicketType.update({
        where: { id: booking.eventTicketTypeId },
        data: { soldQuantity: { decrement: booking.quantity } },
      });
    }
    if (booking.type === "GUIDE" && booking.guideAvailabilityId) {
      await tx.guideAvailability.update({
        where: { id: booking.guideAvailabilityId },
        data: { bookedCount: { decrement: booking.quantity } },
      });
    }
  });

  revalidatePath("/account/bookings");
  return { success: true as const };
}
