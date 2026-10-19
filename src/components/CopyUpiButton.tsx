'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyUpiButton({ upiId }: { upiId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0 text-black dark:text-white"
      title="Copy UPI ID"
      aria-label="Copy UPI ID"
    >
      {copied ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}
