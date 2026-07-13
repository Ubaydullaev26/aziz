import * as cheerio from "cheerio";

import { fetchHtml } from "../fetch-html";
import { guessCity } from "../cities";
import type { NormalizedEvent, SourceResult } from "../types";

// Telegram serves a lightweight, unauthenticated HTML preview of any public
// channel at t.me/s/<channel> — this is the same page search engines use to
// index channel content, and its markup has been stable for years:
// .tgme_widget_message wraps each post, .tgme_widget_message_text the body,
// .tgme_widget_message_date > time[datetime] the timestamp.
const CHANNEL = "aydatuda";
const CHANNEL_URL = `https://t.me/s/${CHANNEL}`;

// Announcement channels are free text, not structured event data — this
// pulls out only what a human would glance at: a date/time near the top of
// the post (if any) and a rough city guess. Posts with neither are still
// imported (startAt falls back to "posted at"), just less useful for the
// live map layer.
const DATE_RE =
  /(\d{1,2})\s+(январ|феврал|март|апрел|ма[йя]|июн|июл|август|сентябр|октябр|ноябр|декабр)\w*(?:\s+(\d{4}))?/i;
const TIME_RE = /(\d{1,2}):(\d{2})/;
const MONTHS: Record<string, number> = {
  январ: 0,
  феврал: 1,
  март: 2,
  апрел: 3,
  ма: 4,
  июн: 5,
  июл: 6,
  август: 7,
  сентябр: 8,
  октябр: 9,
  ноябр: 10,
  декабр: 11,
};

function parseAnnouncedDate(text: string, postedAt: Date): Date {
  const dateMatch = DATE_RE.exec(text);
  const monthText = dateMatch?.[2]?.toLowerCase();
  if (!dateMatch || !monthText) return postedAt;
  const day = Number(dateMatch[1]);
  const monthKey = Object.keys(MONTHS).find((m) => monthText.startsWith(m));
  const month = monthKey ? MONTHS[monthKey] : undefined;
  if (month === undefined) return postedAt;
  const year = dateMatch[3] ? Number(dateMatch[3]) : postedAt.getFullYear();
  const timeMatch = TIME_RE.exec(text);
  const hour = timeMatch?.[1] ? Number(timeMatch[1]) : 19;
  const minute = timeMatch?.[2] ? Number(timeMatch[2]) : 0;
  return new Date(year, month, day, hour, minute);
}

export async function fetchTelegramEvents(): Promise<SourceResult> {
  const events: NormalizedEvent[] = [];
  const errors: string[] = [];

  const page = await fetchHtml(CHANNEL_URL);
  if (!page.ok) {
    return { source: "aydatuda", events, errors: [page.error] };
  }

  const $ = cheerio.load(page.html);

  $(".tgme_widget_message").each((_, el) => {
    try {
      const post = $(el);
      const postId = post.attr("data-post"); // "aydatuda/1234"
      const bodyEl = post.find(".tgme_widget_message_text");
      const text = bodyEl.text().trim();
      if (!postId || !text || text.length < 20) return; // skip photo-only / empty posts

      const isoDate = post.find(".tgme_widget_message_date time").attr("datetime");
      const postedAt = isoDate ? new Date(isoDate) : new Date();
      const startAt = parseAnnouncedDate(text, postedAt);

      const photo = post.find(".tgme_widget_message_photo_wrap").first();
      const styleAttr = photo.attr("style") ?? "";
      const imageMatch = /background-image:url\('([^']+)'\)/.exec(styleAttr);

      // aydatuda posts about events across the wider region, not just
      // Uzbekistan (a Baku festival slipped through and got mislabeled
      // "Tashkent" before this was a hard requirement instead of a
      // default) — skip anything that doesn't explicitly mention Tashkent
      // or Samarkand rather than guessing.
      const city = guessCity(text);
      if (!city) return;
      const firstLine = text.split("\n")[0]?.slice(0, 140) || "Анонс из Aydatuda";

      events.push({
        source: "aydatuda",
        externalId: postId,
        sourceUrl: `https://t.me/${postId}`,
        city,
        titleRu: firstLine,
        descriptionRu: text,
        organizer: "Aydatuda (Telegram)",
        venueName: null,
        address: null,
        latitude: null,
        longitude: null,
        startAt,
        endAt: null,
        coverImage: imageMatch?.[1] ?? null,
        categoryKey: "festival",
      });
    } catch (err) {
      errors.push(`post parse failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  });

  return { source: "aydatuda", events, errors };
}
