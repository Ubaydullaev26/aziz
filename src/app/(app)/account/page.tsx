import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { ProfileForm } from "@/features/account/components/profile-form";

export const metadata: Metadata = { title: "Профиль" };

export default async function AccountPage() {
  const session = await auth();
  const user = session!.user;

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 font-display text-2xl font-semibold">Профиль</h1>
      <ProfileForm user={{ name: user.name ?? null, email: user.email ?? "", image: user.image ?? null }} />
    </div>
  );
}
