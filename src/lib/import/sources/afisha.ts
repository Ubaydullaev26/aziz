import { fetchJsonLdSiteEvents } from "./generic-jsonld-site";
import type { SourceResult } from "../types";

// Detail URL pattern confirmed via search-indexed examples, e.g.
// afisha.uz/ru/concerts/2026/06/08/grande-amore and
// afisha.uz/ru/standup/2026/07/08/slava-madiyar — /ru/<category>/YYYY/MM/DD/<slug>.
// Listing pages (/ru/calendar, /ru/concerts) were not directly verified —
// check those first if discovery comes back empty.
export async function fetchAfishaEvents(): Promise<SourceResult> {
  return fetchJsonLdSiteEvents({
    source: "afisha",
    organizerFallback: "Afisha.uz",
    defaultCity: "tashkent",
    listingUrls: [
      "https://www.afisha.uz/ru/calendar",
      "https://www.afisha.uz/ru/concerts",
      "https://www.afisha.uz/ru/gorod",
    ],
    detailUrlPattern: /\/ru\/[a-z]+\/\d{4}\/\d{2}\/\d{2}\/[a-z0-9-]+/i,
    resolveUrl: (href) => new URL(href, "https://www.afisha.uz").toString(),
    maxDetailPages: 20,
  });
}
