import { prisma } from "@/lib/prisma";
import { getCategoryIcon } from "@/features/map/category-icons";

export async function CategorySection() {
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });

  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary">
            Всё в одном месте
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Один фильтр — весь город
          </h2>
          <p className="mt-4 text-muted-foreground">
            Включайте и выключайте слои карты: от исторических памятников до ночной жизни
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, i) => {
            const Icon = getCategoryIcon(cat.icon);
            return (
              <div
                key={cat.id}
                style={{ animationDelay: `${i * 40}ms` }}
                className="animate-fade-up group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${cat.color}1A`, color: cat.color }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">{cat.nameRu}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
