import { fetchJsonLdSiteEvents } from "./generic-jsonld-site";
import type { NormalizedEvent, SourceResult } from "../types";

// URL scheme confirmed via search-indexed examples:
//   gtickets.uz/concerts/event/9345-30006?date=2026-05-18
//   gtickets.uz/theaters/event/8247-30000?date=2026-01-20
// i.e. /<section>/event/<id>[?date=YYYY-MM-DD]. Listing pages
// (/concerts, /theaters, /sports) were not directly verified — check those
// first if discovery comes back empty. Cinema (/releases, /cinemas) is
// intentionally skipped: movie showtimes aren't "live city" events.
const SECTIONS: { path: string; categoryKey: NormalizedEvent["categoryKey"] }[] = [
  { path: "concerts", categoryKey: "concert" },
  { path: "theaters", categoryKey: "theater" },
  { path: "sports", categoryKey: "sport" },
];

export async function fetchGTicketsEvents(): Promise<SourceResult> {
  const events: NormalizedEvent[] = [];
  const errors: string[] = [];

  for (const section of SECTIONS) {
    const result = await fetchJsonLdSiteEvents({
      source: "gtickets",
      organizerFallback: "GTickets.uz",
      defaultCity: "tashkent",
      listingUrls: [`https://gtickets.uz/${section.path}`],
      detailUrlPattern: new RegExp(`/${section.path}/event/[\\w-]+`, "i"),
      resolveUrl: (href) => new URL(href, "https://gtickets.uz").toString(),
      maxDetailPages: 25,
      categoryKey: section.categoryKey,
    });
    events.push(...result.events);
    errors.push(...result.errors);
  }

  return { source: "gtickets", events, errors };
}
