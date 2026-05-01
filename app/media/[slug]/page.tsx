import { supabase } from '@/lib/supabase';
import type { MediaSection, MediaLink } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

async function getSection(slug: string): Promise<MediaSection | null> {
  try {
    const { data, error } = await supabase
      .from('media_sections')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    if (error) return null;
    return data as MediaSection;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const section = await getSection(params.slug);
  if (!section) return { title: 'Non trovato — Filarmonica Poirinese' };
  return {
    title: `${section.title} — Filarmonica Poirinese`,
    description: section.description ?? `${section.title} — foto e video della Filarmonica Poirinese`,
  };
}

function formatDate(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const linkIcon: Record<string, string> = {
  foto: '📸',
  video: '🎬',
  altro: '🔗',
};

const linkColor: Record<string, string> = {
  foto: '#C9A84C',
  video: '#B22222',
  altro: '#3B82F6',
};

export default async function MediaPage({ params }: Props) {
  const section = await getSection(params.slug);
  if (!section) notFound();

  const links: MediaLink[] = Array.isArray(section.links) ? section.links : [];

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0505 0%, #080808 60%)' }}
    >
      {/* Top bar */}
      <div className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
            <Image src="/logo-filarmonica.png" alt="Logo" width={28} height={28} />
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#C9A84C' }}>
              FILARMONICA POIRINESE
            </span>
          </Link>
          <Link
            href="/galleria"
            className="text-xs text-muted hover:text-cream transition-colors"
            style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}
          >
            ← Galleria
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          {/* Type badge */}
          <div className="flex justify-center mb-6">
            <span
              className="px-3 py-1 rounded-sm text-xs"
              style={{
                background: '#1a0505',
                border: '1px solid #B22222',
                fontFamily: 'Cinzel, serif',
                letterSpacing: '0.15em',
                color: '#C9A84C',
              }}
            >
              {section.type === 'foto' ? '📸 FOTO' : section.type === 'video' ? '🎬 VIDEO' : '📸🎬 FOTO & VIDEO'}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-center mb-3"
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
              color: '#F0EBE0',
              lineHeight: 1.2,
            }}
          >
            {section.title}
          </h1>

          {/* Date */}
          {section.event_date && (
            <p
              className="text-center mb-6 capitalize"
              style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.25em', color: '#C9A84C' }}
            >
              {formatDate(section.event_date)}
            </p>
          )}

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-red" />
            <span className="text-red/60 text-lg">♩</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-red" />
          </div>

          {/* Description */}
          {section.description && (
            <p
              className="text-center text-cream/70 mb-10 leading-relaxed"
              style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.1rem', fontStyle: 'italic' }}
            >
              {section.description}
            </p>
          )}

          {/* Links */}
          {links.length > 0 ? (
            <div className="flex flex-col gap-4">
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 border rounded-sm transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: '#111111',
                    borderColor: linkColor[link.type] ?? '#333',
                    textDecoration: 'none',
                  }}
                >
                  <span className="text-3xl">{linkIcon[link.type] ?? '🔗'}</span>
                  <div className="flex-1">
                    <p
                      style={{ fontFamily: 'Playfair Display, serif', color: '#F0EBE0', fontSize: '1.1rem' }}
                    >
                      {link.label}
                    </p>
                    <p className="text-muted text-xs truncate mt-0.5" style={{ maxWidth: '280px' }}>
                      {link.url}
                    </p>
                  </div>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: linkColor[link.type] ?? '#C9A84C', flexShrink: 0 }}
                  >
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              ))}
            </div>
          ) : (
            <div
              className="text-center p-10 border border-dashed border-border rounded-sm"
            >
              <p className="text-5xl mb-4">🎵</p>
              <p className="text-muted" style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic' }}>
                I contenuti per questo evento saranno disponibili a breve.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer mini */}
      <div className="border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-muted text-xs text-center"
            style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.15em' }}
          >
            FILARMONICA POIRINESE · Est. 1810
          </p>
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/p/Filarmonica-Poirinese-100066956124543/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-cream text-xs transition-colors"
              style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/filarmonicapoirinese/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-cream text-xs transition-colors"
              style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
