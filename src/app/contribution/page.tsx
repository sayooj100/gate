import type { Metadata } from 'next';
import Image from 'next/image';
import { getContributionConfig } from '@/lib/serverStorage';
import { Heart, Copy } from 'lucide-react';
import { CopyUpiButton } from '@/components/CopyUpiButton';

export const metadata: Metadata = {
  title: 'Contribute to OpenMentor | Free Education Support',
  description:
    'Support OpenMentor to keep GATE preparation 100% free and accessible to students across India.',
};

export const revalidate = 0; // Ensure fresh data on visits

export default async function ContributionPage() {
  const config = await getContributionConfig();

  return (
    <div className="flex flex-col flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Header section */}
      <section className="text-left mb-8 pb-6 border-b border-black dark:border-white">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-red-500 fill-current" />
          <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
            Community Support
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black dark:text-white uppercase">
          {config.heading || 'Support OpenMentor'}
        </h1>
        {config.subtitle && (
          <p className="mt-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 max-w-xl font-normal leading-relaxed">
            {config.subtitle}
          </p>
        )}
      </section>

      {/* Payment Box */}
      <section className="p-6 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] mb-10 flex flex-col md:flex-row items-center gap-6">
        {/* Payment QR Image */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-lg border border-black dark:border-white overflow-hidden bg-white shrink-0 flex items-center justify-center p-2">
          <Image
            src={config.qr_image_url || '/openmentor-logo.webp'}
            alt="Payment QR Code"
            fill
            sizes="224px"
            className="object-contain p-2"
            priority
          />
        </div>

        {/* Payment Details */}
        <div className="flex-1 text-left flex flex-col justify-center space-y-4 w-full">
          <div>
            <span className="text-xs uppercase font-extrabold text-neutral-500 dark:text-neutral-400 block mb-1">
              Direct UPI Transfer
            </span>
            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-black dark:border-white bg-neutral-50 dark:bg-neutral-900 font-mono text-sm sm:text-base font-bold text-black dark:text-white break-all">
              <span className="flex-1">{config.upi_id || 'openmentor@upi'}</span>
              <CopyUpiButton upiId={config.upi_id || 'openmentor@upi'} />
            </div>
          </div>

          <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
            <p className="font-semibold text-black dark:text-white">
              Scan with any UPI App: GPay, PhonePe, Paytm, BHIM, etc.
            </p>
            <p>
              100% of contributions go directly towards hosting, domain, server costs, and content creation by top seniors.
            </p>
          </div>
        </div>
      </section>

      {/* Supporter Details Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-black dark:border-white">
          <h2 className="text-sm sm:text-base font-extrabold uppercase text-black dark:text-white">
            Recent Supporters
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black dark:bg-white text-white dark:text-black">
            {config.supporters ? config.supporters.length : 0} Contributors
          </span>
        </div>

        {config.supporters && config.supporters.length > 0 ? (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] overflow-hidden">
            {config.supporters.map((sup) => (
              <div
                key={sup.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
              >
                {/* Left: Name & Comment */}
                <div className="flex flex-col text-left">
                  <span className="text-sm font-extrabold text-black dark:text-white">
                    {sup.name}
                  </span>
                  {sup.comment && (
                    <span className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      &ldquo;{sup.comment}&rdquo;
                    </span>
                  )}
                  {sup.date && (
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                      {new Date(sup.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>

                {/* Right: Contribution Amount */}
                <div className="shrink-0 text-right">
                  <span className="inline-block px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white text-sm font-extrabold text-black dark:text-white font-mono">
                    ₹{sup.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Be the first supporter! Your contribution will be featured here.
          </div>
        )}
      </section>
    </div>
  );
}
