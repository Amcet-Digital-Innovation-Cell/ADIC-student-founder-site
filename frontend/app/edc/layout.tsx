"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

// Client-side guard for the EDC area. The backend independently enforces admin-only
// access (requireEdcUser + EDC_USER_IDS), so this only controls navigation/UX.
export default function EdcLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, role, isLoading } = useAuth();

  const allowed = isAuthenticated && role === "edc";

  useEffect(() => {
    if (isLoading || allowed) return;
    router.replace("/login");
  }, [isLoading, allowed, router]);

  if (!allowed) {
    return (
      <div className="p-12 text-center font-mono text-xs" style={{ color: "#7A6C5B" }}>
        Checking access...
      </div>
    );
  }

  return <>{children}</>;
}
