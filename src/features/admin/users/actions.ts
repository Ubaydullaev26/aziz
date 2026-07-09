"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/features/admin/require-admin";

const roleSchema = z.enum(["USER", "GUIDE", "ADMIN", "SUPERADMIN"]);

export async function updateUserRole(id: string, role: unknown) {
  const admin = await requireAdmin();
  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return { error: "Некорректная роль" };

  if (admin.id === id && parsed.data !== "SUPERADMIN" && parsed.data !== "ADMIN") {
    return { error: "Нельзя понизить собственную роль" };
  }

  await prisma.user.update({ where: { id }, data: { role: parsed.data } });
  revalidatePath("/admin/users");
  return { success: true as const };
}

export async function deleteUser(id: string) {
  const admin = await requireAdmin();
  if (admin.id === id) return { error: "Нельзя удалить собственный аккаунт" };

  try {
    await prisma.user.delete({ where: { id } });
  } catch {
    return { error: "Нельзя удалить пользователя с активными бронированиями" };
  }
  revalidatePath("/admin/users");
  return { success: true as const };
}
