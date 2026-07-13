import { fetchHtml } from "../fetch-html";
import { guessCity } from "../cities";
import { extractNextDataQuery } from "../nextdata";
import type { NormalizedEvent, SourceResult } from "../types";

// gtickets.uz is a Next.js app whose listing pages hydrate from a React
// Query cache embedded in __NEXT_DATA__ — confirmed against a real
// gtickets.uz/concerts page source, which contained a
// dehydratedState.queries entry keyed `["concerts", ...]` holding exactly
// this shape. /theaters and /sports are assumed to follow the same
// pattern (same app, same URL scheme) but weren't directly observed —
// if a section comes back with a "no query found" error, its queryKey
// name likely differs and needs adjusting below.
interface GTicketsItem {
  id: number;
  palace_id: number;
  palace_name?: string;
  title?: string;
  poster?: string;
  big_poster?: string;
  event_type?: string;
  genres?: string[];
  start_date?: string;
  end_date?: string;
  address?: string;
}

const SECTIONS: { path: string; queryKey: string; categoryKey: NormalizedEvent["categoryKey"] }[] = [
  { path: "concerts", queryKey: "concerts", categoryKey: "concert" },
  { path: "theaters", queryKey: "theaters", categoryKey: "theater" },
  { path: "sports", queryKey: "sports", categoryKey: "sport" },
];

// gtickets.uz's dates (e.g. "2026-09-06T20:00:00") carry no timezone
// designator; Uzbekistan is UTC+5 year-round (no DST), so pin it rather
// than letting the runtime's default timezone silently shift every event.
function parseTashkentTime(value: string): Date | null {
  const hasOffset = /Z$|[+-]\d{2}:\d{2}$/.test(value);
  const date = new Date(hasOffset ? value : `${value}+05:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function fetchGTicketsEvents(): Promise<SourceResult> {
  const events: NormalizedEvent[] = [];
  const errors: string[] = [];

  for (const section of SECTIONS) {
    const page = await fetchHtml(`https://gtickets.uz/${section.path}`);
    if (!page.ok) {
      errors.push(page.error);
      continue;
    }

    const items = extractNextDataQuery<GTicketsItem>(page.html, section.queryKey);
    if (!items) {
      errors.push(`gtickets/${section.path}: no "${section.queryKey}" query in __NEXT_DATA__ (page layout may have changed)`);
      continue;
    }

    for (const item of items) {
      if (!item.title || !item.start_date) continue;
      const startAt = parseTashkentTime(item.start_date);
      if (!startAt) continue;
      const endAt = item.end_date ? parseTashkentTime(item.end_date) : null;

      events.push({
        source: "gtickets",
        externalId: `${section.path}-${item.id}`,
        sourceUrl: `https://gtickets.uz/${section.path}/event/${item.id}-${item.palace_id}`,
        city: guessCity(`${item.palace_name ?? ""} ${item.address ?? ""}`) ?? "tashkent",
        titleRu: item.title,
        descriptionRu: `${item.event_type ?? item.genres?.[0] ?? "Мероприятие"} в «${item.palace_name ?? "уточняется на сайте"}»`,
        organizer: "GTickets.uz",
        venueName: item.palace_name ?? null,
        address: item.address ?? item.palace_name ?? null,
        latitude: null,
        longitude: null,
        startAt,
        endAt,
        coverImage: item.big_poster ?? item.poster ?? null,
        categoryKey: section.categoryKey,
      });
    }
  }

  return { source: "gtickets", events, errors };
}
