import { z } from "zod";

export const eventSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  cityId: z.string().min(1, "Выберите город"),
  categoryId: z.string().min(1, "Выберите категорию"),
  placeId: z.string().optional().or(z.literal("")),
  titleRu: z.string().min(2),
  titleEn: z.string().min(2),
  titleUz: z.string().min(2),
  descriptionRu: z.string().min(10, "Минимум 10 символов"),
  descriptionEn: z.string().min(10, "Минимум 10 символов"),
  descriptionUz: z.string().min(10, "Минимум 10 символов"),
  coverImage: z.string().min(1, "Укажите обложку"),
  organizer: z.string().min(2),
  address: z.string().min(3),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  startAt: z.string().min(1, "Укажите дату и время начала"),
  endAt: z.string().min(1, "Укажите дату и время окончания"),
  timezone: z.string().min(1),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  images: z.array(z.object({ url: z.string().min(1) })).optional(),
  ticketTypes: z
    .array(
      z.object({
        // Deliberately not named `id` — react-hook-form's useFieldArray
        // injects its own generated `id` into each array item for React
        // keys, which would shadow a real DB id of the same name.
        ticketTypeId: z.string().optional(),
        name: z.string().min(1),
        price: z.coerce.number().int().min(0),
        currency: z.string().min(1),
        totalQuantity: z.coerce.number().int().min(1),
      }),
    )
    .min(1, "Добавьте хотя бы один тип билета"),
});

export type EventFormValues = z.infer<typeof eventSchema>;
