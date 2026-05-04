'use client';
import { useState, useEffect } from 'react';

interface Props {
  url: string;
  title: string;
}

export default function QRShare({ url, title }: Props) {
  const [qrImg, setQrImg] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!showQR) return;
    import('qrcode').then(QRCode => {
      QRCode.default.toDataURL(url, {
        width: 400, margin: 2,
        color: { dark: '#C9A84C', light: '#111111' },
      }).then((d: string) => setQrImg(d)).catch(() => {});
    }).catch(() => {});
  }, [showQR, url]);

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function downloadQR() {
    if (!qrImg) return;
    const a = document.createElement('a');
    a.href = qrImg;
    a.download = `qr-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  }

  function share() {
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      copyLink();
    }
  }

  return (
    <div>
      <p className="text-center mb-4" style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.25em', color: '#7A6A58' }}>
        CONDIVIDI QUESTO EVENTO
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {/* Copia link */}
        <button onClick={copyLink} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.7rem 1.4rem', border: '1px solid #333', borderRadius: '2px',
          background: 'transparent', color: copied ? '#25D166' : '#7A6A58',
          fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.15em',
          cursor: 'pointer', transition: 'all 0.2s',
        }}>
          {copied ? '✓ COPIATO!' : '🔗 COPIA LINK'}
        </button>

        {/* Condividi */}
        <button onClick={share} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.7rem 1.4rem', border: '1px solid #C9A84C', borderRadius: '2px',
          background: 'transparent', color: '#C9A84C',
          fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.15em',
          cursor: 'pointer',
        }}>
          📤 CONDIVIDI
        </button>

        {/* QR Code */}
        <button onClick={() => setShowQR(true)} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.7rem 1.4rem', border: '1px solid #B22222', borderRadius: '2px',
          background: 'transparent', color: '#B22222',
          fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.15em',
          cursor: 'pointer',
        }}>
          ▦ QR CODE
        </button>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          zIndex: 9999, background: 'rgba(0,0,0,0.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 4, width: '100%', maxWidth: 340, padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.25em', color: '#C9A84C', marginBottom: '1rem' }}>
              QR CODE — {title.toUpperCase()}
            </p>

            <div style={{ background: '#111', padding: '1rem', borderRadius: 4, border: '1px solid #222', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              {qrImg
                ? <img src={qrImg} alt="QR" style={{ width: 180, height: 180 }} />
                : <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A6A58', fontSize: '0.7rem', fontFamily: 'Cinzel, serif' }}>GENERAZIONE...</div>
              }
            </div>

            <p style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic', color: '#7A6A58', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Scansiona per aprire questa pagina. Stampalo per condividerlo all&apos;evento.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={downloadQR} disabled={!qrImg} style={{
                padding: '0.65rem 1.25rem', background: '#B22222', border: '1px solid #B22222',
                color: '#F0EBE0', fontFamily: 'Cinzel, serif', fontSize: '0.65rem',
                letterSpacing: '0.15em', cursor: 'pointer', opacity: qrImg ? 1 : 0.5,
              }}>
                ↓ SCARICA PNG
              </button>
              <button onClick={() => { setShowQR(false); setQrImg(''); }} style={{
                padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid #333',
                color: '#7A6A58', fontFamily: 'Cinzel, serif', fontSize: '0.65rem',
                letterSpacing: '0.15em', cursor: 'pointer',
              }}>
                CHIUDI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
