import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.warn(
    "[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. " +
      "Supabase-dependent features are disabled. Add them in your Vercel project env vars.",
  );
}

function createStubClient(): SupabaseClient {
  const missing = new Error("Supabase is not configured");
  const chain: any = {
    select: () => chain,
    insert: () => Promise.resolve({ data: null, error: missing }),
    update: () => Promise.resolve({ data: null, error: missing }),
    delete: () => Promise.resolve({ data: null, error: missing }),
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    single: () => Promise.resolve({ data: null, error: missing }),
    maybeSingle: () => Promise.resolve({ data: null, error: missing }),
    then: (resolve: (v: { data: null; error: Error }) => void) =>
      resolve({ data: null, error: missing }),
  };
  return {
    from: () => chain,
  } as unknown as SupabaseClient;
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : createStubClient();
