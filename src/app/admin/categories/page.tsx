import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { DataTable, type Column } from "@/features/admin/components/data-table";
import { ConfirmDeleteButton } from "@/features/admin/components/confirm-delete-button";
import { deleteCategory } from "@/features/admin/categories/actions";
import { getCategoryIcon } from "@/features/map/category-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Категории · Админ" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });

  type Row = (typeof categories)[number];
  const columns: Column<Row>[] = [
    {
      header: "Категория",
      cell: (c) => {
        const Icon = getCategoryIcon(c.icon);
        return (
          <span className="flex items-center gap-2 font-medium">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${c.color}1A`, color: c.color }}
            >
              <Icon className="h-4 w-4" />
            </span>
            {c.nameRu}
          </span>
        );
      },
    },
    { header: "Ключ", cell: (c) => <code className="text-xs">{c.key}</code> },
    { header: "Тип", cell: (c) => <Badge variant={c.isEventCategory ? "sunset" : "secondary"}>{c.isEventCategory ? "Событие" : "Место"}</Badge> },
    { header: "Порядок", cell: (c) => c.position },
    {
      header: "",
      className: "text-right",
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/categories/${c.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDeleteButton action={deleteCategory.bind(null, c.id)} itemLabel={c.nameRu} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Категории"
        description="Таксономия мест и событий — задаёт слои карты"
        actions={
          <Button asChild>
            <Link href="/admin/categories/new">
              <Plus className="h-4 w-4" /> Добавить категорию
            </Link>
          </Button>
        }
      />
      <DataTable columns={columns} rows={categories} />
    </div>
  );
}
