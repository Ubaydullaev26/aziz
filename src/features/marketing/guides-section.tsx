import Image from "next/image";
import { Star, Languages } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export async function GuidesSection() {
  const guides = await prisma.guide.findMany({
    where: { isPublished: true },
    orderBy: { rating: "desc" },
    take: 4,
  });

  if (guides.length === 0) return null;

  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary">
            Местные эксперты
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Гиды, которые знают город изнутри
          </h2>
          <p className="mt-4 text-muted-foreground">
            Проверенные специалисты с рейтингом, языками и живым расписанием — бронируйте прямо
            на карте
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {guides.map((guide, i) => (
            <div
              key={guide.id}
              style={{ animationDelay: `${i * 70}ms` }}
              className="animate-fade-up rounded-3xl border border-border bg-card p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full ring-4 ring-background">
                <Image src={guide.avatar} alt={guide.name} fill className="object-cover" />
              </div>
              <h3 className="font-display font-semibold">{guide.name}</h3>
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Languages className="h-3 w-3" /> {guide.languages.join(", ").toUpperCase()}
              </p>
              <p className="mt-3 flex items-center justify-center gap-1 text-sm font-medium">
                <Star className="h-3.5 w-3.5 fill-sunset text-sunset" /> {guide.rating.toFixed(1)}
                <span className="text-muted-foreground">({guide.reviewCount})</span>
              </p>
              <p className="mt-2 text-sm font-semibold text-primary">
                {formatPrice(guide.pricePerHour, guide.currency)} / час
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
