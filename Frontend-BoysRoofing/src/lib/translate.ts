const cache = new Map<string, string>();

function cacheKey(text: string, from: string, to: string): string {
  return `${from}|${to}|${text}`;
}

export async function translateText(
  text: string,
  from: "es" | "en",
  to: "es" | "en"
): Promise<string> {
  const trimmed = text?.trim() ?? "";
  if (!trimmed) return "";
  if (from === to) return trimmed;

  const key = cacheKey(trimmed, from, to);
  if (cache.has(key)) return cache.get(key)!;

  const base =
    typeof window !== "undefined" ? window.location.origin : "";
  const url = `${base}/api/translate?text=${encodeURIComponent(trimmed)}&from=${from}&to=${to}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return trimmed;
    const data = await res.json();
    const translated = (data?.translated ?? trimmed) as string;
    cache.set(key, translated);
    return translated;
  } catch {
    return trimmed;
  }
}

/** Traduce en lote evitando duplicados y con cache. */
export async function translateReviewsToEnglish<
  T extends { comment: string; name?: string | null }
>(items: T[]): Promise<T[]> {
  const out: T[] = [];
  for (const item of items) {
    const [comment, name] = await Promise.all([
      translateText(item.comment, "es", "en"),
      item.name?.trim()
        ? translateText(item.name, "es", "en")
        : Promise.resolve(item.name ?? ""),
    ]);
    out.push({ ...item, comment, name: (name || item.name) ?? undefined });
  }
  return out;
}
