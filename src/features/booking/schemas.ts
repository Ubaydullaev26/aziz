import { z } from "zod";

export const createBookingSchema = z.object({
  type: z.enum(["TOUR", "EVENT", "GUIDE"]),
  tourAvailabilityId: z.string().optional(),
  eventTicketTypeId: z.string().optional(),
  guideAvailabilityId: z.string().optional(),
  quantity: z.number().int().min(1).max(20),
  contactName: z.string().min(2, "Укажите имя"),
  contactPhone: z.string().min(6, "Укажите телефон"),
  notes: z.string().max(500).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
