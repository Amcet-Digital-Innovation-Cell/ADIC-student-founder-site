import type { Requirement, Startup, NewRequirementInput, Application } from "@/types";

const STORAGE_KEY_APPLICATIONS = "fnd_req_applications";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const STORAGE_KEY_REQUIREMENTS = "fnd_req_stored_requirements_v2";


const seedRequirements: Requirement[] = [
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

const seedStartups: Startup[] = [
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

function getStoredRequirements(): Requirement[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_REQUIREMENTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
  }
  return seedRequirements;
}

function saveStoredRequirements(reqs: Requirement[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_REQUIREMENTS, JSON.stringify(reqs));
    } catch {
      // ignore
    }
  }
}

// Returns ONLY approved requirements for student/public browsing
export async function getRequirements(includeAll = false): Promise<Requirement[]> {
  const all = getStoredRequirements();
  if (includeAll) return all;
  return all.filter((r) => r.approvalStatus === "APPROVED");
}

// Returns all requirements (including pending verification) for EDC Hub
export async function getAllRequirements(): Promise<Requirement[]> {
  return getStoredRequirements();
}

export async function getRequirement(id: string): Promise<Requirement | undefined> {
  const all = getStoredRequirements();
  return all.find((r) => r.id === id);
}

// Founder posts a new requirement -> Starts with "PENDING_APPROVAL" by EDC Cell
export async function postRequirement(input: NewRequirementInput): Promise<Requirement> {
  // Auto-derive status from deadline if provided
  let status: Requirement["status"] = "OPEN";
  if (input.deadline) {
    const daysUntilDeadline = Math.ceil(
      (new Date(input.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDeadline <= 7) status = "CLOSING SOON";
  }

  const requirement: Requirement = {
    id: `REQ-${Math.floor(Math.random() * 900 + 100)}`,
    company: input.company,
    role: input.role,
    stack: input.stack.split(",").map((s) => s.trim()).filter(Boolean),
    location: input.location || "Remote",
    stipend: input.stipend || "Unpaid",
    status,
    approvalStatus: "PENDING_APPROVAL",
    posted: "Just now",
    postedDate: new Date().toISOString(),
    founderEmail: input.email,
    blurb: input.blurb || "No description provided yet.",
    ...(input.deadline && { deadline: new Date(input.deadline).toISOString() }),
  };

  const current = getStoredRequirements();
  const updated = [requirement, ...current];
  saveStoredRequirements(updated);

  return requirement;
}


// EDC Cell approves a founder requirement -> Makes it live on the student board
export async function approveRequirement(
  id: string,
  approvedBy = "EDC Incubation Cell"
): Promise<Requirement | undefined> {
  const current = getStoredRequirements();
  let updatedRequirement: Requirement | undefined;

  const updated = current.map((r) => {
    if (r.id === id) {
      updatedRequirement = {
        ...r,
        approvalStatus: "APPROVED" as const,
        approvedBy,
        approvedAt: "Just now",
      };
      return updatedRequirement;
    }
    return r;
  });

  saveStoredRequirements(updated);
  return updatedRequirement;
}

// EDC Cell rejects a founder requirement
export async function rejectRequirement(
  id: string,
  reason?: string
): Promise<Requirement | undefined> {
  const current = getStoredRequirements();
  let updatedRequirement: Requirement | undefined;

  const updated = current.map((r) => {
    if (r.id === id) {
      updatedRequirement = {
        ...r,
        approvalStatus: "REJECTED" as const,
        edcNotes: reason || "Does not meet campus incubation requisites.",
      };
      return updatedRequirement;
    }
    return r;
  });

  saveStoredRequirements(updated);
  return updatedRequirement;
}

export async function getStartups(): Promise<Startup[]> {
  return seedStartups;
}

export async function getStartup(id: string): Promise<Startup | undefined> {
  return seedStartups.find((s) => s.id === id);
}

function getStoredApplications(): Application[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
  }
  return [];
}

function saveStoredApplications(apps: Application[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(apps));
    } catch {
      // ignore
    }
  }
}

// Returns only the applications submitted by the given student email
export async function getMyApplications(studentEmail: string): Promise<Application[]> {
  const all = getStoredApplications();
  return all.filter((a) => a.applicantEmail.toLowerCase() === studentEmail.toLowerCase());
}

// Returns all applications received for requirements posted by this founder email
export async function getApplicationsByFounder(founderEmail: string, founderCompany?: string): Promise<Application[]> {
  const allRequirements = getStoredRequirements();
  // Find all requirement IDs that belong to this founder
  const founderReqIds = new Set(
    allRequirements
      .filter((r) =>
        r.founderEmail.toLowerCase() === founderEmail.toLowerCase() ||
        (founderCompany && r.company.toLowerCase() === founderCompany.toLowerCase())
      )
      .map((r) => r.id)
  );
  const allApplications = getStoredApplications();
  return allApplications.filter((a) => founderReqIds.has(a.requirementId));
}

// Founder updates a candidate's application status
export async function updateApplicationStatus(
  appId: string,
  status: "Reviewing" | "Interviewing" | "Accepted" | "Selected" | "Rejected"
): Promise<Application | undefined> {
  const all = getStoredApplications();
  let updated: Application | undefined;
  const next = all.map((a) => {
    if (a.id === appId) {
      updated = { ...a, status };
      return updated;
    }
    return a;
  });
  saveStoredApplications(next);
  return updated;
}

export async function submitApplication(
  requirementId: string,
  applicantName: string,
  applicantEmail: string,
  options?: {
    roleTitle?: string;
    companyName?: string;
    department?: string;
    college?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    note?: string;
  }
): Promise<Application> {
  const application: Application = {
    id: `APP-${Math.floor(Math.random() * 9000 + 1000)}`,
    requirementId,
    applicantName,
    applicantEmail,
    roleTitle: options?.roleTitle,
    companyName: options?.companyName,
    department: options?.department,
    college: options?.college,
    linkedinUrl: options?.linkedinUrl,
    githubUrl: options?.githubUrl,
    portfolioUrl: options?.portfolioUrl,
    note: options?.note,
    createdAt: new Date().toISOString(),
  };

  const current = getStoredApplications();
  // Prevent duplicate applications for same requirement by same student
  const alreadyApplied = current.some(
    (a) =>
      a.requirementId === requirementId &&
      a.applicantEmail.toLowerCase() === applicantEmail.toLowerCase()
  );
  if (!alreadyApplied) {
    saveStoredApplications([application, ...current]);
  }

  return application;
}
