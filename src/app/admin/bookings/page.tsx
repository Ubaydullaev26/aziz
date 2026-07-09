import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { DataTable, type Column } from "@/features/admin/components/data-table";
import { StatusSelect } from "@/features/admin/bookings/status-select";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Бронирования · Админ" };

const TYPE_LABEL: Record<string, string> = { TOUR: "Экскурсия", EVENT: "Событие", GUIDE: "Гид" };

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      tour: { select: { titleRu: true } },
      event: { select: { titleRu: true } },
      guide: { select: { name: true } },
    },
  });

  type Row = (typeof bookings)[number];
  const columns: Column<Row>[] = [
    {
      header: "Клиент",
      cell: (b) => (
        <div>
          <p className="font-medium">{b.user.name ?? b.contactName}</p>
          <p className="text-xs text-muted-foreground">{b.contactPhone}</p>
        </div>
      ),
    },
    { header: "Тип", cell: (b) => <Badge variant="outline">{TYPE_LABEL[b.type]}</Badge> },
    { header: "Объект", cell: (b) => b.tour?.titleRu ?? b.event?.titleRu ?? b.guide?.name ?? "—" },
    { header: "Кол-во", cell: (b) => b.quantity },
    { header: "Сумма", cell: (b) => formatPrice(b.totalPrice, b.currency) },
    { header: "Дата", cell: (b) => formatDateTime(b.createdAt) },
    { header: "Статус", cell: (b) => <StatusSelect bookingId={b.id} status={b.status} /> },
  ];

  return (
    <div>
      <AdminPageHeader title="Бронирования" description="Все бронирования на платформе" />
      <DataTable columns={columns} rows={bookings} />
    </div>
  );
}
