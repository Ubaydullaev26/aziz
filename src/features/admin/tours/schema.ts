import { z } from "zod";

export const tourSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  placeId: z.string().optional().or(z.literal("")),
  guideId: z.string().optional().or(z.literal("")),
  titleRu: z.string().min(2),
  titleEn: z.string().min(2),
  titleUz: z.string().min(2),
  descriptionRu: z.string().min(10, "Минимум 10 символов"),
  descriptionEn: z.string().min(10, "Минимум 10 символов"),
  descriptionUz: z.string().min(10, "Минимум 10 символов"),
  coverImage: z.string().min(1, "Укажите обложку"),
  durationMinutes: z.coerce.number().int().min(10),
  price: z.coerce.number().int().min(0),
  currency: z.string().min(1),
  maxGroupSize: z.coerce.number().int().min(1),
  isPublished: z.boolean(),
});

export type TourFormValues = z.infer<typeof tourSchema>;
