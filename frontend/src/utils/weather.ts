
// Kata-kata yang menandakan cuaca hujan
const HUJAN = /hujan|gerimis|petir|rain|drizzle|thunder/i;

// Mengecek data cuaca dari backend
export function isRainy(weather: unknown): boolean {
  if (!weather || typeof weather !== "object") return false;
  const w = weather as Record<string, unknown>;
  return [w.description, w.condition, w.main].some(
    (v) => typeof v === "string" && HUJAN.test(v)
  );
}
