import { MapPinOff } from "lucide-react";

export function MapUnavailable() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-secondary/40 p-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        <MapPinOff className="h-7 w-7" />
      </span>
      <h2 className="font-display text-lg font-semibold">Карта не настроена</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Добавьте <code className="rounded bg-secondary px-1.5 py-0.5">NEXT_PUBLIC_MAPBOX_TOKEN</code> в{" "}
        <code className="rounded bg-secondary px-1.5 py-0.5">.env</code>, чтобы включить интерактивную
        карту. А пока все места и события доступны списком ниже.
      </p>
    </div>
  );
}
