// Shared, polite fetch used by every source adapter: identifies itself with
// a real UA (some sites block the default Node/undici UA), times out
// instead of hanging the serverless function, and never throws — callers
// check `ok` and log `error` into the source's error list instead of
// letting one bad page abort the whole import run.

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
          "Mozilla/5.0 (compatible; AzizEventBot/1.0; +https://aziz-eta-eight.vercel.app)",
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
