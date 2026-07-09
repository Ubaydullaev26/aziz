import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBookingSchema } from "@/features/booking/schemas";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      tour: { select: { titleRu: true, coverImage: true, slug: true } },
      tourAvailability: { select: { startAt: true } },
      event: { select: { titleRu: true, coverImage: true, slug: true, startAt: true } },
      eventTicketType: { select: { name: true } },
      guide: { select: { name: true, avatar: true, slug: true } },
      guideAvailability: { select: { startAt: true, endAt: true } },
    },
  });

  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход, чтобы забронировать" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 },
    );
  }

  const { type, quantity, contactName, contactPhone, notes } = parsed.data;
  const userId = session.user.id;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      if (type === "TOUR") {
        if (!parsed.data.tourAvailabilityId) throw new Error("Выберите время экскурсии");
        const slot = await tx.tourAvailability.findUnique({
          where: { id: parsed.data.tourAvailabilityId },
          include: { tour: true },
        });
        if (!slot || !slot.isActive) throw new Error("Этот сеанс недоступен");
        const available = slot.capacity - slot.bookedCount;
        if (available < quantity) throw new Error(`Осталось всего ${Math.max(available, 0)} мест`);

        const updated = await tx.tourAvailability.updateMany({
          where: { id: slot.id, bookedCount: slot.bookedCount },
          data: { bookedCount: { increment: quantity } },
        });
        if (updated.count !== 1) throw new Error("Не удалось забронировать, попробуйте ещё раз");

        return tx.booking.create({
          data: {
            userId,
            type,
            status: "CONFIRMED",
            tourId: slot.tourId,
            tourAvailabilityId: slot.id,
            quantity,
            totalPrice: slot.tour.price * quantity,
            currency: slot.tour.currency,
            contactName,
            contactPhone,
            notes,
          },
        });
      }

      if (type === "EVENT") {
        if (!parsed.data.eventTicketTypeId) throw new Error("Выберите тип билета");
        const ticket = await tx.eventTicketType.findUnique({
          where: { id: parsed.data.eventTicketTypeId },
          include: { event: true },
        });
        if (!ticket) throw new Error("Этот билет недоступен");
        const available = ticket.totalQuantity - ticket.soldQuantity;
        if (available < quantity) throw new Error(`Осталось всего ${Math.max(available, 0)} билетов`);

        const updated = await tx.eventTicketType.updateMany({
          where: { id: ticket.id, soldQuantity: ticket.soldQuantity },
          data: { soldQuantity: { increment: quantity } },
        });
        if (updated.count !== 1) throw new Error("Не удалось забронировать, попробуйте ещё раз");

        return tx.booking.create({
          data: {
            userId,
            type,
            status: "CONFIRMED",
            eventId: ticket.eventId,
            eventTicketTypeId: ticket.id,
            quantity,
            totalPrice: ticket.price * quantity,
            currency: ticket.currency,
            contactName,
            contactPhone,
            notes,
          },
        });
      }

      // GUIDE
      if (!parsed.data.guideAvailabilityId) throw new Error("Выберите время гида");
      const slot = await tx.guideAvailability.findUnique({
        where: { id: parsed.data.guideAvailabilityId },
        include: { guide: true },
      });
      if (!slot || !slot.isActive) throw new Error("Этот слот недоступен");
      const available = slot.capacity - slot.bookedCount;
      if (available < quantity) throw new Error(`Осталось всего ${Math.max(available, 0)} мест`);

      const updated = await tx.guideAvailability.updateMany({
        where: { id: slot.id, bookedCount: slot.bookedCount },
        data: { bookedCount: { increment: quantity } },
      });
      if (updated.count !== 1) throw new Error("Не удалось забронировать, попробуйте ещё раз");

      const hours = Math.max(1, (slot.endAt.getTime() - slot.startAt.getTime()) / 3_600_000);
      const totalPrice = Math.round((slot.guide.pricePerHour ?? 0) * hours);

      return tx.booking.create({
        data: {
          userId,
          type,
          status: "CONFIRMED",
          guideId: slot.guideId,
          guideAvailabilityId: slot.id,
          quantity,
          totalPrice,
          currency: slot.guide.currency,
          contactName,
          contactPhone,
          notes,
        },
      });
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось создать бронирование";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
