import { fetchHtml, sleep } from "../fetch-html";
import { guessCity } from "../cities";
import {
  extractJsonLdEvents,
  schemaAddress,
  schemaImageUrl,
  schemaOrganizer,
  type SchemaEvent,
} from "../jsonld";
import type { ImportCityKey, NormalizedEvent, SourceResult } from "../types";

export interface JsonLdSiteConfig {
  source: string;
  organizerFallback: string;
  defaultCity: ImportCityKey;
  /** Category/listing pages to start discovery from. */
  listingUrls: string[];
  /** Matches href values that look like an individual event's detail page. */
  detailUrlPattern: RegExp;
  /** Absolute-ize a possibly-relative href found on the listing page. */
  resolveUrl: (href: string) => string;
  /** Safety cap on detail pages fetched per run — keeps us within the
   *  serverless function's time budget and off the site's radar. */
  maxDetailPages?: number;
  /**
   * When true, events whose address/venue text doesn't clearly mention
   * Tashkent or Samarkand are dropped instead of falling back to
   * `defaultCity`. Uzbekistan-only platforms (iticket/afisha) can safely
   * default every event to Tashkent — global platforms like Eventbrite
   * cannot, or an unrelated event anywhere in the world silently gets
   * mislabeled as happening in Uzbekistan.
   */
  requireCityMatch?: boolean;
  /**
   * Category to file discovered events under. Sites that split by section
   * (e.g. gtickets.uz's /concerts, /theaters, /sports) can pass a function
   * keyed off the source URL instead of a single fixed category.
   */
  categoryKey: NormalizedEvent["categoryKey"] | ((url: string) => NormalizedEvent["categoryKey"]);
}

function extractDetailLinks(html: string, config: JsonLdSiteConfig): string[] {
  const hrefs = new Set<string>();
  const hrefRe = /href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = hrefRe.exec(html))) {
    const href = match[1];
    if (href && config.detailUrlPattern.test(href)) {
      hrefs.add(config.resolveUrl(href));
    }
  }
  return [...hrefs];
}

function toNormalizedEvent(
  schemaEvent: SchemaEvent,
  url: string,
  config: JsonLdSiteConfig,
): NormalizedEvent | null {
  if (!schemaEvent.name || !schemaEvent.startDate) return null;
  const startAt = new Date(schemaEvent.startDate);
  if (Number.isNaN(startAt.getTime())) return null;

  const endAt = schemaEvent.endDate ? new Date(schemaEvent.endDate) : null;
  const address = schemaAddress(schemaEvent.location);
  const cityMatch = guessCity(
    `${schemaEvent.location?.name ?? ""} ${address ?? ""} ${schemaEvent.name}`,
  );
  if (!cityMatch && config.requireCityMatch) return null; // e.g. a global Eventbrite listing with no Uzbekistan match
  const cityGuess = cityMatch ?? config.defaultCity;

  const geo = schemaEvent.location?.geo;
  const latitude = geo?.latitude !== undefined ? Number(geo.latitude) : null;
  const longitude = geo?.longitude !== undefined ? Number(geo.longitude) : null;

  // Ticketing sites often set the JSON-LD `name` to a full SEO title, e.g.
  // "Артист — купить билеты на концерт в Ташкенте ... — Афиша Ташкента" —
  // keep just the leading event name.
  const cleanTitle = schemaEvent.name.split(" — ")[0]?.trim() || schemaEvent.name;

  return {
    source: config.source,
    externalId: url,
    sourceUrl: url,
    city: cityGuess,
    titleRu: cleanTitle.slice(0, 200),
    descriptionRu: schemaEvent.description?.trim() || schemaEvent.name,
    organizer: schemaOrganizer(schemaEvent.organizer) ?? config.organizerFallback,
    venueName: schemaEvent.location?.name ?? null,
    address,
    latitude: latitude !== null && !Number.isNaN(latitude) ? latitude : null,
    longitude: longitude !== null && !Number.isNaN(longitude) ? longitude : null,
    startAt,
    endAt: endAt && !Number.isNaN(endAt.getTime()) ? endAt : null,
    coverImage: schemaImageUrl(schemaEvent.image),
    categoryKey: typeof config.categoryKey === "function" ? config.categoryKey(url) : config.categoryKey,
  };
}

/**
 * Generic engine for sites that publish Schema.org Event JSON-LD (nearly
 * universal for ticketing platforms, since it drives Google's event rich
 * results). Two-pass: pull events straight off listing pages when present,
 * then fall back to following individual event links for sites that only
 * mark up the detail page.
 */
export async function fetchJsonLdSiteEvents(config: JsonLdSiteConfig): Promise<SourceResult> {
  const events: NormalizedEvent[] = [];
  const errors: string[] = [];
  const seenUrls = new Set<string>();
  const detailLinks = new Set<string>();

  for (const listingUrl of config.listingUrls) {
    const page = await fetchHtml(listingUrl);
    if (!page.ok) {
      errors.push(page.error);
      continue;
    }

    for (const schemaEvent of extractJsonLdEvents(page.html)) {
      const url = typeof schemaEvent.url === "string" ? schemaEvent.url : listingUrl;
      if (seenUrls.has(url)) continue;
      const normalized = toNormalizedEvent(schemaEvent, url, config);
      if (normalized) {
        seenUrls.add(url);
        events.push(normalized);
      }
    }

    for (const link of extractDetailLinks(page.html, config)) {
      detailLinks.add(link);
    }
    await sleep(300);
  }

  const cap = config.maxDetailPages ?? 25;
  for (const url of [...detailLinks].slice(0, cap)) {
    if (seenUrls.has(url)) continue;
    const detail = await fetchHtml(url);
    if (!detail.ok) {
      errors.push(detail.error);
      continue;
    }
    const schemaEvents = extractJsonLdEvents(detail.html);
    const primary = schemaEvents[0];
    if (primary) {
      const normalized = toNormalizedEvent(primary, url, config);
      if (normalized) {
        seenUrls.add(url);
        events.push(normalized);
      }
    }
    await sleep(300);
  }

  return { source: config.source, events, errors };
}
