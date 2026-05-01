import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import type { SiteSettings, BandinaContact } from '@/lib/types';
import { defaultSettings } from '@/lib/types';

async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data } = await supabase.from('site_settings').select('*');
    const s: Record<string, unknown> = {};
    for (const row of data ?? []) s[row.key] = row.value;
    return {
      direttore: (s.direttore as string) ?? defaultSettings.direttore,
      bandina_contacts: (s.bandina_contacts as BandinaContact[]) ?? [],
    };
  } catch {
    return defaultSettings;
  }
}

function whatsappUrl(phone: string, message: string) {
  const clean = phone.replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export default async function HomePage() {
  const settings = await getSiteSettings();
  const direttore = settings.direttore;
  const contacts = settings.bandina_contacts;

  return (
    <>
      <Navbar />
      <main>
        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section
          id="home"
          className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden noise"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, #1a0505 0%, #080808 70%)' }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full border border-red/5 absolute" />
            <div className="w-[800px] h-[800px] rounded-full border border-red/5 absolute" />
            <div className="w-[1000px] h-[1000px] rounded-full border border-red/5 absolute" />
          </div>

          <div className="anim-fade anim-d1 relative z-10">
            <Image
              src="/logo-filarmonica.png"
              alt="Filarmonica Poirinese"
              width={180}
              height={180}
              className="drop-shadow-2xl"
              style={{ mixBlendMode: 'screen' }}
              priority
            />
          </div>

          <div className="mt-8 text-center relative z-10 px-4">
            <p
              className="anim-fade-up anim-d2 section-label mb-3"
              style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.4em', color: '#C9A84C' }}
            >
              — Poirino · Piemonte · Est. 1810 —
            </p>
            <h1
              className="anim-fade-up anim-d3"
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(2.2rem, 7vw, 5rem)',
                fontWeight: 700,
                color: '#F0EBE0',
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
              }}
            >
              Filarmonica
              <br />
              <em style={{ color: '#B22222' }}>Poirinese</em>
            </h1>

            <div className="anim-fade-up anim-d4 flex items-center justify-center gap-4 my-6">
              <span className="text-gold/40 text-xl">❧</span>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
              <span className="text-gold text-lg">♩</span>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
              <span className="text-gold/40 text-xl">❧</span>
            </div>

            <p
              className="anim-fade-up anim-d5 max-w-xl mx-auto text-cream/70 leading-relaxed"
              style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.15rem', fontStyle: 'italic' }}
            >
              Da oltre duecento anni, la nostra banda porta la musica nel cuore della comunità poirinese.
              Una tradizione viva, fatta di passione e dedizione.
            </p>

            <div className="anim-fade-up anim-d5 mt-10 flex flex-wrap gap-4 justify-center">
              <a href="#chi-siamo" className="btn-red">Scopri la nostra storia</a>
              <Link href="/galleria" className="btn-outline">Galleria</Link>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/30">
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.55rem', letterSpacing: '0.3em' }}>SCORRI</span>
            <div className="w-px h-10 bg-gradient-to-b from-cream/30 to-transparent animate-pulse" />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CHI SIAMO
        ══════════════════════════════════════════ */}
        <section id="chi-siamo" className="py-28 bg-surface relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-red to-transparent opacity-60" />

          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label mb-3">Chi Siamo</p>
              <h2
                style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F0EBE0', lineHeight: 1.2 }}
                className="mb-6"
              >
                Una storia lunga
                <br />
                <span style={{ color: '#B22222' }}>oltre 200 anni</span>
              </h2>
              <div className="divider-red" style={{ margin: '0 0 1.5rem 0' }} />
              <div className="text-cream/80 space-y-4 leading-relaxed" style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.1rem' }}>
                <p>
                  La <strong className="text-cream">Filarmonica Poirinese</strong> è un&apos;istituzione musicale
                  fondata nel <strong className="text-gold">1810</strong> a Poirino, comune in provincia di Torino.
                  Una delle realtà bandistiche più longeve del Piemonte, da oltre due secoli custode della tradizione
                  musicale del territorio.
                </p>
                <p>
                  Nel <strong className="text-cream">2010</strong> abbiamo celebrato il duecentesimo anniversario
                  della nostra fondazione — un traguardo straordinario che testimonia la continuità e la dedizione
                  di generazioni di musicisti poirinesi.
                </p>
                <p>
                  Sotto la guida del <strong className="text-cream">Maestro {direttore}</strong>, la Filarmonica
                  continua la sua missione: diffondere la cultura musicale, animare le cerimonie civili e religiose
                  e rappresentare con orgoglio la comunità di Poirino.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '1810', label: 'Anno di fondazione', icon: '🏛️' },
                { num: '200+', label: 'Anni di storia', icon: '📜' },
                { num: `Mº ${direttore}`, label: 'Direttore artistico', icon: '🎼' },
                { num: 'Poirino', label: 'Torino · Piemonte', icon: '📍' },
              ].map((item) => (
                <div key={item.label} className="bg-bg rounded-sm p-6 border border-border card-hover">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', color: '#C9A84C', fontSize: '1.1rem', fontWeight: 700 }}>
                    {item.num}
                  </div>
                  <div className="text-muted text-sm mt-1" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            LA BANDINA
        ══════════════════════════════════════════ */}
        <section
          id="bandina"
          className="py-28 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #050a1a 0%, #080808 50%, #050a1a 100%)' }}
        >
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col items-center gap-6">
              <Image
                src="/logo-bandina.png"
                alt="Bandina Poirinese"
                width={220}
                height={220}
                className="drop-shadow-2xl"
                style={{ mixBlendMode: 'screen' }}
              />
              <div className="text-center">
                <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: '#3B82F6', fontSize: '1.5rem' }}>
                  Bandina Poirinese
                </p>
                <p className="text-muted text-sm mt-1" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.15em' }}>
                  La banda dei giovani
                </p>
              </div>
            </div>

            <div>
              <p className="section-label mb-3" style={{ color: '#3B82F6' }}>La Bandina</p>
              <h2
                style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F0EBE0', lineHeight: 1.2 }}
                className="mb-6"
              >
                Il futuro della
                <br />
                <span style={{ color: '#3B82F6' }}>musica a Poirino</span>
              </h2>
              <div className="h-px w-16 bg-blue-band/60 mb-6" />
              <div className="text-cream/80 space-y-4 leading-relaxed" style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.1rem' }}>
                <p>
                  La <strong className="text-cream">Bandina Poirinese</strong> è la formazione giovanile
                  dell&apos;associazione, nata per avvicinare i più giovani al mondo della musica bandistica
                  e coltivare i futuri musicisti della Filarmonica.
                </p>
                <p>
                  I ragazzi si esibiscono accanto alla Filarmonica nelle principali manifestazioni cittadine,
                  in un percorso che unisce <em>studio, divertimento e spirito di squadra</em>.
                </p>
              </div>
              <div className="mt-8">
                <a href="#contatti" className="btn-outline" style={{ borderColor: '#3B82F6', color: '#3B82F6' }}>
                  Contattaci per la Bandina ↓
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            ATTIVITÀ
        ══════════════════════════════════════════ */}
        <section id="attivita" className="py-28 bg-surface">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="section-label mb-3">Le Nostre Attività</p>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F0EBE0' }}>
                Ogni occasione è
                <br />
                <em style={{ color: '#B22222' }}>un concerto</em>
              </h2>
              <div className="divider-red mx-auto mt-4" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: '🎪', title: 'Carnevale di Poirino', color: '#C9A84C', desc: 'La Filarmonica accompagna il tradizionale corteo allegorico del Carnevale fino alla consegna delle chiavi della città alle maschere Barba Pero e Magna Danda in Piazza Italia.' },
                { icon: '🌟', title: 'Concerti Estivi', color: '#B22222', desc: 'Il concerto estivo in Piazza Europa è l\'appuntamento musicale più atteso dell\'estate poirinese, con un programma che spazia da brani pop a classici intramontabili.' },
                { icon: '🕊️', title: '25 Aprile & Festività', color: '#3B82F6', desc: 'La Filarmonica è presente in tutte le cerimonie civili e religiose cittadine: Festa della Liberazione, Patronale, Natale e ogni momento importante per la comunità.' },
                { icon: '🥁', title: 'Raduno Bandistico', color: '#C9A84C', desc: 'La Filarmonica organizza e partecipa a raduni bandistici regionali, ospitando formazioni musicali da tutto il Piemonte per giornate di musica e condivisione.' },
                { icon: '🎓', title: 'Scuola di Musica', color: '#B22222', desc: 'L\'associazione promuove la formazione musicale attraverso la Bandina, offrendo ai giovani la possibilità di imparare a suonare uno strumento.' },
                { icon: '🎄', title: 'Concerto di Natale', color: '#3B82F6', desc: 'Ogni anno la Filarmonica celebra le festività natalizie con concerti speciali, portando la magia del Natale nelle piazze e nelle chiese di Poirino.' },
              ].map((item) => (
                <div key={item.title} className="bg-bg border border-border rounded-sm p-6 card-hover" style={{ borderTop: `2px solid ${item.color}` }}>
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#F0EBE0', fontSize: '1.2rem' }} className="mb-3">{item.title}</h3>
                  <p className="text-muted text-sm leading-relaxed" style={{ fontFamily: 'EB Garamond, serif', fontSize: '1rem' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            GALLERIA PREVIEW
        ══════════════════════════════════════════ */}
        <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d0505 0%, #080808 100%)' }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="section-label mb-3">Galleria</p>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F0EBE0' }} className="mb-4">
              Foto & Video degli eventi
            </h2>
            <p className="text-cream/60 mb-10 max-w-xl mx-auto" style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.1rem' }}>
              Rivivi le emozioni dei nostri concerti, delle sfilate e di ogni momento speciale vissuto insieme.
            </p>
            <Link href="/galleria" className="btn-red">Sfoglia la galleria →</Link>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CONTATTI
        ══════════════════════════════════════════ */}
        <section id="contatti" className="py-28 bg-surface">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="section-label mb-3">Contattaci</p>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F0EBE0' }}>
                Entra a far parte
                <br />
                <em style={{ color: '#B22222' }}>della Bandina</em>
              </h2>
              <div className="divider-red mx-auto mt-4" />
              <p className="mt-6 text-cream/60 max-w-lg mx-auto" style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.1rem', fontStyle: 'italic' }}>
                Sei interessato a far parte della Bandina Poirinese? Scrivici su WhatsApp, siamo felici di rispondere a tutte le tue domande.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* WhatsApp contacts */}
              {contacts.length > 0 ? (
                contacts.map((c) => (
                  <a
                    key={c.id}
                    href={whatsappUrl(c.phone, c.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-5 bg-bg border border-border rounded-sm p-6 card-hover"
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)' }}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="#25D166">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p style={{ fontFamily: 'Playfair Display, serif', color: '#F0EBE0', fontSize: '1.1rem' }} className="mb-0.5">
                        {c.name}
                      </p>
                      {c.role && (
                        <p className="text-muted text-xs mb-1" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
                          {c.role}
                        </p>
                      )}
                      <p className="text-xs" style={{ color: '#25D166', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
                        Scrivi su WhatsApp →
                      </p>
                    </div>
                  </a>
                ))
              ) : (
                /* Fallback se non ci sono contatti configurati */
                <div className="md:col-span-2 border border-dashed border-border rounded-sm p-10 text-center">
                  <p className="text-5xl mb-4">📱</p>
                  <p style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic', color: '#7A6A58' }}>
                    I contatti WhatsApp saranno disponibili a breve. Nel frattempo scrivici su Facebook.
                  </p>
                </div>
              )}
            </div>

            {/* Social fallback */}
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://www.facebook.com/p/Filarmonica-Poirinese-100066956124543/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                📘 Scrivici su Facebook
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
        </section>
      </main>
      <Footer />
    </>
  );
}
