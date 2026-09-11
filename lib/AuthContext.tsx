"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  registeredStudents: AuthUser[];
  login: (email: string, role?: UserRole) => boolean;
  demoLogin: (role: UserRole) => void;
  register: (user: AuthUser) => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateProfile: (updated: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = "fnd_req_current_user";
const STORAGE_KEY_STUDENTS = "fnd_req_registered_students";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registeredStudents, setRegisteredStudents] = useState<AuthUser[]>(SEED_TALENT_STUDENTS);

  // Load user session from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY_USER);
      const storedStudents = localStorage.getItem(STORAGE_KEY_STUDENTS);

      if (storedStudents) {
        try {
          const parsed = JSON.parse(storedStudents);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRegisteredStudents(parsed);
          }
        } catch {
          // ignore corrupted JSON
        }
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // localStorage disabled or not available
    } finally {
      setIsLoading(false);
    }
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

  const login = (email: string, role?: UserRole) => {
    // Check if user is in demo users or registered students
    const targetEmail = email.trim().toLowerCase();

    // Check registered students
    const foundStudent = registeredStudents.find((s) => s.email.toLowerCase() === targetEmail);
    if (foundStudent) {
      persistUser(foundStudent);
      return true;
    }

    // Check demo users
    if (role && DEMO_USERS[role]?.email.toLowerCase() === targetEmail) {
      persistUser(DEMO_USERS[role]);
      return true;
    }

    // If role provided or matching role
    const matchedRole = role || "student";
    const demo = DEMO_USERS[matchedRole];
    const loggedInUser: AuthUser = {
      ...demo,
      id: `USR-${Date.now()}`,
      email: targetEmail,
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      role: matchedRole,
    };
    persistUser(loggedInUser);
    return true;
  };

  const demoLogin = (selectedRole: UserRole) => {
    const demo = DEMO_USERS[selectedRole];
    persistUser(demo);
  };

  const register = (newUser: AuthUser) => {
    persistUser(newUser);

    if (newUser.role === "student") {
      const updated = [newUser, ...registeredStudents.filter((s) => s.id !== newUser.id)];
      setRegisteredStudents(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updated));
      }
    }
  };

  const logout = () => {
    persistUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const demo = DEMO_USERS[newRole];
    persistUser(demo);
  };

  const updateProfile = (updated: Partial<AuthUser>) => {
    if (!user) return;
    const next = { ...user, ...updated };
    persistUser(next);

    if (next.role === "student") {
      const updatedList = registeredStudents.map((s) => (s.id === next.id ? next : s));
      setRegisteredStudents(updatedList);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updatedList));
      }
    }
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
