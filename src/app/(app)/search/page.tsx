import type { Metadata } from "next";

import { SearchPageContent } from "@/features/search/components/search-page-content";

export const metadata: Metadata = { title: "Поиск" };

export default function SearchPage() {
  return <SearchPageContent />;
}
