"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MapPin, Briefcase, CheckCircle2, ArrowRight, CalendarClock } from "lucide-react";
import type { NewRequirementInput, Requirement } from "@/types";
import { postRequirement } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const fields: [keyof NewRequirementInput, string][] = [
  ["company", "Company / Startup Name"],
  ["role", "Role Title"],
  ["stack", "Tech Stack (comma-separated, e.g. React, Next.js, Python)"],
  ["location", "Location (e.g. Remote, Chennai, Hybrid)"],
  ["stipend", "Stipend (e.g. Rs.10,000/mo or Unpaid)"],
  ["email", "Founder Email (applications go here)"],
];

export function ApplicationForm({ onPosted }: { onPosted?: (requirement: Requirement) => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState<NewRequirementInput>({
    company: user?.founderProfile?.companyName || "",
    role: "",
    stack: "",
    location: user?.founderProfile?.location || "Remote",
    stipend: "",
    blurb: "",
    email: user?.email || "",
    deadline: "",
  });

  useEffect(() => {
    if (user?.founderProfile?.companyName) {
      setForm((prev) => ({
        ...prev,
        company: prev.company || user.founderProfile?.companyName || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const [posted, setPosted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof NewRequirementInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.role || !form.email) return;
    setSubmitting(true);
    const requirement = await postRequirement(form);
    onPosted?.(requirement);
    setForm({
      company: user?.founderProfile?.companyName || "",
      role: "", stack: "",
      location: user?.founderProfile?.location || "Remote",
      stipend: "", blurb: "",
      email: user?.email || "", deadline: "",
    });
    setPosted(true);
    setSubmitting(false);
  };

  const labelClass = "text-xs font-semibold tracking-wide";

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      {/* Form */}
      <div className="card-surface rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4"
          style={{ borderBottom: "1px solid var(--divider)" }}>
          <div>
            <h3 className="font-serif text-xl font-bold" style={{ color: "var(--color-black-leather)" }}>
              Post a Talent Requisition
            </h3>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
              Submitted to the <strong>EDC Incubation Cell</strong> for verification before going live.
            </p>
          </div>
          <span className="badge-verified rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold">
            EDC FLOW
          </span>
        </div>

        <form onSubmit={submit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map(([k, label]) => (
            <div key={k} className={k === "company" || k === "role" ? "sm:col-span-2" : ""}>
              <label className={labelClass} style={{ color: "var(--color-black-leather)" }}>{label} *</label>
              <Input
                required={k === "company" || k === "role" || k === "email"}
                value={form[k]} onChange={set(k)}
                className="mt-1 text-xs"
              />
            </div>
          ))}

          <div className="sm:col-span-2">
            <label className={labelClass} style={{ color: "var(--color-black-leather)" }}>
              What&apos;s the work &amp; scope *
            </label>
            <Textarea required value={form.blurb} onChange={set("blurb")} rows={3}
              placeholder="Describe projects, expectations, and mentorship provided..."
              className="mt-1 text-xs" />
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide"
              style={{ color: "var(--color-black-leather)" }}>
              <CalendarClock size={13} style={{ color: "var(--color-champagne-gold)" }} />
              Application Deadline
              <span className="ml-1 font-normal" style={{ color: "var(--color-muted-taupe)" }}>(optional)</span>
            </label>
            <Input type="date" value={form.deadline || ""}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="mt-1 text-xs" />
            {form.deadline && (() => {
              const days = Math.ceil((new Date(form.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <p className="mt-1 text-[11px] font-semibold"
                  style={{ color: days <= 7 ? "var(--color-blush-suede)" : "var(--color-champagne-gold)" }}>
                  {days <= 0 ? "Deadline has passed" : days <= 7
                    ? `${days} day${days !== 1 ? "s" : ""} left — card will show as Closing Soon`
                    : `${days} days left — countdown shown when approved`}
                </p>
              );
            })()}
          </div>

          <div className="sm:col-span-2 mt-1">
            <button type="submit" disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 disabled:opacity-60"
              style={{
                background: "var(--color-champagne-gold)",
                color: "var(--color-black-leather)",
                border: "1px solid var(--color-champagne-gold)",
              }}
              onMouseEnter={e => !submitting && ((e.currentTarget as HTMLElement).style.background = "var(--color-champagne-dark)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--color-champagne-gold)")}>
              <Plus size={15} />
              {submitting ? "Submitting to EDC..." : "Submit Requisition for EDC Verification"}
            </button>
          </div>
        </form>

        {posted && (
          <div className="mt-4 rounded-xl p-3.5 text-xs animate-fadeIn"
            style={{
              background: "rgba(184,149,104,0.10)",
              border: "1px solid rgba(184,149,104,0.25)",
            }}>
            <p className="flex items-center gap-1.5 font-bold" style={{ color: "var(--color-champagne-gold)" }}>
              <CheckCircle2 size={14} /> Requisition Submitted for EDC Verification!
            </p>
            <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
              The EDC Cell will review and approve this requirement. Once approved, it will be published live to students.
            </p>
            <Link href="/applications" className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] font-bold"
              style={{ color: "var(--color-champagne-gold)" }}>
              View Request Review Status <ArrowRight size={11} />
            </Link>
          </div>
        )}
      </div>

      {/* Live Preview */}
      <div className="card-surface rounded-2xl p-6">
        <div className="flex items-center justify-between pb-2"
          style={{ borderBottom: "1px solid var(--divider)" }}>
          <p className="font-mono text-[10.5px] font-bold tracking-[0.12em] uppercase"
            style={{ color: "var(--color-muted-taupe)" }}>Preview Before Submission</p>
          <span className="rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase"
            style={{
              background: "rgba(184,149,104,0.10)",
              color: "var(--color-champagne-gold)",
              border: "1px solid rgba(184,149,104,0.25)",
            }}>
            Pending EDC Review
          </span>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-serif text-sm font-bold"
            style={{ background: "var(--color-champagne-gold)", color: "var(--color-black-leather)" }}>
            {(form.company || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-serif text-base font-bold leading-tight" style={{ color: "var(--color-black-leather)" }}>
              {form.role || "Role title"}
            </h3>
            <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
              {form.company || "Company name"}
            </p>
          </div>
        </div>

        <p className="mt-3 rounded-xl p-3 text-xs leading-relaxed"
          style={{
            background: "rgba(184,149,104,0.07)",
            color: "var(--text-secondary)",
            border: "1px solid var(--divider)",
          }}>
          {form.blurb || "A description of the startup project will appear here as you type."}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {form.stack.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
            <span key={s} className="tag-green rounded-full px-2.5 py-[2.5px] text-[11px]">{s}</span>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 pt-3 text-xs"
          style={{ color: "var(--color-muted-taupe)", borderTop: "1px solid var(--divider)" }}>
          <span className="flex items-center gap-1"><MapPin size={11} /> {form.location || "Location"}</span>
          <span className="flex items-center gap-1"><Briefcase size={11} /> {form.stipend || "Stipend"}</span>
          {form.deadline && (
            <span className="flex items-center gap-1 font-semibold" style={{ color: "var(--color-champagne-gold)" }}>
              <CalendarClock size={11} />
              Closes {new Date(form.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
