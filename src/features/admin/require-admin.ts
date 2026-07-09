import "server-only";

import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    throw new Error("Недостаточно прав");
  }
  return session.user;
}
