"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/features/admin/require-admin";
import { citySchema } from "@/features/admin/cities/schema";

export async function createCity(input: unknown) {
  await requireAdmin();
  const parsed = citySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" };

  const data = parsed.data;
  try {
    await prisma.city.create({
      data: { ...data, coverImage: data.coverImage || null, descriptionRu: data.descriptionRu || null, descriptionEn: data.descriptionEn || null, descriptionUz: data.descriptionUz || null },
    });
  } catch {
    return { error: "Город с таким slug уже существует" };
  }

  revalidatePath("/admin/cities");
  redirect("/admin/cities");
}

export async function updateCity(id: string, input: unknown) {
  await requireAdmin();
  const parsed = citySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" };

  const data = parsed.data;
  try {
    await prisma.city.update({
      where: { id },
      data: { ...data, coverImage: data.coverImage || null, descriptionRu: data.descriptionRu || null, descriptionEn: data.descriptionEn || null, descriptionUz: data.descriptionUz || null },
    });
  } catch {
    return { error: "Не удалось сохранить изменения" };
  }

  revalidatePath("/admin/cities");
  redirect("/admin/cities");
}

export async function deleteCity(id: string) {
  await requireAdmin();
  try {
    await prisma.city.delete({ where: { id } });
  } catch {
    return { error: "Нельзя удалить город, пока в нём есть места или события" };
  }
  revalidatePath("/admin/cities");
  return { success: true as const };
}
