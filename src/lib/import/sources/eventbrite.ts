import { fetchJsonLdSiteEvents } from "./generic-jsonld-site";
import type { SourceResult } from "../types";

// Lowest-confidence adapter of the four: Eventbrite's discovery pages are a
// heavy client-rendered React app, so a plain fetch() may return an
// HTML shell with no event links at all (they do SSR the page for SEO, but
// that could change or be region-gated). Eventbrite's own event-search API
// (`/v3/events/search/`) was deprecated for public API keys around 2019, so
// scraping is the only option without a partner agreement. Event *detail*
// pages (`/e/<slug>-tickets-<id>`) reliably carry Schema.org Event JSON-LD
// when they do render, which is what this adapter relies on.
export async function fetchEventbriteEvents(): Promise<SourceResult> {
  return fetchJsonLdSiteEvents({
    source: "eventbrite",
    organizerFallback: "Eventbrite",
    defaultCity: "tashkent",
    listingUrls: [
      "https://www.eventbrite.com/d/uzbekistan--tashkent/events/",
      "https://www.eventbrite.com/d/uzbekistan--samarkand/events/",
    ],
    detailUrlPattern: /\/e\/[a-z0-9-]+-tickets-\d+/i,
    resolveUrl: (href) => new URL(href, "https://www.eventbrite.com").toString(),
    maxDetailPages: 20,
  });
}
