// Next.js SSR pages embed their initial React Query cache in
// <script id="__NEXT_DATA__">...props.pageProps.dehydratedState.queries.
// When a site's listing page is populated client-side from an API call
// (gtickets.uz, and plausibly others built the same way), that cache holds
// the exact same structured data the API returned — cleaner and more
// reliable than re-deriving it from rendered HTML or JSON-LD.

interface DehydratedQuery {
  queryKey?: unknown[];
  state?: { data?: unknown };
}

function extractNextData(html: string): unknown | null {
  const match = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/.exec(html);
  if (!match?.[1]) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

/** Finds the first dehydrated React Query result whose queryKey starts with `keyPrefix` and returns its data as an array. */
export function extractNextDataQuery<T>(html: string, keyPrefix: string): T[] | null {
  const nextData = extractNextData(html) as
    | { props?: { pageProps?: { dehydratedState?: { queries?: DehydratedQuery[] } } } }
    | null;
  const queries = nextData?.props?.pageProps?.dehydratedState?.queries;
  if (!queries) return null;

  const match = queries.find((q) => q.queryKey?.[0] === keyPrefix && Array.isArray(q.state?.data));
  return (match?.state?.data as T[]) ?? null;
}
