import * as cheerio from "cheerio";

// Most ticketing/event sites embed Schema.org Event markup in a
// <script type="application/ld+json"> tag purely for Google's event rich
// results — it's server-rendered even on JS-heavy SPAs, which makes it a
// far more reliable extraction target than guessing CSS class names.
// https://schema.org/Event

interface SchemaOffer {
  price?: string | number;
  priceCurrency?: string;
}

interface SchemaPlaceLike {
  name?: string;
  address?: string | { streetAddress?: string; addressLocality?: string };
  geo?: { latitude?: string | number; longitude?: string | number };
}

export interface SchemaEvent {
  "@type"?: string | string[];
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  image?: string | string[] | { url?: string };
  url?: string;
  location?: SchemaPlaceLike;
  organizer?: { name?: string } | string;
  offers?: SchemaOffer | SchemaOffer[];
}

function isEventType(type: SchemaEvent["@type"]): boolean {
  if (!type) return false;
  const types = Array.isArray(type) ? type : [type];
  return types.some((t) => t.toLowerCase().includes("event"));
}

function flatten(node: unknown): SchemaEvent[] {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(flatten);
  const obj = node as Record<string, unknown>;
  if ("@graph" in obj) return flatten(obj["@graph"]);
  if (isEventType((obj as SchemaEvent)["@type"])) return [obj as SchemaEvent];
  return [];
}

/** Extracts every Schema.org Event object embedded in a page's JSON-LD blocks. */
export function extractJsonLdEvents(html: string): SchemaEvent[] {
  const $ = cheerio.load(html);
  const events: SchemaEvent[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text().trim();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      events.push(...flatten(parsed));
    } catch {
      // Some sites emit slightly malformed JSON-LD (trailing commas,
      // unescaped newlines) — skip rather than abort the whole page.
    }
  });

  return events;
}

export function schemaImageUrl(image: SchemaEvent["image"]): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return typeof image[0] === "string" ? image[0] : null;
  return image.url ?? null;
}

export function schemaAddress(location: SchemaPlaceLike | undefined): string | null {
  if (!location?.address) return null;
  if (typeof location.address === "string") return location.address;
  return [location.address.streetAddress, location.address.addressLocality]
    .filter(Boolean)
    .join(", ") || null;
}

export function schemaOrganizer(organizer: SchemaEvent["organizer"]): string | null {
  if (!organizer) return null;
  return typeof organizer === "string" ? organizer : (organizer.name ?? null);
}
