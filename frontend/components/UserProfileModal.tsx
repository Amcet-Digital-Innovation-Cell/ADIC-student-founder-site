"use client";

import React, { useState } from "react";
import {
  X,
  User,
  GraduationCap,
  Rocket,
  Landmark,
  Linkedin,
  Github,
  Globe,
  Check,
  Building,
  BookOpen,
  Code2,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function UserProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, role, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Student profile edit state
  const [name, setName] = useState(user?.name || "");
  const [department, setDepartment] = useState(user?.studentProfile?.department || "");
  const [college, setCollege] = useState(user?.studentProfile?.college || "");
  const [yearOfStudy, setYearOfStudy] = useState(user?.studentProfile?.yearOfStudy || "3rd Year");
  const [rollNo, setRollNo] = useState(user?.studentProfile?.rollNo || "");
  const [phone, setPhone] = useState(user?.studentProfile?.phone || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.studentProfile?.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = useState(user?.studentProfile?.githubUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.studentProfile?.portfolioUrl || "");
  const [bio, setBio] = useState(user?.studentProfile?.bio || "");
  const [skillsStr, setSkillsStr] = useState(user?.studentProfile?.skills?.join(", ") || "");

  // Founder profile edit state
  const [companyName, setCompanyName] = useState(user?.founderProfile?.companyName || "");
  const [sector, setSector] = useState(user?.founderProfile?.sector || "");
  const [stage, setStage] = useState(user?.founderProfile?.stage || "");
  const [location, setLocation] = useState(user?.founderProfile?.location || "");
  const [websiteUrl, setWebsiteUrl] = useState(user?.founderProfile?.websiteUrl || "");

  // EDC profile edit state
  const [institutionName, setInstitutionName] = useState(user?.edcProfile?.institutionName || "");
  const [cellName, setCellName] = useState(user?.edcProfile?.cellName || "");
  const [designation, setDesignation] = useState(user?.edcProfile?.designation || "");
  const [portalUrl, setPortalUrl] = useState(user?.edcProfile?.portalUrl || "");

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    let updated: Parameters<typeof updateProfile>[0] = { name };

    if (role === "student") {
      const skillsArray = skillsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      updated = {
        name,
        studentProfile: {
          ...user.studentProfile,
          department,
          college,
          yearOfStudy,
          rollNo,
          phone,
          linkedinUrl,
          githubUrl,
          portfolioUrl,
          bio,
          skills: skillsArray.length > 0 ? skillsArray : user.studentProfile?.skills || [],
        },
      };
    } else if (role === "founder") {
      updated = {
        name,
        founderProfile: {
          ...user.founderProfile,
          companyName,
          sector,
          stage,
          location,
          websiteUrl,
          linkedinUrl,
        },
      };
    } else if (role === "edc") {
      updated = {
        name,
        edcProfile: {
          ...user.edcProfile,
          institutionName,
          cellName,
          designation,
          portalUrl,
          linkedinUrl,
        },
      };
    }

    const result = await updateProfile(updated);
    if (!result.success) {
      setSaveError(result.message || "Could not save your profile.");
      return;
    }

    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const roleBadgeStyle =
    role === "student"
      ? { bg: "rgba(184,149,104,0.15)", text: "var(--color-champagne-gold)" }
      : role === "founder"
      ? { bg: "rgba(157,98,95,0.15)", text: "var(--color-blush-suede)" }
      : { bg: "rgba(169,156,140,0.15)", text: "var(--color-muted-taupe)" };

  const sectionClass = "rounded-xl p-4 text-xs";
  const sectionStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      style={{ background: "rgba(17,17,17,0.55)" }}
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl animate-pop-in"
        style={{
          background: "var(--color-rosso-onyx)",
          border: "1px solid var(--border)",
          boxShadow: "0 24px 80px rgba(17,17,17,0.30), 0 4px 20px rgba(17,17,17,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold accent top bar */}
        <div className="h-1 rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, var(--color-champagne-gold), var(--color-blush-suede))" }} />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-md p-1.5 transition"
          style={{ color: "var(--color-muted-taupe)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(184,149,104,0.10)"; (e.currentTarget as HTMLElement).style.color = "var(--color-black-leather)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--color-muted-taupe)"; }}
        >
          <X size={18} />
        </button>

        <div className="p-6">
          {/* Modal Header */}
          <div className="flex items-start gap-4 pb-4" style={{ borderBottom: "1px solid var(--divider)" }}>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl font-serif text-2xl font-bold shadow-sm"
              style={{
                background: "var(--color-champagne-gold)",
                color: "var(--color-black-leather)",
              }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold" style={{ color: "var(--color-black-leather)" }}>
                  {user.name}
                </h2>
                <span
                  className="rounded-full px-2.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-wider"
                  style={{ background: roleBadgeStyle.bg, color: roleBadgeStyle.text }}
                >
                  {role}
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-xs mt-0.5" style={{ color: "var(--color-muted-taupe)" }}>
                <Mail size={12} /> {user.email} · ID: {user.id}
              </p>
              {savedSuccess && (
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-champagne-gold)" }}>
                  <Check size={13} /> Profile updated successfully!
                </p>
              )}
              {saveError && <p className="mt-1 text-xs font-semibold text-red-700">{saveError}</p>}
            </div>
          </div>

          {/* Modal Body */}
          {!isEditing ? (
            <div className="mt-5 space-y-4">
              {/* Student View */}
              {role === "student" && user.studentProfile && (
                <>
                  <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${sectionClass}`} style={sectionStyle}>
                    <div>
                      <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: "var(--color-muted-taupe)" }}>
                        Department
                      </span>
                      <p className="font-semibold text-sm mt-0.5" style={{ color: "var(--color-black-leather)" }}>
                        {user.studentProfile.department}
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: "var(--color-muted-taupe)" }}>
                        College / University
                      </span>
                      <p className="font-semibold text-sm mt-0.5" style={{ color: "var(--color-black-leather)" }}>
                        {user.studentProfile.college}
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: "var(--color-muted-taupe)" }}>
                        Year of Study & ID
                      </span>
                      <p className="font-semibold text-sm mt-0.5" style={{ color: "var(--color-black-leather)" }}>
                        {user.studentProfile.yearOfStudy}{" "}
                        {user.studentProfile.rollNo ? `(${user.studentProfile.rollNo})` : ""}
                      </p>
                    </div>
                    <div>
                      <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: "var(--color-muted-taupe)" }}>
                        Availability
                      </span>
                      <p className="font-semibold text-sm mt-0.5" style={{ color: "var(--color-black-leather)" }}>
                        {user.studentProfile.availability || "Part-time"}
                      </p>
                    </div>
                  </div>

                  {/* Professional Links */}
                  <div className={sectionClass} style={sectionStyle}>
                    <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider mb-2.5"
                      style={{ color: "var(--color-muted-taupe)" }}>
                      Verified Links &amp; Portfolios
                    </h4>
                    <div className="space-y-2">
                      {user.studentProfile.linkedinUrl ? (
                        <div className="flex items-center gap-2">
                          <Linkedin size={14} className="text-[#0A66C2] shrink-0" />
                          <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>LinkedIn:</span>
                          <a href={user.studentProfile.linkedinUrl} target="_blank" rel="noreferrer"
                            className="font-mono text-[#0A66C2] underline truncate hover:opacity-80">
                            {user.studentProfile.linkedinUrl}
                          </a>
                        </div>
                      ) : (
                        <p className="italic" style={{ color: "var(--color-muted-taupe)" }}>No LinkedIn profile linked</p>
                      )}

                      {user.studentProfile.githubUrl ? (
                        <div className="flex items-center gap-2">
                          <Github size={14} className="shrink-0" style={{ color: "var(--color-black-leather)" }} />
                          <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>GitHub:</span>
                          <a href={user.studentProfile.githubUrl} target="_blank" rel="noreferrer"
                            className="font-mono underline truncate hover:opacity-80"
                            style={{ color: "var(--color-black-leather)" }}>
                            {user.studentProfile.githubUrl}
                          </a>
                        </div>
                      ) : (
                        <p className="italic" style={{ color: "var(--color-muted-taupe)" }}>No GitHub profile linked</p>
                      )}

                      {user.studentProfile.portfolioUrl && (
                        <div className="flex items-center gap-2">
                          <Globe size={14} className="shrink-0" style={{ color: "var(--color-champagne-gold)" }} />
                          <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>Portfolio:</span>
                          <a href={user.studentProfile.portfolioUrl} target="_blank" rel="noreferrer"
                            className="font-mono underline truncate hover:opacity-80"
                            style={{ color: "var(--color-champagne-gold)" }}>
                            {user.studentProfile.portfolioUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className={sectionClass} style={sectionStyle}>
                    <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider mb-2"
                      style={{ color: "var(--color-muted-taupe)" }}>
                      Key Tech Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {user.studentProfile.skills?.map((s) => (
                        <span key={s}
                          className="tag-green rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  {user.studentProfile.bio && (
                    <div className={sectionClass} style={sectionStyle}>
                      <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider mb-1"
                        style={{ color: "var(--color-muted-taupe)" }}>
                        Bio &amp; Headline
                      </h4>
                      <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {user.studentProfile.bio}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Founder View */}
              {role === "founder" && user.founderProfile && (
                <div className={`space-y-3 ${sectionClass}`} style={sectionStyle}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="font-mono text-[11px] uppercase" style={{ color: "var(--color-muted-taupe)" }}>Company</span>
                      <p className="text-sm font-bold mt-0.5" style={{ color: "var(--color-black-leather)" }}>{user.founderProfile.companyName}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[11px] uppercase" style={{ color: "var(--color-muted-taupe)" }}>Sector</span>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--color-black-leather)" }}>{user.founderProfile.sector}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[11px] uppercase" style={{ color: "var(--color-muted-taupe)" }}>Stage</span>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--color-black-leather)" }}>{user.founderProfile.stage}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[11px] uppercase" style={{ color: "var(--color-muted-taupe)" }}>Location</span>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--color-black-leather)" }}>{user.founderProfile.location}</p>
                    </div>
                  </div>
                  {user.founderProfile.hiringNeeds && (
                    <div className="pt-2" style={{ borderTop: "1px solid var(--divider)" }}>
                      <span className="font-mono text-[11px] uppercase" style={{ color: "var(--color-muted-taupe)" }}>Hiring Needs</span>
                      <p className="mt-0.5" style={{ color: "var(--text-secondary)" }}>{user.founderProfile.hiringNeeds}</p>
                    </div>
                  )}
                </div>
              )}

              {/* EDC View */}
              {role === "edc" && user.edcProfile && (
                <div className={`space-y-3 ${sectionClass}`} style={sectionStyle}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="font-mono text-[11px] uppercase" style={{ color: "var(--color-muted-taupe)" }}>Institution</span>
                      <p className="text-sm font-bold mt-0.5" style={{ color: "var(--color-black-leather)" }}>{user.edcProfile.institutionName}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[11px] uppercase" style={{ color: "var(--color-muted-taupe)" }}>Cell / Chapter</span>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--color-black-leather)" }}>{user.edcProfile.cellName}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[11px] uppercase" style={{ color: "var(--color-muted-taupe)" }}>Designation</span>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--color-black-leather)" }}>{user.edcProfile.designation}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[11px] uppercase" style={{ color: "var(--color-muted-taupe)" }}>Incubated Startups</span>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--color-black-leather)" }}>
                        {user.edcProfile.startupsIncubated || 0} active ventures
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsEditing(true)} className="text-xs font-bold">
                  ✏️ Edit Profile Details
                </Button>
                <Button onClick={onClose} variant="primary" className="text-xs font-bold">
                  Done
                </Button>
              </div>
            </div>
          ) : (
            /* EDITING FORM */
            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold tracking-wide" style={{ color: "var(--color-black-leather)" }}>Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" />
              </div>

              {role === "student" && (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold tracking-wide" style={{ color: "var(--color-black-leather)" }}>Department / Branch</label>
                      <Input value={department} onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Computer Science & Engineering" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold tracking-wide" style={{ color: "var(--color-black-leather)" }}>College / University</label>
                      <Input value={college} onChange={(e) => setCollege(e.target.value)}
                        placeholder="e.g. IIT Madras" className="mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold tracking-wide" style={{ color: "var(--color-black-leather)" }}>Year of Study</label>
                      <Input value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)}
                        placeholder="e.g. 3rd Year" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold tracking-wide" style={{ color: "var(--color-black-leather)" }}>Roll / Registration No</label>
                      <Input value={rollNo} onChange={(e) => setRollNo(e.target.value)}
                        placeholder="e.g. CS22B045" className="mt-1" />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1 text-xs font-semibold tracking-wide" style={{ color: "var(--color-black-leather)" }}>
                      <Linkedin size={13} className="text-[#0A66C2]" /> LinkedIn Profile URL
                    </label>
                    <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="mt-1 font-mono text-xs" />
                  </div>

                  <div>
                    <label className="flex items-center gap-1 text-xs font-semibold tracking-wide" style={{ color: "var(--color-black-leather)" }}>
                      <Github size={13} /> GitHub Profile URL
                    </label>
                    <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="mt-1 font-mono text-xs" />
                  </div>

                  <div>
                    <label className="flex items-center gap-1 text-xs font-semibold tracking-wide" style={{ color: "var(--color-black-leather)" }}>
                      <Globe size={13} style={{ color: "var(--color-champagne-gold)" }} /> Portfolio / Website Link
                    </label>
                    <Input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://myportfolio.dev"
                      className="mt-1 font-mono text-xs" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold tracking-wide" style={{ color: "var(--color-black-leather)" }}>Skills (comma separated)</label>
                    <Input value={skillsStr} onChange={(e) => setSkillsStr(e.target.value)}
                      placeholder="React, Next.js, Python, Tailwind" className="mt-1" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold tracking-wide" style={{ color: "var(--color-black-leather)" }}>Short Bio</label>
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className="mt-1 text-xs" />
                  </div>
                </>
              )}

              {role === "founder" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold tracking-wide" style={{ color: "var(--color-black-leather)" }}>Company Name</label>
                      <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold tracking-wide" style={{ color: "var(--color-black-leather)" }}>Sector</label>
                      <Input value={sector} onChange={(e) => setSector(e.target.value)} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-wide" style={{ color: "var(--color-black-leather)" }}>Location</label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1" />
                  </div>
                </>
              )}

              {role === "edc" && (
                <>
                  <div>
                    <label className="text-xs font-semibold tracking-wide" style={{ color: "var(--color-black-leather)" }}>Institution Name</label>
                    <Input value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-wide" style={{ color: "var(--color-black-leather)" }}>Cell / Chapter Name</label>
                    <Input value={cellName} onChange={(e) => setCellName(e.target.value)} className="mt-1" />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3" style={{ borderTop: "1px solid var(--divider)" }}>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="text-xs font-bold">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
