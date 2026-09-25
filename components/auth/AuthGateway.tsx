"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Rocket,
  Landmark,
  Linkedin,
  Github,
  Globe,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Building,
  UserCheck,
  ShieldAlert,
  Code2,
  Briefcase,
  Layers,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth, DEMO_USERS } from "@/lib/AuthContext";
import type { UserRole, AuthUser, StudentProfile, FounderProfile, EdcProfile } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const POPULAR_DEPARTMENTS = [
  "Computer Science & Engineering",
  "Artificial Intelligence & Data Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical & Electronics",
  "Mechanical Engineering",
  "Biotechnology / Bioengineering",
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
  "FastAPI",
  "PostgreSQL",
  "UI/UX (Figma)",
  "Embedded C / Arduino",
  "Docker",
  "Flutter",
  "Go",
];

const POPULAR_SECTORS = [
  "B2B SaaS",
  "Artificial Intelligence / ML",
  "Robotics & Hardware",
  "FinTech",
  "EdTech",
  "AgriTech / Food",
  "Climate & CleanTech",
  "HealthTech",
  "Consumer & E-Commerce",
];

export function AuthGateway() {
  const { login, register, demoLogin } = useAuth();

  const [activeRole, setActiveRole] = useState<UserRole>("student");
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "Computer Science & Engineering",
    customDepartment: "",
    college: "",
    yearOfStudy: "3rd Year",
    rollNo: "",
    phone: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    skills: ["React", "TypeScript", "Node.js"] as string[],
    newSkillInput: "",
    bio: "",
    availability: "Part-time (15-20 hrs/week)",
  });

  // Founder Form State
  const [founderForm, setFounderForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    sector: "B2B SaaS",
    stage: "Early Traction",
    websiteUrl: "",
    linkedinUrl: "",
    location: "Remote / Hybrid",
    hiringNeeds: "",
  });

  // EDC Form State
  const [edcForm, setEdcForm] = useState({
    name: "",
    email: "",
    password: "",
    institutionName: "",
    cellName: "E-Cell / Innovation Cell",
    designation: "Faculty In-Charge & Incubation Lead",
    portalUrl: "",
    linkedinUrl: "",
    startupsIncubated: 15,
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginEmail.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!loginPassword.trim()) {
      setError("Please enter your password.");
      return;
    }
    const result = await login(loginEmail, activeRole, loginPassword);
    if (!result.success) {
      setError(result.message || "Invalid credentials. Please try again or use Quick Demo.");
      return;
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentForm.name.trim() || !studentForm.email.trim()) {
      setError("Please provide your name and email address.");
      return;
    }
    if (!studentForm.password.trim()) {
      setError("Please create a password.");
      return;
    }
    if (studentForm.password !== studentForm.confirmPassword) {
      setError("Passwords do not match. Please re-enter them.");
      return;
    }
    if (!studentForm.department) {
      setError("Please select or specify your department.");
      return;
    }
    if (!studentForm.linkedinUrl && !studentForm.githubUrl) {
      setError("Please provide at least a LinkedIn or GitHub profile URL.");
      return;
    }

    const dept =
      studentForm.department === "Other"
        ? studentForm.customDepartment || "General Engineering"
        : studentForm.department;

    const studentProfile: StudentProfile = {
      department: dept,
      college: studentForm.college || "Anna University / Regional Institute",
      yearOfStudy: studentForm.yearOfStudy,
      rollNo: studentForm.rollNo,
      phone: studentForm.phone,
      linkedinUrl: studentForm.linkedinUrl.trim(),
      githubUrl: studentForm.githubUrl.trim(),
      portfolioUrl: studentForm.portfolioUrl.trim(),
      skills: studentForm.skills.length > 0 ? studentForm.skills : ["React", "Python"],
      bio: studentForm.bio || "Student developer looking to build impactful startup projects.",
      availability: studentForm.availability,
    };

    const newUser: AuthUser = {
      id: `USR-STU-${Date.now().toString().slice(-4)}`,
      name: studentForm.name.trim(),
      email: studentForm.email.trim().toLowerCase(),
      role: "student",
      createdAt: new Date().toISOString().split("T")[0],
      studentProfile,
    };

    const result = await register(newUser, studentForm.password);
    if (!result.success) {
      setError(result.message || "Registration failed. Please check your details and try again.");
      return;
    }
    if (result.message) {
      setError(result.message);
    }
  };

  const handleFounderRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!founderForm.name.trim() || !founderForm.email.trim() || !founderForm.companyName.trim()) {
      setError("Please fill in your name, company email, and company name.");
      return;
    }
    if (!founderForm.password.trim()) {
      setError("Please create a password.");
      return;
    }

    const founderProfile: FounderProfile = {
      companyName: founderForm.companyName.trim(),
      sector: founderForm.sector,
      stage: founderForm.stage,
      websiteUrl: founderForm.websiteUrl.trim(),
      linkedinUrl: founderForm.linkedinUrl.trim(),
      location: founderForm.location || "Remote",
      hiringNeeds: founderForm.hiringNeeds || "Software & Product Interns",
    };

    const newUser: AuthUser = {
      id: `USR-FND-${Date.now().toString().slice(-4)}`,
      name: founderForm.name.trim(),
      email: founderForm.email.trim().toLowerCase(),
      role: "founder",
      createdAt: new Date().toISOString().split("T")[0],
      founderProfile,
    };

    const result = await register(newUser, founderForm.password);
    if (!result.success) {
      setError(result.message || "Registration failed. Please check your details and try again.");
      return;
    }
    if (result.message) {
      setError(result.message);
    }
  };

  const handleEdcRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!edcForm.name.trim() || !edcForm.email.trim() || !edcForm.institutionName.trim()) {
      setError("Please fill in your name, official institutional email, and institution name.");
      return;
    }
    if (!edcForm.password.trim()) {
      setError("Please create a password.");
      return;
    }

    const edcProfile: EdcProfile = {
      institutionName: edcForm.institutionName.trim(),
      cellName: edcForm.cellName.trim(),
      designation: edcForm.designation.trim(),
      portalUrl: edcForm.portalUrl.trim(),
      linkedinUrl: edcForm.linkedinUrl.trim(),
      startupsIncubated: Number(edcForm.startupsIncubated) || 1,
    };

    const newUser: AuthUser = {
      id: `USR-EDC-${Date.now().toString().slice(-4)}`,
      name: edcForm.name.trim(),
      email: edcForm.email.trim().toLowerCase(),
      role: "edc",
      createdAt: new Date().toISOString().split("T")[0],
      edcProfile,
    };

    const result = await register(newUser, edcForm.password);
    if (!result.success) {
      setError(result.message || "Registration failed. Please check your details and try again.");
      return;
    }
    if (result.message) {
      setError(result.message);
    }
  };

  const toggleSkill = (skill: string) => {
    setStudentForm((prev) => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
      };
    });
  };

  const addCustomSkill = () => {
    const val = studentForm.newSkillInput.trim();
    if (val && !studentForm.skills.includes(val)) {
      setStudentForm((prev) => ({
        ...prev,
        skills: [...prev.skills, val],
        newSkillInput: "",
      }));
    }
  };

  return (
    <div className="relative min-h-screen bg-paper font-sans text-char selection:bg-mustard selection:text-ink">
      {/* Background Decorative Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(27, 43, 75, 0.08) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top Banner Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-6 w-6">
              <div className="absolute inset-0 rotate-[-8deg] rounded-sm bg-mustard" />
              <div className="absolute inset-0 rotate-[6deg] rounded-sm bg-ink opacity-90" />
            </div>
            <div>
              <span className="font-mono text-sm font-bold tracking-wider text-ink">
                FOUNDER&nbsp;REQUIREMENT
              </span>
              <span className="ml-2 hidden rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[10px] text-ink sm:inline">
                TALENT REQUISITION PORTAL
              </span>
            </div>
          </div>

          {/* Quick Demo Access Bar in header */}
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-char/60 md:inline">Quick 1-Click Access:</span>
            <button
              onClick={() => demoLogin("student")}
              className="flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-sm transition hover:border-sage hover:bg-sage/10 hover:text-sage"
            >
              🎓 Student Demo
            </button>
            <button
              onClick={() => demoLogin("founder")}
              className="flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-sm transition hover:border-mustard hover:bg-mustard/15"
            >
              🚀 Founder Demo
            </button>
            <button
              onClick={() => demoLogin("edc")}
              className="flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-sm transition hover:border-rust hover:bg-rust/10 hover:text-rust"
            >
              🏛️ EDC Demo
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Headline Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3.5 py-1 font-mono text-[11px] font-semibold text-ink shadow-sm">
            <span className="h-2 w-2 rounded-full bg-mustard animate-pulse" />
            AUTHENTICATION & ONBOARDING GATEWAY
          </div>
          <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Welcome to Founder Requirement
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-[14.5px] leading-relaxed text-char/75">
            Select your role to access the board. Connect students directly with early-stage founders
            and university incubation cells.
          </p>
        </div>

        {/* 3-Role Interactive Cards */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Student Role Card */}
          <button
            type="button"
            onClick={() => {
              setActiveRole("student");
              setError(null);
            }}
            className={`group relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
              activeRole === "student"
                ? "border-sage bg-sage/10 ring-2 ring-sage shadow-md"
                : "border-line bg-white/70 hover:border-sage/60 hover:bg-white"
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  activeRole === "student" ? "bg-sage text-white" : "bg-ink/5 text-ink"
                }`}
              >
                <GraduationCap size={22} />
              </div>
              {activeRole === "student" && (
                <span className="rounded-full bg-sage px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                  Active Role
                </span>
              )}
            </div>
            <h2 className="mt-3 font-serif text-base font-bold text-ink">I&apos;m a Student</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-char/70">
              Apply to startup roles with your LinkedIn, GitHub, department & skill portfolio.
            </p>
          </button>

          {/* Founder Role Card */}
          <button
            type="button"
            onClick={() => {
              setActiveRole("founder");
              setError(null);
            }}
            className={`group relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
              activeRole === "founder"
                ? "border-mustard bg-mustard/15 ring-2 ring-mustard shadow-md"
                : "border-line bg-white/70 hover:border-mustard/60 hover:bg-white"
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  activeRole === "founder" ? "bg-mustard text-ink" : "bg-ink/5 text-ink"
                }`}
              >
                <Rocket size={20} />
              </div>
              {activeRole === "founder" && (
                <span className="rounded-full bg-mustard px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink">
                  Active Role
                </span>
              )}
            </div>
            <h2 className="mt-3 font-serif text-base font-bold text-ink">I&apos;m a Founder</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-char/70">
              Requisition talent, post open requirements & receive direct applicant portfolios.
            </p>
          </button>

          {/* EDC Role Card */}
          <button
            type="button"
            onClick={() => {
              setActiveRole("edc");
              setError(null);
            }}
            className={`group relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
              activeRole === "edc"
                ? "border-rust bg-rust/10 ring-2 ring-rust shadow-md"
                : "border-line bg-white/70 hover:border-rust/60 hover:bg-white"
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  activeRole === "edc" ? "bg-rust text-white" : "bg-ink/5 text-ink"
                }`}
              >
                <Landmark size={20} />
              </div>
              {activeRole === "edc" && (
                <span className="rounded-full bg-rust px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                  Active Role
                </span>
              )}
            </div>
            <h2 className="mt-3 font-serif text-base font-bold text-ink">I&apos;m an EDC / E-Cell</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-char/70">
              Oversee campus ventures, track student talent pipeline & endorse startup matches.
            </p>
          </button>
        </div>

        {/* Tab Selector: Sign In vs Create Account */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-lg border border-line bg-ink/[0.04] p-1 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`flex items-center gap-2 rounded-md px-6 py-2 text-[13px] font-bold transition-all ${
                mode === "signin"
                  ? "bg-white text-ink shadow-sm"
                  : "text-char/70 hover:text-ink hover:bg-white/50"
              }`}
            >
              <UserCheck size={16} /> Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex items-center gap-2 rounded-md px-6 py-2 text-[13px] font-bold transition-all ${
                mode === "register"
                  ? "bg-white text-ink shadow-sm"
                  : "text-char/70 hover:text-ink hover:bg-white/50"
              }`}
            >
              <Sparkles size={16} /> Create Account (Registration)
            </button>
          </div>
        </div>

        {/* Error Alert Message */}
        {error && (
          <div className="mx-auto mt-5 max-w-lg rounded-md border border-rust/30 bg-rust/10 p-3 text-[13px] text-rust flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE: SIGN IN */}
        {/* ========================================================================= */}
        {mode === "signin" && (
          <div className="mx-auto mt-6 max-w-md">
            <Card className="border-solid p-6 shadow-md bg-white">
              <div className="flex items-center gap-2.5 pb-2 border-b border-line">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    activeRole === "student"
                      ? "bg-sage"
                      : activeRole === "founder"
                      ? "bg-mustard"
                      : "bg-rust"
                  }`}
                />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-char/75">
                  Sign in as {activeRole}
                </span>
              </div>

              <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-char">Email Address</label>
                  <Input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={
                      activeRole === "student"
                        ? "student@campus.edu"
                        : activeRole === "founder"
                        ? "founder@company.co"
                        : "ecell.head@university.ac.in"
                    }
                    className="mt-1 bg-paper/50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-char">Password</label>
                    <span className="text-[11px] text-char/50">Default test: password123</span>
                  </div>
                  <div className="relative mt-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-paper/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-char/50 hover:text-char"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className={`w-full font-bold transition-transform active:scale-[0.99] ${
                    activeRole === "student"
                      ? "bg-sage text-white hover:bg-sage/90"
                      : activeRole === "founder"
                      ? "bg-mustard text-ink hover:bg-mustard/90"
                      : "bg-rust text-white hover:bg-rust/90"
                  }`}
                >
                  Sign In to Web App <ArrowRight size={15} />
                </Button>
              </form>

              {/* Demo Account Box */}
              <div className="mt-6 rounded-lg border border-line/80 bg-paper/60 p-3.5 text-xs text-char/80">
                <div className="flex items-center justify-between font-mono text-[11px] font-bold text-ink">
                  <span>⚡ Instant 1-Click Demo Login</span>
                </div>
                <p className="mt-1 text-[11.5px] text-char/70">
                  {activeRole === "student" &&
                    "Logs in as Priya Sharma (CSE · 3rd Year · IIT Madras) with linked GitHub & LinkedIn."}
                  {activeRole === "founder" &&
                    "Logs in as Arun Kumar (Founder of Ash & Bolt · Manufacturing SaaS)."}
                  {activeRole === "edc" &&
                    "Logs in as Dr. K. Ramesh (EDC & Incubation Lead · IIT Madras E-Cell)."}
                </p>
                <button
                  type="button"
                  onClick={() => demoLogin(activeRole)}
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md border border-line bg-white py-1.5 font-mono text-[11.5px] font-bold text-ink shadow-sm hover:bg-ink hover:text-paper"
                >
                  <Sparkles size={13} className="text-mustard" /> Log In as Demo{" "}
                  {activeRole.toUpperCase()}
                </button>
              </div>

              <div className="mt-4 text-center text-xs text-char/70">
                Don&apos;t have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="font-bold text-ink underline"
                >
                  Register new account
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE: REGISTER (STUDENT) */}
        {/* ========================================================================= */}
        {mode === "register" && activeRole === "student" && (
          <div className="mx-auto mt-6 max-w-2xl">
            <Card className="border-solid p-6 shadow-md bg-white">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sage text-white">
                    <GraduationCap size={16} />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-ink">Student Registration</h2>
                    <p className="text-xs text-char/70">
                      Fill in your academic profile, LinkedIn & GitHub to apply directly to startup
                      founders.
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[11px] font-bold text-sage">ROLE: STUDENT</span>
              </div>

              <form onSubmit={handleStudentRegister} className="mt-6 space-y-6">
                {/* 1. Account Details */}
                <div className="rounded-lg border border-line/70 bg-paper/30 p-4">
                  <h3 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-ink">
                    <UserCheck size={14} className="text-sage" /> 1. Account & Identity
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-char">Full Name *</label>
                      <Input
                        required
                        value={studentForm.name}
                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                        placeholder="e.g. Priya Sharma"
                        className="mt-1 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-char">Email Address *</label>
                      <Input
                        type="email"
                        required
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                        placeholder="e.g. priya.sharma@college.edu"
                        className="mt-1 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-char">Password *</label>
                      <Input
                        type="password"
                        required
                        value={studentForm.password}
                        onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                        placeholder="••••••••"
                        className="mt-1 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-char">Phone / WhatsApp</label>
                      <Input
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="mt-1 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Academic & Department Details */}
                <div className="rounded-lg border border-line/70 bg-paper/30 p-4">
                  <h3 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-ink">
                    <BookOpen size={14} className="text-sage" /> 2. Academic & Department Information
                  </h3>

                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-char">Department / Branch *</label>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {POPULAR_DEPARTMENTS.map((dept) => (
                          <button
                            key={dept}
                            type="button"
                            onClick={() =>
                              setStudentForm({
                                ...studentForm,
                                department: dept,
                                customDepartment: "",
                              })
                            }
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                              studentForm.department === dept
                                ? "border-sage bg-sage text-white shadow-sm"
                                : "border-line bg-white text-char/80 hover:border-sage/60"
                            }`}
                          >
                            {dept}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setStudentForm({ ...studentForm, department: "Other" })
                          }
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                            studentForm.department === "Other"
                              ? "border-sage bg-sage text-white"
                              : "border-line bg-white text-char/80 hover:border-sage/60"
                          }`}
                        >
                          + Other Department
                        </button>
                      </div>

                      {studentForm.department === "Other" && (
                        <Input
                          value={studentForm.customDepartment}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, customDepartment: e.target.value })
                          }
                          placeholder="Type your department (e.g. Aerospace Engineering)"
                          className="mt-2 bg-white"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-char">
                          College / University *
                        </label>
                        <Input
                          required
                          value={studentForm.college}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, college: e.target.value })
                          }
                          placeholder="e.g. IIT Madras, Anna University, VIT"
                          className="mt-1 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-char">Year of Study *</label>
                        <select
                          value={studentForm.yearOfStudy}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, yearOfStudy: e.target.value })
                          }
                          className="mt-1 flex h-9 w-full rounded-md border border-line bg-white px-3 py-1 text-xs text-char focus:outline-none focus:ring-1 focus:ring-sage"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year (Final)</option>
                          <option value="Post-Graduate">Post-Graduate (M.Tech/MBA)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-char">
                          Roll / Registration Number
                        </label>
                        <Input
                          value={studentForm.rollNo}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, rollNo: e.target.value })
                          }
                          placeholder="e.g. CS22B045"
                          className="mt-1 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-char">Availability</label>
                        <select
                          value={studentForm.availability}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, availability: e.target.value })
                          }
                          className="mt-1 flex h-9 w-full rounded-md border border-line bg-white px-3 py-1 text-xs text-char focus:outline-none focus:ring-1 focus:ring-sage"
                        >
                          <option value="Part-time (15-20 hrs/week)">
                            Part-time (15-20 hrs/week)
                          </option>
                          <option value="Summer Internship (Full-time)">
                            Summer Internship (Full-time)
                          </option>
                          <option value="Immediate / Flexible">Immediate / Flexible</option>
                          <option value="Weekend / Project-based">Weekend / Project-based</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Professional Links (LinkedIn, GitHub, Portfolio) */}
                <div className="rounded-lg border border-line/70 bg-paper/30 p-4">
                  <h3 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-ink">
                    <Linkedin size={14} className="text-[#0A66C2]" /> 3. LinkedIn, GitHub &
                    Portfolio Links
                  </h3>
                  <p className="mt-1 text-[11.5px] text-char/65">
                    Founders review your profiles directly when you apply through the board.
                  </p>

                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-char">
                        <Linkedin size={13} className="text-[#0A66C2]" /> LinkedIn Profile Link *
                      </label>
                      <Input
                        type="url"
                        value={studentForm.linkedinUrl}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, linkedinUrl: e.target.value })
                        }
                        placeholder="https://linkedin.com/in/username"
                        className="mt-1 bg-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-char">
                        <Github size={13} className="text-ink" /> GitHub Profile Link *
                      </label>
                      <Input
                        type="url"
                        value={studentForm.githubUrl}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, githubUrl: e.target.value })
                        }
                        placeholder="https://github.com/username"
                        className="mt-1 bg-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-char">
                        <Globe size={13} className="text-sage" /> Portfolio / Resume / Personal
                        Website
                      </label>
                      <Input
                        type="url"
                        value={studentForm.portfolioUrl}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, portfolioUrl: e.target.value })
                        }
                        placeholder="https://myportfolio.dev or Google Drive resume link"
                        className="mt-1 bg-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Skills & Bio */}
                <div className="rounded-lg border border-line/70 bg-paper/30 p-4">
                  <h3 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-ink">
                    <Code2 size={14} className="text-mustard" /> 4. Skills & Short Bio
                  </h3>

                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-char">Key Skills & Tech Stack</label>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {POPULAR_SKILLS.map((skill) => {
                          const isSelected = studentForm.skills.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition ${
                                isSelected
                                  ? "border-ink bg-ink text-white"
                                  : "border-line bg-white text-char/80 hover:border-ink/50"
                              }`}
                            >
                              {isSelected && <CheckCircle2 size={11} className="text-mustard" />}
                              {skill}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom skill adder */}
                      <div className="mt-2 flex gap-2">
                        <Input
                          value={studentForm.newSkillInput}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, newSkillInput: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomSkill();
                            }
                          }}
                          placeholder="Add custom skill (press Add)"
                          className="h-8 bg-white text-xs"
                        />
                        <Button
                          type="button"
                          onClick={addCustomSkill}
                          className="h-8 bg-ink px-3 text-xs text-white"
                        >
                          + Add
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-char">
                        Short Bio / Headline (What you build)
                      </label>
                      <Textarea
                        value={studentForm.bio}
                        onChange={(e) => setStudentForm({ ...studentForm, bio: e.target.value })}
                        rows={2}
                        placeholder="e.g. Full-stack developer passionate about building performant React & Python applications for seed startups."
                        className="mt-1 bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-sage py-3 text-sm font-bold text-white hover:bg-sage/90 shadow-md"
                >
                  Complete Student Registration & Enter Web App <ArrowRight size={16} />
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE: REGISTER (FOUNDER) */}
        {/* ========================================================================= */}
        {mode === "register" && activeRole === "founder" && (
          <div className="mx-auto mt-6 max-w-2xl">
            <Card className="border-solid p-6 shadow-md bg-white">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-mustard text-ink">
                    <Rocket size={16} />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-ink">Founder Registration</h2>
                    <p className="text-xs text-char/70">
                      Register your startup to post talent requisitions directly to student builders.
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[11px] font-bold text-mustard">ROLE: FOUNDER</span>
              </div>

              <form onSubmit={handleFounderRegister} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-char">Founder / Lead Name *</label>
                    <Input
                      required
                      value={founderForm.name}
                      onChange={(e) => setFounderForm({ ...founderForm, name: e.target.value })}
                      placeholder="e.g. Arun Kumar"
                      className="mt-1 bg-paper/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-char">Work Email *</label>
                    <Input
                      type="email"
                      required
                      value={founderForm.email}
                      onChange={(e) => setFounderForm({ ...founderForm, email: e.target.value })}
                      placeholder="founder@ashbolt.co"
                      className="mt-1 bg-paper/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-char">Password *</label>
                    <Input
                      type="password"
                      required
                      value={founderForm.password}
                      onChange={(e) => setFounderForm({ ...founderForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="mt-1 bg-paper/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-char">Startup / Company Name *</label>
                    <Input
                      required
                      value={founderForm.companyName}
                      onChange={(e) =>
                        setFounderForm({ ...founderForm, companyName: e.target.value })
                      }
                      placeholder="e.g. Ash & Bolt"
                      className="mt-1 bg-paper/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-char">Industry / Sector</label>
                    <select
                      value={founderForm.sector}
                      onChange={(e) => setFounderForm({ ...founderForm, sector: e.target.value })}
                      className="mt-1 flex h-9 w-full rounded-md border border-line bg-paper/40 px-3 py-1 text-xs text-char focus:outline-none focus:ring-1 focus:ring-mustard"
                    >
                      {POPULAR_SECTORS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-char">Startup Stage</label>
                    <select
                      value={founderForm.stage}
                      onChange={(e) => setFounderForm({ ...founderForm, stage: e.target.value })}
                      className="mt-1 flex h-9 w-full rounded-md border border-line bg-paper/40 px-3 py-1 text-xs text-char focus:outline-none focus:ring-1 focus:ring-mustard"
                    >
                      <option value="Idea Stage">Idea / Inception</option>
                      <option value="Prototype">Prototype / MVP</option>
                      <option value="Early Traction">Early Traction / Pre-seed</option>
                      <option value="Seed Stage">Seed Stage</option>
                      <option value="Growth / Series A">Growth / Series A</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-1 text-xs font-semibold text-char">
                      <Globe size={12} /> Company Website / Deck
                    </label>
                    <Input
                      type="url"
                      value={founderForm.websiteUrl}
                      onChange={(e) =>
                        setFounderForm({ ...founderForm, websiteUrl: e.target.value })
                      }
                      placeholder="https://ashbolt.co"
                      className="mt-1 bg-paper/40"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs font-semibold text-char">
                      <Linkedin size={12} className="text-[#0A66C2]" /> Founder LinkedIn Profile
                    </label>
                    <Input
                      type="url"
                      value={founderForm.linkedinUrl}
                      onChange={(e) =>
                        setFounderForm({ ...founderForm, linkedinUrl: e.target.value })
                      }
                      placeholder="https://linkedin.com/in/username"
                      className="mt-1 bg-paper/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-char">Location</label>
                  <Input
                    value={founderForm.location}
                    onChange={(e) => setFounderForm({ ...founderForm, location: e.target.value })}
                    placeholder="e.g. Remote, Chennai, Bengaluru"
                    className="mt-1 bg-paper/40"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-char">
                    What talent/skills are you looking for right now?
                  </label>
                  <Textarea
                    value={founderForm.hiringNeeds}
                    onChange={(e) =>
                      setFounderForm({ ...founderForm, hiringNeeds: e.target.value })
                    }
                    rows={2}
                    placeholder="e.g. We need a frontend intern who knows React/Tailwind and a backend builder for Node.js."
                    className="mt-1 bg-paper/40 text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-mustard py-3 text-sm font-bold text-ink hover:bg-mustard/90 shadow-md"
                >
                  Complete Founder Registration & Enter Web App <ArrowRight size={16} />
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE: REGISTER (EDC) */}
        {/* ========================================================================= */}
        {mode === "register" && activeRole === "edc" && (
          <div className="mx-auto mt-6 max-w-2xl">
            <Card className="border-solid p-6 shadow-md bg-white">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rust text-white">
                    <Landmark size={16} />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-ink">EDC / E-Cell Registration</h2>
                    <p className="text-xs text-char/70">
                      Register your university Entrepreneurship Development Cell / Incubation Hub.
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[11px] font-bold text-rust">ROLE: EDC CELL</span>
              </div>

              <form onSubmit={handleEdcRegister} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-char">
                      Coordinator / Lead Name *
                    </label>
                    <Input
                      required
                      value={edcForm.name}
                      onChange={(e) => setEdcForm({ ...edcForm, name: e.target.value })}
                      placeholder="e.g. Dr. K. Ramesh"
                      className="mt-1 bg-paper/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-char">
                      Institutional / Official Email *
                    </label>
                    <Input
                      type="email"
                      required
                      value={edcForm.email}
                      onChange={(e) => setEdcForm({ ...edcForm, email: e.target.value })}
                      placeholder="ecell.head@iitm.ac.in"
                      className="mt-1 bg-paper/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-char">Password *</label>
                    <Input
                      type="password"
                      required
                      value={edcForm.password}
                      onChange={(e) => setEdcForm({ ...edcForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="mt-1 bg-paper/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-char">
                      Designation / Capacity *
                    </label>
                    <Input
                      required
                      value={edcForm.designation}
                      onChange={(e) => setEdcForm({ ...edcForm, designation: e.target.value })}
                      placeholder="Faculty In-Charge / Student President"
                      className="mt-1 bg-paper/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-char">
                      Institution / College Name *
                    </label>
                    <Input
                      required
                      value={edcForm.institutionName}
                      onChange={(e) =>
                        setEdcForm({ ...edcForm, institutionName: e.target.value })
                      }
                      placeholder="e.g. Indian Institute of Technology Madras"
                      className="mt-1 bg-paper/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-char">
                      EDC / Cell / Chapter Name *
                    </label>
                    <Input
                      required
                      value={edcForm.cellName}
                      onChange={(e) => setEdcForm({ ...edcForm, cellName: e.target.value })}
                      placeholder="e.g. E-Cell & Center for Innovation"
                      className="mt-1 bg-paper/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="flex items-center gap-1 text-xs font-semibold text-char">
                      <Globe size={12} /> Cell / Portal URL
                    </label>
                    <Input
                      type="url"
                      value={edcForm.portalUrl}
                      onChange={(e) => setEdcForm({ ...edcForm, portalUrl: e.target.value })}
                      placeholder="https://ecell.iitm.ac.in"
                      className="mt-1 bg-paper/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-char">
                      Number of Startups Incubated
                    </label>
                    <Input
                      type="number"
                      value={edcForm.startupsIncubated}
                      onChange={(e) =>
                        setEdcForm({ ...edcForm, startupsIncubated: Number(e.target.value) })
                      }
                      placeholder="e.g. 25"
                      className="mt-1 bg-paper/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-char">
                    <Linkedin size={12} className="text-[#0A66C2]" /> LinkedIn / Contact URL
                  </label>
                  <Input
                    type="url"
                    value={edcForm.linkedinUrl}
                    onChange={(e) => setEdcForm({ ...edcForm, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/dr-ramesh-ecell"
                    className="mt-1 bg-paper/40"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-rust py-3 text-sm font-bold text-white hover:bg-rust/90 shadow-md"
                >
                  Complete EDC Registration & Enter Web App <ArrowRight size={16} />
                </Button>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
