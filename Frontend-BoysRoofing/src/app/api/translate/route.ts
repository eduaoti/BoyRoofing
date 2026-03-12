import { NextRequest } from "next/server";

const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");
  const from = searchParams.get("from") || "es";
  const to = searchParams.get("to") || "en";

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return Response.json({ translated: "" });
  }

  const langpair = `${from}|${to}`;
  if (from === to) {
    return Response.json({ translated: text.trim() });
  }

  try {
    const res = await fetch(
      `${MYMEMORY_URL}?q=${encodeURIComponent(text.trim().slice(0, 500))}&langpair=${encodeURIComponent(langpair)}`
    );
    if (!res.ok) {
      return Response.json({ translated: text.trim() });
    }
    const data = await res.json();
    const translated =
      data?.responseData?.translatedText ?? text.trim();
    return Response.json({ translated });
  } catch {
    return Response.json({ translated: text.trim() });
  }
}
