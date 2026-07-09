import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="glass-panel relative overflow-hidden rounded-[2.5rem] px-8 py-16 text-center sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.2),transparent_45%),radial-gradient(circle_at_80%_80%,hsl(var(--sunset)/0.18),transparent_45%)]"
          />
          <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Самарканд уже открыт. Ваш город — следующий.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Присоединяйтесь бесплатно и начните исследовать город так, как будто у вас есть личный
            гид в кармане.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/sign-up">
              Начать бесплатно <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
