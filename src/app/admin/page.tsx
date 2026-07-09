import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, Tags, Landmark, CalendarDays, Users, Compass, UserCog, Ticket, Star } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Админ-панель" };

export default async function AdminOverviewPage() {
  const [
    cities,
    categories,
    places,
    events,
    guides,
    tours,
    users,
    bookings,
    reviews,
    revenue,
  ] = await Promise.all([
    prisma.city.count(),
    prisma.category.count(),
    prisma.place.count(),
    prisma.event.count(),
    prisma.guide.count(),
    prisma.tour.count(),
    prisma.user.count(),
    prisma.booking.count(),
    prisma.review.count(),
    prisma.booking.aggregate({ where: { status: "CONFIRMED" }, _sum: { totalPrice: true } }),
  ]);

  const stats = [
    { label: "Города", value: cities, href: "/admin/cities", icon: Globe2 },
    { label: "Категории", value: categories, href: "/admin/categories", icon: Tags },
    { label: "Места", value: places, href: "/admin/places", icon: Landmark },
    { label: "События", value: events, href: "/admin/events", icon: CalendarDays },
    { label: "Гиды", value: guides, href: "/admin/guides", icon: Users },
    { label: "Экскурсии", value: tours, href: "/admin/tours", icon: Compass },
    { label: "Пользователи", value: users, href: "/admin/users", icon: UserCog },
    { label: "Бронирования", value: bookings, href: "/admin/bookings", icon: Ticket },
    { label: "Отзывы", value: reviews, href: "/admin/reviews", icon: Star },
  ];

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Обзор</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Подтверждённая выручка: {formatPrice(revenue._sum.totalPrice ?? 0, "UZS")}
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-2xl font-semibold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
