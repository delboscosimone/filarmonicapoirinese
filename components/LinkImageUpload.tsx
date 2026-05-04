'use client';
import { useState, useRef, useEffect } from 'react';

interface Props {
  value: string;
  ratio: string;
  onChange: (url: string, ratio: string) => void;
}

interface CropRect { x: number; y: number; w: number; h: number; }

const RATIOS = [
  { label:'16:9', key:'16/9', ratio:16/9 },
  { label:'4:3',  key:'4/3',  ratio:4/3  },
  { label:'1:1',  key:'1/1',  ratio:1    },
  { label:'3:4',  key:'3/4',  ratio:3/4  },
  { label:'9:16', key:'9/16', ratio:9/16 },
];

export default function LinkImageUpload({ value, ratio, onChange }: Props) {
  const [showCrop, setShowCrop] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [ratioKey, setRatioKey] = useState(ratio || '4/3');
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState<CropRect>({ x:0, y:0, w:100, h:75 });
  const [dragging, setDragging] = useState<'move'|'tl'|'tr'|'bl'|'br'|null>(null);
  const [dragOrigin, setDragOrigin] = useState({ mx:0, my:0, cx:0, cy:0, cw:0, ch:0 });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentRatio = RATIOS.find(r => r.key === ratioKey)?.ratio ?? 4/3;
  const HANDLE = 10;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setImgSrc(ev.target?.result as string); setShowCrop(true); setError(''); };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function onImgLoad() {
    const img = imgRef.current, con = containerRef.current; if (!img || !con) return;
    const dw = con.clientWidth, scale = dw / img.naturalWidth, dh = img.naturalHeight * scale;
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    setDisplaySize({ w: dw, h: dh });
  }

  useEffect(() => {
    if (!displaySize.w || !displaySize.h) return;
    const r = currentRatio, dw = displaySize.w, dh = displaySize.h;
    let cw: number, ch: number;
    if (r >= 1) { cw = Math.min(dw, dh * r); ch = cw / r; }
    else { ch = Math.min(dh, dw / r); cw = ch * r; }
    setCrop({ x: (dw-cw)/2, y: (dh-ch)/2, w: cw, h: ch });
  }, [displaySize, ratioKey]);

  function getPos(e: React.PointerEvent) {
    const r = containerRef.current!.getBoundingClientRect();
    return { mx: e.clientX - r.left, my: e.clientY - r.top };
  }
  function onPointerDown(e: React.PointerEvent, type: typeof dragging) {
    e.preventDefault(); (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const { mx, my } = getPos(e);
    setDragging(type); setDragOrigin({ mx, my, cx:crop.x, cy:crop.y, cw:crop.w, ch:crop.h });
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const { mx, my } = getPos(e), dx = mx-dragOrigin.mx, dy = my-dragOrigin.my;
    const dw = displaySize.w, dh = displaySize.h;
    let { cx, cy, cw, ch } = dragOrigin;
    const MIN = 30, r = currentRatio;
    if (dragging==='move') { cx=Math.max(0,Math.min(dw-cw,cx+dx)); cy=Math.max(0,Math.min(dh-ch,cy+dy)); }
    else {
      if (dragging==='br') { cw=Math.max(MIN,cw+dx); ch=cw/r; }
      if (dragging==='bl') { cw=Math.max(MIN,cw-dx); cx=dragOrigin.cx+dragOrigin.cw-cw; ch=cw/r; }
      if (dragging==='tr') { cw=Math.max(MIN,cw+dx); ch=cw/r; cy=dragOrigin.cy+dragOrigin.ch-ch; }
      if (dragging==='tl') { cw=Math.max(MIN,cw-dx); cx=dragOrigin.cx+dragOrigin.cw-cw; ch=cw/r; cy=dragOrigin.cy+dragOrigin.ch-ch; }
      cx=Math.max(0,Math.min(dw-cw,cx)); cy=Math.max(0,Math.min(dh-ch,cy));
    }
    setCrop({ x:cx, y:cy, w:cw, h:ch });
  }
  function onPointerUp() { setDragging(null); }

  // Live preview
  useEffect(() => {
    if (!showCrop||!imgSrc||!imgRef.current?.complete) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const scale = naturalSize.w/displaySize.w, OUT_W=240, OUT_H=OUT_W/currentRatio;
    canvas.width=OUT_W; canvas.height=OUT_H;
    canvas.getContext('2d')!.drawImage(imgRef.current,crop.x*scale,crop.y*scale,crop.w*scale,crop.h*scale,0,0,OUT_W,OUT_H);
  }, [crop, showCrop, imgSrc, naturalSize, displaySize, currentRatio]);

  async function confirmCrop() {
    setUploading(true); setError('');
    try {
      const img = imgRef.current!, scale = naturalSize.w/displaySize.w;
      const outW = Math.min(900, crop.w*scale), outH = outW/currentRatio;
      const canvas = document.createElement('canvas');
      canvas.width=outW; canvas.height=outH;
      canvas.getContext('2d')!.drawImage(img,crop.x*scale,crop.y*scale,crop.w*scale,crop.h*scale,0,0,outW,outH);
      const blob = await new Promise<Blob>((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error('err')),'image/jpeg',0.8));
      const fd = new FormData(); fd.append('file',blob,'preview.jpg');
      const r = await fetch('/api/upload',{method:'POST',body:fd});
      const json = await r.json();
      if (!r.ok) throw new Error(json.error??'Errore');
      onChange(json.url, ratioKey);
      setShowCrop(false);
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Errore upload'); }
    setUploading(false);
  }

  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:'6px' }}>
      {/* Preview thumbnail */}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="preview" style={{ height:36, width:36, objectFit:'cover', borderRadius:2, border:'1px solid #333', cursor:'pointer' }} onClick={() => setShowCrop(true)} />
      )}

      {/* Upload button */}
      <label style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'0.3rem 0.6rem', border:'1px solid #333', borderRadius:2, cursor:'pointer', color:'#7A6A58', fontFamily:'Cinzel,serif', fontSize:'0.55rem', letterSpacing:'0.1em', whiteSpace:'nowrap' }}>
        {value ? '✎ CAMBIA' : '+ ANTEPRIMA'}
        <input type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />
      </label>

      {/* Crop Modal */}
      {showCrop && (
        <div style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', zIndex:99999, background:'rgba(0,0,0,0.95)', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'1rem', overflowY:'auto' }}>
          <div style={{ background:'#111', border:'1px solid #333', borderRadius:4, width:'100%', maxWidth:620, margin:'auto' }}>
            <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #222', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.65rem', letterSpacing:'0.2em', color:'#C9A84C' }}>ANTEPRIMA LINK FOTO</p>
              <button onClick={()=>setShowCrop(false)} style={{ background:'none', border:'none', color:'#7A6A58', cursor:'pointer', fontSize:'1.2rem' }}>✕</button>
            </div>
            <div style={{ padding:'1.5rem' }}>
              {/* Ratio */}
              <div style={{ marginBottom:'1rem' }}>
                <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.55rem', letterSpacing:'0.2em', color:'#C9A84C', marginBottom:'0.4rem' }}>FORMATO</p>
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                  {RATIOS.map(r=>(
                    <button key={r.key} type="button" onClick={()=>setRatioKey(r.key)} style={{
                      padding:'0.25rem 0.6rem', fontFamily:'Cinzel,serif', fontSize:'0.6rem', letterSpacing:'0.1em',
                      border: ratioKey===r.key?'1px solid #C9A84C':'1px solid #333',
                      background: ratioKey===r.key?'rgba(201,168,76,0.15)':'transparent',
                      color: ratioKey===r.key?'#C9A84C':'#7A6A58', cursor:'pointer', borderRadius:2,
                    }}>{r.label}</button>
                  ))}
                </div>
              </div>

              {/* Crop area */}
              <div ref={containerRef} style={{ position:'relative', width:'100%', background:'#000', borderRadius:2, overflow:'hidden', touchAction:'none' }}
                onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img ref={imgRef} src={imgSrc} alt="crop" onLoad={onImgLoad}
                  style={{ display:'block', width:'100%', height:'auto', userSelect:'none', pointerEvents:'none' }} />
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', pointerEvents:'none' }} />
                <div onPointerDown={e=>onPointerDown(e,'move')}
                  style={{ position:'absolute', left:crop.x, top:crop.y, width:crop.w, height:crop.h, border:'2px solid #C9A84C', cursor:'grab', boxSizing:'border-box' }}>
                  <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'linear-gradient(rgba(201,168,76,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.2) 1px,transparent 1px)', backgroundSize:`${crop.w/3}px ${crop.h/3}px` }} />
                  {(['tl','tr','bl','br'] as const).map(c=>(
                    <div key={c} onPointerDown={e=>{e.stopPropagation();onPointerDown(e,c);}} style={{
                      position:'absolute', width:HANDLE*2, height:HANDLE*2, background:'#C9A84C', zIndex:10,
                      cursor:c==='tl'||c==='br'?'nwse-resize':'nesw-resize',
                      ...(c==='tl'?{top:-HANDLE,left:-HANDLE}:c==='tr'?{top:-HANDLE,right:-HANDLE}:c==='bl'?{bottom:-HANDLE,left:-HANDLE}:{bottom:-HANDLE,right:-HANDLE}),
                    }} />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div style={{ marginTop:'1rem' }}>
                <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.55rem', letterSpacing:'0.2em', color:'#C9A84C', marginBottom:'0.4rem' }}>ANTEPRIMA</p>
                <canvas ref={canvasRef} style={{
                  display:'block', border:'1px solid #333', borderRadius:2,
                  width: currentRatio>=1 ? '180px' : `${120*currentRatio}px`,
                  height: currentRatio>=1 ? `${180/currentRatio}px` : '120px',
                }} />
              </div>

              {error && <p style={{ color:'#CC3333', fontFamily:'EB Garamond,serif', marginTop:'0.5rem', fontSize:'0.9rem' }}>{error}</p>}

              <div style={{ marginTop:'1.5rem', display:'flex', gap:'0.75rem' }}>
                <button type="button" onClick={confirmCrop} disabled={uploading} className="btn-red" style={{ opacity:uploading?0.7:1 }}>
                  {uploading?'⏳ Caricamento...':'✓ Conferma'}
                </button>
                <button type="button" onClick={()=>setShowCrop(false)} className="btn-outline">Annulla</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
