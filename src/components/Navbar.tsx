import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  return (
    <header className="w-full border-b border-black dark:border-white bg-white dark:bg-black transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand without boundary on logo, with GATE-2027 below */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <Image
              src="/openmentor-logo.webp"
              alt="OpenMentor Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-base tracking-tight text-black dark:text-white">
              GATE-openmentor
            </span>
          </div>
        </Link>

        {/* Change theme button */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
