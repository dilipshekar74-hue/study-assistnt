import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Sanitizes and normalizes incoming LaTeX strings so KaTeX can render them
 * without parse errors. Automatically handles fill-in-the-blank placeholders,
 * unescaped text-mode underscores, and common formatting artifacts.
 */
export function sanitizeLatex(math) {
  if (!math) return '';
  let clean = String(math).trim();

  // 1. Strip wrapping math-mode delimiters if present ($$, $, \[, \], \(, \))
  if (clean.startsWith('$$') && clean.endsWith('$$') && clean.length >= 4) {
    clean = clean.slice(2, -2).trim();
  } else if (clean.startsWith('$') && clean.endsWith('$') && clean.length >= 2) {
    clean = clean.slice(1, -1).trim();
  } else if (clean.startsWith('\\[') && clean.endsWith('\\]') && clean.length >= 4) {
    clean = clean.slice(2, -2).trim();
  } else if (clean.startsWith('\\(') && clean.endsWith('\\)') && clean.length >= 4) {
    clean = clean.slice(2, -2).trim();
  }

  // 2. Fix fill-in-the-blank placeholders inside \text{...}
  // e.g. \text{___}, \text{__}, \text{____} -> \underline{\hspace{1.2cm}}
  clean = clean.replace(/\\text\{\s*([_]+)\s*\}/g, (match, underscores) => {
    const width = Math.max(1.0, underscores.length * 0.4).toFixed(1);
    return `\\underline{\\hspace{${width}cm}}`;
  });

  // 3. Fix unescaped underscores inside \text{...}
  // In LaTeX text mode, raw '_' throws ParseError: Expected 'EOF', got '_'
  clean = clean.replace(/\\text\{([^}]+)\}/g, (match, content) => {
    const escaped = content.replace(/(?<!\\)_/g, '\\_');
    return `\\text{${escaped}}`;
  });

  // 4. Fix standalone fill-in-the-blank placeholders in math mode:
  // e.g. 'y = ___ + 4' or '\lambda_1 = ___'
  clean = clean.replace(/(?<![a-zA-Z0-9_\\])(_{2,})(?![a-zA-Z0-9_])/g, '\\underline{\\hspace{1.2cm}}');

  // 5. Fix unescaped % (comments out remainder of line in TeX)
  clean = clean.replace(/(?<!\\)%/g, '\\%');

  return clean;
}

/**
 * Renders LaTeX math with KaTeX with multi-tier error resilience.
 * Never outputs raw red error boxes to the UI.
 */
export default function KatexMath({ math = '', block = false, className = '' }) {
  const html = useMemo(() => {
    if (!math) return '';
    const clean = sanitizeLatex(math);

    // Tier 1: Render with sanitized LaTeX
    try {
      return katex.renderToString(clean, {
        displayMode: block,
        throwOnError: true,
        strict: false,
      });
    } catch {
      // Tier 2: Recovery attempt by escaping remaining unescaped underscores
      try {
        const fallback = clean.replace(/(?<!\\)_/g, '\\_');
        return katex.renderToString(fallback, {
          displayMode: block,
          throwOnError: true,
          strict: false,
        });
      } catch {
        // Tier 3: Graceful non-throwing text mode fallback (never red error boxes)
        try {
          const safeText = clean.replace(/[{}\\]/g, ' ');
          return katex.renderToString(`\\text{${safeText}}`, {
            displayMode: block,
            throwOnError: false,
            strict: false,
          });
        } catch {
          return clean;
        }
      }
    }
  }, [math, block]);

  return (
    <span
      className={`${block ? 'block my-2 text-center overflow-x-auto' : 'inline-block align-middle'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Formats mixed text containing inline LaTeX (e.g. $F_{net}$, $x$, or raw F_{net})
 * and block display math ($$...$$).
 */
export function FormattedMathText({ text = '', className = '' }) {
  if (!text) return null;

  // Split by $$...$$, $...$, or variable subscript patterns
  const tokens = text.split(/(\$\$[^\$]+\$\$|\$[^\$]+\$|[A-Za-z0-9]+_\{[A-Za-z0-9]+\})/g);

  return (
    <span className={className}>
      {tokens.map((token, i) => {
        if (!token) return null;
        if (token.startsWith('$$') && token.endsWith('$$') && token.length >= 4) {
          return (
            <KatexMath
              key={i}
              math={token.slice(2, -2)}
              block={true}
              className="my-2 text-indigo-200"
            />
          );
        }
        if (token.startsWith('$') && token.endsWith('$') && token.length >= 2) {
          return (
            <KatexMath
              key={i}
              math={token.slice(1, -1)}
              block={false}
              className="mx-0.5 text-indigo-300"
            />
          );
        }
        if (token.includes('_{')) {
          return (
            <KatexMath
              key={i}
              math={token}
              block={false}
              className="mx-0.5 text-indigo-300"
            />
          );
        }
        return token;
      })}
    </span>
  );
}
