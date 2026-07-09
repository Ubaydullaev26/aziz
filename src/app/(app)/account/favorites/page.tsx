import type { Metadata } from "next";

import { FavoritesContent } from "@/features/favorites/components/favorites-content";

export const metadata: Metadata = { title: "Избранное" };

export default function FavoritesPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold">Избранное</h1>
      <FavoritesContent />
    </div>
  );
}
