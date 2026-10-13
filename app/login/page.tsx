"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Rocket,
  ArrowRight,
  Sparkles,
  Linkedin,
  Github,
  ShieldAlert,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import type { UserRole, StudentProfile, FounderProfile, AuthUser } from "@/types";
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
  const { login, register, isAuthenticated, role: currentRole } = useAuth();

  // The public portal only serves Student and Founder; EDC admins use their own login.
  const PUBLIC_ROLES = ["student", "founder"];
  const roleParam = searchParams.get("role") as UserRole;
  const initialRole: UserRole = PUBLIC_ROLES.includes(roleParam) ? roleParam : "student";
  const [role, setRole] = useState<UserRole>(initialRole);
  const [mode, setMode] = useState<"signin" | "register">(
    searchParams.get("mode") === "register" ? "register" : "signin"
  );
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common sign in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

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
    companyDescription: "",
    websiteUrl: "",
  });

  useEffect(() => {
    const r = searchParams.get("role") as UserRole;
    if (r && PUBLIC_ROLES.includes(r)) {
      setRole(r);
    }
  }, [searchParams]);

  const redirectToRolePortal = (userRole: UserRole) => {
    if (userRole === "edc") {
      router.push("/edc");
    } else {
      router.push("/requirements");
    }
  };

  // Already signed in: send each role to its own portal instead of showing the public login.
  useEffect(() => {
    if (isAuthenticated && currentRole) redirectToRolePortal(currentRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentRole]);

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
    setIsSubmitting(true);
    // No role is sent: the role is resolved from the backend profile after authentication.
    const result = await login(email, undefined, password);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.message || "Invalid credentials. Please try again.");
      return;
    }
    // Redirect is handled by the useEffect watching isAuthenticated + currentRole
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
      companyDescription: founderForm.companyDescription,
      websiteUrl: founderForm.websiteUrl,
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

  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-start pt-10 pb-16 px-4 sm:px-6">
      {/* Title & Subtitle */}
      <div className="text-center max-w-xl mx-auto">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "#111111" }}>
          {mode === "signin" ? "Sign In to Your Portal" : "Create Your Account"}
        </h1>
        <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed" style={{ color: "#665C52" }}>
          {mode === "signin" &&
            "Enter your email and password. You'll be taken to the right dashboard automatically."}
          {mode === "register" && role === "student" &&
            "Student Portal: Browse approved requirements, track applications, and link your GitHub/LinkedIn."}
          {mode === "register" && role === "founder" &&
            "Founder Portal: Post talent requisitions routed to the EDC Cell for verification."}
        </p>
      </div>

      <div className="mt-2" />

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
                  role === "student" ? "student@campus.edu" : "founder@company.co"
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm outline-none transition-all"
                  style={{
                    background: "#F5EFE7",
                    border: "1px solid #DCD3C4",
                    color: "#111111",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#7C6859] hover:text-[#111111] transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "#B38E60",
                color: "#FFFFFF",
                border: "1px solid #A68154",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#9F7C50")}
              onMouseLeave={e => (e.currentTarget.style.background = "#B38E60")}>
              {isSubmitting ? "Signing in..." : <>Login <ArrowRight size={15} /></>}
            </button>

            <p className="pt-1 text-center text-xs" style={{ color: "#665C52" }}>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("register"); setError(null); }}
                className="font-bold underline"
                style={{ color: "#111111" }}
              >
                Create Account
              </button>
            </p>
          </form>
        )}

        {/* REGISTER: email + role question */}
        {mode === "register" && (
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: "#2B241E" }}>
                {role === "founder" ? "Work Email *" : "Email Address *"}
              </label>
              <Input type="email" required value={studentForm.email}
                onChange={(e) => {
                  setStudentForm({ ...studentForm, email: e.target.value });
                  setFounderForm({ ...founderForm, email: e.target.value });
                }}
                placeholder={role === "founder" ? "arun@ashbolt.co" : "priya@college.edu"}
                className="text-xs bg-[#F5EFE7] border-[#DCD3C4]" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: "#2B241E" }}>
                How would you like to register? *
              </label>
              <select value={role}
                onChange={(e) => { setRole(e.target.value as UserRole); setError(null); }}
                className="w-full h-9 rounded-md border px-3 text-xs outline-none bg-[#F5EFE7] border-[#DCD3C4]">
                <option value="founder">Founder</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>
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
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: "#2B241E" }}>Password *</label>
              <div className="relative">
                <Input type={showRegisterPassword ? "text" : "password"} required value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  placeholder="••••••••" className="text-xs bg-[#F5EFE7] border-[#DCD3C4] pr-10" />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#7C6859] hover:text-[#111111] transition"
                  aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                >
                  {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
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
                <Input type="url" required value={studentForm.linkedinUrl}
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

            <p className="pt-1 text-center text-xs" style={{ color: "#665C52" }}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(null); }}
                className="font-bold underline"
                style={{ color: "#111111" }}
              >
                Sign In
              </button>
            </p>
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
                <div className="relative">
                  <Input type={showRegisterPassword ? "text" : "password"} required value={founderForm.password}
                    onChange={(e) => setFounderForm({ ...founderForm, password: e.target.value })}
                    placeholder="••••••••" className="text-xs bg-[#F5EFE7] border-[#DCD3C4] pr-10" />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#7C6859] hover:text-[#111111] transition"
                    aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                  >
                    {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: "#2B241E" }}>Company Description *</label>
              <textarea required rows={3} value={founderForm.companyDescription}
                onChange={(e) => setFounderForm({ ...founderForm, companyDescription: e.target.value })}
                placeholder="What does your startup do?"
                className="w-full rounded-md border px-3 py-2 text-xs outline-none bg-[#F5EFE7] border-[#DCD3C4]" />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: "#2B241E" }}>Website URL (optional)</label>
              <Input type="url" value={founderForm.websiteUrl}
                onChange={(e) => setFounderForm({ ...founderForm, websiteUrl: e.target.value })}
                placeholder="https://yourstartup.com" className="text-xs bg-[#F5EFE7] border-[#DCD3C4]" />
            </div>

            <button type="submit"
              className="w-full rounded-xl py-3 text-xs font-bold shadow-sm transition"
              style={{ background: "#B38E60", color: "#FFFFFF" }}>
              Register &amp; Post Requirement <ArrowRight size={14} className="inline ml-1" />
            </button>

            <p className="pt-1 text-center text-xs" style={{ color: "#665C52" }}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(null); }}
                className="font-bold underline"
                style={{ color: "#111111" }}
              >
                Sign In
              </button>
            </p>
          </form>
        )}

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
