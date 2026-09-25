"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Landmark,
  CheckCircle2,
  XCircle,
  Clock,
  Rocket,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  Mail,
  MapPin,
  Briefcase,
  Sparkles,
  ExternalLink,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getAllRequirements, approveRequirement, rejectRequirement } from "@/lib/api";
import type { Requirement, ApprovalStatus } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EdcHubPage() {
  const { user, role } = useAuth();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [filter, setFilter] = useState<"ALL" | ApprovalStatus>("PENDING_APPROVAL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const edcCellName =
    user?.edcProfile?.cellName || user?.edcProfile?.institutionName || "EDC Incubation Cell";

  const loadRequirements = () => {
    getAllRequirements().then(setRequirements);
  };

  useEffect(() => {
    loadRequirements();
  }, []);

  const handleApprove = async (id: string, roleTitle: string) => {
    await approveRequirement(id, edcCellName);
    loadRequirements();
    setActionSuccess(`Approved "${roleTitle}"! It is now published live to the student board.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleReject = async (id: string, roleTitle: string) => {
    const reason = rejectReason.trim() || "Does not meet EDC incubation criteria.";
    await rejectRequirement(id, reason);
    loadRequirements();
    setRejectingId(null);
    setRejectReason("");
    setActionSuccess(`Rejected requisition for "${roleTitle}".`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const pendingCount = requirements.filter((r) => r.approvalStatus === "PENDING_APPROVAL").length;
  const approvedCount = requirements.filter((r) => r.approvalStatus === "APPROVED").length;
  const rejectedCount = requirements.filter((r) => r.approvalStatus === "REJECTED").length;

  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      const matchesFilter = filter === "ALL" || req.approvalStatus === filter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        req.company.toLowerCase().includes(query) ||
        req.role.toLowerCase().includes(query) ||
        req.blurb.toLowerCase().includes(query) ||
        req.stack.some((s) => s.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [requirements, filter, searchQuery]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">

      {/* EDC Header */}
      <div className="rounded-2xl p-6"
        style={{
          background: "var(--color-black-leather)",
          border: "1px solid rgba(184,149,104,0.20)",
          boxShadow: "0 4px 24px rgba(17,17,17,0.12)",
        }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: "var(--color-blush-suede)" }}>
              <Landmark size={22} style={{ color: "var(--color-soft-cream)" }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--color-soft-cream)" }}>
                  EDC Verification Hub
                </h1>
                <span className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase"
                  style={{
                    background: "rgba(157,98,95,0.20)",
                    color: "var(--color-blush-suede)",
                    border: "1px solid rgba(157,98,95,0.30)",
                  }}>
                  VERIFICATION &amp; APPROVAL DESK
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-taupe)" }}>
                Review and verify startup requisitions filed by founders. Only requirements{" "}
                <strong style={{ color: "var(--color-champagne-gold)" }}>approved by the EDC Cell</strong> will be published live to students.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/requirements"
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200"
              style={{
                background: "var(--color-champagne-gold)",
                color: "var(--color-black-leather)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--color-champagne-dark)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--color-champagne-gold)")}>
              <Eye size={14} /> View Live Student Board
            </Link>
          </div>
        </div>

        {/* Gold accent divider */}
        <div className="mt-5 mb-4 gold-divider opacity-25" />

        {/* Pipeline Metric Counters */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              key: "PENDING_APPROVAL" as const,
              label: "Pending EDC Review",
              count: pendingCount,
              sublabel: "Requires Approval",
              icon: <Clock size={14} />,
              color: "var(--color-champagne-gold)",
              activeRing: "rgba(184,149,104,0.35)",
            },
            {
              key: "APPROVED" as const,
              label: "Approved & Live",
              count: approvedCount,
              sublabel: "Published on Board",
              icon: <CheckCircle2 size={14} />,
              color: "var(--color-champagne-light)",
              activeRing: "rgba(202,176,138,0.30)",
            },
            {
              key: "REJECTED" as const,
              label: "Rejected / Flagged",
              count: rejectedCount,
              sublabel: "Not Published",
              icon: <XCircle size={14} />,
              color: "var(--color-blush-suede)",
              activeRing: "rgba(157,98,95,0.30)",
            },
            {
              key: "ALL" as const,
              label: "Total Submissions",
              count: requirements.length,
              sublabel: "All Founder Postings",
              icon: <Rocket size={14} />,
              color: "var(--color-muted-taupe)",
              activeRing: "rgba(169,156,140,0.30)",
            },
          ].map((metric) => (
            <button key={metric.key} onClick={() => setFilter(metric.key)}
              className="rounded-xl p-3 text-left transition-all duration-150"
              style={filter === metric.key
                ? {
                    background: "rgba(184,149,104,0.08)",
                    border: `1px solid ${metric.color}`,
                    boxShadow: `0 0 0 2px ${metric.activeRing}`,
                  }
                : {
                    background: "var(--color-deep-charcoal)",
                    border: "1px solid rgba(184,149,104,0.12)",
                  }}
              onMouseEnter={e => { if (filter !== metric.key) (e.currentTarget as HTMLElement).style.borderColor = "rgba(184,149,104,0.25)"; }}
              onMouseLeave={e => { if (filter !== metric.key) (e.currentTarget as HTMLElement).style.borderColor = "rgba(184,149,104,0.12)"; }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--color-muted-taupe)" }}>
                  {metric.label}
                </span>
                <span style={{ color: metric.color }}>{metric.icon}</span>
              </div>
              <p className="mt-1 font-serif text-2xl font-bold" style={{ color: metric.color }}>
                {metric.count}
              </p>
              <span className="text-[11px] font-semibold" style={{ color: metric.color, opacity: 0.8 }}>
                {metric.sublabel}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Success Alert Banner */}
      {actionSuccess && (
        <div className="mt-4 flex items-center gap-2 rounded-xl p-3.5 text-xs font-bold animate-fadeIn"
          style={{
            background: "rgba(184,149,104,0.10)",
            border: "1px solid rgba(184,149,104,0.30)",
            color: "var(--color-champagne-gold)",
          }}>
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold" style={{ color: "var(--color-muted-taupe)" }}>
            Status View:
          </span>
          {(
            [
              { key: "PENDING_APPROVAL", label: `⏳ Pending (${pendingCount})` },
              { key: "APPROVED", label: `✓ Approved (${approvedCount})` },
              { key: "REJECTED", label: `✗ Rejected (${rejectedCount})` },
              { key: "ALL", label: `All (${requirements.length})` },
            ] as const
          ).map((t) => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className="rounded-full border px-3 py-1 text-[11.5px] font-semibold transition-all duration-150"
              style={filter === t.key
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
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-muted-taupe)" }} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, stack, role..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Founder Requirements List */}
      <div className="mt-6 space-y-4">
        {filteredRequirements.map((req) => {
          const isPending = req.approvalStatus === "PENDING_APPROVAL";
          const isApproved = req.approvalStatus === "APPROVED";
          const isRejected = req.approvalStatus === "REJECTED";

          const leftBorderColor = isPending
            ? "var(--color-champagne-gold)"
            : isApproved
            ? "var(--color-champagne-light)"
            : "var(--color-blush-suede)";

          return (
            <div key={req.id}
              className="card-surface overflow-hidden"
              style={{ borderLeft: `3px solid ${leftBorderColor}` }}>
              <div className="p-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                {/* Left Requirement Details */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-medium" style={{ color: "var(--color-muted-taupe)" }}>
                      {req.id}
                    </span>
                    <span style={{ color: "var(--border)" }}>·</span>
                    <span className="font-serif text-lg font-bold" style={{ color: "var(--color-black-leather)" }}>
                      {req.role}
                    </span>
                    <span style={{ color: "var(--color-muted-taupe)" }}>at</span>
                    <span className="font-serif text-base font-semibold" style={{ color: "var(--text-secondary)" }}>
                      {req.company}
                    </span>

                    {/* Approval Status Badge */}
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
                      style={isPending
                        ? { background: "rgba(184,149,104,0.12)", color: "var(--color-champagne-gold)", border: "1px solid rgba(184,149,104,0.25)" }
                        : isApproved
                        ? { background: "rgba(202,176,138,0.12)", color: "var(--color-champagne-light)", border: "1px solid rgba(202,176,138,0.25)" }
                        : { background: "rgba(157,98,95,0.12)", color: "var(--color-blush-suede)", border: "1px solid rgba(157,98,95,0.25)" }}>
                      {isPending && <Clock size={11} />}
                      {isApproved && <ShieldCheck size={11} />}
                      {isRejected && <XCircle size={11} />}
                      {isPending
                        ? "PENDING EDC APPROVAL"
                        : isApproved
                        ? `APPROVED (${req.approvedBy || "EDC Cell"})`
                        : "REJECTED"}
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed rounded-lg p-3"
                    style={{
                      background: "rgba(184,149,104,0.05)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--divider)",
                    }}>
                    {req.blurb}
                  </p>

                  {/* Meta details */}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs"
                    style={{ color: "var(--color-muted-taupe)" }}>
                    <span className="flex items-center gap-1"><MapPin size={11} /> {req.location}</span>
                    <span className="flex items-center gap-1"><Briefcase size={11} /> {req.stipend}</span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Mail size={11} /> {req.founderEmail}
                    </span>
                    <span className="font-mono text-[11px]">Posted {req.posted}</span>
                  </div>

                  {/* Tech stack */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {req.stack.map((s) => (
                      <span key={s} className="tag-green rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex flex-col gap-2 shrink-0 pt-3 lg:pt-0 lg:w-52"
                  style={{ borderTop: "1px solid var(--divider)" }}>
                  <div className="lg:border-t-0 lg:pt-0">
                    {isPending && (
                      <>
                        <button onClick={() => handleApprove(req.id, req.role)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold mb-2 transition-all duration-200"
                          style={{
                            background: "var(--color-champagne-gold)",
                            color: "var(--color-black-leather)",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--color-champagne-dark)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "var(--color-champagne-gold)")}>
                          <CheckCircle2 size={14} /> Approve &amp; Publish
                        </button>

                        {/* Reject — show reason input inline */}
                        {rejectingId === req.id ? (
                          <div className="rounded-lg p-3 mb-2"
                            style={{
                              background: "rgba(157,98,95,0.07)",
                              border: "1px solid rgba(157,98,95,0.30)",
                            }}>
                            <p className="text-[11px] font-bold mb-1.5" style={{ color: "var(--color-blush-suede)" }}>
                              Reason for rejection *
                            </p>
                            <textarea
                              autoFocus
                              rows={3}
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              placeholder="e.g. Does not align with campus incubation guidelines, missing company details..."
                              className="w-full rounded-md px-2.5 py-2 text-[11px] resize-none outline-none"
                              style={{
                                background: "rgba(245,239,231,0.85)",
                                border: "1px solid rgba(157,98,95,0.30)",
                                color: "#2B241E",
                              }}
                            />
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => handleReject(req.id, req.role)}
                                disabled={!rejectReason.trim()}
                                className="flex-1 rounded-md py-1.5 text-[11px] font-bold transition-all"
                                style={{
                                  background: rejectReason.trim() ? "var(--color-blush-suede)" : "rgba(157,98,95,0.30)",
                                  color: "#fff",
                                  cursor: rejectReason.trim() ? "pointer" : "not-allowed",
                                }}>
                                Confirm Reject
                              </button>
                              <button
                                onClick={() => { setRejectingId(null); setRejectReason(""); }}
                                className="flex-1 rounded-md py-1.5 text-[11px] font-semibold transition-all"
                                style={{
                                  background: "transparent",
                                  border: "1px solid var(--border)",
                                  color: "var(--color-muted-taupe)",
                                }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => { setRejectingId(req.id); setRejectReason(""); }}
                            className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all duration-200 mb-2"
                            style={{
                              background: "transparent",
                              border: "1px solid rgba(157,98,95,0.40)",
                              color: "var(--color-blush-suede)",
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(157,98,95,0.08)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                            <XCircle size={14} /> Reject Requisition
                          </button>
                        )}
                      </>
                    )}

                    {isApproved && (
                      <div className="rounded-lg p-2.5 text-center mb-2"
                        style={{
                          background: "rgba(184,149,104,0.08)",
                          border: "1px solid rgba(184,149,104,0.22)",
                        }}>
                        <p className="flex items-center justify-center gap-1 text-[11.5px] font-bold"
                          style={{ color: "var(--color-champagne-gold)" }}>
                          <ShieldCheck size={14} /> Live on Student Board
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--color-muted-taupe)" }}>
                          Students can now view and apply.
                        </p>
                      </div>
                    )}

                    {isRejected && (
                      <div className="rounded-lg p-2.5 mb-2"
                        style={{
                          background: "rgba(157,98,95,0.08)",
                          border: "1px solid rgba(157,98,95,0.25)",
                        }}>
                        <p className="text-[11.5px] font-bold flex items-center gap-1" style={{ color: "var(--color-blush-suede)" }}>
                          <XCircle size={13} /> Requisition Rejected
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--color-muted-taupe)" }}>
                          Hidden from the student board.
                        </p>
                        {req.rejectionReason && (
                          <div className="mt-2 rounded-md px-2 py-1.5"
                            style={{
                              background: "rgba(157,98,95,0.10)",
                              border: "1px solid rgba(157,98,95,0.20)",
                            }}>
                            <p className="font-mono text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-blush-suede)", opacity: 0.8 }}>
                              Reason
                            </p>
                            <p className="text-[11px] leading-relaxed" style={{ color: "#7A4040" }}>
                              {req.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <a href={`mailto:${req.founderEmail}?subject=EDC Requisition Verification Inquiry: ${req.role}`}
                      className="flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition-all duration-150"
                      style={{
                        background: "transparent",
                        border: "1px solid var(--border)",
                        color: "var(--color-muted-taupe)",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--color-muted-taupe)"; }}>
                      <Mail size={12} /> Contact Founder
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRequirements.length === 0 && (
        <div className="mt-12 rounded-2xl p-12 text-center"
          style={{
            border: "1.5px dashed var(--border)",
            background: "var(--surface)",
          }}>
          <p className="font-serif text-lg font-bold" style={{ color: "var(--color-black-leather)" }}>
            No requisitions under this filter
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--color-muted-taupe)" }}>
            {filter === "PENDING_APPROVAL"
              ? "All founder requisitions have been reviewed! New submissions will appear here for verification."
              : "Try adjusting your search query or selecting another status filter."}
          </p>
        </div>
      )}
    </main>
  );
}
