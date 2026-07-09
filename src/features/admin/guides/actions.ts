"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/features/admin/require-admin";
import { guideSchema } from "@/features/admin/guides/schema";

function buildData(data: ReturnType<typeof guideSchema.parse>) {
  const { placeIds, languages, userId, ...rest } = data;
  return {
    scalar: {
      ...rest,
      userId: userId || null,
      languages: languages.split(",").map((l) => l.trim().toLowerCase()).filter(Boolean),
      pricePerHour: rest.pricePerHour ?? null,
      bioRu: rest.bioRu || null,
      bioEn: rest.bioEn || null,
      bioUz: rest.bioUz || null,
    },
    placeIds: placeIds ?? [],
  };
}

export async function createGuide(input: unknown) {
  await requireAdmin();
  const parsed = guideSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" };

  const { scalar, placeIds } = buildData(parsed.data);

  try {
    await prisma.guide.create({
      data: { ...scalar, places: { connect: placeIds.map((id) => ({ id })) } },
    });
  } catch {
    return { error: "Гид с таким slug уже существует" };
  }

  revalidatePath("/admin/guides");
  redirect("/admin/guides");
}

export async function updateGuide(id: string, input: unknown) {
  await requireAdmin();
  const parsed = guideSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" };

  const { scalar, placeIds } = buildData(parsed.data);

  try {
    await prisma.guide.update({
      where: { id },
      data: { ...scalar, places: { set: placeIds.map((pid) => ({ id: pid })) } },
    });
  } catch {
    return { error: "Не удалось сохранить изменения" };
  }

  revalidatePath("/admin/guides");
  redirect("/admin/guides");
}

export async function deleteGuide(id: string) {
  await requireAdmin();
  try {
    await prisma.guide.delete({ where: { id } });
  } catch {
    return { error: "Нельзя удалить гида, пока на него есть бронирования или экскурсии" };
  }
  revalidatePath("/admin/guides");
  return { success: true as const };
}
