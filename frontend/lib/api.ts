import type { AuthUser, Requirement, Startup, NewRequirementInput, Application } from "@/types";
import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// ─── Simple in-memory TTL cache (30 s) for GET requests ───────────────────────
const _cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 30_000;

function getCached<T>(key: string): T | null {
  const entry = _cache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data as T;
  _cache.delete(key);
  return null;
}

function setCached(key: string, data: unknown) {
  _cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function invalidateCache(key?: string) {
  if (key) _cache.delete(key);
  else _cache.clear();
}

// ─── Singleton session promise – avoid one supabase round-trip per request ────
let _sessionPromise: Promise<string | null> | null = null;

function getAccessToken(): Promise<string | null> {
  if (_sessionPromise) return _sessionPromise;
  _sessionPromise = supabase.auth
    .getSession()
    .then(({ data }) => data.session?.access_token ?? null)
    .finally(() => {
      // Reset after 10 s so tokens are never stale
      setTimeout(() => { _sessionPromise = null; }, 10_000);
    });
  return _sessionPromise;
}

// Invalidate the token singleton on auth state change
supabase.auth.onAuthStateChange(() => { _sessionPromise = null; });

const fallbackRequirements: Requirement[] = [
  {
    id: "REQ-014",
    company: "Ash & Bolt",
    role: "Frontend Intern",
    stack: ["React", "Tailwind", "TypeScript"],
    location: "Remote",
    stipend: "₹8,000/mo",
    status: "OPEN",
    approvalStatus: "APPROVED",
    approvedBy: "IIT Madras E-Cell",
    approvedAt: "2 days ago",
    posted: "2 days ago",
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    isUrgent: false,
    founderEmail: "hiring@ashbolt.co",
    blurb:
      "Rebuilding our order-tracking dashboard. Need someone comfortable turning Figma into clean responsive components.",
  },
  {
    id: "REQ-013",
    company: "Northwind Robotics",
    role: "Embedded Systems Trainee",
    stack: ["C++", "Arduino", "IoT"],
    location: "Chennai, on-site",
    stipend: "₹10,000/mo",
    status: "CLOSING SOON",
    approvalStatus: "APPROVED",
    approvedBy: "Anna Univ EDC",
    approvedAt: "5 days ago",
    posted: "5 days ago",
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    isUrgent: true,
    founderEmail: "team@northwindrobo.in",
    blurb: "Sensor calibration for a warehouse-bot prototype. Prior Arduino project work preferred.",
  },
  {
    id: "REQ-015",
    company: "Aether Dynamics",
    role: "Drone Telemetry & Computer Vision Builder",
    stack: ["Python", "OpenCV", "PyTorch", "ROS"],
    location: "Bengaluru, Hybrid",
    stipend: "₹15,000/mo",
    status: "OPEN",
    approvalStatus: "PENDING_APPROVAL",
    posted: "Today at 08:15 AM",
    postedDate: new Date().toISOString(),
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    isUrgent: false,
    founderEmail: "founder@aetherdynamics.tech",
    blurb:
      "Building autonomous flight obstacle avoidance system. Looking for student engineers in ECE/AI&DS with OpenCV experience.",
  },
  {
    id: "REQ-016",
    company: "Solaria CleanTech",
    role: "Full-Stack Energy Dashboard Engineer",
    stack: ["Next.js", "Node.js", "PostgreSQL", "Tailwind"],
    location: "Remote / Chennai",
    stipend: "₹12,000/mo",
    status: "OPEN",
    approvalStatus: "PENDING_APPROVAL",
    posted: "Yesterday",
    postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    isUrgent: true,
    founderEmail: "talent@solariaclean.in",
    blurb:
      "Developing a real-time smart solar meter ingestion platform. Own the API pipeline and interactive charts.",
  },
  {
    id: "REQ-012",
    company: "Loop Analytics",
    role: "Data Labeling & Scripts",
    stack: ["Python", "Pandas"],
    location: "Remote",
    stipend: "Unpaid + certificate",
    status: "OPEN",
    approvalStatus: "APPROVED",
    approvedBy: "IIT Madras E-Cell",
    approvedAt: "1 week ago",
    posted: "1 week ago",
    postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    isUrgent: false,
    founderEmail: "ops@loopanalytics.dev",
    blurb: "Short 3-week gig cleaning a transaction dataset and writing labeling scripts.",
  },
  {
    id: "REQ-011",
    company: "Verdant Foods",
    role: "Full-Stack Builder",
    stack: ["Node.js", "PostgreSQL"],
    location: "Ranipet, hybrid",
    stipend: "₹12,000/mo",
    status: "OPEN",
    approvalStatus: "APPROVED",
    approvedBy: "Anna Univ EDC",
    approvedAt: "1 week ago",
    posted: "1 week ago",
    postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    isUrgent: true,
    founderEmail: "founder@verdantfoods.in",
    blurb: "Building a supplier-ordering portal from scratch. You'll own the backend end-to-end.",
  },
];

const fallbackStartups: Startup[] = [
  {
    id: "ashbolt",
    name: "Ash & Bolt",
    tagline: "Order tracking for small manufacturers",
    location: "Remote",
    founded: "2024",
    teamSize: 6,
    openRoles: 1,
    description: "Ash & Bolt builds lightweight order-tracking software for small manufacturing shops.",
  },
  {
    id: "northwind",
    name: "Northwind Robotics",
    tagline: "Warehouse automation, built in Chennai",
    location: "Chennai",
    founded: "2023",
    teamSize: 11,
    openRoles: 1,
    description: "Northwind Robotics designs sensor-driven warehouse bots for mid-size logistics firms.",
  },
  {
    id: "aether",
    name: "Aether Dynamics",
    tagline: "Autonomous drone navigation for agriculture",
    location: "Bengaluru",
    founded: "2024",
    teamSize: 5,
    openRoles: 1,
    description: "Aether Dynamics designs computer-vision enabled drone fleet control systems.",
  },
  {
    id: "loop",
    name: "Loop Analytics",
    tagline: "Turning messy data into clean pipelines",
    location: "Remote",
    founded: "2022",
    teamSize: 4,
    openRoles: 1,
    description: "Loop Analytics helps early-stage startups clean, label, and pipeline their transaction data.",
  },
  {
    id: "verdant",
    name: "Verdant Foods",
    tagline: "Supplier ordering, simplified",
    location: "Ranipet",
    founded: "2024",
    teamSize: 8,
    openRoles: 1,
    description: "Verdant Foods is building a supplier-ordering portal for regional grocery distributors.",
  },
];

async function request<T>(path: string, init: RequestInit = {}, opts?: { cache?: boolean }): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const isGet = method === "GET";

  // Return cached result for GET requests when caller opts in (or by default)
  const useCache = opts?.cache !== false && isGet;
  if (useCache) {
    const hit = getCached<T>(path);
    if (hit !== null) return hit;
  }

  // Reuse in-flight session promise instead of making a fresh call every time
  const accessToken = await getAccessToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const payload = await response.text().catch(() => "");
    throw new Error(payload || `Request failed with status ${response.status}`);
  }

  const data = await response.json() as T;

  if (useCache) setCached(path, data);
  return data;
}

export async function getMyProfile(): Promise<AuthUser> {
  return request<AuthUser>("/profile");
}

export async function saveMyProfile(profile: Partial<AuthUser>): Promise<AuthUser> {
  invalidateCache("/profile");
  return request<AuthUser>("/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

// Returns ONLY approved requirements for student/public browsing
export async function getRequirements(includeAll = false): Promise<Requirement[]> {
  try {
    const query = includeAll ? "?includeAll=true" : "";
    const response = await request<Requirement[]>(`/requirements${query}`);
    return Array.isArray(response) ? response : fallbackRequirements;
  } catch {
    return includeAll ? fallbackRequirements : fallbackRequirements.filter((item) => item.approvalStatus === "APPROVED");
  }
}

// Returns all requirements (including pending verification) for EDC Hub
export async function getAllRequirements(): Promise<Requirement[]> {
  try {
    return await request<Requirement[]>(`/requirements?includeAll=true`);
  } catch {
    return fallbackRequirements;
  }
}

export async function getRequirement(id: string): Promise<Requirement | undefined> {
  try {
    return await request<Requirement>(`/requirements/${id}`);
  } catch {
    return fallbackRequirements.find((item) => item.id === id);
  }
}

// Founder posts a new requirement -> Starts with "PENDING_APPROVAL" by EDC Cell
export async function postRequirement(input: NewRequirementInput): Promise<Requirement> {
  const payload = await request<{ data: Requirement; message?: string }>("/requirements", {
    method: "POST",
    body: JSON.stringify(input),
  });
  // Bust cache so the board re-fetches fresh data
  invalidateCache("/requirements");
  invalidateCache("/requirements?includeAll=true");
  return payload.data ?? payload;
}

// EDC Cell approves a founder requirement -> Makes it live on the student board
export async function approveRequirement(
  id: string,
  approvedBy = "EDC Incubation Cell"
): Promise<Requirement | undefined> {
  const payload = await request<{ data: Requirement; message?: string }>(`/requirements/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ approvedBy }),
  });
  invalidateCache("/requirements");
  invalidateCache("/requirements?includeAll=true");
  return payload.data;
}

// EDC Cell rejects a founder requirement
export async function rejectRequirement(
  id: string,
  reason?: string
): Promise<Requirement | undefined> {
  const payload = await request<{ data: Requirement; message?: string }>(`/requirements/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  invalidateCache("/requirements");
  invalidateCache("/requirements?includeAll=true");
  return payload.data;
}

export async function getStartups(): Promise<Startup[]> {
  try {
    return await request<Startup[]>(`/startups`);
  } catch {
    return fallbackStartups;
  }
}

export async function getStartup(id: string): Promise<Startup | undefined> {
  try {
    return await request<Startup>(`/startups/${id}`);
  } catch {
    return fallbackStartups.find((item) => item.id === id);
  }
}

// Returns only the applications submitted by the given student email
export async function getMyApplications(studentEmail: string): Promise<Application[]> {
  const url = `/applications?studentEmail=${encodeURIComponent(studentEmail)}`;
  return request<Application[]>(url);
}

// Returns all applications received for requirements posted by this founder email
export async function getApplicationsByFounder(founderEmail: string, founderCompany?: string): Promise<Application[]> {
  const params = new URLSearchParams({ founderEmail });
  if (founderCompany) params.set("founderCompany", founderCompany);
  return request<Application[]>(`/applications?${params.toString()}`);
}

// Founder updates a candidate's application status
export async function updateApplicationStatus(
  appId: string,
  status: "Reviewing" | "Interviewing" | "Accepted" | "Selected" | "Rejected"
): Promise<Application | undefined> {
  const payload = await request<{ data: Application; message?: string }>(`/applications/${appId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return payload.data;
}

export async function submitApplication(
  requirementId: string,
  applicantName: string,
  applicantEmail: string,
  options?: {
    roleTitle?: string;
    companyName?: string;
    founderEmail?: string;
    department?: string;
    college?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    note?: string;
    skills?: string[];
  }
): Promise<Application> {
  const payload = await request<{ data: Application; message?: string }>("/applications", {
    method: "POST",
    body: JSON.stringify({
      requirementId,
      applicantName,
      applicantEmail,
      ...options,
    }),
  });
  return payload.data ?? payload;
}

export async function uploadApplicationResume(applicationId: string, file: File): Promise<void> {
  const upload = await request<{ path: string; token: string }>(`/applications/${applicationId}/resume-upload`, {
    method: "POST",
    body: JSON.stringify({ contentType: file.type, fileSize: file.size }),
  });

  const { error } = await supabase.storage
    .from("application-files")
    .uploadToSignedUrl(upload.path, upload.token, file, { contentType: file.type, upsert: true });
  if (error) throw new Error(error.message);

  await request(`/applications/${applicationId}/resume`, {
    method: "PATCH",
    body: JSON.stringify({ path: upload.path }),
  });
}

export async function getApplicationResumeUrl(applicationId: string): Promise<string> {
  const payload = await request<{ url: string }>(`/applications/${applicationId}/resume-url`);
  return payload.url;
}
