import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  MessageSquare,
  Phone,
  Users,
  XCircle,
} from "lucide-react";
import { getAdminClient } from "@/lib/supabase-admin";
import MassText from "@/components/MassText";

const KID_CAPACITY = Number(process.env.NEXT_PUBLIC_KID_CAPACITY || 20);

type Child = { first_name: string; last_name: string | null };

type Rsvp = {
  id: string;
  created_at: string;
  parent_first_name: string;
  parent_last_name: string | null;
  phone: string;
  attending: boolean;
  adult_count: number;
  child_count: number;
  children: Child[] | null;
  dietary_restrictions: string | null;
  is_waitlist: boolean;
};

function parentName(r: Rsvp): string {
  const last = r.parent_last_name?.trim();
  return last ? `${r.parent_first_name} ${last}` : r.parent_first_name;
}

function renderChildren(children: Child[] | null): string {
  if (!children || children.length === 0) return "";
  return children
    .map((c) => {
      const first = (c.first_name || "").trim();
      const last = (c.last_name || "").trim();
      return last ? `${first} ${last}` : first;
    })
    .filter(Boolean)
    .join(", ");
}

function formatPhone(digits: string): string {
  const d = (digits || "").replace(/\D/g, "");
  if (d.length !== 10) return digits;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminPage({
  params,
}: {
  params: { token: string };
}) {
  noStore();

  const expected = process.env.ADMIN_TOKEN;
  if (!expected || params.token !== expected) {
    notFound();
  }

  let rsvps: Rsvp[] = [];
  let loadError: string | null = null;
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("rsvps")
      .select(
        "id, created_at, parent_first_name, parent_last_name, phone, attending, adult_count, child_count, children, dietary_restrictions, is_waitlist"
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    rsvps = (data as Rsvp[]) ?? [];
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load RSVPs.";
  }

  const yes = rsvps.filter((r) => r.attending && !r.is_waitlist);
  const waitlist = rsvps.filter((r) => r.attending && r.is_waitlist);
  const no = rsvps.filter((r) => !r.attending);

  const confirmedKids = yes.reduce((sum, r) => sum + (r.child_count || 0), 0);
  const confirmedAdults = yes.reduce((sum, r) => sum + (r.adult_count || 0), 0);
  const waitlistKids = waitlist.reduce(
    (sum, r) => sum + (r.child_count || 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-sonic-electric">
            JJ's 5th Birthday Bash
          </p>
          <h1 className="font-display text-2xl font-black text-sonic-blue sm:text-3xl">
            RSVP Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            {rsvps.length} total {rsvps.length === 1 ? "response" : "responses"}
            {loadError ? null : " · live"}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {loadError && (
          <div className="mb-6 rounded-xl border border-sonic-red/30 bg-sonic-red/5 p-4 text-sm text-sonic-red">
            <p className="font-bold">Couldn't load RSVPs</p>
            <p className="mt-1">{loadError}</p>
            <p className="mt-2 text-xs">
              Check that <code>SUPABASE_SERVICE_ROLE_KEY</code> is set in your
              environment.
            </p>
          </div>
        )}

        {/* Mass text composer */}
        {!loadError && rsvps.length > 0 && (
          <div className="mb-6">
            <MassText
              recipients={rsvps.map((r) => ({
                id: r.id,
                name: parentName(r),
                phone: r.phone,
                attending: r.attending,
                is_waitlist: r.is_waitlist,
              }))}
            />
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Confirmed kids"
            value={`${confirmedKids} / ${KID_CAPACITY}`}
            tone={
              confirmedKids >= KID_CAPACITY
                ? "red"
                : confirmedKids >= KID_CAPACITY - 5
                  ? "gold"
                  : "blue"
            }
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Confirmed adults"
            value={String(confirmedAdults)}
            tone="blue"
          />
          <StatCard
            icon={<Clock3 className="h-5 w-5" />}
            label="Kids waitlist"
            value={String(waitlistKids)}
            tone={waitlistKids > 0 ? "gold" : "blue"}
          />
          <StatCard
            icon={<XCircle className="h-5 w-5" />}
            label="Can't make it"
            value={String(no.length)}
            tone="blue"
          />
        </div>

        {/* Section: confirmed */}
        <RsvpSection
          title="Confirmed"
          subtitle={`${yes.length} ${yes.length === 1 ? "family" : "families"} · ${confirmedKids} kids · ${confirmedAdults} adults`}
          variant="success"
          rsvps={yes}
        />

        {/* Section: waitlist */}
        {waitlist.length > 0 && (
          <RsvpSection
            title="Kids Waitlist"
            subtitle={`${waitlist.length} ${waitlist.length === 1 ? "family" : "families"} · ${waitlistKids} kids waiting`}
            variant="warning"
            rsvps={waitlist}
          />
        )}

        {/* Section: not attending */}
        {no.length > 0 && (
          <RsvpSection
            title="Can't make it"
            subtitle={`${no.length} ${no.length === 1 ? "family" : "families"}`}
            variant="muted"
            rsvps={no}
          />
        )}

        {!loadError && rsvps.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-base font-bold text-slate-700">
              No RSVPs yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Once people start replying, they'll show up here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "blue" | "gold" | "red";
}) {
  const toneClasses = {
    blue: "bg-sonic-blue text-white",
    gold: "bg-sonic-gold text-sonic-blue",
    red: "bg-sonic-red text-white",
  }[tone];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses}`}
      >
        {icon}
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-black text-sonic-blue">
        {value}
      </p>
    </div>
  );
}

function RsvpSection({
  title,
  subtitle,
  variant,
  rsvps,
}: {
  title: string;
  subtitle: string;
  variant: "success" | "warning" | "muted";
  rsvps: Rsvp[];
}) {
  const headerTone = {
    success: "border-l-sonic-electric",
    warning: "border-l-sonic-gold",
    muted: "border-l-slate-300",
  }[variant];

  if (rsvps.length === 0) {
    return (
      <section className="mt-8">
        <div className={`mb-3 border-l-4 pl-3 ${headerTone}`}>
          <h2 className="font-display text-xl font-black text-sonic-blue">
            {title}
          </h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Nothing here yet.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className={`mb-3 border-l-4 pl-3 ${headerTone}`}>
        <h2 className="font-display text-xl font-black text-sonic-blue">
          {title}
        </h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">When</th>
                <th className="px-4 py-3 font-bold">Parent</th>
                <th className="px-4 py-3 font-bold">Phone</th>
                <th className="px-4 py-3 text-center font-bold">Adults</th>
                <th className="px-4 py-3 text-center font-bold">Kids</th>
                <th className="px-4 py-3 font-bold">Children</th>
                <th className="px-4 py-3 font-bold">Dietary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rsvps.map((r) => {
                const kids = renderChildren(r.children);
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {parentName(r)}
                    </td>
                    <td className="px-4 py-3">
                      <PhoneLinks phone={r.phone} />
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-slate-700">
                      {r.adult_count}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-slate-700">
                      {r.child_count}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {kids || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.dietary_restrictions || (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="divide-y divide-slate-100 md:hidden">
          {rsvps.map((r) => (
            <li key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-slate-900">
                    {parentName(r)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatDate(r.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs font-bold">
                  {variant === "success" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" /> In
                    </span>
                  )}
                  {variant === "warning" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sonic-gold/20 px-2 py-0.5 text-sonic-blue">
                      <Clock3 className="h-3 w-3" /> Waitlist
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-slate-50 py-2">
                  <p className="font-display text-lg font-black text-sonic-blue">
                    {r.adult_count}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Adults
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 py-2">
                  <p className="font-display text-lg font-black text-sonic-blue">
                    {r.child_count}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Kids
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <PhoneLinks phone={r.phone} compact />
                </div>
              </div>

              {(() => {
                const kids = renderChildren(r.children);
                if (!kids && !r.dietary_restrictions) return null;
                return (
                  <div className="mt-3 space-y-1 text-sm">
                    {kids && (
                      <p className="text-slate-700">
                        <span className="font-bold text-slate-500">Kids: </span>
                        {kids}
                      </p>
                    )}
                    {r.dietary_restrictions && (
                      <p className="text-slate-700">
                        <span className="font-bold text-slate-500">
                          Dietary:{" "}
                        </span>
                        {r.dietary_restrictions}
                      </p>
                    )}
                  </div>
                );
              })()}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PhoneLinks({
  phone,
  compact = false,
}: {
  phone: string;
  compact?: boolean;
}) {
  const digits = (phone || "").replace(/\D/g, "");
  const tel = `+1${digits}`;
  if (compact) {
    return (
      <div className="flex gap-1.5">
        <a
          href={`sms:${tel}`}
          aria-label={`Text ${formatPhone(phone)}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-sonic-blue text-white transition hover:bg-sonic-electric"
        >
          <MessageSquare className="h-4 w-4" />
        </a>
        <a
          href={`tel:${tel}`}
          aria-label={`Call ${formatPhone(phone)}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sonic-blue transition hover:bg-slate-50"
        >
          <Phone className="h-4 w-4" />
        </a>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="tabular-nums text-slate-700">{formatPhone(phone)}</span>
      <a
        href={`sms:${tel}`}
        aria-label={`Text ${formatPhone(phone)}`}
        className="flex h-7 w-7 items-center justify-center rounded-md bg-sonic-blue text-white transition hover:bg-sonic-electric"
      >
        <MessageSquare className="h-3.5 w-3.5" />
      </a>
      <a
        href={`tel:${tel}`}
        aria-label={`Call ${formatPhone(phone)}`}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-sonic-blue transition hover:bg-slate-50"
      >
        <Phone className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
