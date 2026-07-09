"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа").max(80),
  image: z.string().min(1, "Введите ссылку или путь к изображению").optional().or(z.literal("")),
});

export async function updateProfile(input: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Требуется вход" };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, image: parsed.data.image || null },
  });

  revalidatePath("/account");
  return { success: true as const };
}

export async function updatePreferences(input: { locale?: string; themePreference?: string }) {
  const session = await auth();
  if (!session?.user) return { error: "Требуется вход" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(input.locale ? { locale: input.locale } : {}),
      ...(input.themePreference ? { themePreference: input.themePreference } : {}),
    },
  });

  return { success: true as const };
}
