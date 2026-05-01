import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HomePage() {
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
          {/* Decorative background rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full border border-red/5 absolute" />
            <div className="w-[800px] h-[800px] rounded-full border border-red/5 absolute" />
            <div className="w-[1000px] h-[1000px] rounded-full border border-red/5 absolute" />
          </div>

          {/* Logo */}
          <div className="anim-fade anim-d1 relative z-10">
            <Image
              src="/logo-filarmonica.png"
              alt="Filarmonica Poirinese"
              width={180}
              height={180}
              className="drop-shadow-2xl"
              priority
            />
          </div>

          {/* Title */}
          <div className="mt-8 text-center relative z-10 px-4">
            <p
              className="anim-fade-up anim-d2 section-label mb-3"
              style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.4em', color: '#C9A84C' }}
            >
              — Poirino · Piemonte ·  Est. 1810 —
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

            {/* Ornamental line */}
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

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/30">
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.55rem', letterSpacing: '0.3em' }}>SCORRI</span>
            <div className="w-px h-10 bg-gradient-to-b from-cream/30 to-transparent animate-pulse" />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CHI SIAMO
        ══════════════════════════════════════════ */}
        <section id="chi-siamo" className="py-28 bg-surface relative overflow-hidden">
          {/* Decorative left bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-red to-transparent opacity-60" />

          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            {/* Text */}
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
              <div
                className="text-cream/80 space-y-4 leading-relaxed"
                style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.1rem' }}
              >
                <p>
                  La <strong className="text-cream">Filarmonica Poirinese</strong> è una delle realtà bandistiche
                  più longeve del Piemonte. Fondata nel <strong className="text-gold">1810</strong>, la nostra
                  associazione è radicata nella storia e nella cultura di Poirino, comune in provincia di Torino.
                </p>
                <p>
                  Nel 2010 abbiamo celebrato il <strong className="text-cream">duecentesimo anniversario</strong> della
                  nostra fondazione, un traguardo straordinario che testimonia la continuità e la dedizione di
                  generazioni di musicisti poirinesi.
                </p>
                <p>
                  Sotto la direzione del <strong className="text-cream">Maestro Alessio Mollo</strong>, la Filarmonica
                  continua la sua missione di diffondere la cultura musicale, partecipando a concerti, sfilate,
                  cerimonie civili e religiose che animano il calendario della nostra comunità.
                </p>
              </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '1810', label: 'Anno di fondazione', icon: '🏛️' },
                { num: '200+', label: 'Anni di storia', icon: '📜' },
                { num: 'Mº Mollo', label: 'Direttore artistico', icon: '🎼' },
                { num: 'Poirino', label: 'Torino · Piemonte', icon: '📍' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-bg rounded-sm p-6 border border-border card-hover"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div
                    style={{ fontFamily: 'Cinzel, serif', color: '#C9A84C', fontSize: '1.3rem', fontWeight: 700 }}
                  >
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
            {/* Logo + visual */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }}
                />
                <Image
                  src="/logo-bandina.png"
                  alt="Bandina Poirinese"
                  width={220}
                  height={220}
                  className="relative z-10 drop-shadow-2xl"
                />
              </div>
              <div className="text-center">
                <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: '#3B82F6', fontSize: '1.5rem' }}>
                  Bandina Poirinese
                </p>
                <p className="text-muted text-sm mt-1" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.15em' }}>
                  La banda dei giovani
                </p>
              </div>
            </div>

            {/* Text */}
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
              <div
                className="text-cream/80 space-y-4 leading-relaxed"
                style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.1rem' }}
              >
                <p>
                  La <strong className="text-cream">Bandina Poirinese</strong> è la formazione giovanile
                  dell&apos;associazione, nata per avvicinare i più giovani al mondo della musica bandistica
                  e coltivare i futuri musicisti della Filarmonica.
                </p>
                <p>
                  I ragazzi della Bandina partecipano a eventi locali, saggi musicali e si esibiscono
                  accanto alla Filarmonica in occasione delle principali manifestazioni cittadine.
                  Un percorso formativo che unisce <em>studio, divertimento e spirito di squadra</em>.
                </p>
                <p>
                  Sei interessato a far parte della Bandina?
                  <a href="#contatti" className="text-blue-band hover:underline ml-1">Contattaci</a> per
                  informazioni sui corsi e le modalità di adesione.
                </p>
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
              <h2
                style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F0EBE0' }}
              >
                Ogni occasione è
                <br />
                <em style={{ color: '#B22222' }}>un concerto</em>
              </h2>
              <div className="divider-red mx-auto mt-4" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: '🎪',
                  title: 'Carnevale di Poirino',
                  desc: 'La Filarmonica accompagna il tradizionale corteo allegorico del Carnevale, dalla partenza fino alla consegna delle chiavi della città alle maschere Barba Pero e Magna Danda in Piazza Italia.',
                  color: '#C9A84C',
                },
                {
                  icon: '🌟',
                  title: 'Concerti Estivi',
                  desc: 'Il concerto estivo in Piazza Europa è l\'appuntamento musicale più atteso dell\'estate poirinese. Un programma che spazia da brani pop a classici intramontabili, per emozionare grandi e piccini.',
                  color: '#B22222',
                },
                {
                  icon: '🕊️',
                  title: '25 Aprile & Festività',
                  desc: 'La Filarmonica è presente in tutte le cerimonie civili e religiose cittadine: Festa della Liberazione, Patronale, Natale e ogni momento importante per la comunità di Poirino.',
                  color: '#3B82F6',
                },
                {
                  icon: '🥁',
                  title: 'Raduno Bandistico',
                  desc: 'La Filarmonica Poirinese organizza e partecipa a raduni bandistici regionali, ospitando formazioni musicali da tutto il Piemonte per giornate di musica e condivisione.',
                  color: '#C9A84C',
                },
                {
                  icon: '🎓',
                  title: 'Scuola di Musica',
                  desc: 'L\'associazione promuove la formazione musicale attraverso la Bandina, offrendo ai giovani di Poirino la possibilità di imparare a suonare uno strumento e far parte di una banda.',
                  color: '#B22222',
                },
                {
                  icon: '🎄',
                  title: 'Concerto di Natale',
                  desc: 'Ogni anno la Filarmonica celebra le festività natalizie con concerti speciali, portando l\'atmosfera magica del Natale nelle piazze e nelle chiese di Poirino.',
                  color: '#3B82F6',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-bg border border-border rounded-sm p-6 card-hover group"
                  style={{ borderTop: `2px solid ${item.color}` }}
                >
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3
                    style={{ fontFamily: 'Playfair Display, serif', color: '#F0EBE0', fontSize: '1.2rem' }}
                    className="mb-3"
                  >
                    {item.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed" style={{ fontFamily: 'EB Garamond, serif', fontSize: '1rem' }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            GALLERIA PREVIEW
        ══════════════════════════════════════════ */}
        <section
          className="py-24 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0d0505 0%, #080808 100%)' }}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="section-label mb-3">Galleria</p>
            <h2
              style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F0EBE0' }}
              className="mb-4"
            >
              Foto & Video degli eventi
            </h2>
            <p className="text-cream/60 mb-10 max-w-xl mx-auto" style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.1rem' }}>
              Rivi le emozioni dei nostri concerti, delle sfilate e di ogni momento speciale vissuto insieme.
            </p>
            <Link href="/galleria" className="btn-red">
              Sfoglia la galleria →
            </Link>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CONTATTI
        ══════════════════════════════════════════ */}
        <section id="contatti" className="py-28 bg-surface">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="section-label mb-3">Contattaci</p>
              <h2
                style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#F0EBE0' }}
              >
                Vieni a far parte
                <br />
                <em style={{ color: '#B22222' }}>della nostra musica</em>
              </h2>
              <div className="divider-red mx-auto mt-4" />
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Contact info */}
              <div className="space-y-6">
                {[
                  {
                    icon: '📍',
                    label: 'Sede',
                    value: 'Poirino (TO), Piemonte',
                  },
                  {
                    icon: '📘',
                    label: 'Facebook',
                    value: 'Filarmonica Poirinese',
                    href: 'https://www.facebook.com/p/Filarmonica-Poirinese-100066956124543/',
                  },
                  {
                    icon: '📷',
                    label: 'Instagram',
                    value: '@filarmonicapoirinese',
                    href: 'https://www.instagram.com/filarmonicapoirinese/',
                  },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-4">
                    <span className="text-2xl mt-1">{c.icon}</span>
                    <div>
                      <p className="section-label text-xs mb-1">{c.label}</p>
                      {c.href ? (
                        <a
                          href={c.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cream hover:text-gold transition-colors"
                          style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.1rem' }}
                        >
                          {c.value}
                        </a>
                      ) : (
                        <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.1rem' }} className="text-cream">
                          {c.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA box */}
              <div
                className="border border-red/30 rounded-sm p-8 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1a0505 0%, #111111 100%)' }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-red/5 -translate-y-1/2 translate-x-1/2" />
                <p
                  style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#F0EBE0' }}
                  className="mb-4"
                >
                  Vuoi unirti a noi?
                </p>
                <p className="text-cream/70 mb-6 text-sm leading-relaxed" style={{ fontFamily: 'EB Garamond, serif', fontSize: '1rem' }}>
                  Che tu sia un musicista esperto o un principiante, la Filarmonica Poirinese è sempre
                  alla ricerca di nuovi talenti e appassionati di musica.
                </p>
                <a
                  href="https://www.facebook.com/p/Filarmonica-Poirinese-100066956124543/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-red w-full justify-center"
                  style={{ display: 'flex' }}
                >
                  Scrivici su Facebook
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
