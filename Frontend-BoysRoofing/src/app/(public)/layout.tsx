import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Roboto, Montserrat } from "next/font/google";
import Breadcrumbs from "@/components/Breadcrumbs";

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
    <html lang="es">
      <body className={`${montserrat.variable} ${roboto.variable}`}>
        <Navbar />
        <Breadcrumbs />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
