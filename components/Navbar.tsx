'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const links = [
  { href: '/#chi-siamo', label: 'Chi Siamo' },
  { href: '/#bandina',   label: 'La Bandina' },
  { href: '/#attivita',  label: 'Attività' },
  { href: '/galleria',   label: 'Galleria' },
  { href: '/#contatti',  label: 'Contatti' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-bg/95 backdrop-blur-sm border-b border-border shadow-xl' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity">
          <Image src="/logo-filarmonica.png" alt="Filarmonica Poirinese" width={36} height={36} className="rounded-sm" style={{ mixBlendMode: 'screen' }} />
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.2em', color: '#C9A84C' }}>
            FILARMONICA POIRINESE
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.2em' }}
                className="text-cream/70 hover:text-cream transition-colors uppercase"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Hamburger mobile */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-cream/70 hover:text-cream"
          aria-label="Menu"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {open ? (
              <path d="M4 4l14 14M18 4L4 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <>
                <line x1="3" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="3" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="3" y1="17" x2="19" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-surface border-t border-border px-6 py-4">
          <ul className="flex flex-col gap-4">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', letterSpacing: '0.2em' }}
                  className="text-cream/80 hover:text-gold transition-colors uppercase block py-1"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
