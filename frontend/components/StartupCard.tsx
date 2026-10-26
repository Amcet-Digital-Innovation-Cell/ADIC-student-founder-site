import Link from "next/link";
import { MapPin, Users, Briefcase } from "lucide-react";
import type { Startup } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StartupCard({ startup }: { startup: Startup }) {
  return (
    <Link href={`/startups/${startup.id}`}>
      <Card className="flex h-full flex-col gap-3 transition-transform hover:-translate-y-1 hover:shadow-lg">
        <div>
          <h3 className="font-serif text-lg font-bold text-ink">{startup.name}</h3>
          <p className="text-[13px] text-char/70">{startup.tagline}</p>
        </div>
        <p className="text-[13px] leading-relaxed text-char/85">{startup.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-char/65">
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {startup.location}
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} /> {startup.teamSize} people
          </span>
          <Badge className="flex items-center gap-1">
            <Briefcase size={11} /> {startup.openRoles} open role
            {startup.openRoles === 1 ? "" : "s"}
          </Badge>
        </div>
      </Card>
    </Link>
  );
}
