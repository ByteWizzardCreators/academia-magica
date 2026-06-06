"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="magic-gradient px-6 py-3 shadow-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {/* Logo + Title */}
        <a href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo/logo.png"
            alt="Academia Mágica"
            width={40}
            height={40}
            className="object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="text-xl font-bold text-white drop-shadow-sm">
            Academia Mágica
          </span>
        </a>

        {/* Navigation */}
        <nav className="flex items-center gap-4 text-sm font-medium text-white/90">
          <a href="/" className="transition-colors hover:text-magic-gold">
            Inicio
          </a>
        </nav>
      </div>
    </header>
  );
}
