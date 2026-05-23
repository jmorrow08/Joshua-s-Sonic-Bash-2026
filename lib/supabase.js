import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Soft-warn during dev so the page still renders; the form will surface
  // a clear error on submit if credentials are missing.
  if (typeof window !== "undefined") {
    console.warn(
      "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Add them to .env.local — see .env.local.example."
    );
  }
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

/**
 * Expected `rsvps` table schema (run in Supabase SQL editor):
 *
 *   create table public.rsvps (
 *     id uuid primary key default gen_random_uuid(),
 *     created_at timestamptz not null default now(),
 *     parent_name text not null,
 *     children_attending text not null,
 *     attending boolean not null,
 *     dietary_restrictions text
 *   );
 *
 *   alter table public.rsvps enable row level security;
 *
 *   create policy "Public can insert RSVPs"
 *     on public.rsvps for insert
 *     to anon
 *     with check (true);
 */
