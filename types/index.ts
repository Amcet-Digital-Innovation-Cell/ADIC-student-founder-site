// Shared TypeScript types used across the frontend

export type RequirementStatus = "OPEN" | "CLOSING SOON" | "CLOSED";
export type ApprovalStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

export interface Requirement {
  id: string;
  company: string;
  role: string;
  stack: string[];
  location: string;
  stipend: string;
  status: RequirementStatus;
  approvalStatus: ApprovalStatus;
  posted: string;
  postedDate?: string; // ISO date string e.g. "2026-09-08T10:00:00.000Z"
  deadline?: string; // ISO date string — shown as Application Closing Date
  founderEmail: string;
  blurb: string;
  approvedBy?: string;
  approvedAt?: string;
  edcNotes?: string;
  rejectionReason?: string;
  isUrgent?: boolean;
}


export interface Startup {
  id: string;
  name: string;
  tagline: string;
  logo?: string;
  location: string;
  founded: string;
  teamSize: number;
  openRoles: number;
  description: string;
}

export interface StudentProfile {
  department: string;
  college: string;
  yearOfStudy: string; // e.g. "1st Year", "2nd Year", "3rd Year", "4th Year", "Post-Graduate"
  rollNo?: string;
  phone?: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl?: string;
  skills: string[];
  bio?: string;
  availability?: string;
}

export interface FounderProfile {
  companyName: string;
  sector: string;
  stage: string; // e.g. "Idea", "Prototype", "Early Traction", "Seed", "Growth"
  websiteUrl?: string;
  linkedinUrl?: string;
  location: string;
  hiringNeeds?: string;
}

export interface EdcProfile {
  institutionName: string;
  cellName: string; // e.g. "E-Cell IITM", "EDC Anna Univ"
  designation: string; // e.g. "Faculty In-Charge", "Student President", "Incubation Manager"
  portalUrl?: string;
  linkedinUrl?: string;
  startupsIncubated?: number;
}

export type UserRole = "student" | "founder" | "edc";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  studentProfile?: StudentProfile;
  founderProfile?: FounderProfile;
  edcProfile?: EdcProfile;
}

export type ApplicationStatus = "Reviewing" | "Interviewing" | "Accepted" | "Selected" | "Rejected";

export interface Application {
  id: string;
  requirementId: string;
  founderEmail?: string;
  roleTitle?: string;
  companyName?: string;
  applicantName: string;
  applicantEmail: string;
  department?: string;
  college?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  skills?: string[];
  note?: string;
  createdAt: string;
  status?: ApplicationStatus;
}


export interface NewRequirementInput {
  company: string;
  role: string;
  stack: string;
  location: string;
  stipend: string;
  blurb: string;
  email: string;
  deadline?: string; // ISO date string — optional closing date for the application
}
