import { unstable_noStore as noStore } from "next/cache";
import {
  Calendar,
  Clock,
  Gift,
  MapPin,
  PartyPopper,
  Shirt,
  Sparkles,
  ToyBrick,
} from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import RsvpForm from "@/components/RsvpForm";
import StickyRsvpButton from "@/components/StickyRsvpButton";
import { supabase } from "@/lib/supabase";

const VENUE_ADDRESS = "Makutu Island, 6900 W Chandler Blvd, Chandler, AZ 82509";
const MAP_QUERY = encodeURIComponent(VENUE_ADDRESS);
const KID_CAPACITY = Number(process.env.NEXT_PUBLIC_KID_CAPACITY || 20);

async function getConfirmedKidCount(): Promise<number> {
  noStore();
  try {
    const { data, error } = await supabase.rpc("get_confirmed_kid_count");
    if (error || typeof data !== "number") return 0;
    return data;
  } catch {
    return 0;
  }
}

export default async function Home() {
  const confirmedKids = await getConfirmedKidCount();
  return (
    <main className="min-h-screen bg-white">
      <StickyRsvpButton />

      {/* HERO */}
      <section className="relative overflow-hidden sonic-gradient ring-rings">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(245,197,24,0.25) 0, transparent 35%), radial-gradient(circle at 85% 80%, rgba(225,29,46,0.18) 0, transparent 40%)",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 md:pb-20 md:pt-20">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-sonic-gold/30 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sonic-gold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              You're invited
            </span>
            <h1 className="mt-5 font-display text-4xl font-black leading-tight text-white drop-shadow-md sm:text-5xl md:text-7xl">
              JJ's <span className="sonic-text-gradient">5th</span>
              <br className="sm:hidden" /> Birthday Bash
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg">
              Gotta go fast! Help us celebrate five super-sonic years with rings,
              pizza, and a whole lot of speed.
            </p>
          </div>

          {/* Flyer placeholder */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl border-4 border-sonic-gold/60 bg-sonic-blue/40 shadow-2xl sm:aspect-[3/4]">
              <div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(10,42,107,0.85) 0%, rgba(30,77,216,0.85) 60%, rgba(59,130,246,0.85) 100%)",
                }}
              >
                <div className="text-center text-white">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-sonic-gold text-sonic-blue shadow-gold sm:h-32 sm:w-32">
                    <PartyPopper className="h-12 w-12 sm:h-16 sm:w-16" />
                  </div>
                  <p className="font-display text-2xl font-black sm:text-3xl">
                    Flyer goes here
                  </p>
                  <p className="mt-1 text-sm text-white/70 sm:text-base">
                    Drop the party flyer image in this slot
                  </p>
                </div>
              </div>
              {/* When you have a real flyer, replace the placeholder above with:
                  <Image src="/flyer.jpg" alt="JJ's 5th Birthday Bash flyer" fill className="object-cover" priority />
              */}
            </div>
          </div>

          {/* Countdown */}
          <div className="mx-auto mt-10 max-w-2xl">
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.3em] text-sonic-gold sm:text-sm">
              Race starts in
            </p>
            <CountdownTimer />
          </div>

          {/* Hero CTA */}
          <div className="mt-10 flex justify-center">
            <a
              href="#rsvp"
              className="animate-pulse-glow inline-flex items-center gap-2 rounded-full bg-sonic-gold px-8 py-4 text-base font-black uppercase tracking-wider text-sonic-blue shadow-gold transition hover:scale-105 hover:bg-yellow-400 sm:text-lg"
            >
              <Sparkles className="h-5 w-5" fill="currentColor" />
              RSVP Now
            </a>
          </div>
        </div>

        {/* Bottom curve */}
        <svg
          aria-hidden
          viewBox="0 0 1440 80"
          className="block h-12 w-full text-white sm:h-16"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,64L60,58.7C120,53,240,43,360,42.7C480,43,600,53,720,53.3C840,53,960,43,1080,37.3C1200,32,1320,32,1380,32L1440,32L1440,80L0,80Z"
          />
        </svg>
      </section>

      {/* EVENT DETAILS */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-sonic-blue/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sonic-blue">
            <PartyPopper className="h-3.5 w-3.5" />
            The Details
          </span>
          <h2 className="mt-4 font-display text-3xl font-black text-sonic-blue sm:text-4xl md:text-5xl">
            JJ's 5th Birthday Bash!
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-600">
            Here's everything you need to know to join the fastest hedgehog on the block.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <DetailCard
            icon={<Calendar className="h-6 w-6" />}
            label="When"
            primary="Saturday, June 13, 2026"
            secondary="3:30 PM – 6:30 PM"
            accent="blue"
          />
          <DetailCard
            icon={<Clock className="h-6 w-6" />}
            label="Duration"
            primary="3 hours of fun"
            secondary="Snacks, cake & games"
            accent="gold"
          />
          <DetailCard
            icon={<MapPin className="h-6 w-6" />}
            label="Where"
            primary="Makutu Island"
            secondary="6900 W Chandler Blvd, Chandler, AZ 82509"
            accent="red"
          />
        </div>

        {/* Map */}
        <div className="mt-8 overflow-hidden rounded-3xl border-4 border-sonic-blue/10 shadow-sonic">
          <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
            <iframe
              title="Map to Makutu Island, Chandler, AZ"
              src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border-2 border-sonic-blue/15 bg-white px-5 py-2.5 text-sm font-bold text-sonic-blue transition hover:border-sonic-blue/30 hover:bg-sonic-blue/5"
          >
            <MapPin className="h-4 w-4" />
            Open in Google Maps
          </a>
        </div>
      </section>

      {/* RSVP */}
      <section
        id="rsvp"
        className="relative scroll-mt-6 bg-gradient-to-b from-sonic-cream/40 to-white py-14 sm:py-20"
      >
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-sonic-red/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sonic-red">
              <Sparkles className="h-3.5 w-3.5" />
              Save your spot
            </span>
            <h2 className="mt-4 font-display text-3xl font-black text-sonic-blue sm:text-4xl md:text-5xl">
              RSVP
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base text-slate-600">
              Please reply by{" "}
              <span className="font-bold text-sonic-blue">June 6, 2026</span> so
              we can plan for all our speedy guests.
            </p>
          </div>

          <div className="mt-8">
            <RsvpForm
              initialKidCount={confirmedKids}
              maxKids={KID_CAPACITY}
            />
          </div>
        </div>
      </section>

      {/* GIFT GUIDE */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-sonic-gold/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sonic-blue">
            <Gift className="h-3.5 w-3.5" />
            Just in case
          </span>
          <h2 className="mt-4 font-display text-3xl font-black text-sonic-blue sm:text-4xl md:text-5xl">
            Gift Ideas
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-600">
            Your presence is truly the best <em>present</em> — JJ just wants to
            celebrate with the people he loves. If you'd still like to bring
            something, here are a few ideas he'd flip for:
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <GiftCard
            icon={<Sparkles className="h-6 w-6" />}
            title="Sonic Action Figures"
            description="Sonic, Tails, Knuckles, Shadow — any of the crew is a sure win."
            accent="blue"
          />
          <GiftCard
            icon={<ToyBrick className="h-6 w-6" />}
            title="Lego Sets"
            description="Age 4–6 sets, Sonic Lego, or anything build-and-play."
            accent="red"
          />
          <GiftCard
            icon={<Shirt className="h-6 w-6" />}
            title="Clothes & Shoes"
            description="Clothing size 4/5 · Shoe size 10. Tees, PJs, swim trunks — bonus points for blue hedgehogs."
            accent="gold"
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-slate-500 sm:px-6">
          <p className="font-display text-base font-black text-sonic-blue">
            Gotta go fast! 🦔💨
          </p>
          <p className="mt-1">
            See you on June 13 at Makutu Island. Questions? Just text the family.
          </p>
        </div>
      </footer>
    </main>
  );
}

type DetailCardProps = {
  icon: React.ReactNode;
  label: string;
  primary: string;
  secondary: string;
  accent: "blue" | "gold" | "red";
};

function DetailCard({ icon, label, primary, secondary, accent }: DetailCardProps) {
  const accentClasses = {
    blue: "bg-sonic-blue text-white",
    gold: "bg-sonic-gold text-sonic-blue",
    red: "bg-sonic-red text-white",
  }[accent];

  return (
    <div className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-sonic">
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accentClasses}`}
      >
        {icon}
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-sonic-blue">{primary}</p>
      <p className="mt-1 text-sm text-slate-600">{secondary}</p>
    </div>
  );
}

type GiftCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: "blue" | "gold" | "red";
};

function GiftCard({ icon, title, description, accent }: GiftCardProps) {
  const ringClasses = {
    blue: "bg-sonic-blue text-white",
    gold: "bg-sonic-gold text-sonic-blue",
    red: "bg-sonic-red text-white",
  }[accent];

  const borderClasses = {
    blue: "hover:border-sonic-blue/30",
    gold: "hover:border-sonic-gold/50",
    red: "hover:border-sonic-red/30",
  }[accent];

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border-2 border-slate-100 bg-white p-6 transition hover:-translate-y-1 hover:shadow-sonic ${borderClasses}`}
    >
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${ringClasses} transition group-hover:scale-110`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-black text-sonic-blue">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
    </div>
  );
}
