import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Star } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { DataTable, type Column } from "@/features/admin/components/data-table";
import { ConfirmDeleteButton } from "@/features/admin/components/confirm-delete-button";
import { deletePlace } from "@/features/admin/places/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Места · Админ" };

export default async function AdminPlacesPage() {
  const places = await prisma.place.findMany({
    include: { city: { select: { nameRu: true } }, category: { select: { nameRu: true, color: true } } },
    orderBy: { createdAt: "desc" },
  });

  type Row = (typeof places)[number];
  const columns: Column<Row>[] = [
    {
      header: "Место",
      cell: (p) => (
        <span className="flex items-center gap-2.5">
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
            <Image src={p.coverImage} alt={p.nameRu} fill className="object-cover" />
          </span>
          <span className="font-medium">{p.nameRu}</span>
        </span>
      ),
    },
    { header: "Город", cell: (p) => p.city.nameRu },
    { header: "Категория", cell: (p) => <Badge style={{ backgroundColor: `${p.category.color}1A`, color: p.category.color }} className="border-none">{p.category.nameRu}</Badge> },
    { header: "Цена", cell: (p) => formatPrice(p.priceFrom, p.currency) },
    {
      header: "Рейтинг",
      cell: (p) => (
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-sunset text-sunset" /> {p.rating.toFixed(1)}
        </span>
      ),
    },
    { header: "Статус", cell: (p) => <Badge variant={p.isPublished ? "success" : "secondary"}>{p.isPublished ? "Опубликовано" : "Черновик"}</Badge> },
    {
      header: "",
      className: "text-right",
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/places/${p.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDeleteButton action={deletePlace.bind(null, p.id)} itemLabel={p.nameRu} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Места"
        description="Достопримечательности, музеи, рестораны и другие точки на карте"
        actions={
          <Button asChild>
            <Link href="/admin/places/new">
              <Plus className="h-4 w-4" /> Добавить место
            </Link>
          </Button>
        }
      />
      <DataTable columns={columns} rows={places} />
    </div>
  );
}
