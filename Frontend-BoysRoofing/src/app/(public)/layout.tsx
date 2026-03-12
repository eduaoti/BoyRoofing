// src/app/(public)/layout.tsx
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SiteImagesProvider } from "@/contexts/SiteImagesContext";
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${montserrat.variable} ${roboto.variable} min-w-0 overflow-x-hidden`}>
        <Navbar />

        {/* 📌 Breadcrumbs justo debajo del navbar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <Breadcrumbs />
        </div>

        <SiteImagesProvider>
        <main>{children}</main>
      </SiteImagesProvider>

        <Footer />
      </body>
    </html>
  );
}
