import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-border mt-0">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image src="/logo-filarmonica.png" alt="Logo" width={44} height={44} style={{ mixBlendMode: 'screen' }} />
              <div>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.2em', color: '#C9A84C' }}>
                  FILARMONICA POIRINESE
                </p>
                <p className="text-muted text-sm">Est. 1810</p>
              </div>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              Associazione culturale musicale della città di Poirino, in provincia di Torino.
            </p>
          </div>

          {/* Links */}
          <div>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.25em', color: '#C9A84C' }} className="mb-4 uppercase">
              Navigazione
            </p>
            <ul className="flex flex-col gap-2">
              {[
                ['Chi Siamo', '/#chi-siamo'],
                ['La Bandina', '/#bandina'],
                ['Attività', '/#attivita'],
                ['Galleria', '/galleria'],
                ['Contatti', '/#contatti'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-muted hover:text-cream text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.25em', color: '#C9A84C' }} className="mb-4 uppercase">
              Seguici
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://www.facebook.com/p/Filarmonica-Poirinese-100066956124543/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted hover:text-cream text-sm transition-colors"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
              <a
                href="https://www.instagram.com/filarmonicapoirinese/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted hover:text-cream text-sm transition-colors"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                Instagram
              </a>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Image src="/logo-bandina.png" alt="Bandina Poirinese" width={32} height={32} style={{ mixBlendMode: 'screen' }} />
              <span className="text-muted text-xs" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>Bandina Poirinese</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-xs" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.15em' }}>
            © {new Date().getFullYear()} FILARMONICA POIRINESE — POIRINO (TO)
          </p>
          <p className="text-muted text-xs">
            P.IVA / C.F. da inserire — Via ... , Poirino (TO)
          </p>
        </div>
      </div>
    </footer>
  );
}
