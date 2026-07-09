import { z } from "zod";

export const categorySchema = z.object({
  key: z
    .string()
    .min(2, "Минимум 2 символа")
    .regex(/^[a-z0-9_]+$/, "Только латиница в нижнем регистре, цифры и подчёркивание"),
  nameRu: z.string().min(2),
  nameEn: z.string().min(2),
  nameUz: z.string().min(2),
  icon: z.string().min(1, "Выберите иконку"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Формат: #RRGGBB"),
  isEventCategory: z.boolean(),
  position: z.coerce.number().int().min(0),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
