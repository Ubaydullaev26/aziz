import { fetchJsonLdSiteEvents } from "./generic-jsonld-site";
import type { SourceResult } from "../types";

// Detail URL pattern confirmed via search-indexed examples, e.g.
// iticket.uz/ru/events/concerts/rock-concert2026/44214 and
// iticket.uz/ru/events/concerts/classical-music-fest-ekvon-sunvu —
// /ru/events/<category>/<slug>[/<id>]. Listing URLs below were not directly
// verified (this sandbox can't reach iticket.uz); check those first if
// discovery comes back empty.
//
// iticket.uz turned out to link out to iticket.az (Baku) — a production
// run imported one of their festivals mislabeled as Tashkent, both
// because the path-only regex doesn't care which domain it's on and
// because the city was defaulted rather than required. siteHost fixes the
// domain leak; requireCityMatch fixes the mislabeling on top of it.
export async function fetchITicketEvents(): Promise<SourceResult> {
  return fetchJsonLdSiteEvents({
    source: "iticket",
    organizerFallback: "iTicket.uz",
    defaultCity: "tashkent",
    siteHost: "iticket.uz",
    listingUrls: [
      "https://iticket.uz/ru/events/concerts",
      "https://iticket.uz/ru/events",
    ],
    detailUrlPattern: /\/ru\/events?\/[a-z0-9-]+\/[a-z0-9-]+/i,
    resolveUrl: (href) => new URL(href, "https://iticket.uz").toString(),
    maxDetailPages: 20,
    categoryKey: "concert",
    requireCityMatch: true,
  });
}
