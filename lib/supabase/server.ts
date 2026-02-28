import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createMockSupabaseClient, isSupabaseConfigured } from "./mock";
import { isAdmin } from "@/lib/auth-admin";

export async function createClient() {
  if (!isSupabaseConfigured()) {
    return createMockSupabaseClient() as Awaited<ReturnType<typeof createServerClient>>;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if ((await isAdmin()) && serviceRoleKey?.trim()) {
    return createSupabaseClient(url, serviceRoleKey) as Awaited<ReturnType<typeof createServerClient>>;
  }

  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore in Server Components
        }
      },
    },
  });
}
