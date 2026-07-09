import { z } from "zod";

export const citySchema = z.object({
  slug: z
    .string()
    .min(2, "Минимум 2 символа")
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  countryId: z.string().min(1, "Выберите страну"),
  nameRu: z.string().min(2),
  nameEn: z.string().min(2),
  nameUz: z.string().min(2),
  descriptionRu: z.string().optional().or(z.literal("")),
  descriptionEn: z.string().optional().or(z.literal("")),
  descriptionUz: z.string().optional().or(z.literal("")),
  coverImage: z.string().min(1, "Укажите путь или ссылку на изображение").optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  defaultZoom: z.coerce.number().min(1).max(22),
  timezone: z.string().min(1),
  isPublished: z.boolean(),
});

export type CityFormValues = z.infer<typeof citySchema>;
