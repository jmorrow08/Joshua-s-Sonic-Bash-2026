# JJ's 5th Birthday Bash — Sonic Edition 🦔💨

A high-performance, mobile-first Next.js 14 RSVP landing page for a Sonic the Hedgehog–themed 5th birthday party.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** with a custom Sonic palette (electric blue, gold, vibrant red)
- **Lucide React** for icons
- **Supabase JS** client for RSVP storage

## Quick start

```bash
npm install
cp .env.local.example .env.local
# fill in your Supabase URL + anon key
npm run dev
```

Open <http://localhost:3000>.

## Supabase setup

Create the `rsvps` table in the Supabase SQL editor:

```sql
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  parent_name text not null,
  children_attending text not null,
  attending boolean not null,
  dietary_restrictions text
);

alter table public.rsvps enable row level security;

create policy "Public can insert RSVPs"
  on public.rsvps for insert
  to anon
  with check (true);
```

Then add to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## Page sections

1. **Hero** — flyer placeholder, live countdown to June 13 2026 3:00 PM MST, sticky RSVP CTA
2. **Event Details** — date/time/location cards + embedded Google Map
3. **RSVP Form** — name, children, attendance (yes/no), dietary restrictions; writes to `rsvps`
4. **Gift Guide** — "presence > presents" note plus three idea cards

Replace the flyer placeholder in `app/page.tsx` with a real image (drop it in `public/flyer.jpg` and swap in `<Image />`).
