import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { DataTable, type Column } from "@/features/admin/components/data-table";
import { ConfirmDeleteButton } from "@/features/admin/components/confirm-delete-button";
import { RoleSelect } from "@/features/admin/users/role-select";
import { deleteUser } from "@/features/admin/users/actions";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Пользователи · Админ" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { bookings: true, reviews: true, favoritePlaces: true } } },
    orderBy: { createdAt: "desc" },
  });

  type Row = (typeof users)[number];
  const columns: Column<Row>[] = [
    {
      header: "Пользователь",
      cell: (u) => (
        <div>
          <p className="font-medium">{u.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      ),
    },
    { header: "Роль", cell: (u) => <RoleSelect userId={u.id} role={u.role} /> },
    { header: "Бронирований", cell: (u) => u._count.bookings },
    { header: "Отзывов", cell: (u) => u._count.reviews },
    { header: "Регистрация", cell: (u) => formatDateTime(u.createdAt) },
    {
      header: "",
      className: "text-right",
      cell: (u) => <ConfirmDeleteButton action={deleteUser.bind(null, u.id)} itemLabel={u.name ?? u.email} />,
    },
  ];

  return (
    <div>
      <AdminPageHeader title="Пользователи" description="Управление ролями и доступом" />
      <DataTable columns={columns} rows={users} />
    </div>
  );
}
