import type { Metadata } from "next";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { CategoryForm } from "@/features/admin/categories/category-form";

export const metadata: Metadata = { title: "Новая категория · Админ" };

export default function NewCategoryPage() {
  return (
    <div>
      <AdminPageHeader title="Новая категория" />
      <CategoryForm />
    </div>
  );
}
