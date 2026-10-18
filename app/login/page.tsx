"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Rocket,
  Landmark,
  ArrowRight,
  Sparkles,
  Linkedin,
  Github,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import type { UserRole, StudentProfile, FounderProfile, EdcProfile, AuthUser } from "@/types";
import { Input } from "@/components/ui/input";

const POPULAR_DEPARTMENTS = [
  "Computer Science & Engineering",
  "Artificial Intelligence & Data Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical & Electronics",
  "Mechanical Engineering",
  "MBA / Management",
];

const POPULAR_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "Python",
  "Node.js",
  "Tailwind CSS",
  "Machine Learning",
  "PostgreSQL",
  "Embedded C / Arduino",
  "UI/UX (Figma)",
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();

  const initialRole = (searchParams.get("role") as UserRole) || "student";
  const [role, setRole] = useState<UserRole>(initialRole);
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Common sign in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Student register state
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "Computer Science & Engineering",
    customDepartment: "",
    college: "",
    yearOfStudy: "3rd Year",
    rollNo: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    skills: ["React", "TypeScript", "Node.js"] as string[],
    newSkill: "",
    bio: "",
  });

  // Founder register state
  const [founderForm, setFounderForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    sector: "B2B SaaS",
    location: "Remote / Hybrid",
    hiringNeeds: "",
  });

  // EDC register state
  const [edcForm, setEdcForm] = useState({
    name: "",
    email: "",
    password: "",
    institutionName: "",
    cellName: "E-Cell & Incubation Center",
    designation: "Faculty In-Charge & Incubation Lead",
  });

  useEffect(() => {
    const r = searchParams.get("role") as UserRole;
    if (r && ["student", "founder", "edc"].includes(r)) {
      setRole(r);
    }
  }, [searchParams]);

  const redirectToRolePortal = (userRole: UserRole) => {
    if (userRole === "student") {
      router.push("/requirements");
    } else if (userRole === "founder") {
      router.push("/requirements");
    } else {
      router.push("/edc");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }
    const result = await login(email, role, password);
    if (!result.success) {
      setError(result.message || "Invalid credentials. Please try again.");
      return;
    }
    redirectToRolePortal(role);
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    setError(null);
    setSuccessMessage(null);

    if (!trimmedEmail) {
      setError("Please enter your email address first.");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail.toLowerCase(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        setError(error.message || "Unable to send password reset email.");
        return;
      }

      setSuccessMessage("Password reset link sent. Check your inbox and follow the instructions.");
    } catch (err: any) {
      setError(err?.message || "Unable to send password reset email.");
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!studentForm.name || !studentForm.email) {
      setError("Please fill in your name and email.");
      return;
    }
    if (!studentForm.password.trim()) {
      setError("Please create a password.");
      return;
    }

    const dept =
      studentForm.department === "Other"
        ? studentForm.customDepartment || "Engineering"
        : studentForm.department;

    const studentProfile: StudentProfile = {
      department: dept,
      college: studentForm.college || "IIT Madras / Regional College",
      yearOfStudy: studentForm.yearOfStudy,
      rollNo: studentForm.rollNo,
      linkedinUrl: studentForm.linkedinUrl,
      githubUrl: studentForm.githubUrl,
      portfolioUrl: studentForm.portfolioUrl,
      skills: studentForm.skills,
      bio: studentForm.bio,
    };

    const newUser: AuthUser = {
      id: `USR-STU-${Date.now().toString().slice(-4)}`,
      name: studentForm.name,
      email: studentForm.email.toLowerCase(),
      role: "student",
      createdAt: new Date().toISOString().split("T")[0],
      studentProfile,
    };

    const result = await register(newUser, studentForm.password);
    if (!result.success) {
      setError(result.message || "Registration failed. Please try again.");
      return;
    }
    if (result.message && result.message.includes("Please check your email")) {
      setError(result.message);
      return;
    }
    redirectToRolePortal("student");
  };

  const handleFounderRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!founderForm.name || !founderForm.email || !founderForm.companyName) {
      setError("Please fill in your name, work email, and company name.");
      return;
    }
    if (!founderForm.password.trim()) {
      setError("Please create a password.");
      return;
    }

    const founderProfile: FounderProfile = {
      companyName: founderForm.companyName,
      sector: founderForm.sector,
      stage: "Early Traction",
      location: founderForm.location,
      hiringNeeds: founderForm.hiringNeeds,
    };

    const newUser: AuthUser = {
      id: `USR-FND-${Date.now().toString().slice(-4)}`,
      name: founderForm.name,
      email: founderForm.email.toLowerCase(),
      role: "founder",
      createdAt: new Date().toISOString().split("T")[0],
      founderProfile,
    };

    const result = await register(newUser, founderForm.password);
    if (!result.success) {
      setError(result.message || "Registration failed. Please try again.");
      return;
    }
    if (result.message && result.message.includes("Please check your email")) {
      setError(result.message);
      return;
    }
    redirectToRolePortal("founder");
  };

  const handleEdcRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edcForm.name || !edcForm.email || !edcForm.institutionName) {
      setError("Please fill in your name, institutional email, and institute name.");
      return;
    }
    if (!edcForm.password.trim()) {
      setError("Please create a password.");
      return;
    }

    const edcProfile: EdcProfile = {
      institutionName: edcForm.institutionName,
      cellName: edcForm.cellName,
      designation: edcForm.designation,
      startupsIncubated: 10,
    };

    const newUser: AuthUser = {
      id: `USR-EDC-${Date.now().toString().slice(-4)}`,
      name: edcForm.name,
      email: edcForm.email.toLowerCase(),
      role: "edc",
      createdAt: new Date().toISOString().split("T")[0],
      edcProfile,
    };

    const result = await register(newUser, edcForm.password);
    if (!result.success) {
      setError(result.message || "Registration failed. Please try again.");
      return;
    }
    if (result.message && result.message.includes("Please check your email")) {
      setError(result.message);
      return;
    }
    redirectToRolePortal("edc");
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-start pt-10 pb-16 px-4 sm:px-6">
      {/* Title & Subtitle */}
      <div className="text-center max-w-xl mx-auto">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "#111111" }}>
          {mode === "signin" ? "Sign In to Your Portal" : "Create Your Account"}
        </h1>
        <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed" style={{ color: "#665C52" }}>
          {role === "student" &&
            "Student Portal: Browse approved requirements, track applications, and link your GitHub/LinkedIn."}
          {role === "founder" &&
            "Founder Portal: Post talent requisitions routed to the EDC Cell for verification."}
          {role === "edc" &&
            "EDC Hub: Review and approve founder requirement postings for students."}
        </p>
      </div>

      {/* Main Role Selection Pill Tabs (Student vs Founder) */}
      <div className="mt-7 w-full max-w-md mx-auto grid grid-cols-2 gap-2 p-1.5 rounded-2xl"
        style={{ background: "#E5DDCF", border: "1px solid #D8CFBF" }}>
        {[
          { key: "student" as const, label: "Student", icon: GraduationCap },
          { key: "founder" as const, label: "Founder", icon: Rocket },
        ].map(({ key, label, icon: Icon }) => {
          const isActive = role === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => { setRole(key); setError(null); }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200"
              style={isActive
                ? {
                    background: "#111111",
                    color: "#F3EBDD",
                    boxShadow: "0 2px 8px rgba(17,17,17,0.15)",
                  }
                : {
                    background: "transparent",
                    color: "#5A4E42",
                  }}
            >
              <Icon size={16} style={{ color: isActive ? "#B89568" : "#8A7D6E" }} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Auth Mode Switcher (Sign In vs Register / Create Account) */}
      <div className="mt-5 flex justify-center">
        <div className="inline-flex rounded-xl p-1 gap-1"
          style={{ background: "#1F1C1A" }}>
          {(["signin", "register"] as const).map((m) => {
            const isActive = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="rounded-lg px-6 py-2 text-xs font-bold transition-all duration-200"
                style={isActive
                  ? { background: "#B89568", color: "#111111" }
                  : { background: "transparent", color: "#A99C8C" }}
              >
                {m === "signin" ? "Sign In" : "Register / Create Account"}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mt-4 max-w-md w-full rounded-xl p-3 text-xs flex items-center gap-2"
          style={{
            background: "rgba(157,98,95,0.12)",
            border: "1px solid rgba(157,98,95,0.30)",
            color: "#9D625F",
          }}>
          <ShieldAlert size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 max-w-md w-full rounded-xl p-3 text-xs flex items-center gap-2"
          style={{
            background: "rgba(87, 138, 95, 0.12)",
            border: "1px solid rgba(87, 138, 95, 0.28)",
            color: "#386B43",
          }}>
          <ShieldAlert size={15} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* FORM CARD CONTAINER */}
      <div className="mt-6 w-full max-w-lg rounded-2xl p-6 sm:p-8"
        style={{
          background: "#ECE5DA",
          border: "1px solid #DFD7C8",
          boxShadow: "0 4px 24px rgba(17,17,17,0.04)",
        }}>

        {/* SIGN IN FORM */}
        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold tracking-wide mb-1.5" style={{ color: "#2B241E" }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === "student"
                    ? "student@campus.edu"
                    : role === "founder"
                    ? "founder@company.co"
                    : "ecell.head@university.ac.in"
                }
                className="w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none transition-all"
                style={{
                  background: "#F5EFE7",
                  border: "1px solid #DCD3C4",
                  color: "#111111",
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wide mb-1.5" style={{ color: "#2B241E" }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none transition-all"
                style={{
                  background: "#F5EFE7",
                  border: "1px solid #DCD3C4",
                  color: "#111111",
                }}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] font-semibold underline-offset-2 transition hover:underline"
                style={{ color: "#7C6859" }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition-all duration-200 shadow-sm"
              style={{
                background: "#B38E60",
                color: "#FFFFFF",
                border: "1px solid #A68154",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#9F7C50")}
              onMouseLeave={e => (e.currentTarget.style.background = "#B38E60")}>
              Sign In as {role.toUpperCase()} <ArrowRight size={15} />
            </button>
          </form>
        )}

        {/* STUDENT REGISTRATION FORM */}
        {mode === "register" && role === "student" && (
          <form onSubmit={handleStudentRegister} className="space-y-4">
            <div className="pb-2 border-b border-[#D8CFBF]">
              <h3 className="font-serif text-base font-bold" style={{ color: "#111111" }}>Student Profile Registration</h3>
              <p className="text-[11px]" style={{ color: "#665C52" }}>
                Link your GitHub, LinkedIn &amp; department details to apply for startup roles.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "#2B241E" }}>Full Name *</label>
                <Input required value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="e.g. Priya Sharma" className="text-xs bg-[#F5EFE7] border-[#DCD3C4]" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "#2B241E" }}>Email Address *</label>
                <Input type="email" required value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  placeholder="priya@college.edu" className="text-xs bg-[#F5EFE7] border-[#DCD3C4]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: "#2B241E" }}>Password *</label>
              <Input type="password" required value={studentForm.password}
                onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                placeholder="••••••••" className="text-xs bg-[#F5EFE7] border-[#DCD3C4]" />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: "#2B241E" }}>Department / Branch</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {POPULAR_DEPARTMENTS.slice(0, 4).map((dept) => (
                  <button key={dept} type="button"
                    onClick={() => setStudentForm({ ...studentForm, department: dept })}
                    className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition"
                    style={studentForm.department === dept
                      ? { background: "#B38E60", color: "#FFFFFF", borderColor: "#B38E60" }
                      : { background: "#F5EFE7", borderColor: "#DCD3C4", color: "#5A4E42" }}>
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-1 text-xs font-bold mb-1" style={{ color: "#2B241E" }}>
                  <Linkedin size={12} className="text-[#0A66C2]" /> LinkedIn URL
                </label>
                <Input type="url" value={studentForm.linkedinUrl}
                  onChange={(e) => setStudentForm({ ...studentForm, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/..." className="text-xs bg-[#F5EFE7] border-[#DCD3C4]" />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-bold mb-1" style={{ color: "#2B241E" }}>
                  <Github size={12} /> GitHub URL
                </label>
                <Input type="url" value={studentForm.githubUrl}
                  onChange={(e) => setStudentForm({ ...studentForm, githubUrl: e.target.value })}
                  placeholder="https://github.com/..." className="text-xs bg-[#F5EFE7] border-[#DCD3C4]" />
              </div>
            </div>

            <button type="submit"
              className="w-full rounded-xl py-3 text-xs font-bold shadow-sm transition"
              style={{ background: "#B38E60", color: "#FFFFFF" }}>
              Complete Registration &amp; Open Roles <ArrowRight size={14} className="inline ml-1" />
            </button>
          </form>
        )}

        {/* FOUNDER REGISTRATION FORM */}
        {mode === "register" && role === "founder" && (
          <form onSubmit={handleFounderRegister} className="space-y-4">
            <div className="pb-2 border-b border-[#D8CFBF]">
              <h3 className="font-serif text-base font-bold" style={{ color: "#111111" }}>Founder Registration</h3>
              <p className="text-[11px]" style={{ color: "#665C52" }}>
                Post talent requisitions directly to verified university students.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "#2B241E" }}>Founder Name *</label>
                <Input required value={founderForm.name}
                  onChange={(e) => setFounderForm({ ...founderForm, name: e.target.value })}
                  placeholder="e.g. Arun Kumar" className="text-xs bg-[#F5EFE7] border-[#DCD3C4]" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "#2B241E" }}>Work Email *</label>
                <Input type="email" required value={founderForm.email}
                  onChange={(e) => setFounderForm({ ...founderForm, email: e.target.value })}
                  placeholder="arun@ashbolt.co" className="text-xs bg-[#F5EFE7] border-[#DCD3C4]" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "#2B241E" }}>Startup Name *</label>
                <Input required value={founderForm.companyName}
                  onChange={(e) => setFounderForm({ ...founderForm, companyName: e.target.value })}
                  placeholder="e.g. Ash &amp; Bolt" className="text-xs bg-[#F5EFE7] border-[#DCD3C4]" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "#2B241E" }}>Password *</label>
                <Input type="password" required value={founderForm.password}
                  onChange={(e) => setFounderForm({ ...founderForm, password: e.target.value })}
                  placeholder="••••••••" className="text-xs bg-[#F5EFE7] border-[#DCD3C4]" />
              </div>
            </div>

            <button type="submit"
              className="w-full rounded-xl py-3 text-xs font-bold shadow-sm transition"
              style={{ background: "#B38E60", color: "#FFFFFF" }}>
              Register &amp; Post Requirement <ArrowRight size={14} className="inline ml-1" />
            </button>
          </form>
        )}

      </div>

      {/* EDC Admin Portal Link at bottom */}
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={() => { setRole("edc"); setError(null); }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide transition-all"
          style={{ color: "#7A6C5B" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#111111")}
          onMouseLeave={e => (e.currentTarget.style.color = "#7A6C5B")}
        >
          <Landmark size={14} style={{ color: "#B89568" }} />
          <span>🏛️ EDC Cell / Incubation Admin Portal Sign In →</span>
        </button>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center font-mono text-xs" style={{ color: "#7A6C5B" }}>
          Loading Sign In portal...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
