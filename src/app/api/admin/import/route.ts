import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { runImport } from "@/lib/import/run-import";

export const runtime = "nodejs";
export const maxDuration = 60;

// Two ways in: an ADMIN/SUPERADMIN session (manual trigger from the admin
// panel or curl), or the shared secret Vercel Cron sends — cron requests
// don't carry a browser session.
async function isAuthorized(request: NextRequest): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const header = request.headers.get("authorization");
    if (header === `Bearer ${cronSecret}`) return true;
  }
  const session = await auth();
  return session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const summary = await runImport();
  return NextResponse.json(summary);
}

// Vercel Cron only sends GET requests.
export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const summary = await runImport();
  return NextResponse.json(summary);
}
