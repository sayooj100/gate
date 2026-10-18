import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  text: string;
  className?: string;
}

/**
 * Renders text containing math expressions ($...$, $$...$$, \(...\), \[...\])
 * securely using KaTeX. Falls back gracefully to raw text if syntax is irregular.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ text, className }) => {
  if (!text) return null;

  // Split by LaTeX delimiters: $$...$$, $...$, \[...\], \(...\)
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
  const parts = text.split(regex);

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Display math ($$...$$ or \[...\])
        if (
          (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) ||
          (part.startsWith('\\[') && part.endsWith('\\]') && part.length >= 4)
        ) {
          const math = part.startsWith('$$')
            ? part.slice(2, -2)
            : part.slice(2, -2);
          try {
            const html = katex.renderToString(math.trim(), {
              displayMode: true,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                className="my-2 block overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <span key={index}>{part}</span>;
          }
        }

        // Inline math ($...$ or \(...\))
        if (
          (part.startsWith('$') && part.endsWith('$') && part.length >= 2) ||
          (part.startsWith('\\(') && part.endsWith('\\)') && part.length >= 4)
        ) {
          const math = part.startsWith('$')
            ? part.slice(1, -1)
            : part.slice(2, -2);
          try {
            const html = katex.renderToString(math.trim(), {
              displayMode: false,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                className="inline-math px-0.5"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <span key={index}>{part}</span>;
          }
        }

        // Regular text segment with preserved line breaks
        return (
          <span key={index} className="whitespace-pre-line">
            {part}
          </span>
        );
      })}
    </div>
  );
};
