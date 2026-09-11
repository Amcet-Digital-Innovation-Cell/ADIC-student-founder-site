import { getStartups } from "@/lib/api";
import { StartupCard } from "@/components/StartupCard";

export default async function StartupsPage() {
  const startups = await getStartups();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-serif text-2xl font-bold text-ink">Startups</h1>
      <p className="mt-1 text-[13.5px] text-char/70">The founders currently hiring through the board.</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {startups.map((s) => (
          <StartupCard key={s.id} startup={s} />
        ))}
      </div>
    </main>
  );
}
