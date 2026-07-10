"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ImportSummary } from "@/lib/import/types";

export function ImportEventsButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleImport() {
    startTransition(async () => {
      const res = await fetch("/api/admin/import", { method: "POST" });
      if (!res.ok) {
        toast.error("Импорт не запустился — проверьте, что вы вошли как админ");
        return;
      }
      const summary: ImportSummary = await res.json();
      const created = summary.sources.reduce((sum, s) => sum + s.created, 0);
      const updated = summary.sources.reduce((sum, s) => sum + s.updated, 0);
      const failedSources = summary.sources.filter((s) => s.errors.length > 0);

      if (created + updated === 0 && failedSources.length === summary.sources.length) {
        toast.error("Ни один источник не вернул событий — смотрите детали в консоли/логах Vercel");
      } else {
        toast.success(`Импорт: +${created} новых, ${updated} обновлено`);
      }
      console.table(
        summary.sources.map((s) => ({
          source: s.source,
          fetched: s.fetched,
          created: s.created,
          updated: s.updated,
          skipped: s.skipped,
          firstError: s.errors[0] ?? "",
        })),
      );
      router.refresh();
    });
  }

  return (
    <Button variant="outline" onClick={handleImport} disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Импортировать реальные события
    </Button>
  );
}
