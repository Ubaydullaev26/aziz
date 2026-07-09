import { z } from "zod";

export const placeSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  cityId: z.string().min(1, "Выберите город"),
  categoryId: z.string().min(1, "Выберите категорию"),
  nameRu: z.string().min(2),
  nameEn: z.string().min(2),
  nameUz: z.string().min(2),
  shortDescriptionRu: z.string().optional().or(z.literal("")),
  shortDescriptionEn: z.string().optional().or(z.literal("")),
  shortDescriptionUz: z.string().optional().or(z.literal("")),
  descriptionRu: z.string().min(10, "Минимум 10 символов"),
  descriptionEn: z.string().min(10, "Минимум 10 символов"),
  descriptionUz: z.string().min(10, "Минимум 10 символов"),
  historyRu: z.string().optional().or(z.literal("")),
  historyEn: z.string().optional().or(z.literal("")),
  historyUz: z.string().optional().or(z.literal("")),
  address: z.string().min(3),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  priceLevel: z.enum(["FREE", "LOW", "MEDIUM", "HIGH"]),
  priceFrom: z.coerce.number().int().min(0).optional(),
  currency: z.string().min(1),
  phone: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  coverImage: z.string().min(1, "Укажите обложку"),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  images: z.array(z.object({ url: z.string().min(1) })).optional(),
  hours: z.array(
    z.object({
      dayOfWeek: z.number(),
      opensAt: z.string().optional().or(z.literal("")),
      closesAt: z.string().optional().or(z.literal("")),
      isClosed: z.boolean(),
    }),
  ),
});

export type PlaceFormValues = z.infer<typeof placeSchema>;

export const PRICE_LEVELS = [
  { value: "FREE", label: "Бесплатно" },
  { value: "LOW", label: "Недорого" },
  { value: "MEDIUM", label: "Средне" },
  { value: "HIGH", label: "Дорого" },
] as const;

export const DAY_LABELS = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
