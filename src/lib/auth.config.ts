import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

/**
 * Edge-safe config used by middleware. It must not import anything that
 * touches Prisma (Prisma Client isn't supported on the Edge runtime) — the
 * full config with the adapter + provider `authorize()` logic lives in
 * `auth.ts` and only runs in Node (Route Handlers, Server Components).
 */
export default {
  pages: {
    signIn: "/sign-in",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: UserRole }).role ?? "USER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
