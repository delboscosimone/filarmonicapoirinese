import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #1a0505 0%, #080808 70%)' }}
    >
      <Image src="/logo-filarmonica.png" alt="Logo" width={80} height={80} className="opacity-40 mb-8" />
      <p
        style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.4em', color: '#C9A84C' }}
        className="mb-4"
      >
        404 — PAGINA NON TROVATA
      </p>
      <h1
        style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#F0EBE0' }}
        className="mb-4 text-center"
      >
        La partitura è andata persa
      </h1>
      <p
        className="text-muted text-center mb-10"
        style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic', fontSize: '1.1rem' }}
      >
        La pagina che stai cercando non esiste o è stata rimossa.
      </p>
      <Link href="/" className="btn-red">Torna alla home</Link>
    </div>
  );
}
