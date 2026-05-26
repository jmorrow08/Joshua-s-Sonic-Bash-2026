"use client";

import { Calendar, CheckCircle2, Clock3, PartyPopper, X } from "lucide-react";
import { useEffect } from "react";

export type SuccessVariant = "confirmed" | "waitlist" | "regret";

type Props = {
  open: boolean;
  variant: SuccessVariant;
  parentFirstName: string;
  childCount: number;
  adultCount: number;
  phoneFormatted: string;
  onClose: () => void;
};

const CALENDAR_URL =
  "https://www.google.com/calendar/render?action=TEMPLATE" +
  "&text=" +
  encodeURIComponent("JJ's 5th Birthday Bash") +
  "&dates=20260613T223000Z/20260614T013000Z" + // 3:30–6:30 PM MST in UTC
  "&details=" +
  encodeURIComponent(
    "Sonic-themed party for Joshua's 5th birthday! Pizza, cake, games, and a whole lot of speed."
  ) +
  "&location=" +
  encodeURIComponent("Makutu Island, 6900 W Chandler Blvd, Chandler, AZ 82509");

export default function SuccessModal({
  open,
  variant,
  parentFirstName,
  childCount,
  adultCount,
  phoneFormatted,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const config = {
    confirmed: {
      Icon: PartyPopper,
      iconBg: "bg-sonic-gold text-sonic-blue",
      ring: "ring-sonic-gold/40",
      eyebrow: "You're in!",
      title: parentFirstName
        ? `See you there, ${parentFirstName}!`
        : "See you there!",
      message:
        "Your spot is officially saved. We'll text you a reminder as the day gets closer.",
      showCalendar: true,
    },
    waitlist: {
      Icon: Clock3,
      iconBg: "bg-sonic-gold text-sonic-blue",
      ring: "ring-sonic-gold/40",
      eyebrow: "You're on the waitlist",
      title: parentFirstName
        ? `Thanks, ${parentFirstName}!`
        : "Thanks for RSVPing!",
      message:
        "We're at the 20-kid cap, but you're next in line. We'll text you the moment a spot opens up.",
      showCalendar: false,
    },
    regret: {
      Icon: CheckCircle2,
      iconBg: "bg-sonic-blue text-white",
      ring: "ring-sonic-blue/30",
      eyebrow: "RSVP received",
      title: parentFirstName
        ? `Thanks for letting us know, ${parentFirstName}.`
        : "Thanks for letting us know.",
      message: "We'll miss you — JJ will share photos after the party!",
      showCalendar: false,
    },
  }[variant];

  const { Icon } = config;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rsvp-success-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-sonic-blue/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md animate-slide-up overflow-hidden rounded-3xl bg-white p-6 shadow-2xl ring-4 ${config.ring} sm:p-8`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-sonic-gold/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-sonic-electric/10 blur-3xl"
        />

        <div className="relative text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${config.iconBg} shadow-gold`}
          >
            <Icon className="h-10 w-10" />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-sonic-electric">
            {config.eyebrow}
          </p>
          <h2
            id="rsvp-success-title"
            className="mt-2 font-display text-2xl font-black leading-tight text-sonic-blue sm:text-3xl"
          >
            {config.title}
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-base text-slate-600">
            {config.message}
          </p>

          {variant !== "regret" && (
            <dl className="mx-auto mt-5 grid max-w-xs grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-sonic-blue/5 px-2 py-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-sonic-blue/70">
                  Adults
                </dt>
                <dd className="font-display text-xl font-black text-sonic-blue">
                  {adultCount}
                </dd>
              </div>
              <div className="rounded-xl bg-sonic-gold/15 px-2 py-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-sonic-blue/70">
                  Kids
                </dt>
                <dd className="font-display text-xl font-black text-sonic-blue">
                  {childCount}
                </dd>
              </div>
              <div className="rounded-xl bg-sonic-blue/5 px-2 py-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-sonic-blue/70">
                  Texts to
                </dt>
                <dd className="truncate text-sm font-bold tabular-nums text-sonic-blue">
                  {phoneFormatted}
                </dd>
              </div>
            </dl>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {config.showCalendar && (
              <a
                href={CALENDAR_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-sonic-blue/15 bg-white px-5 py-3 text-sm font-bold text-sonic-blue transition hover:border-sonic-blue/30 hover:bg-sonic-blue/5"
              >
                <Calendar className="h-4 w-4" />
                Add to calendar
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl bg-sonic-blue px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-sonic-electric"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
