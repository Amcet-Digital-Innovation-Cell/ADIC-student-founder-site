"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Rocket,
  Landmark,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Briefcase,
  Users,
  Linkedin,
  Github,
} from "lucide-react";
import { getRequirements, getStartups } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import type { Requirement, Startup } from "@/types";
import { Card } from "@/components/ui/card";
import { UserProfileModal } from "@/components/UserProfileModal";

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    setDataLoading(true);
    Promise.all([getRequirements(), getStartups()]).then(([reqs, stps]) => {
      setRequirements(reqs);
      setStartups(stps);
      setDataLoading(false);
    }).catch(() => setDataLoading(false));
  }, []);

  const open = requirements.filter((r) => r.status === "OPEN").length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Personalized Welcome Banner */}
      <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink font-serif text-xl font-bold text-paper shadow-sm">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-ink">
                  Welcome back, {user?.name || "Member"}
                </h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                    role === "student"
                      ? "bg-sage/15 text-sage"
                      : role === "founder"
                      ? "bg-mustard/20 text-ink"
                      : "bg-rust/15 text-rust"
                  }`}
                >
                  {role}
                </span>
              </div>
              <p className="text-xs text-char/70 mt-0.5">
                {role === "student" &&
                  `Department: ${user?.studentProfile?.department || "Student"} · ${
                    user?.studentProfile?.college || "Campus"
                  }`}
                {role === "founder" &&
                  `Startup: ${user?.founderProfile?.companyName || "Company"} · ${
                    user?.founderProfile?.sector || "Sector"
                  }`}
                {role === "edc" &&
                  `Incubation Hub: ${user?.edcProfile?.institutionName || "Institute"}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-1.5 self-start rounded-md border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-char hover:bg-white transition sm:self-auto"
          >
            ✏️ Manage My Profile & Links
          </button>
        </div>

        {/* Student Specific Profile Status */}
        {role === "student" && user?.studentProfile && (
          <div className="mt-5 rounded-lg border border-sage/30 bg-sage/5 p-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs">
            <div className="flex items-center gap-2 text-sage font-bold">
              <CheckCircle size={15} />
              <span>Student Profile Verified & Active:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-char/80">
              {user.studentProfile.linkedinUrl && (
                <a
                  href={user.studentProfile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#0A66C2] hover:underline"
                >
                  <Linkedin size={13} /> LinkedIn
                </a>
              )}
              {user.studentProfile.githubUrl && (
                <a
                  href={user.studentProfile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-ink hover:underline"
                >
                  <Github size={13} /> GitHub
                </a>
              )}
              <span className="font-mono text-char/60">
                {user.studentProfile.skills?.length || 0} skills linked
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {dataLoading ? (
          [0,1,2].map((i) => (
            <Card key={i} className="border-solid bg-white p-5 text-center shadow-xs">
              <div className="mx-auto mb-2 h-8 w-16 animate-pulse rounded-lg bg-gray-200" />
              <div className="mx-auto h-3 w-28 animate-pulse rounded bg-gray-100" />
            </Card>
          ))
        ) : (
          <>
            <Card className="border-solid bg-white p-5 text-center shadow-xs">
              <p className="font-serif text-3xl font-bold text-ink">{requirements.length}</p>
              <p className="mt-1 text-xs text-char/70 font-semibold">Total Requisitions Filed</p>
            </Card>
            <Card className="border-solid bg-white p-5 text-center shadow-xs">
              <p className="font-serif text-3xl font-bold text-sage">{open}</p>
              <p className="mt-1 text-xs text-char/70 font-semibold">Currently Open for Applications</p>
            </Card>
            <Card className="border-solid bg-white p-5 text-center shadow-xs">
              <p className="font-serif text-3xl font-bold text-mustard">{startups.length}</p>
              <p className="mt-1 text-xs text-char/70 font-semibold">Active Startups Hiring</p>
            </Card>
          </>
        )}
      </div>

      {/* Action Links */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/requirements"
          className="rounded-md bg-ink px-5 py-2.5 text-xs font-bold text-paper hover:bg-mustard hover:text-ink transition"
        >
          View Open Requirements
        </Link>
        <Link
          href="/startups"
          className="rounded-md border border-line bg-white px-5 py-2.5 text-xs font-bold text-ink hover:bg-paper transition"
        >
          View Startups Directory
        </Link>
        <Link
          href="/applications"
          className="rounded-md border border-line bg-white px-5 py-2.5 text-xs font-bold text-ink hover:bg-paper transition"
        >
          Request Review
        </Link>
        {role === "edc" && (
          <Link
            href="/edc"
            className="rounded-md border border-rust/40 bg-rust/10 px-5 py-2.5 text-xs font-bold text-rust hover:bg-rust/20 transition"
          >
            🏛️ Open EDC Talent Hub
          </Link>
        )}
      </div>

      <UserProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </main>
  );
}
