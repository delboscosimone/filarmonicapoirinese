'use client';
import { useState } from 'react';
import type { MediaLink } from '@/lib/types';

interface Props {
  links: MediaLink[];
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('?')[0];
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v') ?? u.pathname.split('/').pop() ?? null;
    }
  } catch {}
  return null;
}

export default function VideoGrid({ links }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '0.75rem',
    }}>
      {links.map((link, i) => {
        const ytId = getYouTubeId(link.url);
        if (!ytId) return null;
        const isActive = activeId === ytId;
        const thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

        return (
          <div key={i} style={{ borderRadius: '2px', overflow: 'hidden', border: '1px solid #222', background: '#0d0d0d' }}>
            {isActive ? (
              /* Embed attivo */
              <div>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                    title={link.label || 'Video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  />
                </div>
                <button
                  onClick={() => setActiveId(null)}
                  style={{ width: '100%', padding: '0.4rem', background: '#1a0000', border: 'none', color: '#B22222', fontFamily: 'Cinzel, serif', fontSize: '0.55rem', letterSpacing: '0.1em', cursor: 'pointer' }}
                >
                  ✕ CHIUDI
                </button>
              </div>
            ) : (
              /* Thumbnail cliccabile */
              <button
                onClick={() => setActiveId(ytId)}
                style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb}
                    alt={link.label || 'Video'}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Play button overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    transition: 'background 0.2s',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'rgba(178,34,34,0.9)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                {link.label && (
                  <div style={{ padding: '0.5rem 0.6rem', borderTop: '1px solid #1a1a1a' }}>
                    <p style={{
                      fontFamily: 'Cinzel, serif', fontSize: '0.55rem',
                      letterSpacing: '0.08em', color: '#C9A84C',
                      margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {link.label}
                    </p>
                  </div>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
