import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { LEGAL_DOCS, type LegalDocKey } from '../data/legalDocs';

const KEYS = Object.keys(LEGAL_DOCS) as LegalDocKey[];

function isDocKey(value: string): value is LegalDocKey {
  return KEYS.includes(value as LegalDocKey);
}

/** Renders a legal document (privacy / terms / child-protection) from src/data/legalDocs.ts */
export default function LegalDoc() {
  const { pathname } = useLocation();
  const segment = pathname.replace(/^\/+/, '').split('/')[0];
  const key: LegalDocKey = isDocKey(segment) ? segment : 'privacy';
  const doc = LEGAL_DOCS[key];

  const nav = useMemo(
    () =>
      KEYS.map((k) => ({
        key: k,
        title: LEGAL_DOCS[k].title,
        active: k === key,
      })),
    [key],
  );

  return (
    <main className="min-h-screen bg-[var(--color-t4c-cream)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-t4c-green)] hover:underline"
        >
          ← Back to home
        </Link>

        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Legal documents">
          {nav.map((item) => (
            <Link
              key={item.key}
              to={`/${item.key}`}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                item.active
                  ? 'bg-[var(--color-t4c-green)] text-white'
                  : 'bg-white text-[var(--color-t4c-green)] border border-[var(--color-t4c-green)]/20 hover:border-[var(--color-t4c-green)]/60'
              }`}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <article className="mt-8 bg-white rounded-2xl border border-black/10 shadow-sm p-6 sm:p-10">
          {doc.updated ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-t4c-green)]">
              {doc.updated}
            </p>
          ) : null}
          <div className="legal-markdown mt-4">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-t4c-green)] mb-4">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--color-t4c-green)] mt-8 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base sm:text-lg font-bold text-[var(--color-t4c-green)] mt-6 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-sm sm:text-base leading-relaxed text-neutral-700 mt-3">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mt-3 space-y-1.5 text-sm sm:text-base text-neutral-700">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mt-3 space-y-1.5 text-sm sm:text-base text-neutral-700">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-[var(--color-t4c-green)] underline underline-offset-2 hover:opacity-80"
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noreferrer' : undefined}
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => <strong className="font-bold text-neutral-900">{children}</strong>,
                hr: () => <hr className="my-6 border-black/10" />,
              }}
            >
              {doc.markdown}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </main>
  );
}
