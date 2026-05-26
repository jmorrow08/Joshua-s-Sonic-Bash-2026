# JJ's 5th Birthday Bash — Sonic Edition 🦔💨

A high-performance, mobile-first Next.js 14 RSVP landing page for a Sonic the Hedgehog–themed 5th birthday party.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** with a custom Sonic palette (electric blue, gold, vibrant red)
- **Lucide React** for icons
- **Supabase JS** for RSVP storage + read-only admin dashboard

## Quick start

```bash
npm install
cp .env.local.example .env.local
# fill in the values below
npm run dev
```

Open <http://localhost:3000>. The admin dashboard lives at
`/admin/<your-secret-slug>`.

## Environment variables

| Var | Where | What it does |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon key (browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Lets the admin page read all RSVPs |
| `ADMIN_TOKEN` | **Server only** | URL slug that gates `/admin/[token]` |
| `NEXT_PUBLIC_KID_CAPACITY` | Public | Max confirmed kids (defaults to 20) |

## Supabase setup

Run this in the Supabase SQL editor (full, fresh schema — drop the
table first if you already created the v1 version):

```sql
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  parent_first_name text not null,
  parent_last_name text,
  phone text not null,
  attending boolean not null,
  adult_count integer not null default 1,
  child_count integer not null default 0,
  children jsonb not null default '[]'::jsonb,
  dietary_restrictions text,
  is_waitlist boolean not null default false
);

create index if not exists rsvps_created_at_idx
  on public.rsvps (created_at desc);

alter table public.rsvps enable row level security;

-- Anyone can submit an RSVP from the public form
create policy "Public can insert RSVPs"
  on public.rsvps for insert
  to anon
  with check (true);

-- A SECURITY DEFINER function so the form can show "X spots left"
-- without exposing row-level data to anon.
create or replace function public.get_confirmed_kid_count()
returns integer
language sql
security definer
set search_path = public
as $$
  select coalesce(sum(child_count), 0)::int
  from public.rsvps
  where attending = true and is_waitlist = false;
$$;

grant execute on function public.get_confirmed_kid_count()
  to anon, authenticated;
```

## Page sections

1. **Hero** — flyer placeholder, live countdown to June 13 2026 3:30 PM MST, sticky RSVP CTA
2. **Event Details** — date/time/location cards + embedded Google Map
3. **RSVP Form** — parent name (last optional), phone, attendance, adult count, per-child name rows (first required, last optional), optional dietary; auto-waitlists when 20 kids are confirmed; success modal with calendar link
4. **Gift Guide** — "presence > presents" note plus three idea cards

### Admin dashboard

Visit `/admin/<ADMIN_TOKEN>`. You'll see:

- Live stats: confirmed kids vs. cap, confirmed adults, waitlist, regrets
- Sections for confirmed / waitlisted / can't-make-it
- One-tap **Text** and **Call** buttons per phone number

Anyone with the URL can see this page, so treat `ADMIN_TOKEN` like a password.

### Flyer

Replace the placeholder in `app/page.tsx` — drop your image in
`public/flyer.jpg` and swap in `<Image src="/flyer.jpg" … />`.
