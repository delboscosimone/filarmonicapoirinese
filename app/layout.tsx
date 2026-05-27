import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.filarmonicapoirinese.it'),
  title: {
    default: 'Filarmonica Poirinese',
    template: '%s — Filarmonica Poirinese',
  },
  description: 'La Filarmonica Poirinese è una storica banda musicale di Poirino (TO), fondata nel 1810. Concerti, eventi, foto e video della tradizione musicale piemontese.',
  keywords: ['filarmonica', 'poirino', 'banda musicale', 'concerti', 'piemonte', 'torino', 'musica', 'bandina poirinese', 'filarmonica poirinese'],
  authors: [{ name: 'Filarmonica Poirinese', url: 'https://www.filarmonicapoirinese.it' }],
  creator: 'Filarmonica Poirinese',
  publisher: 'Filarmonica Poirinese',
  alternates: {
    canonical: 'https://www.filarmonicapoirinese.it',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Filarmonica Poirinese',
    description: 'Banda musicale di Poirino (TO) fondata nel 1810. Concerti, eventi, foto e video della tradizione musicale piemontese.',
    url: 'https://www.filarmonicapoirinese.it',
    siteName: 'Filarmonica Poirinese',
    locale: 'it_IT',
    type: 'website',
    images: [{
      url: 'https://www.filarmonicapoirinese.it/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Filarmonica Poirinese — Banda musicale di Poirino dal 1810',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Filarmonica Poirinese',
    description: 'Banda musicale di Poirino (TO) fondata nel 1810.',
    images: ['https://www.filarmonicapoirinese.it/og-image.jpg'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MusicGroup',
  name: 'Filarmonica Poirinese',
  description: 'Storica banda musicale di Poirino (TO) fondata nel 1810.',
  url: 'https://www.filarmonicapoirinese.it',
  foundingDate: '1810',
  genre: 'Banda musicale',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Poirino',
    addressRegion: 'TO',
    addressCountry: 'IT',
  },
  sameAs: [
    'https://www.facebook.com/p/Filarmonica-Poirinese-100066956124543/',
    'https://www.instagram.com/filarmonicapoirinese/',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Cinzel:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
