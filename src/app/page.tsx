import Image from 'next/image';
import Link from 'next/link';
import { getMasterCatalogue } from '@/lib/bmData';

export const revalidate = 60; // Auto-revalidate from Cloudflare R2 every 60s

export default async function HomePage() {
  const categories = await getMasterCatalogue();

  return (
    <div className="flex flex-col flex-1 w-full max-w-4xl mx-auto px-4 py-8">
      {/* Top Left-Aligned Hero Section */}
      <section className="text-left w-full">
        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black dark:text-white uppercase">
          ACE YOUR GATE.
        </h1>

        {/* Subtext */}
        <p className="mt-2 text-xs sm:text-sm text-black dark:text-white max-w-xl leading-normal font-normal">
          Practise previous year questions, master every topic, and challenge yourself with mock tests — all in one place.
        </p>

        {/* Indicators in a single row filled solid */}
        <div className="mt-4 flex flex-row items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
          <span className="px-2.5 py-1 rounded bg-black dark:bg-white text-white dark:text-black font-semibold whitespace-nowrap shadow-xs">
            100% Free
          </span>
          <span className="text-black dark:text-white font-bold">•</span>
          <span className="px-2.5 py-1 rounded bg-black dark:bg-white text-white dark:text-black font-semibold whitespace-nowrap shadow-xs">
            Zero Ads
          </span>
          <span className="text-black dark:text-white font-bold">•</span>
          <span className="px-2.5 py-1 rounded bg-black dark:bg-white text-white dark:text-black font-semibold whitespace-nowrap shadow-xs">
            Focused Learning
          </span>
        </div>
      </section>

      {/* Dynamic Category Selection Section driven by master.json catalogue */}
      <section className="mt-8 pt-6 border-t border-black dark:border-white">
        <h2 className="text-xs sm:text-sm font-bold tracking-wider text-black dark:text-white uppercase mb-4">
          Select Your Branch
        </h2>

        {/* 2 columns per row with shadow on branch boxes */}
        <div className="grid grid-cols-2 gap-4 max-w-md">
          {categories.map((cat) => (
            <Link
              key={cat.code}
              href={`/branches/${cat.code.toLowerCase()}`}
              className="group flex flex-col items-center p-3 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all"
            >
              {/* Square Image */}
              <div className="relative w-full aspect-square rounded-lg border border-black dark:border-white overflow-hidden bg-white dark:bg-black">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 180px"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  priority={cat.code === 'GA' || cat.code === 'BM'}
                />
              </div>

              {/* Name of branch below */}
              <span className="mt-2.5 text-xs sm:text-sm font-bold text-center text-black dark:text-white line-clamp-2">
                {cat.name}
              </span>
              <span className="text-[10px] text-black dark:text-white font-semibold">
                ({cat.code})
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
