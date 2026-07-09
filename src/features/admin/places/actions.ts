"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/features/admin/require-admin";
import { placeSchema } from "@/features/admin/places/schema";

function buildData(data: ReturnType<typeof placeSchema.parse>) {
  const { images, hours, ...rest } = data;
  return {
    scalar: {
      ...rest,
      priceFrom: rest.priceFrom ?? null,
      phone: rest.phone || null,
      website: rest.website || null,
      shortDescriptionRu: rest.shortDescriptionRu || null,
      shortDescriptionEn: rest.shortDescriptionEn || null,
      shortDescriptionUz: rest.shortDescriptionUz || null,
      historyRu: rest.historyRu || null,
      historyEn: rest.historyEn || null,
      historyUz: rest.historyUz || null,
    },
    images: (images ?? []).filter((i) => i.url.trim()),
    hours,
  };
}

export async function createPlace(input: unknown) {
  await requireAdmin();
  const parsed = placeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" };

  const { scalar, images, hours } = buildData(parsed.data);

  try {
    await prisma.place.create({
      data: {
        ...scalar,
        images: { create: images.map((img, i) => ({ url: img.url, position: i })) },
        openingHours: { create: hours.map((h) => ({ ...h, opensAt: h.opensAt || null, closesAt: h.closesAt || null })) },
      },
    });
  } catch {
    return { error: "Место с таким slug уже существует" };
  }

  revalidatePath("/admin/places");
  redirect("/admin/places");
}

export async function updatePlace(id: string, input: unknown) {
  await requireAdmin();
  const parsed = placeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" };

  const { scalar, images, hours } = buildData(parsed.data);

  try {
    await prisma.$transaction([
      prisma.place.update({ where: { id }, data: scalar }),
      prisma.placeImage.deleteMany({ where: { placeId: id } }),
      prisma.placeImage.createMany({ data: images.map((img, i) => ({ placeId: id, url: img.url, position: i })) }),
      prisma.placeOpeningHour.deleteMany({ where: { placeId: id } }),
      prisma.placeOpeningHour.createMany({
        data: hours.map((h) => ({ placeId: id, ...h, opensAt: h.opensAt || null, closesAt: h.closesAt || null })),
      }),
    ]);
  } catch {
    return { error: "Не удалось сохранить изменения" };
  }

  revalidatePath("/admin/places");
  redirect("/admin/places");
}

export async function deletePlace(id: string) {
  await requireAdmin();
  try {
    await prisma.place.delete({ where: { id } });
  } catch {
    return { error: "Нельзя удалить место, пока с ним связаны экскурсии или бронирования" };
  }
  revalidatePath("/admin/places");
  return { success: true as const };
}
