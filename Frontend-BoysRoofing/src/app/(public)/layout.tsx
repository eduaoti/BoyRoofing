import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Roboto, Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-montserrat",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto",
});

export default function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: "es" | "en" };
}) {
  const lang = params?.lang ?? "es"; // 👈 por si acaso

  return (
    <html lang={lang}>
      <body className={`${montserrat.variable} ${roboto.variable}`}>
        <Navbar />

        {/* 📌 Breadcrumbs justo debajo del navbar */}
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Breadcrumbs />
        </div>

        <main>{children}</main>

        <Footer />
      </body>
    </html>
  );
}
