"use client";

import { useState } from "react";
import {
  Mail, MapPin, Briefcase, X, Linkedin, Github, Globe,
  GraduationCap, CheckCircle2, ShieldCheck, Calendar, Clock,
} from "lucide-react";
import type { Requirement } from "@/types";
import { useAuth } from "@/lib/AuthContext";
import { getApplicationResumeUrl, submitApplication, uploadApplicationResume } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Luxury avatar colors cycle through palette tones
const AVATAR_COLORS = [
  "var(--color-champagne-gold)",
  "var(--color-blush-suede)",
  "var(--color-deep-charcoal)",
  "#7A6B5A",
  "#5C4E40",
];

function companyColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function avatarTextColor(bgColor: string) {
  if (bgColor === "var(--color-champagne-gold)") return "var(--color-black-leather)";
  return "var(--color-soft-cream)";
}

function CompanyAvatar({ letter, color }: { letter: string; color: string }) {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-serif text-sm font-bold shadow-sm"
      style={{ background: color, color: avatarTextColor(color) }}
    >
      {letter}
    </div>
  );
}

export function RequirementCard({ requirement }: { requirement: Requirement }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [applicantEmail, setApplicantEmail] = useState(user?.email || "");
  const [department, setDepartment] = useState(user?.studentProfile?.department || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.studentProfile?.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = useState(user?.studentProfile?.githubUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.studentProfile?.portfolioUrl || "");
  const [note, setNote] = useState("");
  const [applied, setApplied] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleOpenModal = () => {
    if (user) {
      setName(user.name);
      setApplicantEmail(user.email || "");
      if (user.studentProfile) {
        setDepartment(user.studentProfile.department || "");
        setLinkedinUrl(user.studentProfile.linkedinUrl || "");
        setGithubUrl(user.studentProfile.githubUrl || "");
        setPortfolioUrl(user.studentProfile.portfolioUrl || "");
      }
    }
    setOpen(true);
  };

  const color = companyColor(requirement.id);

  const daysLeft = (() => {
    if (requirement.status !== "CLOSING SOON" || !requirement.deadline) return null;
    const diff = new Date(requirement.deadline).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  const statusStyle = requirement.status === "OPEN"
    ? { bg: "rgba(184,149,104,0.12)", text: "var(--color-champagne-gold)", border: "rgba(184,149,104,0.25)" }
    : { bg: "rgba(157,98,95,0.12)", text: "var(--color-blush-suede)", border: "rgba(157,98,95,0.25)" };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = user?.email || applicantEmail;
    const finalName = name || user?.name || "Student Applicant";

    if (!finalEmail) {
      alert("Please provide your email address to submit your application.");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.id !== user?.id) {
      setSubmitError("Sign in with your account before applying.");
      return;
    }
    if (resume && (resume.type !== "application/pdf" || resume.size > 5 * 1024 * 1024)) {
      setSubmitError("Choose a PDF resume smaller than 5 MB.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const application = await submitApplication(requirement.id, finalName, finalEmail, {
        roleTitle: requirement.role,
        companyName: requirement.company,
        founderEmail: requirement.founderEmail,
        department: department || user?.studentProfile?.department,
        college: user?.studentProfile?.college,
        linkedinUrl: linkedinUrl || user?.studentProfile?.linkedinUrl,
        githubUrl: githubUrl || user?.studentProfile?.githubUrl,
        portfolioUrl: portfolioUrl || user?.studentProfile?.portfolioUrl,
        skills: user?.studentProfile?.skills,
        note,
      });
      if (resume) await uploadApplicationResume(application.id, resume);
      setApplied(true);
      setTimeout(() => {
        setOpen(false);
        setApplied(false);
      }, 1800);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not submit your application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="card-surface relative flex flex-col gap-3 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1">
        {/* Status badge */}
        <div className="absolute -top-3 right-4">
          <span className="rounded-full px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase shadow-sm"
            style={{
              background: statusStyle.bg,
              color: statusStyle.text,
              border: `1px solid ${statusStyle.border}`,
            }}>
            {requirement.status === "CLOSING SOON" && daysLeft !== null
              ? `${daysLeft}d left`
              : requirement.status}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {/* Header */}
          <div className="flex items-start gap-3 pr-2">
            <CompanyAvatar letter={requirement.company.charAt(0)} color={color} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[10.5px] font-medium" style={{ color: "var(--color-muted-taupe)" }}>
                  {requirement.id} &middot; {requirement.posted}
                </span>
              </div>
              <h3 className="mt-0.5 font-serif text-[18px] font-bold leading-tight"
                style={{ color: "var(--color-black-leather)" }}>
                {requirement.role}
              </h3>
              <p className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                {requirement.company}
              </p>
            </div>
          </div>

          {/* Blurb */}
          <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {requirement.blurb}
          </p>

          {/* Stack tags */}
          <div className="flex flex-wrap gap-1.5">
            {requirement.stack.map((s) => (
              <span key={s} className="tag-green rounded-full px-2.5 py-[2.5px] text-[11px]">{s}</span>
            ))}
          </div>

          {/* Meta & Dates */}
          <div className="mt-auto flex flex-col gap-2 pt-2 text-[12px]" style={{ borderTop: "1px solid var(--divider)", color: "var(--color-muted-taupe)" }}>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1"><MapPin size={11} /> {requirement.location}</span>
              <span className="flex items-center gap-1"><Briefcase size={11} /> {requirement.stipend}</span>
            </div>

            <div className="flex flex-col gap-1 rounded-lg p-2 text-[11.5px]" style={{ background: "rgba(184,149,104,0.06)", border: "1px solid rgba(184,149,104,0.15)" }}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 font-medium" style={{ color: "var(--text-secondary)" }}>
                  <Calendar size={11} className="text-[var(--color-champagne-gold)]" />
                  <span><strong>Posted:</strong> {requirement.postedDate ? new Date(requirement.postedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : requirement.posted}</span>
                </span>
                <span className="flex items-center gap-1 font-medium" style={{ color: daysLeft !== null && daysLeft <= 3 ? "var(--color-blush-suede)" : "var(--text-secondary)" }}>
                  <Clock size={11} style={{ color: daysLeft !== null && daysLeft <= 3 ? "var(--color-blush-suede)" : "var(--color-champagne-gold)" }} />
                  <span><strong>Closing Date:</strong> {requirement.deadline ? new Date(requirement.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Open until filled"}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Apply button */}
        <button
          onClick={handleOpenModal}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200"
          style={{
            background: "var(--color-champagne-gold)",
            color: "var(--color-black-leather)",
            border: "1px solid var(--color-champagne-gold)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "var(--color-champagne-dark)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--color-champagne-dark)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(184,149,104,0.25)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "var(--color-champagne-gold)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--color-champagne-gold)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}>
          <Briefcase size={13} /> Apply
        </button>
      </div>

      {/* Application Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          style={{ background: "rgba(17,17,17,0.55)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl animate-pop-in"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 24px 80px rgba(17,17,17,0.30), 0 4px 20px rgba(17,17,17,0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent stripe */}
            <div className="h-1 rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, ${color}, var(--color-champagne-gold))` }} />

            <button onClick={() => setOpen(false)} aria-label="Close"
              className="absolute right-4 top-4 rounded-lg p-1.5 transition"
              style={{ color: "var(--color-muted-taupe)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(184,149,104,0.10)"; (e.currentTarget as HTMLElement).style.color = "var(--color-black-leather)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--color-muted-taupe)"; }}>
              <X size={16} />
            </button>

            <form onSubmit={handleApplySubmit} className="p-6">
              <div className="flex items-center gap-3">
                <CompanyAvatar letter={requirement.company.charAt(0)} color={color} />
                <div>
                  <p className="font-mono text-[10.5px]" style={{ color: "var(--color-muted-taupe)" }}>
                    {requirement.id} &middot; {requirement.role}
                  </p>
                  <h3 className="font-serif text-xl font-bold" style={{ color: "var(--color-black-leather)" }}>
                    Apply to {requirement.company}
                  </h3>
                </div>
              </div>

              {/* Gold divider */}
              <div className="my-3 gold-divider" />

              <p className="text-[12.5px]" style={{ color: "var(--text-secondary)" }}>
                Your application details will be submitted directly to the founder&apos;s applicant page.
              </p>

              {user?.studentProfile && (
                <div className="mt-3.5 rounded-xl p-3 text-xs"
                  style={{
                    background: "rgba(184,149,104,0.08)",
                    border: "1px solid rgba(184,149,104,0.20)",
                  }}>
                  <div className="flex items-center gap-1.5 font-bold" style={{ color: "var(--color-champagne-gold)" }}>
                    <CheckCircle2 size={13} /> Auto-linking Registered Student Profile
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11.5px]" style={{ color: "var(--text-secondary)" }}>
                    <span className="flex items-center gap-1 rounded-md px-2 py-0.5"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                      <GraduationCap size={10} style={{ color: "var(--color-champagne-gold)" }} />
                      {user.studentProfile.department}
                    </span>
                    {user.studentProfile.linkedinUrl && (
                      <span className="flex items-center gap-1 rounded-md px-2 py-0.5"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "#0A66C2" }}>
                        <Linkedin size={10} /> LinkedIn
                      </span>
                    )}
                    {user.studentProfile.githubUrl && (
                      <span className="flex items-center gap-1 rounded-md px-2 py-0.5"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--color-black-leather)" }}>
                        <Github size={10} /> GitHub
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold" style={{ color: "var(--color-black-leather)" }}>Your Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Sharma"
                      className="mt-1 text-xs" style={{ borderColor: "var(--border)" }} required />
                  </div>
                  {!user?.email ? (
                    <div>
                      <label className="text-xs font-semibold" style={{ color: "var(--color-black-leather)" }}>Your Email</label>
                      <Input value={applicantEmail} onChange={(e) => setApplicantEmail(e.target.value)} placeholder="e.g. student@college.edu"
                        className="mt-1 text-xs" style={{ borderColor: "var(--border)" }} required />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-semibold" style={{ color: "var(--color-black-leather)" }}>Department</label>
                      <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science"
                        className="mt-1 text-xs" style={{ borderColor: "var(--border)" }} />
                    </div>
                  )}
                </div>

                {user?.email && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <label className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-black-leather)" }}>
                        <Linkedin size={11} className="text-[#0A66C2]" /> LinkedIn URL
                      </label>
                      <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/..." className="mt-1 text-xs font-mono"
                        style={{ borderColor: "var(--border)" }} />
                    </div>
                    <div>
                      <label className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-black-leather)" }}>
                        <Github size={11} /> GitHub URL
                      </label>
                      <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/..." className="mt-1 text-xs font-mono"
                        style={{ borderColor: "var(--border)" }} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold" style={{ color: "var(--color-black-leather)" }}>
                    Why you&apos;re a great fit
                  </label>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                    placeholder="Describe your relevant projects and passion for this startup..."
                    className="mt-1 text-xs" style={{ borderColor: "var(--border)" }} />
                </div>

                <div>
                  <label className="text-xs font-semibold" style={{ color: "var(--color-black-leather)" }}>
                    Resume (PDF, max 5 MB)
                  </label>
                  <Input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(event) => setResume(event.target.files?.[0] ?? null)}
                    className="mt-1 text-xs"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              </div>

              {submitError && <p role="alert" className="mt-3 text-xs text-red-700">{submitError}</p>}

              <div className="mt-5">
                <button
                  type="submit"
                  disabled={applied || submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200"
                  style={{
                    background: applied ? "#2e7d32" : "var(--color-champagne-gold)",
                    color: applied ? "#ffffff" : "var(--color-black-leather)",
                    border: "1px solid " + (applied ? "#2e7d32" : "var(--color-champagne-gold)"),
                    cursor: applied || submitting ? "default" : "pointer",
                  }}
                  onMouseEnter={e => {
                    if (!applied) (e.currentTarget as HTMLElement).style.background = "var(--color-champagne-dark)";
                  }}
                  onMouseLeave={e => {
                    if (!applied) (e.currentTarget as HTMLElement).style.background = "var(--color-champagne-gold)";
                  }}>
                  {applied ? (
                    <>
                      <CheckCircle2 size={15} /> Application Submitted to Founder!
                    </>
                  ) : (
                    <>
                      <Briefcase size={14} /> {submitting ? "Submitting..." : "Submit Application"}
                    </>
                  )}
                </button>
              </div>

              <p className="mt-3 text-center font-mono text-[10.5px]" style={{ color: "var(--color-muted-taupe)" }}>
                Destination: Founder Candidate Inflow ({requirement.founderEmail})
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

