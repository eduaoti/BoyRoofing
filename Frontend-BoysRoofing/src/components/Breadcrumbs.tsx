"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {

  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  return (
    <nav className="breadcrumbs">
      <Link href="/">Home</Link>

      {parts.map((segment, index) => {
        const href = "/" + parts.slice(0, index + 1).join("/");

        return (
          <span key={href}>
            {" / "}
            <Link href={href}>
              {segment.charAt(0).toUpperCase() + segment.slice(1)}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
