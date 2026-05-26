import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client. Uses the service role key so it can read
// every RSVP regardless of Row Level Security. NEVER import this file
// from a "use client" component or expose it in browser bundles.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getAdminClient() {
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Set them in .env.local (or your hosting environment) to use the admin page."
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
