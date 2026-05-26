"use client";

import { useEffect, useState } from "react";

// June 13, 2026 at 3:30 PM MST (MST = UTC-7, no DST in Arizona)
const TARGET_DATE = new Date("2026-06-13T15:30:00-07:00").getTime();

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function calculate(): TimeLeft {
  const diff = TARGET_DATE - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: false,
  };
}

export default function CountdownTimer() {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(calculate());
    const id = setInterval(() => setTime(calculate()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: "Days", value: time?.days },
    { label: "Hours", value: time?.hours },
    { label: "Minutes", value: time?.minutes },
    { label: "Seconds", value: time?.seconds },
  ];

  if (time?.done) {
    return (
      <div className="text-center">
        <p className="text-2xl font-black text-sonic-gold sm:text-3xl">
          The party is here! 🎉
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-4 gap-2 sm:gap-4"
      aria-label="Countdown to the party"
    >
      {units.map((unit) => (
        <div
          key={unit.label}
          className="rounded-2xl border border-white/20 bg-white/10 px-2 py-3 text-center backdrop-blur-md sm:px-4 sm:py-5"
        >
          <div className="font-display text-2xl font-black tabular-nums text-white sm:text-4xl md:text-5xl">
            {time === null ? "--" : String(unit.value).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-sonic-gold sm:text-xs">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}
