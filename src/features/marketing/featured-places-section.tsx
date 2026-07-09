import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export async function FeaturedPlacesSection() {
  const places = await prisma.place.findMany({
    where: { isPublished: true, isFeatured: true },
    orderBy: { rating: "desc" },
    take: 4,
    select: {
      id: true,
      slug: true,
      nameRu: true,
      shortDescriptionRu: true,
      coverImage: true,
      rating: true,
      priceFrom: true,
      currency: true,
      category: { select: { nameRu: true, color: true } },
    },
  });

  if (places.length === 0) return null;

  return (
    <section id="cities" className="py-20">
      <div className="container">
        <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary">
              Первый город
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Жемчужины Самарканда
            </h2>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {places.map((place, i) => (
            <Link
              key={place.id}
              href={`/places/${place.slug}`}
              style={{ animationDelay: `${i * 70}ms` }}
              className="animate-fade-up group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={place.coverImage}
                  alt={place.nameRu}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 300px, 50vw"
                />
                <Badge
                  className="absolute left-3 top-3 border-none backdrop-blur"
                  style={{ backgroundColor: `${place.category.color}CC`, color: "white" }}
                >
                  {place.category.nameRu}
                </Badge>
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold">{place.nameRu}</h3>
                  <span className="flex items-center gap-1 text-sm font-medium">
                    <Star className="h-3.5 w-3.5 fill-sunset text-sunset" />
                    {place.rating.toFixed(1)}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {place.shortDescriptionRu}
                </p>
                <p className="pt-1 text-sm font-semibold">{formatPrice(place.priceFrom, place.currency)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
