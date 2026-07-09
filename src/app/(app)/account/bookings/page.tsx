import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Ticket } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { CancelBookingButton } from "@/features/booking/components/cancel-booking-button";
import { formatDateTime, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Мои бронирования" };

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" }> = {
  PENDING: { label: "Ожидает", variant: "secondary" },
  CONFIRMED: { label: "Подтверждено", variant: "success" },
  CANCELLED: { label: "Отменено", variant: "destructive" },
  COMPLETED: { label: "Завершено", variant: "default" },
};

export default async function BookingsPage() {
  const session = await auth();

  const bookings = await prisma.booking.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      tour: { select: { titleRu: true, coverImage: true, slug: true, place: { select: { slug: true } } } },
      tourAvailability: { select: { startAt: true } },
      event: { select: { titleRu: true, coverImage: true, slug: true } },
      eventTicketType: { select: { name: true } },
      guide: { select: { name: true, avatar: true, slug: true } },
      guideAvailability: { select: { startAt: true, endAt: true } },
    },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold">Мои бронирования</h1>

      {bookings.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center">
          <Ticket className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Пока нет бронирований</p>
          <Link href="/map" className="text-sm font-medium text-primary hover:underline">
            Найти экскурсию или событие →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {bookings.map((b) => {
          const status = STATUS_LABEL[b.status] ?? STATUS_LABEL.PENDING!;
          const image = b.tour?.coverImage ?? b.event?.coverImage ?? b.guide?.avatar;
          const title = b.tour?.titleRu ?? b.event?.titleRu ?? (b.guide ? `Гид: ${b.guide.name}` : "Бронирование");
          const href = b.tour
            ? `/places/${b.tour.place?.slug ?? ""}`
            : b.event
              ? `/events/${b.event.slug}`
              : b.guide
                ? `/guides/${b.guide.slug}`
                : "#";
          const when = b.tourAvailability?.startAt ?? b.guideAvailability?.startAt ?? null;
          const subtitle = b.eventTicketType?.name;

          return (
            <div key={b.id} className="flex items-center gap-3 rounded-2xl border border-border p-3">
              {image && (
                <Link href={href} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                  <Image src={image} alt={title} fill className="object-cover" />
                </Link>
              )}
              <Link href={href} className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{title}</p>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {subtitle && `${subtitle} · `}
                  {when && `${formatDateTime(when)} · `}
                  {b.quantity} {b.quantity === 1 ? "место" : "мест"} · {formatPrice(b.totalPrice, b.currency)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Код брони: {b.code}</p>
              </Link>
              {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                <CancelBookingButton bookingId={b.id} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
