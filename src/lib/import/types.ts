// Normalized shape every source adapter must produce. City/category
// resolution and DB writes happen centrally in upsert.ts — adapters only
// scrape + map fields, they never touch Prisma directly.

export type ImportCityKey = "tashkent" | "samarkand";

export interface NormalizedEvent {
  source: string; // e.g. "aydatuda", "iticket", "afisha", "eventbrite"
  externalId: string; // stable id/slug from the source, used for de-dup
  sourceUrl: string;
  city: ImportCityKey;
  titleRu: string;
  descriptionRu: string;
  organizer: string;
  venueName: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  startAt: Date;
  endAt: Date | null;
  coverImage: string | null;
  categoryKey: "concert" | "festival" | "exhibition" | "masterclass";
}

export interface SourceResult {
  source: string;
  events: NormalizedEvent[];
  errors: string[];
}

export interface SourceSummary {
  source: string;
  fetched: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface ImportSummary {
  startedAt: string;
  finishedAt: string;
  sources: SourceSummary[];
}
