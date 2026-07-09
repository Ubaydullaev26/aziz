import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  AUTH_GOOGLE_ID: z.string().optional().default(""),
  AUTH_GOOGLE_SECRET: z.string().optional().default(""),
  AUTH_APPLE_ID: z.string().optional().default(""),
  AUTH_APPLE_SECRET: z.string().optional().default(""),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional().default(""),
  NEXT_PUBLIC_APP_URL: z.string().optional().default("http://localhost:3000"),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().optional().default("ru"),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().optional().default("UZS"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  AUTH_APPLE_ID: process.env.AUTH_APPLE_ID,
  AUTH_APPLE_SECRET: process.env.AUTH_APPLE_SECRET,
  NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  NEXT_PUBLIC_DEFAULT_CURRENCY: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY,
});
