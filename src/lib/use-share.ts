"use client";

import { toast } from "sonner";

export function useShare() {
  return async function share(data: { title: string; text?: string; path: string }) {
    const url = `${window.location.origin}${data.path}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: data.title, text: data.text, url });
        return;
      } catch {
        // user cancelled — fall through silently
        return;
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Ссылка скопирована");
  };
}
