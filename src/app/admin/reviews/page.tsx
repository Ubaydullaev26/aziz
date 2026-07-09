import type { Metadata } from "next";
import { Star } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { DataTable, type Column } from "@/features/admin/components/data-table";
import { ConfirmDeleteButton } from "@/features/admin/components/confirm-delete-button";
import { deleteReview } from "@/features/admin/reviews/actions";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Отзывы · Админ" };

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      place: { select: { nameRu: true } },
      event: { select: { titleRu: true } },
      guide: { select: { name: true } },
    },
  });

  type Row = (typeof reviews)[number];
  const columns: Column<Row>[] = [
    { header: "Автор", cell: (r) => r.user.name ?? r.user.email },
    { header: "Объект", cell: (r) => r.place?.nameRu ?? r.event?.titleRu ?? r.guide?.name ?? "—" },
    {
      header: "Оценка",
      cell: (r) => (
        <span className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} className={cn("h-3.5 w-3.5", r.rating >= n ? "fill-sunset text-sunset" : "text-muted-foreground/30")} />
          ))}
        </span>
      ),
    },
    { header: "Комментарий", cell: (r) => <p className="max-w-xs truncate text-muted-foreground">{r.comment ?? "—"}</p> },
    { header: "Дата", cell: (r) => formatDateTime(r.createdAt) },
    {
      header: "",
      className: "text-right",
      cell: (r) => <ConfirmDeleteButton action={deleteReview.bind(null, r.id)} itemLabel="отзыв" />,
    },
  ];

  return (
    <div>
      <AdminPageHeader title="Отзывы" description="Модерация отзывов пользователей" />
      <DataTable columns={columns} rows={reviews} />
    </div>
  );
}
