"use client";

import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const changeLang = (lang: "en" | "es") => {
    const segments = pathname.split("/").filter(Boolean);

    // si la ruta actual es /en/... o /es/..., reemplazarla
    if (segments[0] === "en" || segments[0] === "es") {
      segments[0] = lang;
    } else {
      // si está en /
      segments.unshift(lang);
    }

    router.push("/" + segments.join("/"));
  };

  return (
    <div className="flex gap-2 text-xs">
      <button onClick={() => changeLang("en")} className="hover:text-br-red-light">
        EN
      </button>
      <span className="text-br-stone">|</span>
      <button onClick={() => changeLang("es")} className="hover:text-br-red-light">
        ES
      </button>
    </div>
  );
}
