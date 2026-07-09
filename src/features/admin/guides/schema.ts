import { z } from "zod";

export const guideSchema = z.object({
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  cityId: z.string().min(1, "Выберите город"),
  userId: z.string().optional().or(z.literal("")),
  name: z.string().min(2),
  avatar: z.string().min(1, "Укажите аватар"),
  bioRu: z.string().optional().or(z.literal("")),
  bioEn: z.string().optional().or(z.literal("")),
  bioUz: z.string().optional().or(z.literal("")),
  languages: z.string().min(2, "Укажите языки через запятую, напр. ru, en"),
  experienceYears: z.coerce.number().int().min(0).max(80),
  pricePerHour: z.coerce.number().int().min(0).optional(),
  currency: z.string().min(1),
  isVerified: z.boolean(),
  isPublished: z.boolean(),
  placeIds: z.array(z.string()).optional(),
});

export type GuideFormValues = z.infer<typeof guideSchema>;
