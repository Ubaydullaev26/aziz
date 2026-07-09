"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUserRole } from "@/features/admin/users/actions";
import type { UserRole } from "@prisma/client";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "USER", label: "Пользователь" },
  { value: "GUIDE", label: "Гид" },
  { value: "ADMIN", label: "Админ" },
  { value: "SUPERADMIN", label: "Суперадмин" },
];

export function RoleSelect({ userId, role }: { userId: string; role: UserRole }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    startTransition(async () => {
      const result = await updateUserRole(userId, value);
      if (result.error) toast.error(result.error);
      else toast.success("Роль обновлена");
    });
  }

  return (
    <Select defaultValue={role} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="h-8 w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            {r.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
