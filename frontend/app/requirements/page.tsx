"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, GraduationCap, Rocket, Landmark, ShieldCheck } from "lucide-react";
import type { Requirement, RequirementStatus } from "@/types";
import { getRequirements } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { RequirementCard } from "@/components/RequirementCard";
import { ApplicationForm } from "@/components/ApplicationForm";

type FilterValue = "ALL" | "Newly Posted" | "Closing soon" | "Urgent";

export default function RequirementsPage() {
  const { role } = useAuth();
  const [view, setView] = useState<"student" | "founder">("student");
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { setView(role === "founder" ? "founder" : "student"); }, [role]);
  useEffect(() => {
    setIsLoading(true);
    getRequirements().then((data) => {
      setRequirements(data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ALL") return requirements;

    if (filter === "Newly Posted") {
      const threshold = Date.now() - 4 * 24 * 60 * 60 * 1000;
      return requirements.filter((r) => {
        if (r.postedDate) {
          return new Date(r.postedDate).getTime() >= threshold;
        }
        const text = r.posted.toLowerCase();
        return text.includes("today") || text.includes("yesterday") || text.includes("just now") || text.includes("2 days");
      });
    }

    if (filter === "Closing soon") {
      return requirements.filter((r) => {
        if (r.status === "CLOSING SOON") return true;
        if (r.deadline) {
          const diffDays = (new Date(r.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 7;
        }
        return false;
      });
    }

    if (filter === "Urgent") {
      return requirements.filter((r) => {
        if (r.isUrgent) return true;
        if (r.deadline) {
          const diffDays = (new Date(r.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 3;
        }
        return r.status === "CLOSING SOON";
      });
    }

    return requirements;
  }, [requirements, filter]);

  const filterButtons: { id: FilterValue; label: string; icon: string }[] = [
    { id: "ALL", label: "All Roles", icon: "✨" },
    { id: "Newly Posted", label: "Newly Posted", icon: "🔥" },
    { id: "Closing soon", label: "Closing soon", icon: "⏳" },
    { id: "Urgent", label: "Urgent", icon: "⚡" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--color-black-leather)" }}>
              Requisition Board
            </h1>
          </div>
          <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--text-secondary)" }}>
            {view === "student"
              ? "Browse live startup requirements and apply directly to founders."
              : "Post a talent requisition for your startup."}
          </p>
        </div>

        {/* View Toggle & Tracking Link */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link href="/applications"
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-sm"
            style={{
              background: "var(--color-champagne-gold)",
              color: "var(--color-black-leather)",
              border: "1px solid var(--color-champagne-gold)",
            }}>
            📋 {role === "founder" ? "Request Review" : "Track My Applications"}
          </Link>

          {role !== "student" && (
            <div className="flex items-center gap-1 rounded-xl p-1"
              style={{
                background: "var(--color-deep-charcoal)",
                border: "1px solid rgba(184,149,104,0.20)",
              }}>
              {[
                { key: "student", label: "Live Board", Icon: GraduationCap },
                { key: "founder", label: "Post Role", Icon: Rocket },
              ].map(({ key, label, Icon }) => (
                <button key={key} onClick={() => setView(key as "student" | "founder")}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all duration-150"
                  style={view === key
                    ? { background: "var(--color-champagne-gold)", color: "var(--color-black-leather)" }
                    : { color: "var(--color-muted-taupe)" }}
                  onMouseEnter={e => { if (view !== key) (e.currentTarget as HTMLElement).style.color = "var(--color-soft-cream)"; }}
                  onMouseLeave={e => { if (view !== key) (e.currentTarget as HTMLElement).style.color = "var(--color-muted-taupe)"; }}>
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {view === "student" ? (
        <>
          {/* Filter row */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Filter size={13} style={{ color: "var(--color-muted-taupe)" }} />
              {filterButtons.map(({ id, label, icon }) => (
                <button key={id} onClick={() => setFilter(id)}
                  className="rounded-full border px-3 py-1 text-[11.5px] font-semibold transition-all duration-150 flex items-center gap-1"
                  style={filter === id
                    ? {
                        background: "var(--color-champagne-gold)",
                        color: "var(--color-black-leather)",
                        borderColor: "var(--color-champagne-gold)",
                      }
                    : {
                        background: "transparent",
                        borderColor: "var(--border)",
                        color: "var(--color-muted-taupe)",
                      }}>
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>

            {role === "edc" && (
              <Link href="/edc"
                className="flex items-center gap-1 text-xs font-semibold transition"
                style={{ color: "var(--color-champagne-gold)" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                <Landmark size={12} /> EDC Approval Desk &rarr;
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0,1,2,3,4,5].map((i) => (
                <div key={i} className="rounded-2xl border p-5 animate-pulse"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <div className="mb-3 h-4 w-3/4 rounded bg-gray-200" />
                  <div className="mb-2 h-3 w-1/2 rounded bg-gray-100" />
                  <div className="mb-4 h-3 w-2/3 rounded bg-gray-100" />
                  <div className="flex gap-2">
                    <div className="h-5 w-14 rounded-full bg-gray-200" />
                    <div className="h-5 w-14 rounded-full bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl py-16 text-center"
              style={{
                border: "1.5px dashed var(--border)",
                background: "var(--surface)",
              }}>
              <p className="font-serif text-base font-bold" style={{ color: "var(--color-black-leather)" }}>
                No approved requisitions yet
              </p>
              <p className="mt-1 text-[13px]" style={{ color: "var(--text-secondary)" }}>
                Check back soon for new startup opportunities.
              </p>
              {role === "edc" && (
                <Link href="/edc"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-200"
                  style={{
                    background: "var(--color-champagne-gold)",
                    color: "var(--color-black-leather)",
                  }}>
                  Go to EDC Approval Desk
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 items-stretch sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((r) => <RequirementCard key={r.id} requirement={r} />)}
            </div>
          )}
        </>
      ) : (
        <ApplicationForm onPosted={() => getRequirements().then(setRequirements)} />
      )}
    </main>
  );
}
