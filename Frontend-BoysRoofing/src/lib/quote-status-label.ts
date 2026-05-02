/** Etiquetas de estado para UI admin (cotizaciones). */
export function quoteStatusLabel(status: string, locale: "en" | "es"): string {
  const en: Record<string, string> = {
    PENDING: "Pending",
    IN_REVIEW: "In review",
    SENT: "Sent",
    CLOSED: "Closed",
  };
  const es: Record<string, string> = {
    PENDING: "Pendiente",
    IN_REVIEW: "En revisión",
    SENT: "Enviada",
    CLOSED: "Cerrada",
  };
  const map = locale === "es" ? es : en;
  return map[status] ?? status;
}
