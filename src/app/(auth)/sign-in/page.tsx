import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

import { SignInForm } from "@/features/auth/components/sign-in-form";
import { OAuthButtons } from "@/features/auth/components/oauth-buttons";
import { Separator } from "@/components/ui/separator";
import { getOAuthStatus } from "@/lib/oauth-status";

export const metadata: Metadata = { title: "Вход" };

export default function SignInPage() {
  const { googleEnabled, appleEnabled } = getOAuthStatus();

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-semibold">С возвращением</h1>
        <p className="text-sm text-muted-foreground">Войдите, чтобы открыть живую карту города</p>
      </div>

      <Suspense>
        <SignInForm />
      </Suspense>

      {(googleEnabled || appleEnabled) && (
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs uppercase text-muted-foreground">или</span>
          <Separator className="flex-1" />
        </div>
      )}

      <OAuthButtons googleEnabled={googleEnabled} appleEnabled={appleEnabled} />

      <p className="text-center text-sm text-muted-foreground">
        Ещё нет аккаунта?{" "}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
