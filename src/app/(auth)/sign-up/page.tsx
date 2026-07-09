import Link from "next/link";
import type { Metadata } from "next";

import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Регистрация" };

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-semibold">Начните исследовать</h1>
        <p className="text-sm text-muted-foreground">
          Создайте аккаунт — это займёт меньше минуты
        </p>
      </div>

      <SignUpForm />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs uppercase text-muted-foreground">или</span>
        <Separator className="flex-1" />
      </div>

      <OAuthButtons />

      <p className="text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
