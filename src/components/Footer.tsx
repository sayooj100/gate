import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-black dark:border-white bg-white dark:bg-black py-6 transition-colors">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-black dark:text-white">
        <div>
          <span>&copy; 2026 OpenMentor GATE Portal.</span>
        </div>
        <div className="flex items-center gap-4 font-medium">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/branches/bm" className="hover:underline">
            Biomedical
          </Link>
        </div>
      </div>
    </footer>
  );
}
