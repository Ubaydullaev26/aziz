"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/features/admin/require-admin";
import { categorySchema } from "@/features/admin/categories/schema";

export async function createCategory(input: unknown) {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" };

  try {
    await prisma.category.create({ data: parsed.data });
  } catch {
    return { error: "Категория с таким ключом уже существует" };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, input: unknown) {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" };

  try {
    await prisma.category.update({ where: { id }, data: parsed.data });
  } catch {
    return { error: "Не удалось сохранить изменения" };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    return { error: "Нельзя удалить категорию, пока она используется" };
  }
  revalidatePath("/admin/categories");
  return { success: true as const };
}
