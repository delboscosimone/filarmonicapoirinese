'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  value: string;
  onChange: (url: string) => void;
}

interface CropRect { x: number; y: number; w: number; h: number; }

const QUALITY = 0.78;
const MAX_W = 1200;
const OUTPUT_RATIO = 16 / 9; // default aspect ratio

export default function ImageCropUpload({ value, onChange }: Props) {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [showCrop, setShowCrop] = useState(false);
  const [imgDataUrl, setImgDataUrl] = useState('');
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 100, h: 56.25 });
  const [dragging, setDragging] = useState<'move' | 'tl' | 'tr' | 'bl' | 'br' | null>(null);
  const [dragOrigin, setDragOrigin] = useState({ mx: 0, my: 0, cx: 0, cy: 0, cw: 0, ch: 0 });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── File picked ──
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result as string;
      setImgDataUrl(src);
      setShowCrop(true);
      setPreview('');
      setError('');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  // ── Image loaded in crop modal → init crop ──
  function onImgLoad() {
    const img = imgRef.current;
    const con = containerRef.current;
    if (!img || !con) return;
    const dw = con.clientWidth;
    const scale = dw / img.naturalWidth;
    const dh = img.naturalHeight * scale;
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    setDisplaySize({ w: dw, h: dh });
    // Init crop = full image, clamped to 16:9
    const cw = dw;
    const ch = Math.min(dh, dw / OUTPUT_RATIO);
    setCrop({ x: 0, y: (dh - ch) / 2, w: cw, h: ch });
  }

  // ── Pointer events ──
  const HANDLE = 12;
  function getPointerPos(e: React.PointerEvent): { mx: number; my: number } {
    const con = containerRef.current!.getBoundingClientRect();
    return { mx: e.clientX - con.left, my: e.clientY - con.top };
  }

  function onPointerDown(e: React.PointerEvent, type: typeof dragging) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const { mx, my } = getPointerPos(e);
    setDragging(type);
    setDragOrigin({ mx, my, cx: crop.x, cy: crop.y, cw: crop.w, ch: crop.h });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const { mx, my } = getPointerPos(e);
    const dx = mx - dragOrigin.mx;
    const dy = my - dragOrigin.my;
    const dw = displaySize.w;
    const dh = displaySize.h;
    let { cx, cy, cw, ch } = dragOrigin;
    const MIN = 40;

    if (dragging === 'move') {
      cx = Math.max(0, Math.min(dw - cw, cx + dx));
      cy = Math.max(0, Math.min(dh - ch, cy + dy));
    } else {
      // Resize maintaining ratio
      if (dragging === 'br') { cw = Math.max(MIN, cw + dx); ch = cw / OUTPUT_RATIO; }
      if (dragging === 'bl') { cw = Math.max(MIN, cw - dx); cx = dragOrigin.cx + dragOrigin.cw - cw; ch = cw / OUTPUT_RATIO; }
      if (dragging === 'tr') { cw = Math.max(MIN, cw + dx); ch = cw / OUTPUT_RATIO; cy = dragOrigin.cy + dragOrigin.ch - ch; }
      if (dragging === 'tl') { cw = Math.max(MIN, cw - dx); cx = dragOrigin.cx + dragOrigin.cw - cw; ch = cw / OUTPUT_RATIO; cy = dragOrigin.cy + dragOrigin.ch - ch; }
      cx = Math.max(0, Math.min(dw - cw, cx));
      cy = Math.max(0, Math.min(dh - ch, cy));
      cw = Math.min(dw - cx, cw);
      ch = cw / OUTPUT_RATIO;
    }
    setCrop({ x: cx, y: cy, w: cw, h: ch });
  }

  function onPointerUp() { setDragging(null); }

  // ── Live preview on canvas ──
  useEffect(() => {
    if (!showCrop || !imgDataUrl) return;
    const img = imgRef.current;
    if (!img || !img.complete) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scale = naturalSize.w / displaySize.w;
    const sx = crop.x * scale;
    const sy = crop.y * scale;
    const sw = crop.w * scale;
    const sh = crop.h * scale;
    const OUT_W = 400;
    const OUT_H = OUT_W / OUTPUT_RATIO;
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OUT_W, OUT_H);
  }, [crop, showCrop, imgDataUrl, naturalSize, displaySize]);

  // ── Confirm crop & upload ──
  async function confirmCrop() {
    setUploading(true);
    setError('');
    try {
      const img = imgRef.current!;
      const scale = naturalSize.w / displaySize.w;
      const sx = crop.x * scale;
      const sy = crop.y * scale;
      const sw = crop.w * scale;
      const sh = crop.h * scale;
      const outW = Math.min(MAX_W, sw);
      const outH = outW / OUTPUT_RATIO;
      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob(b => b ? res(b) : rej(new Error('Canvas error')), 'image/jpeg', QUALITY)
      );
      const filename = `thumbnail-${Date.now()}.jpg`;
      const { data, error: upErr } = await supabase.storage
        .from('thumbnails')
        .upload(filename, blob, { contentType: 'image/jpeg', upsert: false });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('thumbnails').getPublicUrl(data.path);
      onChange(urlData.publicUrl);
      setPreview(urlData.publicUrl);
      setShowCrop(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore upload');
    }
    setUploading(false);
  }

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex gap-1 mb-2">
        {(['url', 'upload'] as const).map(m => (
          <button key={m} type="button" onClick={() => setMode(m)}
            style={{
              padding: '0.3rem 0.8rem', fontSize: '0.6rem', fontFamily: 'Cinzel, serif',
              letterSpacing: '0.15em', border: '1px solid #333',
              background: mode === m ? '#B22222' : 'transparent',
              color: mode === m ? '#F0EBE0' : '#7A6A58', cursor: 'pointer',
            }}>
            {m === 'url' ? '🔗 URL' : '📁 CARICA FILE'}
          </button>
        ))}
      </div>

      {mode === 'url' ? (
        <input type="url" value={value} onChange={e => onChange(e.target.value)}
          placeholder="https://..." className="admin-input w-full" />
      ) : (
        <div>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 0.75rem', border: '1px dashed #444',
            cursor: 'pointer', color: '#7A6A58', fontSize: '0.9rem',
            fontFamily: 'EB Garamond, serif',
          }}>
            <span>📁</span>
            <span>Scegli immagine (JPG, PNG, WebP)</span>
            <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          </label>
          {value && (
            <div className="mt-2 flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="preview" style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 2, border: '1px solid #333' }} />
              <span className="text-xs text-muted" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>Immagine caricata ✓</span>
            </div>
          )}
        </div>
      )}

      {/* ── Crop Modal ── */}
      {showCrop && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 4, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.2em', color: '#C9A84C' }}>RITAGLIA IMMAGINE</p>
              <button onClick={() => setShowCrop(false)} style={{ background: 'none', border: 'none', color: '#7A6A58', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic', color: '#7A6A58', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Trascina il riquadro per riposizionarlo. Usa gli angoli per ridimensionarlo. Proporzioni 16:9 fisse.
              </p>

              {/* Crop area */}
              <div ref={containerRef} style={{ position: 'relative', width: '100%', overflow: 'hidden', background: '#000', borderRadius: 2 }}
                onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img ref={imgRef} src={imgDataUrl} alt="crop" onLoad={onImgLoad}
                  style={{ display: 'block', width: '100%', height: 'auto', userSelect: 'none', pointerEvents: 'none' }} />

                {/* Dark overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }} />

                {/* Crop window */}
                <div
                  onPointerDown={e => onPointerDown(e, 'move')}
                  style={{
                    position: 'absolute',
                    left: crop.x, top: crop.y, width: crop.w, height: crop.h,
                    border: '2px solid #C9A84C',
                    boxShadow: 'inset 0 0 0 9999px rgba(0,0,0,0)',
                    background: 'transparent',
                    cursor: dragging === 'move' ? 'grabbing' : 'grab',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Clear window */}
                  <div style={{ position: 'absolute', inset: 0, background: 'transparent', backdropFilter: 'none' }} />

                  {/* Grid lines */}
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)', backgroundSize: `${crop.w/3}px ${crop.h/3}px`, pointerEvents: 'none' }} />

                  {/* Corner handles */}
                  {(['tl','tr','bl','br'] as const).map(corner => (
                    <div key={corner}
                      onPointerDown={e => { e.stopPropagation(); onPointerDown(e, corner); }}
                      style={{
                        position: 'absolute',
                        width: HANDLE * 2, height: HANDLE * 2,
                        background: '#C9A84C',
                        cursor: corner === 'tl' || corner === 'br' ? 'nwse-resize' : 'nesw-resize',
                        zIndex: 10,
                        ...(corner === 'tl' ? { top: -HANDLE, left: -HANDLE } :
                          corner === 'tr' ? { top: -HANDLE, right: -HANDLE } :
                          corner === 'bl' ? { bottom: -HANDLE, left: -HANDLE } :
                          { bottom: -HANDLE, right: -HANDLE }),
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#C9A84C', marginBottom: '0.5rem' }}>ANTEPRIMA</p>
                <canvas ref={canvasRef} style={{ width: '100%', maxWidth: 320, height: 'auto', display: 'block', border: '1px solid #333', borderRadius: 2 }} />
              </div>

              {error && <p style={{ color: '#CC3333', fontSize: '0.9rem', fontFamily: 'EB Garamond, serif', marginTop: '0.5rem' }}>{error}</p>}

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={confirmCrop} disabled={uploading}
                  className="btn-red" style={{ opacity: uploading ? 0.7 : 1 }}>
                  {uploading ? '⏳ Caricamento...' : '✓ Conferma e carica'}
                </button>
                <button type="button" onClick={() => setShowCrop(false)} className="btn-outline">
                  Annulla
                </button>
              </div>
              <p style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic', color: '#7A6A58', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                Immagine compressa automaticamente in JPEG ({Math.round(QUALITY * 100)}% qualità, max {MAX_W}px larghezza)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
