import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Users, Calendar } from "lucide-react";
import { getStartup, getRequirements } from "@/lib/api";
import { RequirementCard } from "@/components/RequirementCard";

export default async function StartupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const startup = await getStartup(id);
  if (!startup) notFound();

  const requirements = (await getRequirements()).filter(
    (r) => r.company.toLowerCase() === startup.name.toLowerCase()
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/startups" className="text-[13px] text-ink/70">
        ← Back to startups
      </Link>

      <h1 className="mt-3 font-serif text-3xl font-bold text-ink">{startup.name}</h1>
      <p className="mt-1 text-[15px] text-char/70">{startup.tagline}</p>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-char/65">
        <span className="flex items-center gap-1">
          <MapPin size={12} /> {startup.location}
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} /> {startup.teamSize} people
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} /> Founded {startup.founded}
        </span>
      </div>

      <p className="mt-6 max-w-2xl text-[14.5px] leading-relaxed text-char/85">{startup.description}</p>

      {requirements.length > 0 && (
        <>
          <h2 className="mt-10 font-serif text-lg font-bold text-ink">Open roles</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {requirements.map((r) => (
              <RequirementCard key={r.id} requirement={r} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
