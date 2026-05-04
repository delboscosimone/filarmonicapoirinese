'use client';
import { useState, useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (url: string) => void;
}

interface CropRect { x: number; y: number; w: number; h: number; }

const QUALITY = 0.78;
const MAX_W = 1200;

const RATIOS = [
  { label: '16:9', key: 'landscape', ratio: 16/9 },
  { label: '4:3',  key: 'square43',  ratio: 4/3  },
  { label: '1:1',  key: 'square',    ratio: 1    },
  { label: '3:4',  key: 'portrait',  ratio: 3/4  },
  { label: '9:16', key: 'vertical',  ratio: 9/16 },
];

export default function ImageCropUpload({ value, onChange }: Props) {
  const [mode, setMode] = useState<'url'|'upload'>('url');
  const [showCrop, setShowCrop] = useState(false);
  const [imgDataUrl, setImgDataUrl] = useState('');
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [ratioKey, setRatioKey] = useState('landscape');
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 100, h: 56.25 });
  const [dragging, setDragging] = useState<'move'|'tl'|'tr'|'bl'|'br'|null>(null);
  const [dragOrigin, setDragOrigin] = useState({ mx:0, my:0, cx:0, cy:0, cw:0, ch:0 });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentRatio = RATIOS.find(r => r.key === ratioKey)?.ratio ?? 16/9;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImgDataUrl(ev.target?.result as string);
      setShowCrop(true);
      setError('');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function initCrop(ratio: number) {
    const dw = displaySize.w;
    const dh = displaySize.h;
    if (!dw || !dh) return;
    let cw: number, ch: number;
    if (ratio >= 1) {
      cw = Math.min(dw, dh * ratio);
      ch = cw / ratio;
    } else {
      ch = Math.min(dh, dw / ratio);
      cw = ch * ratio;
    }
    setCrop({ x: (dw - cw) / 2, y: (dh - ch) / 2, w: cw, h: ch });
  }

  function onImgLoad() {
    const img = imgRef.current;
    const con = containerRef.current;
    if (!img || !con) return;
    const dw = con.clientWidth;
    const scale = dw / img.naturalWidth;
    const dh = img.naturalHeight * scale;
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    setDisplaySize({ w: dw, h: dh });
  }

  useEffect(() => {
    if (displaySize.w && displaySize.h) initCrop(currentRatio);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displaySize, ratioKey]);

  function changeRatio(key: string) {
    setRatioKey(key);
  }

  const HANDLE = 12;

  function getPos(e: React.PointerEvent) {
    const r = containerRef.current!.getBoundingClientRect();
    return { mx: e.clientX - r.left, my: e.clientY - r.top };
  }

  function onPointerDown(e: React.PointerEvent, type: typeof dragging) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const { mx, my } = getPos(e);
    setDragging(type);
    setDragOrigin({ mx, my, cx: crop.x, cy: crop.y, cw: crop.w, ch: crop.h });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const { mx, my } = getPos(e);
    const dx = mx - dragOrigin.mx;
    const dy = my - dragOrigin.my;
    const dw = displaySize.w;
    const dh = displaySize.h;
    let { cx, cy, cw, ch } = dragOrigin;
    const MIN = 30;
    const ratio = currentRatio;

    if (dragging === 'move') {
      cx = Math.max(0, Math.min(dw - cw, cx + dx));
      cy = Math.max(0, Math.min(dh - ch, cy + dy));
    } else {
      if (dragging === 'br') { cw = Math.max(MIN, cw + dx); ch = cw / ratio; }
      if (dragging === 'bl') { cw = Math.max(MIN, cw - dx); cx = dragOrigin.cx + dragOrigin.cw - cw; ch = cw / ratio; }
      if (dragging === 'tr') { cw = Math.max(MIN, cw + dx); ch = cw / ratio; cy = dragOrigin.cy + dragOrigin.ch - ch; }
      if (dragging === 'tl') { cw = Math.max(MIN, cw - dx); cx = dragOrigin.cx + dragOrigin.cw - cw; ch = cw / ratio; cy = dragOrigin.cy + dragOrigin.ch - ch; }
      cx = Math.max(0, Math.min(dw - cw, cx));
      cy = Math.max(0, Math.min(dh - ch, cy));
    }
    setCrop({ x: cx, y: cy, w: cw, h: ch });
  }

  function onPointerUp() { setDragging(null); }

  // Live preview
  useEffect(() => {
    if (!showCrop || !imgDataUrl || !imgRef.current?.complete) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scale = naturalSize.w / displaySize.w;
    const OUT_W = 300;
    const OUT_H = OUT_W / currentRatio;
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(imgRef.current, crop.x * scale, crop.y * scale, crop.w * scale, crop.h * scale, 0, 0, OUT_W, OUT_H);
  }, [crop, showCrop, imgDataUrl, naturalSize, displaySize, currentRatio]);

  async function confirmCrop() {
    setUploading(true); setError('');
    try {
      const img = imgRef.current!;
      const scale = naturalSize.w / displaySize.w;
      const outW = Math.min(MAX_W, crop.w * scale);
      const outH = outW / currentRatio;
      const canvas = document.createElement('canvas');
      canvas.width = outW; canvas.height = outH;
      canvas.getContext('2d')!.drawImage(img, crop.x*scale, crop.y*scale, crop.w*scale, crop.h*scale, 0, 0, outW, outH);
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob(b => b ? res(b) : rej(new Error('Canvas error')), 'image/jpeg', QUALITY)
      );
      const fd = new FormData();
      fd.append('file', blob, 'thumbnail.jpg');
      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error ?? 'Errore upload');
      onChange(json.url);
      setShowCrop(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore upload');
    }
    setUploading(false);
  }

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'8px' }}>
        {(['url','upload'] as const).map(m => (
          <button key={m} type="button" onClick={() => setMode(m)} style={{
            padding:'0.35rem 1rem', fontSize:'0.6rem', fontFamily:'Cinzel,serif',
            letterSpacing:'0.15em', border:'1px solid #333', whiteSpace:'nowrap',
            background: mode===m ? '#B22222' : 'transparent',
            color: mode===m ? '#F0EBE0' : '#7A6A58', cursor:'pointer',
          }}>
            {m==='url' ? '🔗 URL' : '📁 CARICA FILE'}
          </button>
        ))}
      </div>

      {mode==='url' ? (
        <input type="url" value={value} onChange={e => onChange(e.target.value)}
          placeholder="https://..." className="admin-input w-full" />
      ) : (
        <div>
          <label style={{
            display:'flex', alignItems:'center', gap:'0.5rem',
            padding:'0.6rem 0.75rem', border:'1px dashed #444',
            cursor:'pointer', color:'#7A6A58', fontFamily:'EB Garamond,serif', fontSize:'0.9rem',
          }}>
            <span>📁</span><span>Scegli immagine (JPG, PNG, WebP)</span>
            <input type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />
          </label>
          {value && (
            <div style={{ marginTop:'8px', display:'flex', alignItems:'center', gap:'8px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="preview" style={{ width:80, height:45, objectFit:'cover', borderRadius:2, border:'1px solid #333' }} />
              <span style={{ fontFamily:'Cinzel,serif', letterSpacing:'0.05em', color:'#7A6A58', fontSize:'0.75rem' }}>Immagine caricata ✓</span>
            </div>
          )}
        </div>
      )}

      {/* ── Crop Modal ── */}
      {showCrop && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.95)', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'1rem', overflowY:'auto' }}>
          <div style={{ background:'#111', border:'1px solid #333', borderRadius:4, width:'100%', maxWidth:680, margin:'auto' }}>

            {/* Header */}
            <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #222', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.7rem', letterSpacing:'0.2em', color:'#C9A84C' }}>RITAGLIA IMMAGINE</p>
              <button onClick={() => setShowCrop(false)} style={{ background:'none', border:'none', color:'#7A6A58', cursor:'pointer', fontSize:'1.2rem' }}>✕</button>
            </div>

            <div style={{ padding:'1.5rem' }}>

              {/* Ratio selector */}
              <div style={{ marginBottom:'1rem' }}>
                <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.6rem', letterSpacing:'0.2em', color:'#C9A84C', marginBottom:'0.5rem' }}>FORMATO</p>
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                  {RATIOS.map(r => (
                    <button key={r.key} type="button" onClick={() => changeRatio(r.key)} style={{
                      padding:'0.3rem 0.8rem',
                      fontFamily:'Cinzel,serif', fontSize:'0.65rem', letterSpacing:'0.1em',
                      border: ratioKey===r.key ? '1px solid #C9A84C' : '1px solid #333',
                      background: ratioKey===r.key ? 'rgba(201,168,76,0.15)' : 'transparent',
                      color: ratioKey===r.key ? '#C9A84C' : '#7A6A58',
                      cursor:'pointer', borderRadius:2,
                    }}>
                      {r.label}
                      <span style={{ fontSize:'0.5rem', display:'block', marginTop:'1px', opacity:0.7 }}>
                        {r.key==='landscape'?'Orizzontale':r.key==='portrait'||r.key==='vertical'?'Verticale':r.key==='square'?'Quadrato':''}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <p style={{ fontFamily:'EB Garamond,serif', fontStyle:'italic', color:'#7A6A58', fontSize:'0.85rem', marginBottom:'0.75rem' }}>
                Trascina il riquadro · usa gli angoli per ridimensionare
              </p>

              {/* Crop area */}
              <div ref={containerRef}
                style={{ position:'relative', width:'100%', background:'#000', borderRadius:2, overflow:'hidden', touchAction:'none' }}
                onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img ref={imgRef} src={imgDataUrl} alt="crop" onLoad={onImgLoad}
                  style={{ display:'block', width:'100%', height:'auto', userSelect:'none', pointerEvents:'none' }} />

                {/* Dark overlay */}
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', pointerEvents:'none' }} />

                {/* Crop window (clear) */}
                <div
                  onPointerDown={e => onPointerDown(e, 'move')}
                  style={{
                    position:'absolute',
                    left: crop.x, top: crop.y, width: crop.w, height: crop.h,
                    border:'2px solid #C9A84C',
                    cursor: dragging==='move' ? 'grabbing' : 'grab',
                    boxSizing:'border-box', background:'transparent',
                  }}
                >
                  {/* Clear window */}
                  <div style={{ position:'absolute', inset:0, boxShadow:'0 0 0 9999px rgba(0,0,0,0.5)', pointerEvents:'none' }} />

                  {/* Grid */}
                  <div style={{
                    position:'absolute', inset:0, pointerEvents:'none',
                    backgroundImage:'linear-gradient(rgba(201,168,76,0.25) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.25) 1px,transparent 1px)',
                    backgroundSize:`${crop.w/3}px ${crop.h/3}px`,
                  }} />

                  {/* Handles */}
                  {(['tl','tr','bl','br'] as const).map(c => (
                    <div key={c}
                      onPointerDown={e => { e.stopPropagation(); onPointerDown(e, c); }}
                      style={{
                        position:'absolute', width:HANDLE*2, height:HANDLE*2, background:'#C9A84C', zIndex:10,
                        cursor: c==='tl'||c==='br' ? 'nwse-resize' : 'nesw-resize',
                        ...(c==='tl'?{top:-HANDLE,left:-HANDLE}:c==='tr'?{top:-HANDLE,right:-HANDLE}:c==='bl'?{bottom:-HANDLE,left:-HANDLE}:{bottom:-HANDLE,right:-HANDLE}),
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div style={{ marginTop:'1rem', display:'flex', gap:'1rem', alignItems:'flex-start', flexWrap:'wrap' }}>
                <div style={{ flex:'0 0 auto' }}>
                  <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.6rem', letterSpacing:'0.2em', color:'#C9A84C', marginBottom:'0.4rem' }}>ANTEPRIMA</p>
                  <canvas ref={canvasRef} style={{
                    display:'block', border:'1px solid #333', borderRadius:2,
                    width: currentRatio >= 1 ? '200px' : `${200 * currentRatio}px`,
                    height: currentRatio >= 1 ? `${200/currentRatio}px` : '200px',
                  }} />
                </div>
                <div style={{ flex:1, paddingTop:'1.5rem' }}>
                  <p style={{ fontFamily:'EB Garamond,serif', color:'#7A6A58', fontSize:'0.85rem', lineHeight:1.6 }}>
                    Formato selezionato: <strong style={{ color:'#C9A84C' }}>{RATIOS.find(r=>r.key===ratioKey)?.label}</strong><br/>
                    La copertina verrà compressa in JPEG ({Math.round(QUALITY*100)}% qualità, max {MAX_W}px).
                  </p>
                </div>
              </div>

              {error && <p style={{ color:'#CC3333', fontFamily:'EB Garamond,serif', marginTop:'0.5rem' }}>{error}</p>}

              <div style={{ marginTop:'1.5rem', display:'flex', gap:'0.75rem' }}>
                <button type="button" onClick={confirmCrop} disabled={uploading}
                  className="btn-red" style={{ opacity:uploading?0.7:1 }}>
                  {uploading ? '⏳ Caricamento...' : '✓ Conferma e carica'}
                </button>
                <button type="button" onClick={() => setShowCrop(false)} className="btn-outline">Annulla</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
