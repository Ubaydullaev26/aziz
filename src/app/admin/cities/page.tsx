import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { DataTable, type Column } from "@/features/admin/components/data-table";
import { ConfirmDeleteButton } from "@/features/admin/components/confirm-delete-button";
import { deleteCity } from "@/features/admin/cities/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Города · Админ" };

export default async function AdminCitiesPage() {
  const cities = await prisma.city.findMany({
    include: { country: { select: { nameRu: true } }, _count: { select: { places: true, events: true } } },
    orderBy: { createdAt: "desc" },
  });

  type Row = (typeof cities)[number];
  const columns: Column<Row>[] = [
    { header: "Город", cell: (c) => <span className="font-medium">{c.nameRu}</span> },
    { header: "Страна", cell: (c) => c.country.nameRu },
    { header: "Мест", cell: (c) => c._count.places },
    { header: "Событий", cell: (c) => c._count.events },
    { header: "Статус", cell: (c) => <Badge variant={c.isPublished ? "success" : "secondary"}>{c.isPublished ? "Опубликован" : "Черновик"}</Badge> },
    {
      header: "",
      className: "text-right",
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/cities/${c.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDeleteButton action={deleteCity.bind(null, c.id)} itemLabel={c.nameRu} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Города"
        description="Управляйте направлениями платформы"
        actions={
          <Button asChild>
            <Link href="/admin/cities/new">
              <Plus className="h-4 w-4" /> Добавить город
            </Link>
          </Button>
        }
      />
      <DataTable columns={columns} rows={cities} />
    </div>
  );
}
