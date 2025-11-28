import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer-gradient text-br-white/90 text-sm">
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col items-center space-y-4">

        {/* 🔗 Redes sociales */}
        <div className="flex space-x-6 text-xl">
          <Link
            href="https://www.facebook.com/share/1C7BhWFubi/?mibextid=wwXIfr"
            target="_blank"
            className="hover:text-br-red-light transition-colors"
          >
            <FaFacebookF />
          </Link>
          <Link
            href="https://www.instagram.com/luisortiz6211?igsh=ZjdxbjJmZ2VyZXhx"
            target="_blank"
            className="hover:text-br-red-light transition-colors"
          >
            <FaInstagram />
          </Link>
        </div>

        {/* 📌 Copyright */}
        <div className="text-center opacity-90">
          © {new Date().getFullYear()} Boys Roofing. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
