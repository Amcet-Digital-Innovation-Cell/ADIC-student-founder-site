import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { env } from "./config/env.js";
import { supabase, db } from "./lib/supabase.js";
import { seedApplications, seedRequirements, seedStartups } from "./data/seed.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const store = {
  requirements: [...seedRequirements],
  startups: [...seedStartups],
  applications: [...seedApplications],
};

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

async function requireAuthenticatedUser(req: Request, res: Response, next: NextFunction) {
  if (!supabase) {
    res.status(503).json({ error: "Supabase authentication is not configured." });
    return;
  }

  const authorization = req.header("authorization");
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!accessToken) {
    res.status(401).json({ error: "Sign in to continue." });
    return;
  }

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    res.status(401).json({ error: "Your session is invalid or expired. Sign in again." });
    return;
  }

  res.locals.authUser = data.user;
  next();
}

function requireEdcUser(_req: Request, res: Response, next: NextFunction) {
  const authUser = res.locals.authUser as { id: string } | undefined;
  if (!authUser || !env.edcUserIds.has(authUser.id)) {
    res.status(403).json({ error: "This action is restricted to approved EDC accounts." });
    return;
  }

  next();
}

// The "edc" role can never be self-assigned: it is granted only to IDs in EDC_USER_IDS.
function resolveRole(userId: string, requestedRole: unknown): "student" | "founder" | "edc" {
  if (env.edcUserIds.has(userId)) return "edc";
  return requestedRole === "founder" ? "founder" : "student";
}

function profileFromAuthUser(authUser: { id: string; email?: string; created_at?: string; user_metadata?: Record<string, any> }) {
  const metadata = authUser.user_metadata ?? {};
  const role = resolveRole(authUser.id, metadata.role);
  return {
    id: authUser.id,
    role,
    full_name: metadata.full_name || authUser.email?.split("@")[0] || "User",
    student_profile: role === "student" ? metadata.studentProfile ?? {} : null,
    founder_profile: role === "founder" ? metadata.founderProfile ?? {} : null,
    edc_profile: role === "edc" ? metadata.edcProfile ?? {} : null,
    created_at: authUser.created_at,
  };
}

function mapProfile(row: Record<string, any>, authUser: { id: string; email?: string; created_at?: string }) {
  return {
    id: row.id,
    name: row.full_name || authUser.email?.split("@")[0] || "User",
    email: authUser.email ?? "",
    role: resolveRole(authUser.id, row.role),
    createdAt: authUser.created_at ?? row.created_at,
    ...(row.student_profile ? { studentProfile: row.student_profile } : {}),
    ...(row.founder_profile ? { founderProfile: row.founder_profile } : {}),
    ...(row.edc_profile ? { edcProfile: row.edc_profile } : {}),
  };
}

function fallbackResponse<T>(value: T, message?: string) {
  return {
    success: true,
    data: value,
    ...(message ? { message } : {}),
  };
}

function mapApplication(row: Record<string, any>) {
  return {
    id: row.id,
    requirementId: row.requirement_id ?? row.requirementId,
    founderEmail: row.founder_email ?? row.founderEmail,
    applicantId: row.applicant_id ?? row.applicantId,
    applicantName: row.applicant_name ?? row.applicantName,
    applicantEmail: row.applicant_email ?? row.applicantEmail,
    roleTitle: row.role_title ?? row.roleTitle,
    companyName: row.company_name ?? row.companyName,
    department: row.department,
    college: row.college,
    linkedinUrl: row.linkedin_url ?? row.linkedinUrl,
    githubUrl: row.github_url ?? row.githubUrl,
    portfolioUrl: row.portfolio_url ?? row.portfolioUrl,
    skills: row.skills,
    note: row.note,
    createdAt: row.created_at ?? row.createdAt,
    status: row.status,
    resumePath: row.resume_path ?? row.resumePath,
  };
}

function mapRequirement(row: Record<string, any>) {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    stack: row.stack ?? [],
    location: row.location,
    stipend: row.stipend,
    status: row.status,
    approvalStatus: row.approval_status ?? row.approvalStatus,
    approvedBy: row.approved_by ?? row.approvedBy,
    approvedAt: row.approved_at ?? row.approvedAt,
    posted: row.posted,
    postedDate: row.posted_date ?? row.postedDate,
    deadline: row.deadline,
    isUrgent: row.is_urgent ?? row.isUrgent,
    founderEmail: row.founder_email ?? row.founderEmail,
    founderId: row.founder_id ?? row.founderId,
    blurb: row.blurb,
    edcNotes: row.edc_notes ?? row.edcNotes,
    rejectionReason: row.rejection_reason ?? row.rejectionReason,
  };
}

async function getRequirementsFromSupabase(includeAll = false) {
  if (!supabase) {
    return includeAll ? [...store.requirements] : store.requirements.filter((r) => r.approvalStatus === "APPROVED");
  }

  const { data, error } = await db()!.from("requirements").select("*");
  if (error) {
    throw new Error("Could not load requirements from Supabase.");
  }

  const requirements = (data ?? []).map(mapRequirement);
  return includeAll ? requirements : requirements.filter((r) => r.approvalStatus === "APPROVED");
}

async function getApplicationsByQueries(studentEmail?: string, founderEmail?: string, founderCompany?: string) {
  if (!supabase) {
    let filtered = [...store.applications];
    if (studentEmail) {
      filtered = filtered.filter((a) => a.applicantEmail.toLowerCase() === studentEmail.toLowerCase());
    }
    if (founderEmail) {
      filtered = filtered.filter((a) => a.founderEmail?.toLowerCase() === founderEmail.toLowerCase());
    }
    if (founderCompany) {
      filtered = filtered.filter((a) => a.companyName?.toLowerCase() === founderCompany.toLowerCase());
    }
    return filtered;
  }

  let query = db()!.from("applications").select("*");

  if (studentEmail) {
    query = query.ilike("applicant_email", studentEmail);
  }

  if (founderEmail) {
    query = query.ilike("founder_email", founderEmail);
  }

  if (founderCompany) {
    query = query.ilike("company_name", founderCompany);
  }

  const { data, error } = await query;
  if (error || !Array.isArray(data)) {
    return [];
  }

  return data;
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", supabaseEnabled: Boolean(supabase) });
});

app.get("/api/profile", requireAuthenticatedUser, async (_req, res) => {
  const authUser = res.locals.authUser as { id: string; email?: string; created_at?: string; user_metadata?: Record<string, any> };
  if (!supabase) {
    res.status(503).json({ error: "Supabase is not configured." });
    return;
  }

  const { data, error } = await db()!.from("profiles").select("*").eq("id", authUser.id).maybeSingle();
  if (error) {
    res.status(500).json({ error: "Could not load your profile." });
    return;
  }

  if (data) {
    res.json(mapProfile(data, authUser));
    return;
  }

  const initialProfile = profileFromAuthUser(authUser);
  const { data: created, error: createError } = await db()!.from("profiles").upsert(initialProfile).select("*").single();
  if (createError || !created) {
    res.status(500).json({ error: "Could not initialize your profile. Apply the profiles migration in Supabase." });
    return;
  }

  res.json(mapProfile(created, authUser));
});

app.put("/api/profile", requireAuthenticatedUser, async (req, res) => {
  const authUser = res.locals.authUser as { id: string; email?: string; created_at?: string; user_metadata?: Record<string, any> };
  if (!supabase) {
    res.status(503).json({ error: "Supabase is not configured." });
    return;
  }

  const initialProfile = profileFromAuthUser(authUser);
  const role = initialProfile.role;
  const body = req.body ?? {};
  const profileRow = {
    id: authUser.id,
    role,
    full_name: typeof body.name === "string" ? body.name.trim() : initialProfile.full_name,
    student_profile: role === "student" ? body.studentProfile ?? initialProfile.student_profile : null,
    founder_profile: role === "founder" ? body.founderProfile ?? initialProfile.founder_profile : null,
    edc_profile: role === "edc" ? body.edcProfile ?? initialProfile.edc_profile : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await db()!.from("profiles").upsert(profileRow).select("*").single();
  if (error || !data) {
    res.status(500).json({ error: "Could not save your profile." });
    return;
  }

  res.json(mapProfile(data, authUser));
});

app.get("/api/requirements", async (req, res) => {
  const includeAll = req.query.includeAll === "true";
  try {
    const requirements = await getRequirementsFromSupabase(includeAll);
    res.json(requirements);
  } catch {
    res.status(500).json({ error: "Could not load requirements." });
  }
});

app.get("/api/requirements/:id", async (req, res) => {
  try {
    const requirements = await getRequirementsFromSupabase(true);
    const requirement = requirements.find((r) => r.id === req.params.id);
    if (!requirement) {
      res.status(404).json({ error: "Requirement not found" });
      return;
    }
    res.json(requirement);
  } catch {
    res.status(500).json({ error: "Could not load requirement." });
  }
});

app.post("/api/requirements", requireAuthenticatedUser, async (req, res) => {
  const authUser = res.locals.authUser as { email?: string; id: string };
  if (!authUser.email) {
    res.status(400).json({ error: "Your Supabase account must have an email address." });
    return;
  }

  const input = req.body ?? {};
  const status = input.deadline
    ? (() => {
        const daysUntilDeadline = Math.ceil((new Date(input.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilDeadline <= 7 ? "CLOSING SOON" : "OPEN";
      })()
    : "OPEN";

  const requirement = {
    id: `REQ-${randomUUID().slice(0, 8).toUpperCase()}`,
    company: input.company,
    role: input.role,
    stack: String(input.stack ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    location: input.location || "Remote",
    stipend: input.stipend || "Unpaid",
    status,
    approval_status: "PENDING_APPROVAL",
    posted: "Just now",
    posted_date: new Date().toISOString(),
    deadline: input.deadline
      ? new Date(input.deadline).toISOString()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_urgent: false,
    founder_id: authUser.id,
    founder_email: authUser.email,
    blurb: input.blurb || "No description provided yet.",
  };

  if (!supabase) {
    res.status(503).json({ error: "Supabase is required to save requirements." });
    return;
  }

  const { data, error } = await db()!.from("requirements").insert([requirement]).select().single();
  if (error || !data) {
    res.status(500).json({ error: "Could not save the requirement to Supabase." });
    return;
  }

  const mapped = mapRequirement(data);
  store.requirements = [mapped, ...store.requirements];
  res.status(201).json(fallbackResponse(mapped, "Requirement created successfully."));
});

app.post("/api/requirements/:id/approve", requireAuthenticatedUser, requireEdcUser, async (req, res) => {
  const updatedBy = req.body?.approvedBy || "EDC Incubation Cell";
  let current;
  try {
    current = await getRequirementsFromSupabase(true);
  } catch {
    res.status(500).json({ error: "Could not load the requirement from Supabase." });
    return;
  }
  const requirement = current.find((item) => item.id === req.params.id);

  if (!requirement) {
    res.status(404).json({ error: "Requirement not found" });
    return;
  }

  if (!supabase) {
    res.status(503).json({ error: "Supabase is required to approve requirements." });
    return;
  }

  const { data, error } = await db()!.from("requirements").update({
    approval_status: "APPROVED",
    approved_by: updatedBy,
    approved_at: new Date().toISOString(),
  }).eq("id", req.params.id).select().single();
  if (error || !data) {
    res.status(500).json({ error: "Could not save the approval to Supabase." });
    return;
  }

  const mapped = mapRequirement(data);
  store.requirements = store.requirements.map((item) => (item.id === req.params.id ? mapped : item));
  res.json(fallbackResponse(mapped, "Requirement approved."));
});

app.post("/api/requirements/:id/reject", requireAuthenticatedUser, requireEdcUser, async (req, res) => {
  const reason = req.body?.reason || "Does not meet campus incubation requisites.";
  let current;
  try {
    current = await getRequirementsFromSupabase(true);
  } catch {
    res.status(500).json({ error: "Could not load the requirement from Supabase." });
    return;
  }
  const requirement = current.find((item) => item.id === req.params.id);

  if (!requirement) {
    res.status(404).json({ error: "Requirement not found" });
    return;
  }

  if (!supabase) {
    res.status(503).json({ error: "Supabase is required to reject requirements." });
    return;
  }

  const { data, error } = await db()!.from("requirements").update({
    approval_status: "REJECTED",
    edc_notes: reason,
    rejection_reason: reason,
  }).eq("id", req.params.id).select().single();
  if (error || !data) {
    res.status(500).json({ error: "Could not save the rejection to Supabase." });
    return;
  }

  const mapped = mapRequirement(data);
  store.requirements = store.requirements.map((item) => (item.id === req.params.id ? mapped : item));
  res.json(fallbackResponse(mapped, "Requirement rejected."));
});

app.get("/api/startups", async (_req, res) => {
  res.json(store.startups);
});

app.get("/api/startups/:id", async (req, res) => {
  const startup = store.startups.find((item) => item.id === req.params.id);
  if (!startup) {
    res.status(404).json({ error: "Startup not found" });
    return;
  }
  res.json(startup);
});

app.get("/api/applications", requireAuthenticatedUser, async (req, res) => {
  const authUser = res.locals.authUser as { email?: string };
  const requestedStudentEmail = typeof req.query.studentEmail === "string" ? req.query.studentEmail : undefined;
  const requestedFounderEmail = typeof req.query.founderEmail === "string" ? req.query.founderEmail : undefined;
  const studentEmail = requestedStudentEmail && requestedStudentEmail.toLowerCase() === authUser.email?.toLowerCase()
    ? authUser.email
    : undefined;
  const founderEmail = requestedFounderEmail && requestedFounderEmail.toLowerCase() === authUser.email?.toLowerCase()
    ? authUser.email
    : undefined;

  if ((!studentEmail && !founderEmail) || (requestedStudentEmail && !studentEmail) || (requestedFounderEmail && !founderEmail)) {
    res.status(403).json({ error: "You can only view your own applications." });
    return;
  }

  const founderCompany = typeof req.query.founderCompany === "string" ? req.query.founderCompany : undefined;

  const applications = await getApplicationsByQueries(studentEmail, founderEmail, founderCompany);
  res.json(applications.map((application) => mapApplication(application)));
});

app.post("/api/applications", requireAuthenticatedUser, async (req, res) => {
  const authUser = res.locals.authUser as { email?: string; id: string };
  if (!authUser.email) {
    res.status(400).json({ error: "Your Supabase account must have an email address." });
    return;
  }

  if (!supabase) {
    res.status(503).json({ error: "Supabase is required to submit applications." });
    return;
  }

  const body = req.body ?? {};
  const { data: requirement, error: requirementError } = await db()!
    .from("requirements")
    .select("*")
    .eq("id", body.requirementId)
    .maybeSingle();

  if (requirementError) {
    res.status(500).json({ error: "Could not verify this requirement." });
    return;
  }
  if (!requirement) {
    res.status(404).json({ error: "Requirement not found." });
    return;
  }

  const application = {
    id: randomUUID(),
    requirement_id: body.requirementId,
    founder_id: requirement.founder_id ?? null,
    founder_email: requirement.founder_email ?? requirement.founderEmail,
    applicant_id: authUser.id,
    applicant_name: body.applicantName,
    applicant_email: authUser.email,
    role_title: requirement.role,
    company_name: requirement.company,
    department: body.department,
    college: body.college,
    linkedin_url: body.linkedinUrl,
    github_url: body.githubUrl,
    portfolio_url: body.portfolioUrl,
    skills: body.skills,
    note: body.note,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await db()!.from("applications").insert([application]).select().single();
  if (error || !data) {
    res.status(500).json({ error: "Could not save the application." });
    return;
  }

  store.applications = [mapApplication(data), ...store.applications];
  res.status(201).json(fallbackResponse(mapApplication(data), "Application created successfully."));
});

app.post("/api/applications/:id/resume-upload", requireAuthenticatedUser, async (req, res) => {
  const authUser = res.locals.authUser as { id: string };
  const contentType = req.body?.contentType;
  const fileSize = Number(req.body?.fileSize);

  if (contentType !== "application/pdf" || !Number.isInteger(fileSize) || fileSize < 1 || fileSize > 5 * 1024 * 1024) {
    res.status(400).json({ error: "Upload a PDF resume no larger than 5 MB." });
    return;
  }

  if (!supabase) {
    res.status(503).json({ error: "Supabase Storage is not configured." });
    return;
  }

  const { data: application, error: applicationError } = await db()!
    .from("applications")
    .select("id, applicant_id")
    .eq("id", req.params.id)
    .maybeSingle();

  if (applicationError || !application) {
    res.status(404).json({ error: "Application not found." });
    return;
  }
  if (application.applicant_id !== authUser.id) {
    res.status(403).json({ error: "Only the applicant can upload this resume." });
    return;
  }

  const path = `${authUser.id}/${application.id}/resume.pdf`;
  const { data, error } = await supabase.storage.from("application-files").createSignedUploadUrl(path, { upsert: true });
  if (error || !data) {
    res.status(500).json({ error: "Could not prepare the resume upload. Check the Storage setup." });
    return;
  }

  res.json({ path, token: data.token });
});

app.patch("/api/applications/:id/resume", requireAuthenticatedUser, async (req, res) => {
  const authUser = res.locals.authUser as { id: string };
  const expectedPath = `${authUser.id}/${req.params.id}/resume.pdf`;
  if (req.body?.path !== expectedPath) {
    res.status(400).json({ error: "Invalid resume path." });
    return;
  }

  if (!supabase) {
    res.status(503).json({ error: "Supabase Storage is not configured." });
    return;
  }

  const { data: files, error: listError } = await supabase.storage
    .from("application-files")
    .list(`${authUser.id}/${req.params.id}`, { search: "resume.pdf" });
  if (listError || !files?.some((file) => file.name === "resume.pdf")) {
    res.status(400).json({ error: "The uploaded resume could not be found." });
    return;
  }

  const { data, error } = await db()!
    .from("applications")
    .update({ resume_path: expectedPath })
    .eq("id", req.params.id)
    .eq("applicant_id", authUser.id)
    .select("*")
    .maybeSingle();
  if (error || !data) {
    res.status(500).json({ error: "Could not attach the resume to this application." });
    return;
  }

  res.json(fallbackResponse(mapApplication(data), "Resume uploaded successfully."));
});

app.get("/api/applications/:id/resume-url", requireAuthenticatedUser, async (req, res) => {
  const authUser = res.locals.authUser as { id: string; email?: string };
  if (!supabase) {
    res.status(503).json({ error: "Supabase Storage is not configured." });
    return;
  }

  const { data: application, error: applicationError } = await db()!
    .from("applications")
    .select("applicant_id, founder_id, founder_email, resume_path")
    .eq("id", req.params.id)
    .maybeSingle();
  if (applicationError || !application) {
    res.status(404).json({ error: "Application not found." });
    return;
  }

  const isApplicant = application.applicant_id === authUser.id;
  const isFounder = application.founder_id === authUser.id ||
    application.founder_email?.toLowerCase() === authUser.email?.toLowerCase();
  if (!isApplicant && !isFounder) {
    res.status(403).json({ error: "You cannot access this resume." });
    return;
  }
  if (!application.resume_path) {
    res.status(404).json({ error: "No resume is attached to this application." });
    return;
  }

  const { data, error } = await supabase.storage
    .from("application-files")
    .createSignedUrl(application.resume_path, 60);
  if (error || !data) {
    res.status(500).json({ error: "Could not create a resume download link." });
    return;
  }

  res.json({ url: data.signedUrl });
});

app.patch("/api/applications/:id/status", requireAuthenticatedUser, async (req, res) => {
  const authUser = res.locals.authUser as { email?: string; id: string };
  const status = req.body?.status;
  const allowedStatuses = ["Reviewing", "Interviewing", "Accepted", "Selected", "Rejected"];
  if (!allowedStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid application status." });
    return;
  }

  if (!supabase) {
    res.status(503).json({ error: "Supabase is required to update applications." });
    return;
  }

  const { data: application, error: applicationError } = await db()!
    .from("applications")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();

  if (applicationError || !application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  const founderEmail = application.founder_email ?? application.founderEmail;
  if (application.founder_id !== authUser.id && founderEmail?.toLowerCase() !== authUser.email?.toLowerCase()) {
    res.status(403).json({ error: "Only the founder can update this application." });
    return;
  }

  const { data, error } = await db()!
    .from("applications")
    .update({ status })
    .eq("id", req.params.id)
    .select("*")
    .single();
  if (error || !data) {
    res.status(500).json({ error: "Could not update the application." });
    return;
  }

  const updated = mapApplication(data);
  store.applications = store.applications.map((item) => (item.id === req.params.id ? updated : item));
  res.json(fallbackResponse(updated, "Application status updated."));
});

app.listen(PORT, () => {
  console.log(`FounderWeb backend running on http://localhost:${PORT}`);
});
