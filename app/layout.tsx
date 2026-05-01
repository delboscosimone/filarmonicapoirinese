import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Filarmonica Poirinese',
  description: 'La Filarmonica Poirinese — banda musicale di Poirino (TO) fondata nel 1810. Concerti, eventi e tradizione musicale piemontese.',
  keywords: ['filarmonica', 'poirino', 'banda musicale', 'concerti', 'piemonte', 'torino'],
  openGraph: {
    title: 'Filarmonica Poirinese',
    description: 'Dal 1810, la musica di Poirino',
    type: 'website',
    locale: 'it_IT',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Cinzel:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
