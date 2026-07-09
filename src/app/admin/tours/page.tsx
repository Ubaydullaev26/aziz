import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { DataTable, type Column } from "@/features/admin/components/data-table";
import { ConfirmDeleteButton } from "@/features/admin/components/confirm-delete-button";
import { deleteTour } from "@/features/admin/tours/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Экскурсии · Админ" };

export default async function AdminToursPage() {
  const tours = await prisma.tour.findMany({
    include: { place: { select: { nameRu: true } }, guide: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  type Row = (typeof tours)[number];
  const columns: Column<Row>[] = [
    {
      header: "Экскурсия",
      cell: (t) => (
        <span className="flex items-center gap-2.5">
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
            <Image src={t.coverImage} alt={t.titleRu} fill className="object-cover" />
          </span>
          <span className="font-medium">{t.titleRu}</span>
        </span>
      ),
    },
    { header: "Место", cell: (t) => t.place?.nameRu ?? "—" },
    { header: "Гид", cell: (t) => t.guide?.name ?? "—" },
    { header: "Длительность", cell: (t) => `${t.durationMinutes} мин` },
    { header: "Цена", cell: (t) => formatPrice(t.price, t.currency) },
    { header: "Статус", cell: (t) => <Badge variant={t.isPublished ? "success" : "secondary"}>{t.isPublished ? "Опубликована" : "Черновик"}</Badge> },
    {
      header: "",
      className: "text-right",
      cell: (t) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/tours/${t.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDeleteButton action={deleteTour.bind(null, t.id)} itemLabel={t.titleRu} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Экскурсии"
        description="Бронируемые туры, привязанные к местам и гидам"
        actions={
          <Button asChild>
            <Link href="/admin/tours/new">
              <Plus className="h-4 w-4" /> Добавить экскурсию
            </Link>
          </Button>
        }
      />
      <DataTable columns={columns} rows={tours} />
    </div>
  );
}
