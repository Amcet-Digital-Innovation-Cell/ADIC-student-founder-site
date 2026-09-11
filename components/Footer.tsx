"use client";

import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="mt-auto px-6 py-5"
      style={{
        background: "var(--color-black-leather)",
        borderTop: "1px solid rgba(184,149,104,0.18)",
      }}
    >
      {/* Gold accent line */}
      <div className="mx-auto mb-4 max-w-6xl">
        <div className="gold-divider" />
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={13} style={{ color: "var(--color-champagne-gold)" }} />
          <span
            className="font-mono text-[11px] font-medium tracking-wide"
            style={{ color: "var(--color-muted-taupe)" }}
          >
            Founder Requirement &mdash; EDC-verified talent requisitions
          </span>
        </div>
        <Link
          href="/requirements"
          className="footer-link flex items-center gap-1 font-mono text-[11px] font-semibold transition"
          style={{ color: "var(--color-champagne-gold)" }}
        >
          How it works <ArrowUpRight size={11} />
        </Link>
      </div>
    </footer>
  );
}
