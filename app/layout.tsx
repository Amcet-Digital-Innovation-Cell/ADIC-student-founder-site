import type { Metadata } from "next";
import "./globals.css";
import { Inter, Manrope, Cormorant_Garamond } from "next/font/google";
import { AuthProvider } from "@/lib/AuthContext";
import { AuthGate } from "@/components/auth/AuthGate";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "Founder Hub - Talent Requisition Portal",
  description: "Where founders requisition talent, not just post job ads. Connects students, founders, and EDC incubation cells through EDC-verified requirements.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${cormorant.variable}`}>
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
