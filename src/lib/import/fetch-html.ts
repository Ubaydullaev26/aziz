// Shared, polite fetch used by every source adapter: identifies with an
// ordinary browser UA (a self-identifying bot UA got served an emptier
// page by at least one source's WAF — a plain fetch() with no UA at all
// fares even worse), times out instead of hanging the serverless
// function, and never throws — callers check `ok` and log `error` into
// the source's error list instead of letting one bad page abort the
// whole import run.

export async function fetchHtml(
  url: string,
  { timeoutMs = 15_000 }: { timeoutMs?: number } = {},
): Promise<{ ok: true; html: string } | { ok: false; error: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) {
      return { ok: false, error: `${url} → HTTP ${res.status}` };
    }
    return { ok: true, html: await res.text() };
  } catch (err) {
    return { ok: false, error: `${url} → ${err instanceof Error ? err.message : String(err)}` };
  } finally {
    clearTimeout(timeout);
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
