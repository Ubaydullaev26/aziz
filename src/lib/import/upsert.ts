import slugify from "slugify";

import { prisma } from "@/lib/prisma";
import { CITY_CENTERS } from "./cities";
import type { ImportCityKey, NormalizedEvent } from "./types";

const CITY_SEED: Record<ImportCityKey, { nameRu: string; nameEn: string; nameUz: string; defaultZoom: number }> = {
  samarkand: { nameRu: "Самарканд", nameEn: "Samarkand", nameUz: "Samarqand", defaultZoom: 14.2 },
  tashkent: { nameRu: "Ташкент", nameEn: "Tashkent", nameUz: "Toshkent", defaultZoom: 12 },
};

const cityIdCache = new Map<ImportCityKey, string>();
const categoryIdCache = new Map<string, string>();

async function getCountryId(): Promise<string> {
  const country = await prisma.country.upsert({
    where: { code: "UZ" },
    update: {},
    create: { code: "UZ", nameRu: "Узбекистан", nameEn: "Uzbekistan", nameUz: "O'zbekiston" },
  });
  return country.id;
}

async function getCityId(city: ImportCityKey): Promise<string> {
  const cached = cityIdCache.get(city);
  if (cached) return cached;

  const countryId = await getCountryId();
  const seed = CITY_SEED[city];
  const center = CITY_CENTERS[city];
  const record = await prisma.city.upsert({
    where: { slug: city },
    update: {},
    create: {
      slug: city,
      countryId,
      nameRu: seed.nameRu,
      nameEn: seed.nameEn,
      nameUz: seed.nameUz,
      latitude: center.latitude,
      longitude: center.longitude,
      defaultZoom: seed.defaultZoom,
    },
  });
  cityIdCache.set(city, record.id);
  return record.id;
}

async function getCategoryId(key: NormalizedEvent["categoryKey"]): Promise<string> {
  const cached = categoryIdCache.get(key);
  if (cached) return cached;
  const category = await prisma.category.findUnique({ where: { key } });
  if (!category) {
    throw new Error(`Category "${key}" not seeded — run db:seed first`);
  }
  categoryIdCache.set(key, category.id);
  return category.id;
}

// Small deterministic offset (~150m) so events that fall back to the city
// center don't all stack on the exact same map pixel.
function jitter(seed: string, base: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return base + ((hash % 1000) / 1000) * 0.02 - 0.01;
}

export type UpsertOutcome = "created" | "updated" | "skipped";

export async function upsertNormalizedEvent(
  event: NormalizedEvent,
): Promise<{ outcome: UpsertOutcome; slug: string; error?: string }> {
  const slug = `${event.source}-${slugify(event.externalId, { lower: true, strict: true }).slice(0, 180)}`;

  try {
    const [cityId, categoryId] = await Promise.all([
      getCityId(event.city),
      getCategoryId(event.categoryKey),
    ]);

    const center = CITY_CENTERS[event.city];
    const latitude = event.latitude ?? jitter(`${slug}-lat`, center.latitude);
    const longitude = event.longitude ?? jitter(`${slug}-lng`, center.longitude);
    const endAt = event.endAt ?? new Date(event.startAt.getTime() + 3 * 60 * 60 * 1000);

    const existing = await prisma.event.findUnique({ where: { slug } });

    const data = {
      cityId,
      categoryId,
      titleRu: event.titleRu,
      titleEn: event.titleRu,
      titleUz: event.titleRu,
      descriptionRu: event.descriptionRu,
      descriptionEn: event.descriptionRu,
      descriptionUz: event.descriptionRu,
      coverImage: event.coverImage ?? `/api/placeholder/${slug}?w=1200&h=800`,
      organizer: event.organizer,
      address: event.address ?? event.venueName ?? `${event.city}, источник: ${event.source}`,
      latitude,
      longitude,
      startAt: event.startAt,
      endAt,
    };

    await prisma.event.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });

    return { outcome: existing ? "updated" : "created", slug };
  } catch (err) {
    return { outcome: "skipped", slug, error: err instanceof Error ? err.message : String(err) };
  }
}
