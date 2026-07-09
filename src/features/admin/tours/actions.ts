"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/features/admin/require-admin";
import { tourSchema } from "@/features/admin/tours/schema";

function buildScalar(data: ReturnType<typeof tourSchema.parse>) {
  return { ...data, placeId: data.placeId || null, guideId: data.guideId || null };
}

export async function createTour(input: unknown) {
  await requireAdmin();
  const parsed = tourSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" };

  try {
    await prisma.tour.create({ data: buildScalar(parsed.data) });
  } catch {
    return { error: "Экскурсия с таким slug уже существует" };
  }

  revalidatePath("/admin/tours");
  redirect("/admin/tours");
}

export async function updateTour(id: string, input: unknown) {
  await requireAdmin();
  const parsed = tourSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" };

  try {
    await prisma.tour.update({ where: { id }, data: buildScalar(parsed.data) });
  } catch {
    return { error: "Не удалось сохранить изменения" };
  }

  revalidatePath("/admin/tours");
  redirect("/admin/tours");
}

export async function deleteTour(id: string) {
  await requireAdmin();
  try {
    await prisma.tour.delete({ where: { id } });
  } catch {
    return { error: "Нельзя удалить экскурсию, пока на неё есть бронирования" };
  }
  revalidatePath("/admin/tours");
  return { success: true as const };
}
