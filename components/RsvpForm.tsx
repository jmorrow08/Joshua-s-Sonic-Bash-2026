"use client";

import { Loader2, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import Toast, { type ToastVariant } from "./Toast";

type FormState = {
  parentName: string;
  childrenAttending: string;
  attending: "yes" | "no" | "";
  dietary: string;
};

const INITIAL: FormState = {
  parentName: "",
  childrenAttending: "",
  attending: "",
  dietary: "",
};

export default function RsvpForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    if (!form.parentName.trim() || !form.childrenAttending.trim() || !form.attending) {
      setToast({
        open: true,
        variant: "error",
        title: "Missing info",
        message: "Please fill out the required fields before submitting.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("rsvps").insert({
        parent_name: form.parentName.trim(),
        children_attending: form.childrenAttending.trim(),
        attending: form.attending === "yes",
        dietary_restrictions: form.dietary.trim() || null,
      });

      if (error) throw error;

      setToast({
        open: true,
        variant: "success",
        title: "RSVP received! 🦔💨",
        message:
          form.attending === "yes"
            ? "We can't wait to see you at the bash!"
            : "Thanks for letting us know — you'll be missed!",
      });
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
            id="childrenAttending"
            label="Child / Children Attending"
            required
            value={form.childrenAttending}
            onChange={update("childrenAttending")}
            placeholder="e.g. Sam (5) and Riley (3)"
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
};

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
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
        type="text"
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sonic-electric focus:bg-white focus:ring-4 focus:ring-sonic-electric/15"
      />
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
