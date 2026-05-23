"use client";

import { Zap } from "lucide-react";

export default function StickyRsvpButton() {
  return (
    <a
      href="#rsvp"
      className="group fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-sonic-gold px-5 py-3 text-sm font-black uppercase tracking-wider text-sonic-blue shadow-gold ring-2 ring-sonic-blue/10 transition hover:scale-105 hover:bg-yellow-400 sm:bottom-6 sm:right-6 sm:px-6 sm:py-4 sm:text-base"
    >
      <Zap className="h-5 w-5 transition group-hover:rotate-12" fill="currentColor" />
      RSVP Now
    </a>
  );
}
