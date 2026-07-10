import { fetchTelegramEvents } from "./sources/telegram";
import { fetchITicketEvents } from "./sources/iticket";
import { fetchAfishaEvents } from "./sources/afisha";
import { fetchEventbriteEvents } from "./sources/eventbrite";
import { upsertNormalizedEvent } from "./upsert";
import type { ImportSummary, SourceResult, SourceSummary } from "./types";

export type { ImportSummary, SourceSummary };

async function runSource(fetchFn: () => Promise<SourceResult>): Promise<SourceSummary> {
  let result: SourceResult;
  try {
    result = await fetchFn();
  } catch (err) {
    return {
      source: fetchFn.name,
      fetched: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [`source crashed: ${err instanceof Error ? err.message : String(err)}`],
    };
  }

  const summary: SourceSummary = {
    source: result.source,
    fetched: result.events.length,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [...result.errors],
  };

  for (const event of result.events) {
    const outcome = await upsertNormalizedEvent(event);
    summary[outcome.outcome === "created" ? "created" : outcome.outcome === "updated" ? "updated" : "skipped"] += 1;
    if (outcome.error) summary.errors.push(`${outcome.slug}: ${outcome.error}`);
  }

  return summary;
}

/**
 * Runs every source adapter independently (one failing/blocked source never
 * takes down the others) and upserts whatever normalized events it finds.
 * Safe to re-run on a schedule — upserts key off a stable per-source slug.
 */
export async function runImport(): Promise<ImportSummary> {
  const startedAt = new Date().toISOString();

  const sources = await Promise.all([
    runSource(fetchTelegramEvents),
    runSource(fetchITicketEvents),
    runSource(fetchAfishaEvents),
    runSource(fetchEventbriteEvents),
  ]);

  return { startedAt, finishedAt: new Date().toISOString(), sources };
}
