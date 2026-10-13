"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Linkedin, Github, Globe, GraduationCap, ArrowUpRight, Clock,
  Send, Sparkles, ShieldCheck, CheckCircle2, FileText, Search,
  MessageSquare, Trophy, ChevronDown, ChevronUp, Building2, XCircle,
  Landmark, Rocket, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getMyApplications, getApplicationsByFounder, getApplicationResumeUrl, getRequirements, updateApplicationStatus } from "@/lib/api";
import type { Application, ApplicationStatus, Requirement } from "@/types";

const TRACKING_STEPS = [
  { key: "Applied",      label: "Applied",       sublabel: "Submitted",       icon: FileText,      activeColor: "var(--color-champagne-gold)" },
  { key: "Reviewing",    label: "Under Review",  sublabel: "Founder viewing",  icon: Search,        activeColor: "var(--color-blush-suede)" },
  { key: "Interviewing", label: "Interviewing",  sublabel: "Shortlisted!",    icon: MessageSquare, activeColor: "var(--color-champagne-gold)" },
  { key: "Accepted",     label: "Accepted",      sublabel: "Offer accepted!", icon: Trophy,        activeColor: "#059669" },
];

function getStepIndex(status?: string) {
  if (status === "Rejected") return -1;
  if (!status || status === "Reviewing") return 1;
  if (status === "Interviewing") return 2;
  if (status === "Accepted" || status === "Selected") return 3;
  return 1;
}

function ApplicationTracker({ status }: { status?: string }) {
  if (status === "Rejected") {
    return (
      <div className="mt-4 rounded-xl p-3.5 text-center flex items-center justify-center gap-2 font-semibold text-xs"
        style={{ background: "rgba(157,98,95,0.12)", border: "1px solid rgba(157,98,95,0.30)", color: "#9D625F" }}>
        <XCircle size={16} className="shrink-0" />
        <span>Application Status: Not Selected / Rejected</span>
      </div>
    );
  }

  const currentIdx = getStepIndex(status);
  const progressPct = (currentIdx / (TRACKING_STEPS.length - 1)) * 100;

  return (
    <div className="relative mt-5 px-1">
      <div
        className="absolute top-[20px] left-0 right-0 h-[2px] rounded-full"
        style={{ marginLeft: "32px", marginRight: "32px", background: "var(--border)" }} />
      <div className="absolute top-[20px] left-0 right-0 overflow-hidden h-[2px] rounded-full"
        style={{ marginLeft: "32px", marginRight: "32px" }}>
        <div className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, var(--color-blush-suede), var(--color-champagne-gold))" }} />
      </div>

      <div className="relative flex justify-between">
        {TRACKING_STEPS.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isActive = idx === currentIdx;
          const Icon = step.icon;
          const color = isDone ? "var(--color-champagne-gold)" : isActive ? step.activeColor : "var(--color-muted-taupe)";

          return (
            <div key={step.key} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500"
                style={{
                  backgroundColor: isDone ? "var(--color-champagne-gold)" : isActive ? "rgba(184,149,104,0.12)" : "var(--warm-surface)",
                  borderColor: isDone || isActive ? color : "var(--border)",
                  boxShadow: isActive ? `0 0 0 4px rgba(184,149,104,0.15)` : "none",
                }}>
                {isDone
                  ? <CheckCircle2 size={18} style={{ color: "var(--color-black-leather)" }} />
                  : <Icon size={15} color={isActive ? step.activeColor : "var(--color-muted-taupe)"} />}
                {isActive && (
                  <span className="absolute inset-0 rounded-full animate-ping opacity-15"
                    style={{ backgroundColor: step.activeColor }} />
                )}
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold leading-tight"
                  style={{ color: isDone || isActive ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {step.label}
                </p>
                {(isDone || isActive) && (
                  <p className="mt-0.5 text-[10px] leading-tight max-w-[70px]" style={{ color: "var(--text-muted)" }}>
                    {step.sublabel}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status?: string }) {
  if (status === "Rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
        style={{ background: "rgba(157,98,95,0.15)", color: "#9D625F", border: "1px solid rgba(157,98,95,0.35)" }}>
        <span className="h-1.5 w-1.5 rounded-full bg-[#9D625F]" />
        Rejected
      </span>
    );
  }

  if (status === "Accepted" || status === "Selected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
        style={{ background: "rgba(16,185,129,0.15)", color: "#059669", border: "1px solid rgba(16,185,129,0.30)" }}>
        <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
        Accepted
      </span>
    );
  }

  const map: Record<string, { bg: string; text: string }> = {
    Reviewing:    { bg: "var(--gold-soft)",    text: "var(--gold)" },
    Interviewing: { bg: "var(--primary-light)", text: "var(--primary)" },
  };
  const s = map[status ?? "Reviewing"] ?? map["Reviewing"];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.text}30` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.text }} />
      {status ?? "Reviewing"}
    </span>
  );
}

function relativeTime(isoString: string) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function RequirementStatusPill({ status }: { status: Requirement["approvalStatus"] }) {
  const config = {
    PENDING_APPROVAL: { label: "Reviewing", color: "var(--gold)", background: "var(--gold-soft)", icon: Clock },
    APPROVED: { label: "Selected", color: "#059669", background: "rgba(16,185,129,0.15)", icon: CheckCircle2 },
    REJECTED: { label: "Rejected", color: "#9D625F", background: "rgba(157,98,95,0.15)", icon: XCircle },
  }[status];
  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{ background: config.background, color: config.color, border: `1px solid ${config.color}40` }}>
      <Icon size={12} /> {config.label}
    </span>
  );
}

function FounderRequestReview({ founderEmail, founderCompany }: { founderEmail: string; founderCompany?: string }) {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRequirements(true), getApplicationsByFounder(founderEmail, founderCompany)]).then(([all, founderApplications]) => {
      const normalizedEmail = founderEmail.toLowerCase();
      const normalizedCompany = founderCompany?.toLowerCase();
      setRequirements(all.filter((requirement) =>
        requirement.founderEmail.toLowerCase() === normalizedEmail ||
        (normalizedCompany && requirement.company.toLowerCase() === normalizedCompany)
      ));
      setApplications(founderApplications);
      setLoading(false);
    });
  }, [founderEmail, founderCompany]);

  const handleStatusChange = async (appId: string, status: "Reviewing" | "Interviewing" | "Accepted" | "Rejected") => {
    await updateApplicationStatus(appId, status);
    setApplications((current) => current.map((application) =>
      application.id === appId ? { ...application, status } : application
    ));
  };

  const counts = {
    all: requirements.length,
    reviewing: requirements.filter((r) => r.approvalStatus === "PENDING_APPROVAL").length,
    selected: requirements.filter((r) => r.approvalStatus === "APPROVED").length,
    rejected: requirements.filter((r) => r.approvalStatus === "REJECTED").length,
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Request Review</h1>
            <span className="badge-verified rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold">Founder View</span>
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Track every requirement you have submitted to the EDC cell.
          </p>
        </div>
        <Link href="/requirements"
          className="self-start rounded-xl px-4 py-2 text-xs font-bold text-white transition"
          style={{ background: "var(--primary)" }}>
          + Submit Requirement
        </Link>
      </div>

      {!loading && (
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Submitted", count: counts.all, color: "var(--text-primary)", background: "var(--surface-green)" },
            { label: "Reviewing", count: counts.reviewing, color: "var(--gold)", background: "var(--gold-soft)" },
            { label: "Selected", count: counts.selected, color: "#059669", background: "rgba(16,185,129,0.15)" },
            { label: "Rejected", count: counts.rejected, color: "#9D625F", background: "rgba(157,98,95,0.15)" },
          ].map((metric) => (
            <div key={metric.label} className="rounded-xl p-3 text-center" style={{ background: metric.background, color: metric.color }}>
              <p className="text-xl font-bold">{metric.count}</p>
              <p className="text-[10px] font-semibold opacity-80">{metric.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {loading ? (
          [1, 2].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl" style={{ background: "var(--surface-green)" }} />)
        ) : requirements.length === 0 ? (
          <div className="rounded-2xl py-20 text-center" style={{ border: "1.5px dashed var(--border)" }}>
            <Rocket size={28} className="mx-auto mb-3" style={{ color: "var(--border-strong)" }} />
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>No requirements submitted yet</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Submit a requirement to begin the EDC review process.</p>
          </div>
        ) : (
          requirements.map((requirement) => (
            <div key={requirement.id} className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{requirement.role}</h2>
                    <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>{requirement.id}</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <Landmark size={12} style={{ color: "var(--secondary)" }} /> {requirement.company}
                  </p>
                </div>
                <RequirementStatusPill status={requirement.approvalStatus} />
              </div>
              <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3" style={{ color: "var(--text-muted)" }}>
                <span>Submitted {requirement.posted}</span>
                <span>{requirement.location}</span>
                <span>{requirement.stipend}</span>
              </div>
              {requirement.approvalStatus === "REJECTED" && requirement.edcNotes && (
                <div className="mt-4 flex gap-2 rounded-xl p-3 text-xs" style={{ background: "rgba(157,98,95,0.08)", color: "#9D625F" }}>
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{requirement.edcNotes}</span>
                </div>
              )}

            </div>
          ))
        )}
      </div>
    </main>
  );
}

function ApplicationCard({ app }: { app: Application }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-surface overflow-hidden rounded-2xl">
      <div className="flex items-start justify-between gap-4 p-5 pb-0">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-lg text-white shadow-sm"
            style={{ background: "var(--primary)" }}>
            {(app.companyName ?? app.applicantName).charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{app.roleTitle ?? "Role"}</h3>
              <span style={{ color: "var(--text-muted)" }} className="text-sm">at</span>
              <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                <Building2 size={12} style={{ color: "var(--text-muted)" }} />
                {app.companyName ?? "Company"}
              </span>
              <span className="rounded-full px-2 py-0.5 font-mono text-[10px]"
                style={{ background: "var(--surface-green)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                {app.id}
              </span>
            </div>
            {app.department && (
              <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <GraduationCap size={11} style={{ color: "var(--secondary)" }} />
                <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{app.department}</span>
                {app.college && <span>&middot; {app.college}</span>}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusPill status={app.status} />
          <span className="flex items-center gap-1 text-[10.5px]" style={{ color: "var(--text-muted)" }}>
            <Clock size={10} /> {relativeTime(app.createdAt)}
          </span>
        </div>
      </div>

      <div className="px-5 pb-3">
        <ApplicationTracker status={app.status} />
      </div>

      <div className="px-5 py-3" style={{ borderTop: "1px solid var(--divider)" }}>
        <button onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between text-xs font-semibold transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
          <span>View application details</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 px-5 py-4" style={{ borderTop: "1px solid var(--divider)", background: "var(--surface-green)" }}>
          <div className="flex flex-wrap gap-2">
            {app.linkedinUrl && (
              <a href={app.linkedinUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                style={{ background: "white", border: "1px solid var(--border)", color: "#0A66C2" }}>
                <Linkedin size={12} /> LinkedIn <ArrowUpRight size={10} />
              </a>
            )}
            {app.githubUrl && (
              <a href={app.githubUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                style={{ background: "white", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                <Github size={12} /> GitHub <ArrowUpRight size={10} />
              </a>
            )}
            {app.portfolioUrl && (
              <a href={app.portfolioUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                style={{ background: "white", border: "1px solid var(--border)", color: "var(--secondary)" }}>
                <Globe size={12} /> Portfolio <ArrowUpRight size={10} />
              </a>
            )}
          </div>

          {app.note && (
            <div className="rounded-xl p-3" style={{ background: "var(--primary-light)", border: "1px solid rgba(11,93,59,0.15)" }}>
              <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>Your Pitch Note</p>
              <p className="text-[12.5px] leading-relaxed italic" style={{ color: "var(--text-secondary)" }}>&ldquo;{app.note}&rdquo;</p>
            </div>
          )}

          {(app.skills ?? []).length > 0 && (
            <div>
              <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {(app.skills ?? []).map((s) => (
                  <span key={s} className="tag-green rounded-full px-2.5 py-0.5 text-[11px]">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusSelector({ appId, current, onUpdate }: {
  appId: string;
  current?: string;
  onUpdate: (appId: string, status: "Reviewing" | "Interviewing" | "Accepted" | "Rejected") => void;
}) {
  const statuses: Array<{ key: "Reviewing" | "Interviewing" | "Accepted" | "Rejected"; label: string }> = [
    { key: "Reviewing", label: "Reviewing" },
    { key: "Interviewing", label: "Interviewing" },
    { key: "Accepted", label: "Accepted" },
    { key: "Rejected", label: "Rejected" },
  ];
  const active = current === "Selected" ? "Accepted" : (current ?? "Reviewing");

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {statuses.map((s) => (
        <button key={s.key} onClick={() => onUpdate(appId, s.key)}
          className="rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all"
          style={active === s.key
            ? s.key === "Rejected"
              ? { background: "rgba(157,98,95,0.20)", color: "#9D625F", borderColor: "#9D625F" }
              : s.key === "Accepted"
              ? { background: "rgba(16,185,129,0.20)", color: "#059669", borderColor: "#059669" }
              : { background: "var(--primary-light)", color: "var(--primary)", borderColor: "rgba(184,149,104,0.4)" }
            : { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
          {s.label}
        </button>
      ))}
    </div>
  );
}

function ApplicantCard({ app, onStatusChange }: {
  app: Application;
  onStatusChange: (appId: string, status: "Reviewing" | "Interviewing" | "Accepted" | "Rejected") => void;
}) {
  const [resumeLoading, setResumeLoading] = useState(false);
  const colorIdx = app.applicantName.charCodeAt(0) % 6;
  const avatarColors = ["#0B5D3B", "#267A56", "#B38E60", "#9D625F", "#4A7FA5", "#7B5EA7"];
  const effectiveStatus = (app.status === "Selected" ? "Accepted" : app.status) ?? "Reviewing";

  const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
    Reviewing:    { bg: "rgba(184,149,104,0.12)", text: "var(--color-champagne-gold, #B38E60)", border: "rgba(184,149,104,0.35)" },
    Interviewing: { bg: "rgba(74,127,165,0.12)",  text: "#4A7FA5",                              border: "rgba(74,127,165,0.35)" },
    Accepted:     { bg: "rgba(16,185,129,0.12)",  text: "#059669",                              border: "rgba(16,185,129,0.35)" },
    Rejected:     { bg: "rgba(157,98,95,0.12)",   text: "#9D625F",                              border: "rgba(157,98,95,0.35)" },
  };
  const sc = statusConfig[effectiveStatus] ?? statusConfig["Reviewing"];

  const openResume = async () => {
    setResumeLoading(true);
    try {
      const url = await getApplicationResumeUrl(app.id);
      window.location.assign(url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not open the resume.");
    } finally {
      setResumeLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl transition-all duration-200"
      style={{ border: "1.5px solid var(--border)", background: "var(--surface)" }}>
      <div className="h-1 w-full" style={{ background: sc.text, opacity: 0.6 }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-lg text-white shadow-sm"
              style={{ background: avatarColors[colorIdx] }}>
              {app.applicantName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-serif text-lg font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                  {app.applicantName}
                </p>
                {app.roleTitle && (
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: "rgba(184,149,104,0.12)", color: "var(--gold)", border: "1px solid rgba(184,149,104,0.35)" }}>
                    {app.roleTitle}
                  </span>
                )}
              </div>

              {(app.companyName || app.department || app.college) && (
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                  {app.companyName && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                      style={{ background: "var(--surface-green)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                      <Building2 size={10} /> {app.companyName}
                    </span>
                  )}
                  {app.department && (
                    <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{app.department}</span>
                  )}
                  {app.college && <span>· {app.college}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: sc.text }} />
              {effectiveStatus}
            </span>
            <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
              <Clock size={10} /> {relativeTime(app.createdAt)}
            </span>
          </div>
        </div>

        {(app.skills ?? []).length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {(app.skills ?? []).map((s) => (
                <span key={s} className="tag-green rounded-full px-2.5 py-0.5 text-[11px] font-semibold">{s}</span>
              ))}
            </div>
          </div>
        )}

        {app.note && (
          <div className="mt-4 rounded-xl px-4 py-3"
            style={{ background: "rgba(184,149,104,0.07)", border: "1px solid rgba(184,149,104,0.20)" }}>
            <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Pitch Note</p>
            <p className="text-[12.5px] italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>&ldquo;{app.note}&rdquo;</p>
          </div>
        )}

        {(app.linkedinUrl || app.githubUrl || app.portfolioUrl) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {app.linkedinUrl && (
              <a href={app.linkedinUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition hover:opacity-80"
                style={{ background: "rgba(10,102,194,0.10)", color: "#0A66C2", border: "1px solid rgba(10,102,194,0.25)" }}>
                <Linkedin size={12} /> LinkedIn <ArrowUpRight size={10} />
              </a>
            )}
            {app.githubUrl && (
              <a href={app.githubUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition hover:opacity-80"
                style={{ background: "rgba(36,41,47,0.08)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
                <Github size={12} /> GitHub <ArrowUpRight size={10} />
              </a>
            )}
            {app.portfolioUrl && (
              <a href={app.portfolioUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition hover:opacity-80"
                style={{ background: "rgba(11,93,59,0.08)", color: "var(--secondary)", border: "1px solid rgba(11,93,59,0.20)" }}>
                <Globe size={12} /> Portfolio <ArrowUpRight size={10} />
              </a>
            )}
          </div>
        )}

        {app.resumePath && (
          <button type="button" onClick={openResume} disabled={resumeLoading}
            className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
            style={{ background: "var(--surface-green)", color: "var(--secondary)", border: "1px solid var(--border)" }}>
            <FileText size={12} /> {resumeLoading ? "Opening..." : "View resume"}
          </button>
        )}

        <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--divider)" }}>
          <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Move Candidate Stage</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {([
              { key: "Reviewing", label: "Under Review", activeStyle: { background: "rgba(184,149,104,0.18)", color: "#9A7840", border: "1.5px solid #B38E60" }, inactiveStyle: { background: "var(--surface-green)", color: "var(--text-muted)", border: "1px solid var(--border)" } },
              { key: "Interviewing", label: "Interviewing", activeStyle: { background: "rgba(74,127,165,0.15)", color: "#4A7FA5", border: "1.5px solid #4A7FA5" }, inactiveStyle: { background: "var(--surface-green)", color: "var(--text-muted)", border: "1px solid var(--border)" } },
              { key: "Accepted", label: "Accept ✓", activeStyle: { background: "rgba(16,185,129,0.20)", color: "#059669", border: "1.5px solid #059669" }, inactiveStyle: { background: "var(--surface-green)", color: "var(--text-muted)", border: "1px solid var(--border)" } },
              { key: "Rejected", label: "Reject ✗", activeStyle: { background: "rgba(157,98,95,0.18)", color: "#9D625F", border: "1.5px solid #9D625F" }, inactiveStyle: { background: "var(--surface-green)", color: "var(--text-muted)", border: "1px solid var(--border)" } },
            ] as const).map(({ key, label, activeStyle, inactiveStyle }) => (
              <button key={key}
                onClick={() => onStatusChange(app.id, key)}
                className="rounded-xl py-2.5 text-[11px] font-bold transition-all duration-150"
                style={effectiveStatus === key ? activeStyle : inactiveStyle}
                onMouseEnter={e => { if (effectiveStatus !== key) (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
                onMouseLeave={e => { if (effectiveStatus !== key) (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
          📧 {app.applicantEmail}
        </p>
      </div>
    </div>
  );
}

function FounderInflowDashboard({ founderEmail }: { founderEmail: string }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "Reviewing" | "Interviewing" | "Accepted" | "Rejected">("ALL");

  useEffect(() => {
    getApplicationsByFounder(founderEmail).then((apps: Application[]) => {
      setApplications(apps);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [founderEmail]);

  const handleStatusChange = async (appId: string, status: "Reviewing" | "Interviewing" | "Accepted" | "Rejected") => {
    await updateApplicationStatus(appId, status);
    setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
  };

  const normalizeStatus = (s?: string) => (s === "Selected" ? "Accepted" : s ?? "Reviewing");

  const counts = {
    ALL: applications.length,
    Reviewing: applications.filter((a) => normalizeStatus(a.status) === "Reviewing").length,
    Interviewing: applications.filter((a) => normalizeStatus(a.status) === "Interviewing").length,
    Accepted: applications.filter((a) => normalizeStatus(a.status) === "Accepted").length,
    Rejected: applications.filter((a) => normalizeStatus(a.status) === "Rejected").length,
  };

  const filtered = filter === "ALL" ? applications : applications.filter((a) => normalizeStatus(a.status) === filter);
  const grouped = filtered.reduce<Record<string, Application[]>>((acc, app) => {
    const key = `${app.roleTitle ?? "Role"} - ${app.companyName ?? "Company"}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(app);
    return acc;
  }, {});

  const statTiles = [
    { label: "Total",        key: "ALL",          bg: "var(--surface-green)", text: "var(--text-primary)" },
    { label: "Reviewing",    key: "Reviewing",    bg: "var(--gold-soft)",     text: "var(--gold)" },
    { label: "Interviewing", key: "Interviewing", bg: "var(--primary-light)", text: "var(--secondary)" },
    { label: "Accepted",     key: "Accepted",     bg: "rgba(16,185,129,0.15)", text: "#059669" },
    { label: "Rejected",     key: "Rejected",     bg: "rgba(157,98,95,0.15)", text: "#9D625F" },
  ] as const;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Candidate Inflow</h1>
            <span className="badge-verified rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold">Founder View</span>
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Review and move student applicants through your hiring pipeline.
          </p>
        </div>
        <Link href="/requirements"
          className="self-start rounded-xl px-4 py-2 text-xs font-bold text-white transition"
          style={{ background: "var(--primary)" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--primary-hover)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "var(--primary)")}>
          + Post Requirement
        </Link>
      </div>

      {!loading && (
        <div className="mt-6 grid grid-cols-5 gap-2 sm:gap-3">
          {statTiles.map(({ label, key, bg, text }) => (
            <div key={key} onClick={() => setFilter(key)}
              className="cursor-pointer rounded-xl p-2.5 text-center transition-all"
              style={{
                background: bg, color: text,
                border: filter === key ? `2px solid ${text}` : "2px solid transparent",
                boxShadow: filter === key ? `0 2px 8px ${text}25` : "none",
              }}>
              <p className="text-lg sm:text-xl font-bold">{counts[key]}</p>
              <p className="text-[10px] font-semibold opacity-80">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <span className="text-xs font-semibold mr-1" style={{ color: "var(--text-muted)" }}>Filter:</span>
        {(["ALL", "Reviewing", "Interviewing", "Accepted", "Rejected"] as const).map((st) => (
          <button key={st} onClick={() => setFilter(st)}
            className="rounded-full border px-3.5 py-1 text-xs font-semibold transition-all"
            style={filter === st
              ? { background: "var(--primary)", color: "white", borderColor: "var(--primary)" }
              : { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            {st}
            {st !== "ALL" && (
              <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                style={filter === st
                  ? { background: "rgba(255,255,255,0.2)", color: "white" }
                  : { background: "var(--surface-green)", color: "var(--text-muted)" }}>
                {counts[st]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl" style={{ background: "var(--surface-green)" }} />)}
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-2xl py-20 text-center" style={{ border: "1.5px dashed var(--border)" }}>
            <Send size={28} className="mx-auto mb-3" style={{ color: "var(--border-strong)" }} />
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>No applications received yet</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Once students apply, they will appear here.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl py-16 text-center" style={{ border: "1.5px dashed var(--border)" }}>
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>No candidates in this stage</p>
          </div>
        ) : (
          Object.entries(grouped).map(([reqLabel, apps]) => (
            <div key={reqLabel} className="overflow-hidden rounded-2xl" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
              <div className="flex items-center justify-between px-5 py-3.5" style={{ background: "var(--surface-green)", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{reqLabel}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {apps.length} applicant{apps.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className="badge-verified rounded-full px-2.5 py-1 text-[10px] font-bold">
                  {apps.filter((a) => (a.status ?? "Reviewing") === "Reviewing").length} to review
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--divider)" }}>
                {apps.map((app) => (
                  <div key={app.id} className="px-4 py-1">
                    <ApplicantCard app={app} onStatusChange={handleStatusChange} />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && applications.length > 0 && (
        <p className="mt-8 text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
          <ShieldCheck size={11} className="inline mr-1" />
          Status updates are reflected instantly on student tracking dashboards.
        </p>
      )}
    </main>
  );
}

function FounderDashboard({ founderEmail, founderCompany }: { founderEmail: string; founderCompany?: string }) {
  const [tab, setTab] = useState<"applicants" | "edc">("applicants");
  const [applications, setApplications] = useState<Application[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "Reviewing" | "Interviewing" | "Accepted" | "Rejected">("ALL");

  useEffect(() => {
    Promise.all([
      getApplicationsByFounder(founderEmail, founderCompany),
      getRequirements(true),
    ]).then(([apps, allReqs]) => {
      setApplications(apps);
      const normalizedEmail = founderEmail.toLowerCase();
      const normalizedCompany = founderCompany?.toLowerCase();
      setRequirements(allReqs.filter((r) =>
        r.founderEmail.toLowerCase() === normalizedEmail ||
        (normalizedCompany && r.company.toLowerCase() === normalizedCompany)
      ));
      setLoading(false);
    });
  }, [founderEmail, founderCompany]);

  const handleStatusChange = async (appId: string, status: "Reviewing" | "Interviewing" | "Accepted" | "Rejected") => {
    await updateApplicationStatus(appId, status);
    setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
  };

  const normalizeStatus = (s?: string) => (s === "Selected" ? "Accepted" : s ?? "Reviewing");
  const counts = {
    ALL: applications.length,
    Reviewing:    applications.filter((a) => normalizeStatus(a.status) === "Reviewing").length,
    Interviewing: applications.filter((a) => normalizeStatus(a.status) === "Interviewing").length,
    Accepted:     applications.filter((a) => normalizeStatus(a.status) === "Accepted").length,
    Rejected:     applications.filter((a) => normalizeStatus(a.status) === "Rejected").length,
  };
  const filtered = filter === "ALL" ? applications : applications.filter((a) => normalizeStatus(a.status) === filter);

  const reqCounts = {
    all:      requirements.length,
    pending:  requirements.filter((r) => r.approvalStatus === "PENDING_APPROVAL").length,
    approved: requirements.filter((r) => r.approvalStatus === "APPROVED").length,
    rejected: requirements.filter((r) => r.approvalStatus === "REJECTED").length,
  };



  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Applicants</h1>
            <span className="badge-verified rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold">Founder View</span>
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Review students who applied to your requirements and move them through your pipeline.
          </p>
        </div>
        <Link href="/requirements"
          className="self-start rounded-xl px-4 py-2 text-xs font-bold text-white transition"
          style={{ background: "var(--primary)" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--primary-hover)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "var(--primary)")}>
          + Post Requirement
        </Link>
      </div>

      {/* Tab switcher */}
      <div className="mt-6 flex gap-1 rounded-xl p-1" style={{ background: "var(--surface-green)", border: "1px solid var(--border)" }}>
        {([
          { key: "applicants" as const, label: `👥 Applicants (${counts.ALL})` },
          { key: "edc"        as const, label: `🏛️ EDC Review (${reqCounts.all})` },
        ]).map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex-1 rounded-lg py-2 text-xs font-bold transition-all"
            style={tab === key
              ? { background: "var(--primary)", color: "white" }
              : { background: "transparent", color: "var(--text-muted)" }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── APPLICANTS TAB ── */}
      {tab === "applicants" && (
        <>
          {/* Stat tiles */}
          {!loading && (
            <div className="mt-5 grid grid-cols-5 gap-2">
              {([
                { label: "Total",        key: "ALL",          bg: "var(--surface-green)",   text: "var(--text-primary)" },
                { label: "Reviewing",    key: "Reviewing",    bg: "var(--gold-soft)",        text: "var(--gold)" },
                { label: "Interviewing", key: "Interviewing", bg: "var(--primary-light)",    text: "var(--secondary)" },
                { label: "Accepted",     key: "Accepted",     bg: "rgba(16,185,129,0.15)",   text: "#059669" },
                { label: "Rejected",     key: "Rejected",     bg: "rgba(157,98,95,0.15)",    text: "#9D625F" },
              ] as const).map(({ label, key, bg, text }) => (
                <div key={key} onClick={() => setFilter(key)}
                  className="cursor-pointer rounded-xl p-2.5 text-center transition-all"
                  style={{
                    background: bg, color: text,
                    border: filter === key ? `2px solid ${text}` : "2px solid transparent",
                    boxShadow: filter === key ? `0 2px 8px ${text}25` : "none",
                  }}>
                  <p className="text-xl font-bold">{counts[key]}</p>
                  <p className="text-[10px] font-semibold opacity-80">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filter pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="text-xs font-semibold mr-1" style={{ color: "var(--text-muted)" }}>Filter:</span>
            {(["ALL", "Reviewing", "Interviewing", "Accepted", "Rejected"] as const).map((st) => (
              <button key={st} onClick={() => setFilter(st)}
                className="rounded-full border px-3.5 py-1 text-xs font-semibold transition-all"
                style={filter === st
                  ? { background: "var(--primary)", color: "white", borderColor: "var(--primary)" }
                  : { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                {st}{st !== "ALL" && <span className="ml-1 opacity-70">({counts[st]})</span>}
              </button>
            ))}
          </div>

          {/* Applicant cards */}
          <div className="mt-5 space-y-4">
            {loading ? (
              [1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl" style={{ background: "var(--surface-green)" }} />)
            ) : applications.length === 0 ? (
              <div className="rounded-2xl py-20 text-center" style={{ border: "1.5px dashed var(--border)" }}>
                <Send size={28} className="mx-auto mb-3" style={{ color: "var(--border-strong)" }} />
                <p className="font-bold" style={{ color: "var(--text-primary)" }}>No applications received yet</p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  Once students apply to your requirements, their profiles will appear here.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl py-16 text-center" style={{ border: "1.5px dashed var(--border)" }}>
                <p className="font-bold" style={{ color: "var(--text-primary)" }}>No candidates in this stage</p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Try a different filter above.</p>
              </div>
            ) : (
              filtered.map((app) => (
                <ApplicantCard key={app.id} app={app} onStatusChange={handleStatusChange} />
              ))
            )}
          </div>

          {!loading && applications.length > 0 && (
            <p className="mt-8 text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
              <ShieldCheck size={11} className="inline mr-1" />
              Status changes are reflected instantly on the student&apos;s tracking dashboard.
            </p>
          )}
        </>
      )}

      {/* ── EDC REVIEW TAB ── */}
      {tab === "edc" && (
        <>
          {!loading && (
            <div className="mt-5 grid grid-cols-4 gap-2">
              {[
                { label: "Total Submitted", count: reqCounts.all,      bg: "var(--surface-green)",  text: "var(--text-primary)" },
                { label: "Pending Review",  count: reqCounts.pending,  bg: "var(--gold-soft)",       text: "var(--gold)" },
                { label: "Approved & Live", count: reqCounts.approved, bg: "rgba(16,185,129,0.15)",  text: "#059669" },
                { label: "Rejected",        count: reqCounts.rejected, bg: "rgba(157,98,95,0.15)",   text: "#9D625F" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-3 text-center" style={{ background: m.bg, color: m.text }}>
                  <p className="text-xl font-bold">{m.count}</p>
                  <p className="text-[10px] font-semibold opacity-80">{m.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 space-y-4">
            {loading ? (
              [1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl" style={{ background: "var(--surface-green)" }} />)
            ) : requirements.length === 0 ? (
              <div className="rounded-2xl py-20 text-center" style={{ border: "1.5px dashed var(--border)" }}>
                <Rocket size={28} className="mx-auto mb-3" style={{ color: "var(--border-strong)" }} />
                <p className="font-bold" style={{ color: "var(--text-primary)" }}>No requirements submitted yet</p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Post a requirement to begin the EDC review process.</p>
              </div>
            ) : (
              requirements.map((req) => {
                return (
                  <div key={req.id} className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{req.role}</h2>
                          <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>{req.id}</span>
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                          <Landmark size={12} style={{ color: "var(--secondary)" }} /> {req.company}
                        </p>
                      </div>
                      <RequirementStatusPill status={req.approvalStatus} />
                    </div>
                    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3" style={{ color: "var(--text-muted)" }}>
                      <span>Submitted {req.posted}</span>
                      <span>{req.location}</span>
                      <span>{req.stipend}</span>
                    </div>
                    {req.approvalStatus === "REJECTED" && req.edcNotes && (
                      <div className="mt-3 flex gap-2 rounded-xl p-3 text-xs" style={{ background: "rgba(157,98,95,0.08)", color: "#9D625F" }}>
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <span>{req.edcNotes}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </main>
  );
}

export default function ApplicationsPage() {
  const { user, role } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<"ALL" | "Interviewing" | "Reviewing" | "Accepted" | "Rejected">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === "founder") return;
    if (user?.email) {
      getMyApplications(user.email).then((apps) => { setApplications(apps); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [user?.email, role]);

  if (role === "founder") {
    return <FounderDashboard
      founderEmail={user?.email ?? ""}
      founderCompany={user?.founderProfile?.companyName}
    />;
  }

  const normalizeStatus = (s?: string) => (s === "Selected" ? "Accepted" : s ?? "Reviewing");
  const filtered = filter === "ALL" ? applications : applications.filter((app) => normalizeStatus(app.status) === filter);
  const counts = {
    ALL: applications.length,
    Reviewing: applications.filter((a) => normalizeStatus(a.status) === "Reviewing").length,
    Interviewing: applications.filter((a) => normalizeStatus(a.status) === "Interviewing").length,
    Accepted: applications.filter((a) => normalizeStatus(a.status) === "Accepted").length,
    Rejected: applications.filter((a) => normalizeStatus(a.status) === "Rejected").length,
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--text-primary)" }}>My Applications</h1>
            <span className="badge-verified rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold">Tracking</span>
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Track your application progress in real-time</p>
        </div>
        <Link href="/requirements"
          className="self-start rounded-xl px-4 py-2 text-xs font-bold text-white transition"
          style={{ background: "var(--primary)" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--primary-hover)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "var(--primary)")}>
          + Browse More
        </Link>
      </div>

      {!loading && applications.length > 0 && (
        <div className="mt-6 grid grid-cols-5 gap-2 sm:gap-3">
          {([
            { label: "Total",        key: "ALL",          bg: "var(--surface-green)", text: "var(--text-primary)" },
            { label: "Reviewing",    key: "Reviewing",    bg: "var(--gold-soft)",     text: "var(--gold)" },
            { label: "Interviewing", key: "Interviewing", bg: "var(--primary-light)", text: "var(--secondary)" },
            { label: "Accepted",     key: "Accepted",     bg: "rgba(16,185,129,0.15)", text: "#059669" },
            { label: "Rejected",     key: "Rejected",     bg: "rgba(157,98,95,0.15)", text: "#9D625F" },
          ] as const).map(({ label, key, bg, text }) => (
            <div key={key} onClick={() => setFilter(key)}
              className="cursor-pointer rounded-xl p-2.5 text-center transition-all"
              style={{
                background: bg, color: text,
                border: filter === key ? `2px solid ${text}` : "2px solid transparent",
              }}>
              <p className="text-lg sm:text-xl font-bold">{counts[key]}</p>
              <p className="text-[10px] font-semibold opacity-80">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <span className="text-xs font-semibold mr-1" style={{ color: "var(--text-muted)" }}>Filter:</span>
        {(["ALL", "Reviewing", "Interviewing", "Accepted", "Rejected"] as const).map((st) => (
          <button key={st} onClick={() => setFilter(st)}
            className="rounded-full border px-3.5 py-1 text-xs font-semibold transition-all"
            style={filter === st
              ? { background: "var(--primary)", color: "white", borderColor: "var(--primary)" }
              : { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            {st}
            {st !== "ALL" && (
              <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                style={filter === st
                  ? { background: "rgba(255,255,255,0.2)" }
                  : { background: "var(--surface-green)", color: "var(--text-muted)" }}>
                {counts[st]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl" style={{ background: "var(--surface-green)" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl py-20 text-center" style={{ border: "1.5px dashed var(--border)" }}>
            <Send size={28} className="mx-auto mb-3" style={{ color: "var(--border-strong)" }} />
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>
              {applications.length === 0 ? "No applications yet" : "No applications match this filter"}
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              {applications.length === 0
                ? "Browse startup requirements and apply."
                : "Try a different status filter above."}
            </p>
            {applications.length === 0 && (
              <Link href="/requirements"
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
                style={{ background: "var(--primary)" }}>
                <Sparkles size={14} /> Browse Requirements
              </Link>
            )}
          </div>
        ) : (
          filtered.map((app) => <ApplicationCard key={app.id} app={app} />)
        )}
      </div>

      {!loading && applications.length > 0 && (
        <p className="mt-8 text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
          <ShieldCheck size={11} className="inline mr-1" />
          Showing only your applications.
        </p>
      )}
    </main>
  );
}
