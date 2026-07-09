"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/features/admin/require-admin";
import { eventSchema } from "@/features/admin/events/schema";

function buildScalar(data: ReturnType<typeof eventSchema.parse>) {
  return {
    slug: data.slug,
    cityId: data.cityId,
    categoryId: data.categoryId,
    placeId: data.placeId || null,
    titleRu: data.titleRu,
    titleEn: data.titleEn,
    titleUz: data.titleUz,
    descriptionRu: data.descriptionRu,
    descriptionEn: data.descriptionEn,
    descriptionUz: data.descriptionUz,
    coverImage: data.coverImage,
    organizer: data.organizer,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    startAt: new Date(data.startAt),
    endAt: new Date(data.endAt),
    timezone: data.timezone,
    isFeatured: data.isFeatured,
    isPublished: data.isPublished,
  };
}

export async function createEvent(input: unknown) {
  await requireAdmin();
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" };

  const images = (parsed.data.images ?? []).filter((i) => i.url.trim());

  try {
    await prisma.event.create({
      data: {
        ...buildScalar(parsed.data),
        images: { create: images.map((img, i) => ({ url: img.url, position: i })) },
        ticketTypes: { create: parsed.data.ticketTypes.map((t) => ({ name: t.name, price: t.price, currency: t.currency, totalQuantity: t.totalQuantity })) },
      },
    });
  } catch {
    return { error: "Событие с таким slug уже существует" };
  }

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function updateEvent(id: string, input: unknown) {
  await requireAdmin();
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" };

  const images = (parsed.data.images ?? []).filter((i) => i.url.trim());

  try {
    await prisma.$transaction(async (tx) => {
      await tx.event.update({ where: { id }, data: buildScalar(parsed.data) });

      await tx.eventImage.deleteMany({ where: { eventId: id } });
      await tx.eventImage.createMany({ data: images.map((img, i) => ({ eventId: id, url: img.url, position: i })) });

      const existing = await tx.eventTicketType.findMany({ where: { eventId: id }, select: { id: true } });
      const existingIds = existing.map((t) => t.id);
      const submittedIds = parsed.data.ticketTypes.map((t) => t.ticketTypeId).filter(Boolean) as string[];
      const toDelete = existingIds.filter((tid) => !submittedIds.includes(tid));
      if (toDelete.length) await tx.eventTicketType.deleteMany({ where: { id: { in: toDelete } } });

      for (const t of parsed.data.ticketTypes) {
        if (t.ticketTypeId) {
          await tx.eventTicketType.update({
            where: { id: t.ticketTypeId },
            data: { name: t.name, price: t.price, currency: t.currency, totalQuantity: t.totalQuantity },
          });
        } else {
          await tx.eventTicketType.create({
            data: { eventId: id, name: t.name, price: t.price, currency: t.currency, totalQuantity: t.totalQuantity },
          });
        }
      }
    });
  } catch {
    return { error: "Не удалось сохранить изменения — возможно, на билет уже есть бронирования" };
  }

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  try {
    await prisma.event.delete({ where: { id } });
  } catch {
    return { error: "Нельзя удалить событие, пока на него есть бронирования" };
  }
  revalidatePath("/admin/events");
  return { success: true as const };
}
