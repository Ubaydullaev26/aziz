import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, Languages, Briefcase } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Гиды" };

export default async function GuidesPage() {
  const guides = await prisma.guide.findMany({
    where: { isPublished: true },
    orderBy: { rating: "desc" },
    include: { city: { select: { nameRu: true } } },
  });

  return (
    <div className="mx-auto h-full max-w-5xl overflow-y-auto px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Гиды</h1>
        <p className="mt-2 text-muted-foreground">
          Проверенные местные эксперты — с языками, опытом и живым расписанием
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <Link
            key={guide.id}
            href={`/guides/${guide.slug}`}
            className="rounded-3xl border border-border bg-card p-5 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full ring-4 ring-background">
              <Image src={guide.avatar} alt={guide.name} fill className="object-cover" />
            </div>
            <h3 className="flex items-center justify-center gap-1.5 font-display font-semibold">
              {guide.name}
              {guide.isVerified && <ShieldCheck className="h-4 w-4 text-primary" />}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{guide.city.nameRu}</p>
            <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Languages className="h-3 w-3" /> {guide.languages.join(", ").toUpperCase()}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Briefcase className="h-3 w-3" /> {guide.experienceYears} лет опыта
            </p>
            <p className="mt-3 flex items-center justify-center gap-1 text-sm font-medium">
              <Star className="h-3.5 w-3.5 fill-sunset text-sunset" /> {guide.rating.toFixed(1)}
              <span className="text-muted-foreground">({guide.reviewCount})</span>
            </p>
            <p className="mt-2 text-sm font-semibold text-primary">
              {formatPrice(guide.pricePerHour, guide.currency)} / час
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
