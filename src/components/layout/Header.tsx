"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/traductor", label: "Traductor" },
  { href: "/clases", label: "Clases" },
  { href: "/dashboard", label: "Progreso" },
] as const;

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="magic-gradient px-6 py-3 shadow-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {/* Logo + Title */}
        <Link href="/" className="flex items-center gap-3">
          <span className="text-xl font-bold text-white drop-shadow-sm">
            Academia Mágica
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 text-sm font-medium text-white/90">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  isActive
                    ? "text-magic-gold drop-shadow-[0_0_6px_rgba(255,184,0,0.5)]"
                    : "text-white/80 hover:text-magic-gold"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
