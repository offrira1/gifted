/**
 * Minimal Supabase client when NEXT_PUBLIC_SUPABASE_URL or ANON_KEY are not set.
 * Prevents runtime errors; auth returns no user, DB/storage operations return a clear error.
 */

const NOT_CONFIGURED = { message: "Supabase לא מוגדר. הגדר NEXT_PUBLIC_SUPABASE_URL ו-NEXT_PUBLIC_SUPABASE_ANON_KEY ב-.env.local" };

const emptyData = { data: null, error: NOT_CONFIGURED };
const emptyArray = { data: [], error: null };

function chain(): Record<string, unknown> {
  const c = () => chain();
  return {
    select: c,
    eq: c,
    gte: c,
    lte: c,
    insert: c,
    update: c,
    single: () => Promise.resolve(emptyData),
    order: () => Promise.resolve(emptyArray),
  };
}

export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: NOT_CONFIGURED }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: NOT_CONFIGURED }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: (_table: string) => chain(),
    storage: {
      from: (_bucket: string) => ({
        upload: () => Promise.resolve({ error: NOT_CONFIGURED }),
        getPublicUrl: (_path: string) => ({ data: { publicUrl: "" } }),
      }),
    },
  };
}

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}
