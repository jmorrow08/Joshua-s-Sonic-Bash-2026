"use client";

import { Check, Copy, MessageSquare, Sparkles, Users } from "lucide-react";
import { useMemo, useState } from "react";

type Recipient = {
  id: string;
  name: string;
  phone: string;
  attending: boolean;
  is_waitlist: boolean;
};

type Audience = "confirmed" | "waitlist" | "regret";

type Template = {
  key: string;
  label: string;
  body: string;
};

const TEMPLATES: Template[] = [
  {
    key: "save_the_date",
    label: "Save the date",
    body:
      "Hi! Joshua's 5th birthday bash is Sat June 13 from 3:30–6:30 PM at Makutu Island (6900 W Chandler Blvd). Please RSVP at the link if you haven't yet — hope to see you there!",
  },
  {
    key: "week_before",
    label: "One week out",
    body:
      "One week to go until Joshua's Sonic-themed birthday bash! Sat June 13, 3:30–6:30 PM at Makutu Island. Let me know if anything's changed with your RSVP.",
  },
  {
    key: "day_before",
    label: "Day before",
    body:
      "See you tomorrow! Joshua's birthday party starts at 3:30 PM at Makutu Island, 6900 W Chandler Blvd, Chandler AZ. Can't wait!",
  },
  {
    key: "day_of",
    label: "Day of",
    body:
      "Today's the day! Party starts at 3:30 at Makutu Island. Text me if you need anything — see you soon!",
  },
];

function toE164(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

function formatPhone(phone: string): string {
  const d = (phone || "").replace(/\D/g, "");
  if (d.length !== 10) return phone;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export default function MassText({
  recipients,
}: {
  recipients: Recipient[];
}) {
  const [body, setBody] = useState(TEMPLATES[1].body);
  const [audiences, setAudiences] = useState<Record<Audience, boolean>>({
    confirmed: true,
    waitlist: true,
    regret: false,
  });
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<"phones" | "message" | null>(null);

  const bucketed = useMemo(() => {
    const groups: Record<Audience, Recipient[]> = {
      confirmed: [],
      waitlist: [],
      regret: [],
    };
    for (const r of recipients) {
      const audience: Audience = !r.attending
        ? "regret"
        : r.is_waitlist
          ? "waitlist"
          : "confirmed";
      groups[audience].push(r);
    }
    return groups;
  }, [recipients]);

  const selected = useMemo(() => {
    return recipients.filter((r) => {
      const audience: Audience = !r.attending
        ? "regret"
        : r.is_waitlist
          ? "waitlist"
          : "confirmed";
      if (!audiences[audience]) return false;
      if (excluded.has(r.id)) return false;
      return true;
    });
  }, [recipients, audiences, excluded]);

  const e164List = selected.map((r) => toE164(r.phone));
  const smsLink = `sms:${e164List.join(",")}${body ? `?&body=${encodeURIComponent(body)}` : ""}`;

  async function copy(kind: "phones" | "message", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Fallback: select + execCommand is deprecated; just no-op
    }
  }

  function toggleAudience(key: Audience) {
    setAudiences((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleExclude(id: string) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sonic-blue text-white">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-black text-sonic-blue">
            Send a group text
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Opens your phone's Messages app with the selected recipients and
            your message pre-filled.
          </p>
        </div>
      </div>

      {/* Templates */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          Templates
        </p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => {
            const active = body.trim() === t.body.trim();
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setBody(t.body)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? "border-sonic-gold bg-sonic-gold/15 text-sonic-blue"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Message */}
      <div className="mb-4">
        <label
          htmlFor="mass-body"
          className="mb-2 flex items-baseline justify-between text-sm font-bold text-sonic-blue"
        >
          Message
          <span className="text-xs font-normal text-slate-500">
            {body.length} chars
          </span>
        </label>
        <textarea
          id="mass-body"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sonic-electric focus:bg-white focus:ring-4 focus:ring-sonic-electric/15"
          placeholder="What do you want to send everyone?"
        />
      </div>

      {/* Audience toggles */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          Recipients
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          <AudienceToggle
            label="Confirmed"
            count={bucketed.confirmed.length}
            checked={audiences.confirmed}
            onChange={() => toggleAudience("confirmed")}
            accent="emerald"
          />
          <AudienceToggle
            label="Waitlist"
            count={bucketed.waitlist.length}
            checked={audiences.waitlist}
            onChange={() => toggleAudience("waitlist")}
            accent="gold"
          />
          <AudienceToggle
            label="Can't make it"
            count={bucketed.regret.length}
            checked={audiences.regret}
            onChange={() => toggleAudience("regret")}
            accent="slate"
          />
        </div>
      </div>

      {/* Individuals */}
      {selected.length > 0 && (
        <details className="mb-4 rounded-xl border border-slate-200">
          <summary className="flex cursor-pointer items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-bold text-sonic-blue hover:bg-slate-50">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {selected.length} recipient{selected.length === 1 ? "" : "s"}{" "}
              selected
            </span>
            <span className="text-xs font-normal text-slate-500">
              Tap to review & exclude
            </span>
          </summary>
          <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
            {recipients
              .filter((r) => {
                const audience: Audience = !r.attending
                  ? "regret"
                  : r.is_waitlist
                    ? "waitlist"
                    : "confirmed";
                return audiences[audience];
              })
              .map((r) => {
                const isExcluded = excluded.has(r.id);
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between px-4 py-2 text-sm"
                  >
                    <div className={isExcluded ? "opacity-40" : ""}>
                      <p className="font-bold text-slate-900">{r.name}</p>
                      <p className="text-xs tabular-nums text-slate-500">
                        {formatPhone(r.phone)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleExclude(r.id)}
                      className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                        isExcluded
                          ? "bg-sonic-blue text-white hover:bg-sonic-electric"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {isExcluded ? "Include" : "Skip"}
                    </button>
                  </li>
                );
              })}
          </ul>
        </details>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          href={selected.length > 0 ? smsLink : undefined}
          aria-disabled={selected.length === 0}
          onClick={(e) => {
            if (selected.length === 0) e.preventDefault();
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-sonic-blue px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition ${
            selected.length === 0
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-sonic-electric"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Open in Messages ({selected.length})
        </a>
        <button
          type="button"
          onClick={() => copy("phones", e164List.join(", "))}
          disabled={selected.length === 0}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-sonic-blue transition hover:border-sonic-blue/30 hover:bg-sonic-blue/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied === "phones" ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy numbers
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => copy("message", body)}
          disabled={!body}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-sonic-blue transition hover:border-sonic-blue/30 hover:bg-sonic-blue/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied === "message" ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy message
            </>
          )}
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        On iPhone, this opens Messages with all recipients pre-filled (may
        send as individual texts or one group depending on your settings).
        Use "Copy numbers" + "Copy message" if you'd rather paste into a
        group chat you've already started.
      </p>
    </section>
  );
}

function AudienceToggle({
  label,
  count,
  checked,
  onChange,
  accent,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
  accent: "emerald" | "gold" | "slate";
}) {
  const accentClasses = {
    emerald: "peer-checked:border-emerald-400 peer-checked:bg-emerald-50",
    gold: "peer-checked:border-sonic-gold peer-checked:bg-sonic-gold/10",
    slate: "peer-checked:border-slate-400 peer-checked:bg-slate-100",
  }[accent];

  return (
    <label className="relative block cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <div
        className={`flex items-center justify-between rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 transition ${accentClasses}`}
      >
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold tabular-nums text-slate-600">
          {count}
        </span>
      </div>
    </label>
  );
}
