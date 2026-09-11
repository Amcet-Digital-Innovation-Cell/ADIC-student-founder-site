import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { AuthGate } from "@/components/auth/AuthGate";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Founder Hub - Talent Requisition Portal",
  description: "Where founders requisition talent, not just post job ads. Connects students, founders, and EDC incubation cells through EDC-verified requirements.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased" style={{ background: "var(--bg)" }}>
        <AuthProvider>
          <AuthGate>
            <Navbar />
            <div className="min-h-[calc(100vh-140px)]">{children}</div>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
