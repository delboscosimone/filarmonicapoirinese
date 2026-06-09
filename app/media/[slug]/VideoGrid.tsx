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
  const [modalVideo, setModalVideo] = useState<{ id: string; label: string } | null>(null);

  return (
    <>
      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '0.75rem',
      }}>
        {links.map((link, i) => {
          const ytId = getYouTubeId(link.url);
          if (!ytId) return null;
          const thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

          return (
            <button
              key={i}
              onClick={() => setModalVideo({ id: ytId, label: link.label || '' })}
              style={{
                display: 'block', width: '100%', background: 'none',
                border: '1px solid #222', borderRadius: '2px',
                padding: 0, cursor: 'pointer', textAlign: 'left', overflow: 'hidden',
              }}
            >
              {/* Thumbnail */}
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', background: '#0d0d0d' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb}
                  alt={link.label || 'Video'}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Play overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.25)',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'rgba(178,34,34,0.92)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Label */}
              {link.label && (
                <div style={{ padding: '0.5rem 0.6rem', borderTop: '1px solid #1a1a1a', background: '#0d0d0d' }}>
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
          );
        })}
      </div>

      {/* Modal overlay */}
      {modalVideo && (
        <div
          onClick={() => setModalVideo(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          {/* Modal box — stopPropagation evita chiusura cliccando sul video */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '900px' }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}>
              {modalVideo.label && (
                <p style={{
                  fontFamily: 'Cinzel, serif', fontSize: '0.7rem',
                  letterSpacing: '0.15em', color: '#C9A84C', margin: 0,
                }}>
                  {modalVideo.label}
                </p>
              )}
              <button
                onClick={() => setModalVideo(null)}
                style={{
                  marginLeft: 'auto', background: 'none', border: '1px solid #333',
                  borderRadius: '2px', color: '#F0EBE0', cursor: 'pointer',
                  padding: '0.3rem 0.8rem', fontFamily: 'Cinzel, serif',
                  fontSize: '0.6rem', letterSpacing: '0.15em',
                }}
              >
                ✕ CHIUDI
              </button>
            </div>

            {/* YouTube embed 16:9 */}
            <div style={{
              position: 'relative', paddingBottom: '56.25%', height: 0,
              borderRadius: '2px', overflow: 'hidden',
              border: '1px solid #333',
            }}>
              <iframe
                src={`https://www.youtube.com/embed/${modalVideo.id}?autoplay=1&rel=0`}
                title={modalVideo.label || 'Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%', border: 'none',
                }}
              />
            </div>

            <p style={{
              textAlign: 'center', marginTop: '0.75rem',
              fontFamily: 'EB Garamond, serif', fontStyle: 'italic',
              color: '#7A6A58', fontSize: '0.85rem',
            }}>
              Clicca fuori dal video per chiudere · Usa ⛶ per il vero schermo intero
            </p>
          </div>
        </div>
      )}
    </>
  );
}
