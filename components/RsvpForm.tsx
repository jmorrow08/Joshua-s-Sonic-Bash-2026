"use client";

import { Loader2, Minus, Plus, Send, Trash2, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import Toast, { type ToastVariant } from "./Toast";
import SuccessModal, { type SuccessVariant } from "./SuccessModal";

type Child = { first_name: string; last_name: string };

type FormState = {
  parentFirstName: string;
  parentLastName: string;
  phone: string;
  attending: "yes" | "no" | "";
  adultCount: number;
  children: Child[];
  dietary: string;
};

const INITIAL: FormState = {
  parentFirstName: "",
  parentLastName: "",
  phone: "",
  attending: "",
  adultCount: 2,
  children: [{ first_name: "", last_name: "" }],
  dietary: "",
};

type Props = {
  initialKidCount: number;
  maxKids: number;
};

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
  }>({ open: false, variant: "error", title: "" });
  const [success, setSuccess] = useState<{
    open: boolean;
    variant: SuccessVariant;
    parentFirstName: string;
    childCount: number;
    adultCount: number;
    phoneFormatted: string;
  }>({
    open: false,
    variant: "confirmed",
    parentFirstName: "",
    childCount: 0,
    adultCount: 0,
    phoneFormatted: "",
  });

  const update =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value }));

  const updateChild = (index: number, key: keyof Child, value: string) => {
    setForm((prev) => ({
      ...prev,
      children: prev.children.map((c, i) =>
        i === index ? { ...c, [key]: value } : c
      ),
    }));
  };

  const addChild = () =>
    setForm((prev) =>
      prev.children.length >= 10
        ? prev
        : { ...prev, children: [...prev.children, { first_name: "", last_name: "" }] }
    );

  const removeChild = (index: number) =>
    setForm((prev) => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index),
    }));

  const attending = form.attending === "yes";
  const validChildren = attending
    ? form.children.filter((c) => c.first_name.trim().length > 0)
    : [];
  const childCount = validChildren.length;
  const spotsLeft = Math.max(0, maxKids - confirmedKids);
  const wouldOverflow = attending && childCount > 0 && childCount > spotsLeft;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    if (!form.parentFirstName.trim() || !form.phone.trim() || !form.attending) {
      setToast({
        open: true,
        variant: "error",
        title: "Missing info",
        message: "Please fill out first name, phone, and whether you'll attend.",
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

    if (attending) {
      const hasIncomplete = form.children.some(
        (c) => c.last_name.trim() && !c.first_name.trim()
      );
      if (hasIncomplete) {
        setToast({
          open: true,
          variant: "error",
          title: "Each child needs a first name",
          message:
            "Add a first name for every child, or remove the empty row.",
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      // Re-check live count so we waitlist correctly under race conditions.
      const { data: liveCountRaw } = await supabase.rpc(
        "get_confirmed_kid_count"
      );
      const liveCount = typeof liveCountRaw === "number" ? liveCountRaw : 0;
      setConfirmedKids(liveCount);

      const isWaitlist =
        attending && childCount > 0 && liveCount + childCount > maxKids;

      const cleanChildren = validChildren.map((c) => ({
        first_name: c.first_name.trim(),
        last_name: c.last_name.trim() || null,
      }));

      const { error } = await supabase.from("rsvps").insert({
        parent_first_name: form.parentFirstName.trim(),
        parent_last_name: form.parentLastName.trim() || null,
        phone: digits,
        attending,
        adult_count: attending ? form.adultCount : 0,
        child_count: attending ? childCount : 0,
        children: attending ? cleanChildren : [],
        dietary_restrictions: form.dietary.trim() || null,
        is_waitlist: isWaitlist,
      });

      if (error) throw error;

      const variant: SuccessVariant = !attending
        ? "regret"
        : isWaitlist
          ? "waitlist"
          : "confirmed";

      setSuccess({
        open: true,
        variant,
        parentFirstName: form.parentFirstName.trim(),
        childCount: attending ? childCount : 0,
        adultCount: attending ? form.adultCount : 0,
        phoneFormatted: formatPhone(digits),
      });

      if (variant === "confirmed") {
        setConfirmedKids((c) => c + childCount);
      }

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

          {/* Parent name */}
          <div>
            <span className="mb-2 block text-sm font-bold text-sonic-blue">
              Parent's Name <span className="text-sonic-red">*</span>
            </span>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                id="parentFirstName"
                value={form.parentFirstName}
                onChange={update("parentFirstName")}
                placeholder="First name"
                autoComplete="given-name"
                required
              />
              <Input
                id="parentLastName"
                value={form.parentLastName}
                onChange={update("parentLastName")}
                placeholder="Last name (optional)"
                autoComplete="family-name"
              />
            </div>
          </div>

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

          {/* Attending */}
          <div>
            <span className="mb-2 block text-sm font-bold text-sonic-blue">
              Will you be attending? <span className="text-sonic-red">*</span>
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              <RadioPill
                checked={form.attending === "yes"}
                onChange={() => update("attending")("yes")}
                label="Yes, we'll be there!"
                accent="gold"
              />
              <RadioPill
                checked={form.attending === "no"}
                onChange={() => update("attending")("no")}
                label="Sorry, we can't make it"
                accent="red"
              />
            </div>
          </div>

          {attending && (
            <>
              <NumberStepper
                id="adultCount"
                label="Adults Attending"
                min={1}
                max={20}
                value={form.adultCount}
                onChange={(v) => update("adultCount")(v)}
              />

              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-sonic-blue">
                    Children Attending
                  </span>
                  <span className="text-xs text-slate-500">
                    {childCount} {childCount === 1 ? "child" : "children"}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {form.children.map((child, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-sonic-blue/70">
                          Child {i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeChild(i)}
                          aria-label={`Remove child ${i + 1}`}
                          className="-m-1 rounded-full p-1 text-slate-400 transition hover:bg-sonic-red/10 hover:text-sonic-red"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input
                          id={`child-${i}-first`}
                          value={child.first_name}
                          onChange={(v) => updateChild(i, "first_name", v)}
                          placeholder="First name *"
                          autoComplete="off"
                        />
                        <Input
                          id={`child-${i}-last`}
                          value={child.last_name}
                          onChange={(v) => updateChild(i, "last_name", v)}
                          placeholder="Last name (optional)"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addChild}
                  disabled={form.children.length >= 10}
                  className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sonic-blue/25 bg-white px-4 py-3 text-sm font-bold text-sonic-blue transition hover:border-sonic-blue/50 hover:bg-sonic-blue/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UserPlus className="h-4 w-4" />
                  Add another child
                </button>
                <p className="mt-1.5 text-xs text-slate-500">
                  Just first name is required per child — last name is optional.
                </p>
              </div>
            </>
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
            Required fields marked with <span className="text-sonic-red">*</span>
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

      <SuccessModal
        open={success.open}
        variant={success.variant}
        parentFirstName={success.parentFirstName}
        childCount={success.childCount}
        adultCount={success.adultCount}
        phoneFormatted={success.phoneFormatted}
        onClose={() => setSuccess((s) => ({ ...s, open: false }))}
      />
    </>
  );
}

type InputProps = {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
};

function Input({
  id,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
}: InputProps) {
  return (
    <input
      id={id}
      name={id}
      type="text"
      required={required}
      autoComplete={autoComplete}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sonic-electric focus:bg-white focus:ring-4 focus:ring-sonic-electric/15"
    />
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
  checked: boolean;
  onChange: () => void;
  label: string;
  accent: "gold" | "red";
};

function RadioPill({ checked, onChange, label, accent }: RadioPillProps) {
  const accentClasses =
    accent === "gold"
      ? "peer-checked:border-sonic-gold peer-checked:bg-sonic-gold/10 peer-checked:text-sonic-blue"
      : "peer-checked:border-sonic-red peer-checked:bg-sonic-red/10 peer-checked:text-sonic-red";

  return (
    <label className="relative cursor-pointer">
      <input
        type="radio"
        name="attending"
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
