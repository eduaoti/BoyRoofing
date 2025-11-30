// src/app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  // Cambia "/es" por "/en" si quisieras que el inglés fuera el default
  redirect("/en");
}
