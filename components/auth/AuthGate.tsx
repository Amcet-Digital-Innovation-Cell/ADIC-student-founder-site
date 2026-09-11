"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { AuthGateway } from "@/components/auth/AuthGateway";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-8 w-8 animate-spin">
            <div className="absolute inset-0 rotate-[-8deg] rounded-sm bg-mustard" />
            <div className="absolute inset-0 rotate-[6deg] rounded-sm bg-ink opacity-80" />
          </div>
          <p className="font-mono text-xs tracking-wider text-char/70">
            LOADING TALENT PLATFORM...
          </p>
        </div>
      </div>
    );
  }

  // Always allow rendering the Home page and public routes
  return <>{children}</>;
}
