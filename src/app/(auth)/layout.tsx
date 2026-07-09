import Link from "next/link";
import { MapPinned } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.15),transparent_45%),radial-gradient(circle_at_80%_0%,hsl(var(--sunset)/0.12),transparent_40%)]"
      />
      <div className="relative w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-display text-lg font-semibold"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MapPinned className="h-5 w-5" />
          </span>
          Aziz
        </Link>
        <div className="glass-panel rounded-3xl p-8">{children}</div>
      </div>
    </div>
  );
}
