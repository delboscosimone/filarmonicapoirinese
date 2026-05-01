import { supabase } from '@/lib/supabase';
import type { MediaSection } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

async function getMediaSections(): Promise<MediaSection[]> {
  try {
    const { data, error } = await supabase
      .from('media_sections')
      .select('*')
      .eq('is_published', true)
      .order('event_date', { ascending: false });
    if (error) return [];
    return (data ?? []) as MediaSection[];
  } catch {
    return [];
  }
}

const typeLabel: Record<string, string> = {
  foto: '📸 Foto',
  video: '🎬 Video',
  misto: '📸🎬 Foto & Video',
};

function formatDate(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function GalleriaPage() {
  const sections = await getMediaSections();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg pt-24 pb-20">
        {/* Header */}
        <div
          className="relative py-20 text-center overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, #1a0505 0%, #080808 60%)' }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[500px] rounded-full border border-red/5" />
            <div className="w-[700px] h-[700px] rounded-full border border-red/5 absolute" />
          </div>
          <p className="section-label mb-3 relative z-10">Archivio Multimediale</p>
          <h1
            className="relative z-10"
            style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#F0EBE0' }}
          >
            Galleria
          </h1>
          <div className="divider-red mx-auto mt-4" />
          <p
            className="mt-6 text-cream/60 max-w-xl mx-auto px-4 relative z-10"
            style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.1rem', fontStyle: 'italic' }}
          >
            Foto e video dei nostri concerti, sfilate ed eventi. Ogni momento vissuto insieme, da conservare.
          </p>
        </div>

        {/* Media sections grid */}
        <div className="max-w-6xl mx-auto px-6 mt-12">
          {sections.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-6">🎵</p>
              <p
                style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: '#F0EBE0' }}
                className="mb-3"
              >
                La galleria è in aggiornamento
              </p>
              <p className="text-muted" style={{ fontFamily: 'EB Garamond, serif' }}>
                Presto saranno disponibili foto e video dei nostri eventi.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((s) => (
                <Link
                  key={s.id}
                  href={`/media/${s.slug}`}
                  className="group block bg-surface border border-border rounded-sm overflow-hidden card-hover"
                >
                  {/* Thumbnail */}
                  <div
                    className="h-44 relative overflow-hidden flex items-center justify-center"
                    style={{
                      background: s.thumbnail_url
                        ? `url(${s.thumbnail_url}) center/cover no-repeat`
                        : 'linear-gradient(135deg, #1a0505 0%, #111 100%)',
                    }}
                  >
                    {!s.thumbnail_url && (
                      <div className="text-6xl opacity-40">
                        {s.type === 'foto' ? '📸' : s.type === 'video' ? '🎬' : '🎵'}
                      </div>
                    )}
                    {/* Type badge */}
                    <div
                      className="absolute top-3 left-3 px-2 py-1 rounded-sm text-xs"
                      style={{
                        background: 'rgba(8,8,8,0.85)',
                        fontFamily: 'Cinzel, serif',
                        letterSpacing: '0.05em',
                        color: '#C9A84C',
                      }}
                    >
                      {typeLabel[s.type] ?? s.type}
                    </div>
                    {/* Links count */}
                    {s.links?.length > 0 && (
                      <div
                        className="absolute top-3 right-3 px-2 py-1 rounded-sm text-xs"
                        style={{
                          background: '#B22222',
                          fontFamily: 'Cinzel, serif',
                          color: '#F0EBE0',
                        }}
                      >
                        {s.links.length} link{s.links.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {s.event_date && (
                      <p
                        className="text-xs mb-2"
                        style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', color: '#C9A84C' }}
                      >
                        {formatDate(s.event_date)}
                      </p>
                    )}
                    <h3
                      style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#F0EBE0' }}
                      className="mb-2 group-hover:text-red-light transition-colors"
                    >
                      {s.title}
                    </h3>
                    {s.description && (
                      <p className="text-muted text-sm line-clamp-2" style={{ fontFamily: 'EB Garamond, serif' }}>
                        {s.description}
                      </p>
                    )}
                    <p
                      className="mt-4 text-xs"
                      style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', color: '#B22222' }}
                    >
                      Apri →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Social links */}
        <div className="max-w-4xl mx-auto px-6 mt-16 text-center">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-10" />
          <p className="section-label mb-4">Seguici anche su</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.facebook.com/p/Filarmonica-Poirinese-100066956124543/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              📘 Facebook
            </a>
            <a
              href="https://www.instagram.com/filarmonicapoirinese/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              📷 Instagram
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
