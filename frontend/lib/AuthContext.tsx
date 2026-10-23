"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getMyProfile, saveMyProfile } from "@/lib/api";
import type { AuthUser, UserRole, StudentProfile, FounderProfile, EdcProfile } from "@/types";

export const DEMO_USERS: Record<UserRole, AuthUser> = {
  student: {
    id: "USR-STU-101",
    name: "Priya Sharma",
    email: "priya.sharma@campus.edu",
    role: "student",
    createdAt: "2025-01-15",
    studentProfile: {
      department: "Computer Science & Engineering",
      college: "IIT Madras",
      yearOfStudy: "3rd Year",
      rollNo: "CS22B045",
      phone: "+91 98765 43210",
      linkedinUrl: "https://linkedin.com/in/priyasharma-dev",
      githubUrl: "https://github.com/priyasharma-builds",
      portfolioUrl: "https://priyasharma.me",
      skills: ["React", "TypeScript", "Next.js", "Node.js", "Python", "Tailwind CSS"],
      bio: "Full-stack developer passionate about building clean user interfaces and microservices for early-stage startups.",
      availability: "Immediate / Part-time (20 hrs/week)",
    },
  },
  founder: {
    id: "USR-FND-202",
    name: "Arun Kumar",
    email: "arun@ashbolt.co",
    role: "founder",
    createdAt: "2024-11-10",
    founderProfile: {
      companyName: "Ash & Bolt",
      sector: "Manufacturing SaaS",
      stage: "Seed Stage",
      websiteUrl: "https://ashbolt.co",
      linkedinUrl: "https://linkedin.com/in/arunkumar-founder",
      location: "Bengaluru / Remote",
      hiringNeeds: "Frontend Engineer Intern (React, Tailwind), Backend builder",
    },
  },
  edc: {
    id: "USR-EDC-303",
    name: "Dr. K. Ramesh",
    email: "ecell.head@iitm.ac.in",
    role: "edc",
    createdAt: "2024-08-01",
    edcProfile: {
      institutionName: "Indian Institute of Technology Madras",
      cellName: "E-Cell & Center for Innovation (CFI)",
      designation: "Faculty In-Charge & Incubation Head",
      portalUrl: "https://ecell.iitm.ac.in",
      linkedinUrl: "https://linkedin.com/in/dr-ramesh-ecell",
      startupsIncubated: 48,
    },
  },
};

const SEED_TALENT_STUDENTS: AuthUser[] = [
  DEMO_USERS.student,
  {
    id: "USR-STU-102",
    name: "Karthik Raja",
    email: "karthik.r@annauniv.edu",
    role: "student",
    createdAt: "2025-01-20",
    studentProfile: {
      department: "Artificial Intelligence & Data Science",
      college: "Anna University (CEG)",
      yearOfStudy: "4th Year",
      rollNo: "AI21U089",
      linkedinUrl: "https://linkedin.com/in/karthik-raja-ai",
      githubUrl: "https://github.com/karthik-ai-data",
      portfolioUrl: "https://karthik.design",
      skills: ["Python", "PyTorch", "FastAPI", "Pandas", "Computer Vision", "SQL"],
      bio: "Deep learning enthusiast working on sensor telemetry and automated data pipelines.",
      availability: "Full-time (Intern-to-hire)",
    },
  },
  {
    id: "USR-STU-103",
    name: "Ananya Iyer",
    email: "ananya.iyer@vit.ac.in",
    role: "student",
    createdAt: "2025-02-01",
    studentProfile: {
      department: "Electronics & Communication Engineering",
      college: "VIT Vellore",
      yearOfStudy: "2nd Year",
      rollNo: "ECE23V112",
      linkedinUrl: "https://linkedin.com/in/ananya-iyer-hardware",
      githubUrl: "https://github.com/ananya-iot",
      portfolioUrl: "https://ananya-portfolio.vercel.app",
      skills: ["C++", "Arduino", "Embedded C", "Raspberry Pi", "IoT", "PCB Design"],
      bio: "Embedded systems builder eager to calibrate sensors and build hardware prototypes.",
      availability: "Part-time (15 hrs/week)",
    },
  },
  {
    id: "USR-STU-104",
    name: "Mohammed Farhan",
    email: "farhan.m@srmist.edu.in",
    role: "student",
    createdAt: "2025-02-10",
    studentProfile: {
      department: "Information Technology",
      college: "SRM University",
      yearOfStudy: "3rd Year",
      rollNo: "IT22S304",
      linkedinUrl: "https://linkedin.com/in/mohammed-farhan-fullstack",
      githubUrl: "https://github.com/farhan-stack",
      portfolioUrl: "https://farhan.tech",
      skills: ["PostgreSQL", "Node.js", "Express", "Docker", "Go", "Next.js"],
      bio: "Backend developer specializing in relational schema design and RESTful APIs.",
      availability: "Immediate",
    },
  },
];

interface AuthResult {
  success: boolean;
  message?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  registeredStudents: AuthUser[];
  login: (email: string, role?: UserRole, password?: string) => Promise<AuthResult>;
  demoLogin: (role: UserRole) => void;
  register: (user: AuthUser, password?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  updateProfile: (updated: Partial<AuthUser>) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = "fnd_req_current_user";
const STORAGE_KEY_STUDENTS = "fnd_req_registered_students";

function mapSupabaseUserToAuthUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, any>;
  created_at?: string | null;
}, roleOverride?: UserRole): AuthUser {
  const metadata = user.user_metadata ?? {};
  // "edc" is never trusted from client-side metadata; only the backend profile can grant it.
  const requested = (roleOverride ?? metadata.role ?? "student") as UserRole;
  const resolvedRole: UserRole = requested === "edc" ? "student" : requested;

  const baseUser: AuthUser = {
    id: user.id,
    name: metadata.full_name || user.email?.split("@")[0] || "User",
    email: user.email || "",
    role: resolvedRole,
    createdAt: user.created_at ? new Date(user.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  };

  if (resolvedRole === "student") {
    baseUser.studentProfile = metadata.studentProfile || {
      department: metadata.department || "Computer Science & Engineering",
      college: metadata.college || "Campus College",
      yearOfStudy: metadata.yearOfStudy || "3rd Year",
      linkedinUrl: metadata.linkedinUrl || "",
      githubUrl: metadata.githubUrl || "",
      portfolioUrl: metadata.portfolioUrl || "",
      skills: metadata.skills || ["React", "TypeScript"],
      bio: metadata.bio || "",
      availability: metadata.availability || "Part-time",
    };
  }

  if (resolvedRole === "founder") {
    baseUser.founderProfile = metadata.founderProfile || {
      companyName: metadata.companyName || "Startup Company",
      sector: metadata.sector || "B2B SaaS",
      stage: metadata.stage || "Early Traction",
      websiteUrl: metadata.websiteUrl || "",
      linkedinUrl: metadata.linkedinUrl || "",
      location: metadata.location || "Remote",
      hiringNeeds: metadata.hiringNeeds || "",
    };
  }

  return baseUser;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Hydrate from localStorage synchronously so isLoading=false immediately
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  // isLoading starts false because we already have a value from localStorage.
  // It's only briefly true during the background Supabase refresh.
  const [isLoading, setIsLoading] = useState(false);

  const [registeredStudents, setRegisteredStudents] = useState<AuthUser[]>(() => {
    if (typeof window === "undefined") return SEED_TALENT_STUDENTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_STUDENTS);
      const parsed = stored ? JSON.parse(stored) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_TALENT_STUDENTS;
    } catch {
      return SEED_TALENT_STUDENTS;
    }
  });

  useEffect(() => {
    let isMounted = true;

    // Background refresh from Supabase (doesn't block initial render)
    const refreshFromSupabase = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session?.user) {
          const mapped = await getMyProfile().catch(() =>
            mapSupabaseUserToAuthUser(session.user, session.user.user_metadata?.role as UserRole)
          );
          if (!isMounted) return;
          setUser(mapped);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mapped));
        } else if (!session) {
          // No active session — clear stale localStorage user
          setUser(null);
          localStorage.removeItem(STORAGE_KEY_USER);
        }
      } catch {
        // silently ignore — localStorage user is already shown
      }
    };

    refreshFromSupabase();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        const sessionUser = session.user;
        // Defer: calling supabase APIs inside this callback can deadlock.
        setTimeout(async () => {
          const mapped = await getMyProfile().catch(() =>
            mapSupabaseUserToAuthUser(sessionUser, sessionUser.user_metadata?.role as UserRole)
          );
          if (!isMounted) return;
          setUser(mapped);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mapped));
        }, 0);
      } else {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const persistUser = (newUser: AuthUser | null) => {
    setUser(newUser);
    if (typeof window !== "undefined") {
      if (newUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    }
  };

  const login = async (email: string, role?: UserRole, password?: string): Promise<AuthResult> => {
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail || !password) {
      return { success: false, message: "Please enter both email and password." };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (error) {
        const message = error.message.includes("Email not confirmed")
          ? "Please confirm your email before signing in."
          : error.message || "Invalid credentials. Please try again.";
        return { success: false, message };
      }

      if (!data.session || !data.user) {
        return { success: false, message: "Unable to start a session. Please try again." };
      }

      // Role comes from the backend profile (EDC allowlist enforced server-side).
      // If it cannot be loaded, fall back to metadata, which can never yield "edc".
      const mappedUser = await getMyProfile().catch(() =>
        mapSupabaseUserToAuthUser(data.user, data.user.user_metadata?.role as UserRole)
      );

      if (role && mappedUser.role !== role) {
        // Wrong portal for this account: end the session and do not reveal account details.
        await supabase.auth.signOut();
        persistUser(null);
        return { success: false, message: "Invalid credentials or wrong role selected." };
      }

      persistUser(mappedUser);
      return { success: true, role: mappedUser.role };
    } catch (error: any) {
      return { success: false, message: error?.message || "Something went wrong while signing in." };
    }
  };

  const demoLogin = (selectedRole: UserRole) => {
    // The EDC admin role has no public demo access.
    if (selectedRole === "edc") return;
    const demo = DEMO_USERS[selectedRole];
    persistUser(demo);
  };

  const register = async (newUser: AuthUser, password?: string): Promise<AuthResult> => {
    // Public registration can never create an EDC admin account.
    if (newUser.role === "edc") {
      return { success: false, message: "This account type cannot be registered publicly." };
    }
    if (!password) {
      persistUser(newUser);
      if (newUser.role === "student") {
        const updated = [newUser, ...registeredStudents.filter((s) => s.id !== newUser.id)];
        setRegisteredStudents(updated);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updated));
        }
      }
      return { success: true, message: "Saved locally. Please create a password to complete registration." };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password,
        options: {
          data: {
            full_name: newUser.name,
            role: newUser.role,
            studentProfile: newUser.studentProfile ?? null,
            founderProfile: newUser.founderProfile ?? null,
            edcProfile: newUser.edcProfile ?? null,
          },
        },
      });

      if (error) {
        return { success: false, message: error.message || "Registration failed. Please try again." };
      }

      if (!data.user) {
        return { success: false, message: "Registration did not complete. Please try again." };
      }

      if (!data.session) {
        return {
          success: true,
          message: "Account created successfully. Please check your email and confirm it before signing in.",
        };
      }

      const mappedUser = mapSupabaseUserToAuthUser(data.user, newUser.role);
      persistUser(mappedUser);

      if (newUser.role === "student") {
        const updated = [mappedUser, ...registeredStudents.filter((s) => s.id !== mappedUser.id)];
        setRegisteredStudents(updated);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updated));
        }
      }

      return { success: true, message: "Registration successful and signed in." };
    } catch (error: any) {
      return { success: false, message: error?.message || "Something went wrong while registering." };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      persistUser(null);
      if (typeof window !== "undefined") {
        window.location.assign("/login");
      }
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === "edc") return;
    const demo = DEMO_USERS[newRole];
    persistUser(demo);
  };

  const updateProfile = async (updated: Partial<AuthUser>): Promise<AuthResult> => {
    if (!user) return { success: false, message: "Sign in before updating your profile." };
    const next = { ...user, ...updated };

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.id === user.id) {
      try {
        const saved = await saveMyProfile(next);
        persistUser(saved);
        return { success: true };
      } catch (error: any) {
        return { success: false, message: error?.message || "Could not save your profile to Supabase." };
      }
    }

    persistUser(next);

    if (next.role === "student") {
      const updatedList = registeredStudents.map((s) => (s.id === next.id ? next : s));
      setRegisteredStudents(updatedList);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updatedList));
      }
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isAuthenticated: !!user,
        isLoading,
        registeredStudents,
        login,
        demoLogin,
        register,
        logout,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
