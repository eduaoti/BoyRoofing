'use client'

import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Roboto, Montserrat } from "next/font/google";
import Breadcrumbs from "@/components/Breadcrumbs";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import { usePathname } from "next/navigation";

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
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();
  const lang = pathname.startsWith("/en") ? "en" : "es";

  return (
    <html lang={lang}>
      <body className={`${montserrat.variable} ${roboto.variable}`}>
        <Navbar />
        <Breadcrumbs />
        <main>{children}</main>
        <ReviewsCarousel lang={lang} />
        <Footer />
      </body>
    </html>
  );
}
