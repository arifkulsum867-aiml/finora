import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";

function safeNextPath(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  if (!code || !isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login?error=Could%20not%20verify%20the%20email%20link.", baseUrl));
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=The%20email%20link%20is%20invalid%20or%20expired.", baseUrl));
  return NextResponse.redirect(new URL(next, baseUrl));
}
