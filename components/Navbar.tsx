"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, GraduationCap, Rocket, Landmark, User, LogOut,
  ChevronDown, FileText, Send, Clock, Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { UserProfileModal } from "@/components/UserProfileModal";
import type { UserRole } from "@/types";

export function Navbar() {
  const pathname = usePathname();
  const { user, role, logout, isAuthenticated } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const roleBadge = (r: UserRole | null) => {
    const map: Record<string, { bg: string; text: string }> = {
      student: { bg: "rgba(184,149,104,0.15)", text: "var(--color-champagne-gold)" },
      founder: { bg: "rgba(157,98,95,0.15)", text: "var(--color-blush-suede)" },
      edc:     { bg: "rgba(184,149,104,0.20)", text: "var(--color-champagne-dark)" },
    };
    return map[r ?? ""] ?? { bg: "rgba(169,156,140,0.15)", text: "var(--color-muted-taupe)" };
  };

  const roleIcon = (r: UserRole | null) => {
    if (r === "student") return <GraduationCap size={11} className="shrink-0" />;
    if (r === "founder") return <Rocket size={11} className="shrink-0" />;
    if (r === "edc")     return <Landmark size={11} className="shrink-0" />;
    return <User size={11} className="shrink-0" />;
  };

  const badge = roleBadge(role);

  return (
    <>
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 sm:px-6"
        style={{
          background: "var(--color-black-leather)",
          borderBottom: "1px solid rgba(184,149,104,0.20)",
          boxShadow: "0 2px 20px rgba(17,17,17,0.25)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            {/* Logo mark */}
            <div className="flex h-7 w-7 items-center justify-center rounded-md font-bold text-xs shadow-sm"
              style={{ background: "var(--color-champagne-gold)", color: "var(--color-black-leather)" }}>
              <span className="font-serif text-sm font-extrabold">F</span>
            </div>
            <span className="font-mono text-[13px] font-bold tracking-[0.14em] uppercase"
              style={{ color: "var(--color-soft-cream)" }}>
              FOUNDER <span style={{ color: "var(--color-champagne-gold)" }}>HUB</span>
            </span>
          </Link>
        </div>

        {/* Nav links for authenticated users — hidden on login/root page */}
        {isAuthenticated && pathname !== "/login" && pathname !== "/" && (
          <nav className="flex items-center gap-1 rounded-xl p-1"
            style={{
              background: "var(--color-deep-charcoal)",
              border: "1px solid rgba(184,149,104,0.18)",
            }}>
            {role === "student" && (
              <>
                <Link href="/requirements"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition"
                  style={pathname?.startsWith("/requirements") || pathname === "/"
                    ? { background: "var(--color-champagne-gold)", color: "var(--color-black-leather)" }
                    : { color: "var(--color-muted-taupe)" }}>
                  <Briefcase size={13} />
                  <span>Roles Board</span>
                </Link>
                <Link href="/applications"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition"
                  style={pathname?.startsWith("/applications")
                    ? { background: "var(--color-champagne-gold)", color: "var(--color-black-leather)" }
                    : { color: "var(--color-muted-taupe)" }}>
                  <Send size={13} />
                  <span>My Applications</span>
                </Link>
              </>
            )}

            {role === "founder" && (
              <>
                <Link href="/requirements"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition"
                  style={pathname?.startsWith("/requirements")
                    ? { background: "var(--color-champagne-gold)", color: "var(--color-black-leather)" }
                    : { color: "var(--color-muted-taupe)" }}>
                  <Rocket size={13} />
                  <span>Roles Board</span>
                </Link>
                <Link href="/applications"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition"
                  style={pathname?.startsWith("/applications")
                    ? { background: "var(--color-champagne-gold)", color: "var(--color-black-leather)" }
                    : { color: "var(--color-muted-taupe)" }}>
                  <FileText size={13} />
                  <span>Applicants</span>
                </Link>
              </>
            )}


            {role === "edc" && (
              <>
                <Link href="/edc"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition"
                  style={pathname?.startsWith("/edc")
                    ? { background: "var(--color-champagne-gold)", color: "var(--color-black-leather)" }
                    : { color: "var(--color-muted-taupe)" }}>
                  <Landmark size={13} />
                  <span>Approval Hub</span>
                </Link>
                <Link href="/requirements"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition"
                  style={pathname?.startsWith("/requirements")
                    ? { background: "var(--color-champagne-gold)", color: "var(--color-black-leather)" }
                    : { color: "var(--color-muted-taupe)" }}>
                  <Briefcase size={13} />
                  <span>Live Board</span>
                </Link>
              </>
            )}
          </nav>
        )}

        {/* Right - Profile dropdown when authenticated — hidden on login/root page */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user && pathname !== "/login" && pathname !== "/" && (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition"
                style={{
                  background: "var(--color-deep-charcoal)",
                  border: "1px solid rgba(184,149,104,0.20)",
                  color: "var(--color-soft-cream)",
                }}>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs"
                  style={{ background: "var(--color-champagne-gold)", color: "var(--color-black-leather)" }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden flex-col text-left sm:flex">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-semibold" style={{ color: "var(--color-soft-cream)" }}>
                      {user.name.split(" ")[0]}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase"
                      style={{ background: badge.bg, color: badge.text }}>
                      {roleIcon(role)}&nbsp;{role}
                    </span>
                  </div>
                  <span className="text-[10px] truncate max-w-[120px]" style={{ color: "var(--color-muted-taupe)" }}>
                    {role === "student" ? user.studentProfile?.department?.split(" ")[0] || "Student"
                     : role === "founder" ? user.founderProfile?.companyName || "Founder"
                     : "EDC Lead"}
                  </span>
                </div>
                <ChevronDown size={12} style={{ color: "var(--color-muted-taupe)" }} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl p-2 animate-pop-in"
                    style={{
                      background: "var(--color-deep-charcoal)",
                      border: "1px solid rgba(184,149,104,0.22)",
                      boxShadow: "0 16px 48px rgba(17,17,17,0.35), 0 2px 10px rgba(17,17,17,0.20)",
                    }}>
                    <div className="px-3 py-2.5" style={{ borderBottom: "1px solid rgba(184,149,104,0.15)" }}>
                      <p className="font-serif text-sm font-bold" style={{ color: "var(--color-soft-cream)" }}>{user.name}</p>
                      <p className="text-[11px]" style={{ color: "var(--color-muted-taupe)" }}>{user.email}</p>
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase"
                        style={{ background: badge.bg, color: badge.text }}>
                        {roleIcon(role)} {role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link href="/applications" onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition mb-1"
                        style={{ background: "rgba(184,149,104,0.12)", color: "var(--color-champagne-gold)" }}>
                        <Send size={13} />
                        {role === "student" ? "📋 My Applications (Track)" : role === "founder" ? "📋 Request Review" : "📥 Candidate Inflow"}
                      </Link>

                      <button onClick={() => { setMenuOpen(false); setProfileOpen(true); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition"
                        style={{ color: "var(--color-muted-taupe)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(184,149,104,0.08)"; (e.currentTarget as HTMLElement).style.color = "var(--color-soft-cream)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--color-muted-taupe)"; }}>
                        <User size={13} style={{ color: "var(--color-champagne-gold)" }} />
                        {role === "student" ? "My Profile & Links" : "View Profile"}
                      </button>

                      <div className="pt-1" style={{ borderTop: "1px solid rgba(184,149,104,0.12)" }}>
                        <button onClick={() => { logout(); setMenuOpen(false); }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition"
                          style={{ color: "var(--color-blush-suede)" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(157,98,95,0.10)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                          <LogOut size={13} /> Log Out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
