import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { DataTable, type Column } from "@/features/admin/components/data-table";
import { ConfirmDeleteButton } from "@/features/admin/components/confirm-delete-button";
import { ImportEventsButton } from "@/features/admin/components/import-events-button";
import { deleteEvent } from "@/features/admin/events/actions";
import { getEventTiming } from "@/features/events/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "События · Админ" };

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    include: { city: { select: { nameRu: true } }, category: { select: { nameRu: true, color: true } } },
    orderBy: { startAt: "desc" },
  });

  type Row = (typeof events)[number];
  const columns: Column<Row>[] = [
    {
      header: "Событие",
      cell: (e) => (
        <span className="flex items-center gap-2.5">
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
            <Image src={e.coverImage} alt={e.titleRu} fill className="object-cover" />
          </span>
          <span className="font-medium">{e.titleRu}</span>
        </span>
      ),
    },
    { header: "Город", cell: (e) => e.city.nameRu },
    { header: "Категория", cell: (e) => <Badge style={{ backgroundColor: `${e.category.color}1A`, color: e.category.color }} className="border-none">{e.category.nameRu}</Badge> },
    { header: "Начало", cell: (e) => formatDateTime(e.startAt) },
    {
      header: "Статус",
      cell: (e) => {
        const timing = getEventTiming(e.startAt, e.endAt);
        if (timing.isLiveNow) return <Badge variant="live">Сейчас идёт</Badge>;
        if (timing.hasEnded) return <Badge variant="secondary">Завершено</Badge>;
        return <Badge variant="outline">Предстоит</Badge>;
      },
    },
    {
      header: "",
      className: "text-right",
      cell: (e) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/events/${e.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDeleteButton action={deleteEvent.bind(null, e.id)} itemLabel={e.titleRu} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="События"
        description="Концерты, фестивали, выставки и мастер-классы — живой слой карты"
        actions={
          <div className="flex gap-2">
            <ImportEventsButton />
            <Button asChild>
              <Link href="/admin/events/new">
                <Plus className="h-4 w-4" /> Добавить событие
              </Link>
            </Button>
          </div>
        }
      />
      <DataTable columns={columns} rows={events} />
    </div>
  );
}
