"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M16.365 1.43c0 1.14-.462 2.15-1.213 2.9-.8.79-2.09 1.4-3.02 1.32-.13-1.09.44-2.24 1.19-2.98.79-.79 2.17-1.37 3.04-1.24zM20.1 17.16c-.5 1.16-.74 1.68-1.39 2.7-.9 1.42-2.17 3.19-3.75 3.2-1.4.02-1.76-.92-3.66-.91-1.9.01-2.3.93-3.7.92-1.58-.02-2.78-1.61-3.68-3.03-2.52-3.98-2.79-8.66-1.23-11.15.99-1.59 2.7-2.6 4.32-2.6 1.65 0 2.68.94 4.04.94 1.32 0 2.11-.94 4.03-.94 1.44 0 2.97.79 4.06 2.15-3.57 1.96-2.99 7.03.96 8.72z" />
    </svg>
  );
}

export function OAuthButtons({ callbackUrl = "/map" }: { callbackUrl?: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl })}
      >
        <GoogleIcon />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => signIn("apple", { callbackUrl })}
      >
        <AppleIcon />
        Apple
      </Button>
    </div>
  );
}
