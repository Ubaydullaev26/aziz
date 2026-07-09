export type EventTiming = {
  isLiveNow: boolean;
  startsSoon: boolean; // starts within the next 3 hours
  hasEnded: boolean;
};

const STARTS_SOON_WINDOW_MS = 3 * 60 * 60 * 1000;

export function getEventTiming(startAt: Date | string, endAt: Date | string): EventTiming {
  const now = Date.now();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();

  return {
    isLiveNow: now >= start && now <= end,
    startsSoon: now < start && start - now <= STARTS_SOON_WINDOW_MS,
    hasEnded: now > end,
  };
}
