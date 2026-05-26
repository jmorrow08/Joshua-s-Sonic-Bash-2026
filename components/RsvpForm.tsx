"use client";

import { Loader2, Minus, Plus, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import Toast, { type ToastVariant } from "./Toast";

type FormState = {
  parentName: string;
  phone: string;
  attending: "yes" | "no" | "";
  adultCount: number;
  childCount: number;
  childNames: string;
  dietary: string;
};

const INITIAL: FormState = {
  parentName: "",
  phone: "",
  attending: "",
  adultCount: 2,
  childCount: 1,
  childNames: "",
  dietary: "",
};

type Props = {
  initialKidCount: number;
  maxKids: number;
};

// Light formatting only — keep digits, render as (XXX) XXX-XXXX as you type.
function formatPhone(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function RsvpForm({ initialKidCount, maxKids }: Props) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedKids, setConfirmedKids] = useState(initialKidCount);
  const [toast, setToast] = useState<{
    open: boolean;
    variant: ToastVariant;
    title: string;
    message?: string;
  }>({ open: false, variant: "success", title: "" });

  const update =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value }));

  const spotsLeft = Math.max(0, maxKids - confirmedKids);
  const attending = form.attending === "yes";
  const wouldOverflow =
    attending && form.childCount > 0 && form.childCount > spotsLeft;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    if (
      !form.parentName.trim() ||
      !form.phone.trim() ||
      !form.attending
    ) {
      setToast({
        open: true,
        variant: "error",
        title: "Missing info",
        message: "Please fill out name, phone, and whether you'll attend.",
      });
      return;
    }

    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setToast({
        open: true,
        variant: "error",
        title: "Check that phone number",
        message: "Please enter a 10-digit US phone number.",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Re-check the live count right before insert in case other people
      // RSVPed while this form was open.
      const { data: liveCountRaw } = await supabase.rpc(
        "get_confirmed_kid_count"
      );
      const liveCount = typeof liveCountRaw === "number" ? liveCountRaw : 0;
      setConfirmedKids(liveCount);

      const isWaitlist =
        attending &&
        form.childCount > 0 &&
        liveCount + form.childCount > maxKids;

      const { error } = await supabase.from("rsvps").insert({
        parent_name: form.parentName.trim(),
        phone: digits,
        attending,
        adult_count: attending ? form.adultCount : 0,
        child_count: attending ? form.childCount : 0,
        child_names: attending ? form.childNames.trim() || null : null,
        dietary_restrictions: form.dietary.trim() || null,
        is_waitlist: isWaitlist,
      });

      if (error) throw error;

      let title: string;
      let message: string;
      if (!attending) {
        title = "RSVP received";
        message = "Thanks for letting us know — you'll be missed!";
      } else if (isWaitlist) {
        title = "You're on the kids waitlist 🎟️";
        message =
          "We're at the 20-kid cap, but we'll text you the moment a spot opens up.";
      } else {
        title = "RSVP confirmed! 🦔💨";
        message = "We can't wait to see you at the bash!";
        setConfirmedKids((c) => c + form.childCount);
      }

      setToast({ open: true, variant: "success", title, message });
      setForm(INITIAL);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setToast({
        open: true,
        variant: "error",
        title: "Could not submit RSVP",
        message: msg,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="relative overflow-hidden rounded-3xl border border-sonic-blue/10 bg-white p-6 shadow-sonic sm:p-8 md:p-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sonic-gold/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-sonic-electric/10 blur-3xl"
        />

        <div className="relative space-y-5">
          {/* Capacity badge */}
          <div
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
              spotsLeft === 0
                ? "border-sonic-red/30 bg-sonic-red/5 text-sonic-red"
                : spotsLeft <= 5
                  ? "border-sonic-gold/40 bg-sonic-gold/10 text-sonic-blue"
                  : "border-sonic-blue/15 bg-sonic-blue/5 text-sonic-blue"
            }`}
          >
            <span className="font-bold">
              {spotsLeft === 0
                ? "Kids list is full"
                : `${spotsLeft} of ${maxKids} kid spots left`}
            </span>
            <span className="text-xs opacity-70">
              {spotsLeft === 0 ? "Waitlist only" : "Adults welcome any time"}
            </span>
          </div>

          <Field
            id="parentName"
            label="Parent's First & Last Name"
            required
            value={form.parentName}
            onChange={update("parentName")}
            placeholder="Jane Doe"
            autoComplete="name"
          />

          <Field
            id="phone"
            label="Phone Number"
            required
            type="tel"
            value={form.phone}
            onChange={(v) => update("phone")(formatPhone(v))}
            placeholder="(602) 555-0123"
            autoComplete="tel"
            inputMode="tel"
            hint="So we can text confirmation & reminders."
          />

          <div>
            <span className="mb-2 block text-sm font-bold text-sonic-blue">
              Will you be attending? <span className="text-sonic-red">*</span>
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              <RadioPill
                name="attending"
                value="yes"
                checked={form.attending === "yes"}
                onChange={() => update("attending")("yes")}
                label="Yes, we'll be there!"
                accent="gold"
              />
              <RadioPill
                name="attending"
                value="no"
                checked={form.attending === "no"}
                onChange={() => update("attending")("no")}
                label="Sorry, we can't make it"
                accent="red"
              />
            </div>
          </div>

          {attending && (
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberStepper
                id="adultCount"
                label="Adults Attending"
                min={1}
                max={20}
                value={form.adultCount}
                onChange={(v) => update("adultCount")(v)}
              />
              <NumberStepper
                id="childCount"
                label="Children Attending"
                min={0}
                max={10}
                value={form.childCount}
                onChange={(v) => update("childCount")(v)}
              />
            </div>
          )}

          {attending && form.childCount > 0 && (
            <Field
              id="childNames"
              label="Children's Names & Ages (optional)"
              value={form.childNames}
              onChange={update("childNames")}
              placeholder="e.g. Sam (5) and Riley (3)"
            />
          )}

          {wouldOverflow && (
            <div className="rounded-xl border border-sonic-gold/40 bg-sonic-gold/10 px-4 py-3 text-sm text-sonic-blue">
              <span className="font-bold">Heads up:</span> only {spotsLeft}{" "}
              {spotsLeft === 1 ? "kid spot is" : "kid spots are"} left. You can
              still submit — your kids will be added to the waitlist and we'll
              text you the moment a spot opens.
            </div>
          )}

          <div>
            <label
              htmlFor="dietary"
              className="mb-2 block text-sm font-bold text-sonic-blue"
            >
              Dietary Restrictions or Allergies
            </label>
            <textarea
              id="dietary"
              name="dietary"
              rows={3}
              value={form.dietary}
              onChange={(e) => update("dietary")(e.target.value)}
              placeholder="Anything we should know to keep everyone safe and happy?"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sonic-electric focus:bg-white focus:ring-4 focus:ring-sonic-electric/15"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-sonic-blue px-6 py-4 text-base font-black uppercase tracking-wide text-white shadow-sonic transition hover:bg-sonic-electric disabled:cursor-not-allowed disabled:opacity-70 sm:text-lg"
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1 bg-sonic-gold transition-all group-hover:w-full group-hover:opacity-20"
            />
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Send RSVP
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            Required fields marked with{" "}
            <span className="text-sonic-red">*</span>
          </p>
        </div>
      </form>

      <Toast
        open={toast.open}
        variant={toast.variant}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  type?: string;
  inputMode?: "tel" | "text" | "numeric" | "email";
  hint?: string;
};

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  type = "text",
  inputMode,
  hint,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-sonic-blue"
      >
        {label}
        {required && <span className="text-sonic-red"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sonic-electric focus:bg-white focus:ring-4 focus:ring-sonic-electric/15"
      />
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

type RadioPillProps = {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  accent: "gold" | "red";
};

function RadioPill({ name, value, checked, onChange, label, accent }: RadioPillProps) {
  const accentClasses =
    accent === "gold"
      ? "peer-checked:border-sonic-gold peer-checked:bg-sonic-gold/10 peer-checked:text-sonic-blue"
      : "peer-checked:border-sonic-red peer-checked:bg-sonic-red/10 peer-checked:text-sonic-red";

  return (
    <label className="relative cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <div
        className={`flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-600 transition hover:border-slate-300 ${accentClasses}`}
      >
        {label}
      </div>
    </label>
  );
}

type StepperProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
};

function NumberStepper({ id, label, value, min, max, onChange }: StepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-sonic-blue"
      >
        {label} <span className="text-sonic-red">*</span>
      </label>
      <div className="flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-sonic-electric focus-within:ring-4 focus-within:ring-sonic-electric/15">
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="flex w-12 items-center justify-center bg-white text-sonic-blue transition hover:bg-sonic-blue/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          id={id}
          name={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (Number.isNaN(n)) return onChange(min);
            onChange(Math.min(max, Math.max(min, n)));
          }}
          className="w-full bg-transparent text-center text-lg font-black tabular-nums text-sonic-blue outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="flex w-12 items-center justify-center bg-white text-sonic-blue transition hover:bg-sonic-blue/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
