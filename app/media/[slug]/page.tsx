import { supabase } from '@/lib/supabase';
import type { MediaSection, MediaLink } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
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
  const { slug } = await params;
  const section = await getSection(slug);
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
  const { slug } = await params;
  const section = await getSection(slug);
  if (!section) return notFound();

  const links: MediaLink[] = Array.isArray(section.links) ? section.links : [];

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0505 0%, #080808 60%)' }}
    >
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

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">

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

          {section.event_date && (
            <p
              className="text-center mb-6 capitalize"
              style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.25em', color: '#C9A84C' }}
            >
              {formatDate(section.event_date)}
            </p>
          )}

          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-500" />
            <span className="text-lg" style={{ color: '#B22222' }}>&#9833;</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-500" />
          </div>

          {section.description && (
            <p
              className="text-center mb-10 leading-relaxed"
              style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(240,235,224,0.7)' }}
            >
              {section.description}
            </p>
          )}

          {links.length > 0 ? (
            <div className="flex flex-col gap-4">
              {links.map((link, i) => {
                const color = linkColor[link.type] ?? '#333333';
                const icon = linkIcon[link.type] ?? '🔗';
                return (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1.25rem',
                      border: `1px solid ${color}`,
                      borderRadius: '2px',
                      background: '#111111',
                      textDecoration: 'none',
                    }}
                  >
                    <span style={{ fontSize: '1.875rem' }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Playfair Display, serif', color: '#F0EBE0', fontSize: '1.1rem', margin: 0 }}>
                        {link.label}
                      </p>
                      <p style={{ color: '#7A6A58', fontSize: '0.75rem', margin: '2px 0 0 0', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {link.url}
                      </p>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </a>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem', border: '1px dashed #222222', borderRadius: '2px' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎵</p>
              <p style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic', color: '#7A6A58' }}>
                I contenuti per questo evento saranno disponibili a breve.
              </p>
            </div>
          )}

        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-center" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.15em', color: '#7A6A58' }}>
            FILARMONICA POIRINESE · Est. 1810
          </p>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/p/Filarmonica-Poirinese-100066956124543/" target="_blank" rel="noopener noreferrer" className="text-xs" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', color: '#7A6A58' }}>
              Facebook
            </a>
            <a href="https://www.instagram.com/filarmonicapoirinese/" target="_blank" rel="noopener noreferrer" className="text-xs" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', color: '#7A6A58' }}>
              Instagram
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
