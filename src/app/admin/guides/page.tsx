import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Star, ShieldCheck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { DataTable, type Column } from "@/features/admin/components/data-table";
import { ConfirmDeleteButton } from "@/features/admin/components/confirm-delete-button";
import { deleteGuide } from "@/features/admin/guides/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Гиды · Админ" };

export default async function AdminGuidesPage() {
  const guides = await prisma.guide.findMany({
    include: { city: { select: { nameRu: true } } },
    orderBy: { createdAt: "desc" },
  });

  type Row = (typeof guides)[number];
  const columns: Column<Row>[] = [
    {
      header: "Гид",
      cell: (g) => (
        <span className="flex items-center gap-2.5">
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
            <Image src={g.avatar} alt={g.name} fill className="object-cover" />
          </span>
          <span className="flex items-center gap-1 font-medium">
            {g.name}
            {g.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
          </span>
        </span>
      ),
    },
    { header: "Город", cell: (g) => g.city.nameRu },
    { header: "Языки", cell: (g) => g.languages.join(", ").toUpperCase() },
    { header: "Цена / час", cell: (g) => formatPrice(g.pricePerHour, g.currency) },
    {
      header: "Рейтинг",
      cell: (g) => (
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-sunset text-sunset" /> {g.rating.toFixed(1)}
        </span>
      ),
    },
    { header: "Статус", cell: (g) => <Badge variant={g.isPublished ? "success" : "secondary"}>{g.isPublished ? "Опубликован" : "Черновик"}</Badge> },
    {
      header: "",
      className: "text-right",
      cell: (g) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/guides/${g.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDeleteButton action={deleteGuide.bind(null, g.id)} itemLabel={g.name} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Гиды"
        description="Проверенные специалисты, доступные для бронирования"
        actions={
          <Button asChild>
            <Link href="/admin/guides/new">
              <Plus className="h-4 w-4" /> Добавить гида
            </Link>
          </Button>
        }
      />
      <DataTable columns={columns} rows={guides} />
    </div>
  );
}
