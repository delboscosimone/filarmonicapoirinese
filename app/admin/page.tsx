'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { MediaSection, MediaLink, BandinaContact, SiteSettings } from '@/lib/types';
import { defaultSettings } from '@/lib/types';
import ImageCropUpload from '@/components/ImageCropUpload';

/* ─── Helpers ───────────────────────────────── */
type LinkType = 'foto' | 'video' | 'altro';
type SectionType = 'foto' | 'video' | 'misto';

interface FormData {
  title: string; slug: string; description: string;
  type: SectionType; event_date: string; thumbnail_url: string;
  is_published: boolean; links: MediaLink[];
}
const emptyForm: FormData = {
  title: '', slug: '', description: '', type: 'misto',
  event_date: '', thumbnail_url: '', is_published: true, links: [],
};

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
}
function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'});
}
function whatsappUrl(phone: string, message: string) {
  const clean = phone.replace(/\D/g,'');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
function uid() { return Math.random().toString(36).slice(2,9); }

/* ─── Main Component ────────────────────────── */
export default function AdminPage() {
  const [authState, setAuthState] = useState<'loading'|'unauth'|'auth'>('loading');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState<'media'|'settings'>('media');

  /* Media state */
  const [sections, setSections] = useState<MediaSection[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);
  const [qrSection, setQrSection] = useState<MediaSection|null>(null);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [qrImg, setQrImg] = useState('');
  const [copied, setCopied] = useState(false);

  /* Settings state */
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://filarmonicapoirinese.it';

  /* Auth check */
  useEffect(() => {
    fetch('/api/auth/check').then(r=>r.json()).then(d=>setAuthState(d.authenticated?'auth':'unauth')).catch(()=>setAuthState('unauth'));
  }, []);

  /* Load sections */
  const loadSections = useCallback(async () => {
    setLoadingSections(true);
    try { const r=await fetch('/api/media'); const d=await r.json(); setSections(Array.isArray(d)?d:[]); } catch{/**/}
    setLoadingSections(false);
  }, []);

  /* Load settings */
  const loadSettings = useCallback(async () => {
    try {
      const r = await fetch('/api/settings');
      const d = await r.json();
      setSettings({
        direttore: d.direttore ?? defaultSettings.direttore,
        bandina_contacts: d.bandina_contacts ?? [],
      });
    } catch{/**/}
  }, []);

  useEffect(() => {
    if (authState === 'auth') { loadSections(); loadSettings(); }
  }, [authState, loadSections, loadSettings]);

  /* QR generation */
  useEffect(() => {
    if (!qrSection) { setQrImg(''); return; }
    const url = `${siteUrl}/media/${qrSection.slug}`;
    import('qrcode').then(QRCode => {
      QRCode.default.toDataURL(url,{width:512,margin:2,color:{dark:'#C9A84C',light:'#111111'}})
        .then((d:string)=>setQrImg(d)).catch(()=>setQrImg(''));
    }).catch(()=>setQrImg(''));
  }, [qrSection, siteUrl]);

  /* ── Login ── */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setLoginLoading(true); setLoginError('');
    try {
      const r = await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
      const d = await r.json();
      if (r.ok) setAuthState('auth'); else setLoginError(d.error??'Errore');
    } catch { setLoginError('Errore di rete'); }
    setLoginLoading(false);
  }

  async function handleLogout() {
    await fetch('/api/logout',{method:'POST'});
    setAuthState('unauth'); setSections([]);
  }

  /* ── Media form helpers ── */
  function openCreate() { setForm(emptyForm); setEditId(null); setFormError(''); setAutoSlug(true); setShowForm(true); }
  function openEdit(s: MediaSection) {
    setForm({ title:s.title, slug:s.slug, description:s.description??'', type:s.type as SectionType,
      event_date:s.event_date??'', thumbnail_url:s.thumbnail_url??'', is_published:s.is_published,
      links:Array.isArray(s.links)?[...s.links]:[] });
    setEditId(s.id); setFormError(''); setAutoSlug(false); setShowForm(true);
  }
  function updateField(k: keyof FormData, v: unknown) {
    if (k==='title' && autoSlug) { setForm(f=>({...f, title:v as string, slug:slugify(v as string)})); return; }
    setForm(f=>({...f,[k]:v}));
  }
  function addLink() { setForm(f=>({...f, links:[...f.links,{label:'',url:'',type:'altro' as LinkType}]})); }
  function updateLink(i:number, field:keyof MediaLink, val:string) {
    setForm(f=>{const links=[...f.links]; links[i]={...links[i],[field]:val}; return {...f,links};});
  }
  function removeLink(i:number) { setForm(f=>({...f,links:f.links.filter((_,idx)=>idx!==i)})); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setFormLoading(true); setFormError('');
    try {
      const url = editId?`/api/media/${editId}`:'/api/media';
      const body:{[k:string]:unknown} = {...form};
      if (!body.event_date) body.event_date=null;
      if (!body.thumbnail_url) body.thumbnail_url=null;
      if (!body.description) body.description=null;
      const r = await fetch(url,{method:editId?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const d = await r.json();
      if (r.ok) { setShowForm(false); loadSections(); } else setFormError(d.error??'Errore');
    } catch { setFormError('Errore di rete'); }
    setFormLoading(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/media/${deleteId}`,{method:'DELETE'});
    setDeleteId(null); loadSections();
  }

  /* ── QR ── */
  function downloadQR() {
    if (!qrImg||!qrSection) return;
    const a=document.createElement('a'); a.href=qrImg; a.download=`qr-${qrSection.slug}.png`; a.click();
  }
  function copyUrl() {
    if (!qrSection) return;
    navigator.clipboard.writeText(`${siteUrl}/media/${qrSection.slug}`);
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  }

  /* ── Settings ── */
  function addContact() {
    setSettings(s=>({...s, bandina_contacts:[...s.bandina_contacts,{id:uid(),name:'',role:'',phone:'',message:'Ciao! Vorrei informazioni sulla Bandina Poirinese.'}]}));
  }
  function updateContact(id:string, field:keyof BandinaContact, val:string) {
    setSettings(s=>({...s, bandina_contacts:s.bandina_contacts.map(c=>c.id===id?{...c,[field]:val}:c)}));
  }
  function removeContact(id:string) {
    setSettings(s=>({...s, bandina_contacts:s.bandina_contacts.filter(c=>c.id!==id)}));
  }

  async function saveSettings() {
    setSettingsLoading(true);
    try {
      await fetch('/api/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)});
      setSettingsSaved(true); setTimeout(()=>setSettingsSaved(false),3000);
    } catch{/**/}
    setSettingsLoading(false);
  }

  /* ── Loading ── */
  if (authState==='loading') return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-muted animate-pulse" style={{fontFamily:'Cinzel,serif',letterSpacing:'0.2em',fontSize:'0.75rem'}}>CARICAMENTO...</div>
    </div>
  );

  /* ════ LOGIN ════ */
  if (authState==='unauth') return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:'radial-gradient(ellipse at 50% 40%, #1a0505 0%, #080808 70%)'}}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <Image src="/logo-filarmonica.png" alt="Logo" width={72} height={72} className="mb-4 opacity-80" style={{mixBlendMode:'screen'}} />
          <p style={{fontFamily:'Cinzel,serif',fontSize:'0.7rem',letterSpacing:'0.3em',color:'#C9A84C'}}>ADMIN — FILARMONICA POIRINESE</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="pwd" style={{fontFamily:'Cinzel,serif',fontSize:'0.6rem',letterSpacing:'0.25em',color:'#C9A84C'}} className="block mb-2 uppercase">Password</label>
            <input id="pwd" type="password" value={password} onChange={e=>setPassword(e.target.value)} className="admin-input w-full" autoFocus />
          </div>
          {loginError && <p className="text-red-light text-sm" style={{fontFamily:'EB Garamond,serif'}}>{loginError}</p>}
          <button type="submit" disabled={loginLoading} className="btn-red w-full justify-center" style={{display:'flex',opacity:loginLoading?0.7:1}}>
            {loginLoading?'Accesso in corso...':'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );

  /* ════ DASHBOARD ════ */
  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo-filarmonica.png" alt="Logo" width={28} height={28} style={{mixBlendMode:'screen'}} />
            <span style={{fontFamily:'Cinzel,serif',fontSize:'0.65rem',letterSpacing:'0.2em',color:'#C9A84C'}}>PANNELLO ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" className="text-muted hover:text-cream text-xs transition-colors" style={{fontFamily:'Cinzel,serif',letterSpacing:'0.1em'}}>Vedi sito ↗</a>
            <button onClick={handleLogout} className="text-muted hover:text-red-light text-xs transition-colors" style={{fontFamily:'Cinzel,serif',letterSpacing:'0.1em'}}>Esci</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-1 mb-10 border-b border-border">
          {[{key:'media',label:'Sezioni Media'},{key:'settings',label:'Impostazioni Sito'}].map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key as 'media'|'settings')}
              className="px-6 py-3 text-xs transition-all"
              style={{
                fontFamily:'Cinzel,serif',letterSpacing:'0.15em',
                borderBottom: tab===t.key ? '2px solid #B22222' : '2px solid transparent',
                color: tab===t.key ? '#F0EBE0' : '#7A6A58',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* ═══ TAB: MEDIA ═══ */}
        {tab==='media' && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                {label:'Sezioni totali',value:sections.length},
                {label:'Pubblicate',value:sections.filter(s=>s.is_published).length},
                {label:'Nascoste',value:sections.filter(s=>!s.is_published).length},
              ].map(stat=>(
                <div key={stat.label} className="bg-surface border border-border rounded-sm p-5 text-center">
                  <div style={{fontFamily:'Cinzel,serif',fontSize:'1.8rem',color:'#C9A84C'}}>{stat.value}</div>
                  <div className="text-muted text-xs mt-1" style={{fontFamily:'Cinzel,serif',letterSpacing:'0.1em'}}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.5rem',color:'#F0EBE0'}}>Sezioni Media</h2>
              <button onClick={openCreate} className="btn-red">+ Nuova sezione</button>
            </div>

            {loadingSections ? (
              <div className="text-center py-16 text-muted" style={{fontFamily:'Cinzel,serif',letterSpacing:'0.2em',fontSize:'0.65rem'}}>CARICAMENTO...</div>
            ) : sections.length===0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-sm">
                <p className="text-5xl mb-4">🎵</p>
                <p className="text-muted mb-6" style={{fontFamily:'EB Garamond,serif',fontStyle:'italic'}}>Nessuna sezione ancora.</p>
                <button onClick={openCreate} className="btn-red">Crea la prima sezione</button>
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map(s=>(
                  <div key={s.id} className="bg-surface border border-border rounded-sm p-4 flex items-center gap-4"
                    style={{borderLeft:`3px solid ${s.is_published?'#B22222':'#333'}`}}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span style={{fontFamily:'Playfair Display,serif',color:'#F0EBE0',fontSize:'1.1rem'}}>{s.title}</span>
                        {!s.is_published&&<span className="px-2 py-0.5 text-xs rounded-sm" style={{background:'#222',color:'#7A6A58',fontFamily:'Cinzel,serif',letterSpacing:'0.1em'}}>Nascosta</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
                        <span style={{fontFamily:'Cinzel,serif',letterSpacing:'0.1em'}}>/{s.slug}</span>
                        <span>·</span>
                        <span style={{color:'#C9A84C'}}>{s.type==='foto'?'📸 Foto':s.type==='video'?'🎬 Video':'📸🎬 Misto'}</span>
                        {s.event_date&&<><span>·</span><span>{formatDate(s.event_date)}</span></>}
                        <span>·</span><span>{(s.links??[]).length} link(s)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={()=>setQrSection(s)} title="QR Code" className="p-2 text-gold hover:text-gold-light transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="3" height="3"/>
                          <rect x="19" y="14" width="2" height="2"/><rect x="14" y="19" width="2" height="2"/><rect x="19" y="19" width="2" height="2"/>
                        </svg>
                      </button>
                      <a href={`/media/${s.slug}`} target="_blank" rel="noopener noreferrer" title="Vedi" className="p-2 text-muted hover:text-cream transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                      </a>
                      <button onClick={()=>openEdit(s)} title="Modifica" className="p-2 text-muted hover:text-cream transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button onClick={()=>setDeleteId(s.id)} title="Elimina" className="p-2 text-muted hover:text-red-light transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6M14,11v6"/>
                          <path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══ TAB: SETTINGS ═══ */}
        {tab==='settings' && (
          <div className="space-y-10 max-w-2xl">
            <div>
              <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.5rem',color:'#F0EBE0'}} className="mb-6">Impostazioni Sito</h2>

              {/* Direttore */}
              <div className="bg-surface border border-border rounded-sm p-6 mb-6">
                <p className="admin-label mb-4">Direttore Artistico</p>
                <input
                  type="text"
                  value={settings.direttore}
                  onChange={e=>setSettings(s=>({...s,direttore:e.target.value}))}
                  placeholder="Es: Alessio Mollo"
                  className="admin-input w-full"
                />
                <p className="text-muted text-xs mt-2" style={{fontFamily:'Cinzel,serif',letterSpacing:'0.05em'}}>
                  Appare nella sezione &quot;Chi Siamo&quot; e nella card del direttore.
                </p>
              </div>

              {/* Contatti Bandina */}
              <div className="bg-surface border border-border rounded-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="admin-label mb-1">Contatti Bandina (WhatsApp)</p>
                    <p className="text-muted text-xs" style={{fontFamily:'Cinzel,serif',letterSpacing:'0.05em'}}>
                      Appaiono nella sezione &quot;Contattaci&quot; come pulsanti WhatsApp.
                    </p>
                  </div>
                  <button onClick={addContact} className="btn-outline text-xs py-1 px-3">+ Aggiungi</button>
                </div>

                {settings.bandina_contacts.length===0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-sm">
                    <p className="text-3xl mb-3">📱</p>
                    <p className="text-muted text-sm" style={{fontFamily:'EB Garamond,serif',fontStyle:'italic'}}>
                      Nessun contatto. Aggiungine uno per mostrare i pulsanti WhatsApp nel sito.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {settings.bandina_contacts.map(c=>(
                      <div key={c.id} className="border border-border rounded-sm p-4 relative">
                        <button
                          onClick={()=>removeContact(c.id)}
                          className="absolute top-3 right-3 text-muted hover:text-red-light transition-colors"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="admin-label">Nome</label>
                            <input type="text" value={c.name} onChange={e=>updateContact(c.id,'name',e.target.value)}
                              placeholder="Es: Mario Rossi" className="admin-input w-full" />
                          </div>
                          <div>
                            <label className="admin-label">Ruolo</label>
                            <input type="text" value={c.role} onChange={e=>updateContact(c.id,'role',e.target.value)}
                              placeholder="Es: Responsabile Bandina" className="admin-input w-full" />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="admin-label">Numero di telefono</label>
                          <input type="tel" value={c.phone} onChange={e=>updateContact(c.id,'phone',e.target.value)}
                            placeholder="Es: +393331234567" className="admin-input w-full" />
                          <p className="text-muted text-xs mt-1" style={{fontFamily:'Cinzel,serif',letterSpacing:'0.05em'}}>
                            Inserisci con prefisso internazionale (+39 per l&apos;Italia)
                          </p>
                        </div>
                        <div className="mb-3">
                          <label className="admin-label">Messaggio pre-impostato WhatsApp</label>
                          <textarea value={c.message} onChange={e=>updateContact(c.id,'message',e.target.value)}
                            rows={3} placeholder="Es: Ciao! Vorrei informazioni sulla Bandina Poirinese."
                            className="admin-input w-full resize-none" />
                        </div>
                        {c.phone && (
                          <a href={whatsappUrl(c.phone, c.message)} target="_blank" rel="noopener noreferrer"
                            className="text-xs" style={{color:'#25D166',fontFamily:'Cinzel,serif',letterSpacing:'0.1em'}}>
                            ✓ Prova il link WhatsApp →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save button */}
              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={saveSettings}
                  disabled={settingsLoading}
                  className="btn-red"
                  style={{opacity:settingsLoading?0.7:1}}
                >
                  {settingsLoading ? 'Salvataggio...' : 'Salva impostazioni'}
                </button>
                {settingsSaved && (
                  <span className="text-sm" style={{color:'#25D166',fontFamily:'Cinzel,serif',letterSpacing:'0.1em'}}>
                    ✓ Salvato!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ════ FORM MODAL ════ */}
      {showForm && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:50,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',boxSizing:'border-box',overflowY:'auto'}}>
          <div style={{width:'100%',maxWidth:'620px',maxHeight:'88vh',overflowY:'auto',background:'#111111',border:'1px solid #222222',borderRadius:'2px',flexShrink:0}}>
            <div style={{position:'sticky',top:0,background:'#111111',borderBottom:'1px solid #222',padding:'1rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:10}}>
              <h3 style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',color:'#F0EBE0'}}>
                {editId?'Modifica Sezione':'Nuova Sezione'}
              </h3>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#7A6A58',cursor:'pointer',padding:'4px'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="admin-label">Titolo *</label>
                <input type="text" value={form.title} onChange={e=>updateField('title',e.target.value)}
                  placeholder="Es: FOTO MAGGIO POIRINESE 2026" required className="admin-input w-full" />
              </div>
              <div>
                <label className="admin-label">Slug (URL) *</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 border border-border border-r-0 text-muted text-xs" style={{background:'#0d0d0d',fontFamily:'Cinzel,serif'}}>/media/</span>
                  <input type="text" value={form.slug}
                    onChange={e=>{setAutoSlug(false); updateField('slug',e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-'));}}
                    placeholder="foto-maggio-poirinese-2026" required pattern="[a-z0-9-]+" className="admin-input flex-1" style={{borderLeft:0}} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Tipo</label>
                  <select value={form.type} onChange={e=>updateField('type',e.target.value)} className="admin-input w-full">
                    <option value="misto">📸🎬 Foto & Video</option>
                    <option value="foto">📸 Solo Foto</option>
                    <option value="video">🎬 Solo Video</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Data evento</label>
                  <input type="date" value={form.event_date} onChange={e=>updateField('event_date',e.target.value)} className="admin-input w-full" />
                </div>
              </div>
              <div>
                <label className="admin-label">Descrizione</label>
                <textarea value={form.description} onChange={e=>updateField('description',e.target.value)}
                  rows={2} placeholder="Breve descrizione..." className="admin-input w-full resize-none" />
              </div>
              <div>
                <label className="admin-label">Immagine anteprima</label>
                <ImageCropUpload value={form.thumbnail_url} onChange={v => updateField('thumbnail_url', v)} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="admin-label" style={{margin:0}}>Link Media</label>
                  <button type="button" onClick={addLink} className="btn-outline text-xs py-1 px-3">+ Aggiungi link</button>
                </div>
                <div className="space-y-3">
                  {form.links.map((link,i)=>(
                    <div key={i} className="flex gap-2 items-start">
                      <select value={link.type} onChange={e=>updateLink(i,'type',e.target.value)} style={{background:'#0d0d0d',border:'1px solid #222',color:'#F0EBE0',padding:'0.6rem 0.4rem',fontFamily:'EB Garamond,serif',fontSize:'0.95rem',outline:'none',width:'100px',flexShrink:0}}>
                        <option value="foto">📸 Foto</option>
                        <option value="video">🎬 Video</option>
                        <option value="altro">🔗 Altro</option>
                      </select>
                      <input type="text" value={link.label} onChange={e=>updateLink(i,'label',e.target.value)}
                        placeholder="Etichetta" className="admin-input flex-1" />
                      <input type="url" value={link.url} onChange={e=>updateLink(i,'url',e.target.value)}
                        placeholder="https://..." className="admin-input flex-1" />
                      <button type="button" onClick={()=>removeLink(i)} className="p-2 text-muted hover:text-red-light transition-colors flex-shrink-0 mt-0.5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                  {form.links.length===0 && (
                    <p className="text-muted text-sm italic text-center py-4 border border-dashed border-border rounded-sm" style={{fontFamily:'EB Garamond,serif'}}>
                      Aggiungi link a YouTube, Google Foto, ecc.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_published" checked={form.is_published}
                  onChange={e=>updateField('is_published',e.target.checked)} className="w-4 h-4 accent-red" />
                <label htmlFor="is_published" className="text-cream text-sm" style={{fontFamily:'Cinzel,serif',letterSpacing:'0.1em'}}>
                  Pubblicata (visibile nel sito)
                </label>
              </div>
              {formError && <p className="text-red-light text-sm" style={{fontFamily:'EB Garamond,serif'}}>{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={formLoading} className="btn-red flex-1 justify-center" style={{display:'flex',opacity:formLoading?0.7:1}}>
                  {formLoading?'Salvataggio...':(editId?'Salva modifiche':'Crea sezione')}
                </button>
                <button type="button" onClick={()=>setShowForm(false)} className="btn-outline">Annulla</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ QR MODAL ════ */}
      {qrSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.9)'}}>
          <div className="bg-surface border border-border rounded-sm w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',color:'#F0EBE0'}}>QR Code</h3>
              <button onClick={()=>setQrSection(null)} className="text-muted hover:text-cream p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <p className="text-muted text-sm mb-6" style={{fontFamily:'EB Garamond,serif',fontStyle:'italic'}}>{qrSection.title}</p>
            <div className="flex justify-center mb-6 p-4 bg-bg rounded-sm border border-border">
              {qrImg
                ? <img src={qrImg} alt="QR Code" className="w-48 h-48 rounded" />
                : <div className="w-48 h-48 bg-surface animate-pulse rounded flex items-center justify-center"><span className="text-muted text-xs" style={{fontFamily:'Cinzel,serif'}}>Generazione...</span></div>
              }
            </div>
            <div className="bg-bg border border-border rounded-sm p-3 mb-6 flex items-center gap-2">
              <code className="text-gold text-xs flex-1 truncate" style={{fontFamily:'monospace'}}>{siteUrl}/media/{qrSection.slug}</code>
              <button onClick={copyUrl} className="text-muted hover:text-cream transition-colors text-xs flex-shrink-0" style={{fontFamily:'Cinzel,serif',letterSpacing:'0.1em'}}>
                {copied?'✓ Copiato!':'Copia'}
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={downloadQR} disabled={!qrImg} className="btn-red flex-1 justify-center" style={{display:'flex',opacity:qrImg?1:0.5}}>↓ Scarica PNG</button>
              <a href={`/media/${qrSection.slug}`} target="_blank" rel="noopener noreferrer" className="btn-outline">Apri ↗</a>
            </div>
            <p className="text-muted text-xs text-center mt-4" style={{fontFamily:'EB Garamond,serif',fontStyle:'italic'}}>
              Stampa e posiziona vicino all&apos;evento per condividere foto e video.
            </p>
          </div>
        </div>
      )}

      {/* ════ DELETE CONFIRM ════ */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.9)'}}>
          <div className="bg-surface border border-red/30 rounded-sm w-full max-w-sm p-8 text-center">
            <p className="text-4xl mb-4">⚠️</p>
            <h3 style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',color:'#F0EBE0'}} className="mb-3">Eliminare questa sezione?</h3>
            <p className="text-muted text-sm mb-8" style={{fontFamily:'EB Garamond,serif'}}>Azione irreversibile. Il QR code non funzionerà più.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 btn-red justify-center" style={{display:'flex',background:'#8B1A1A',borderColor:'#8B1A1A'}}>Elimina</button>
              <button onClick={()=>setDeleteId(null)} className="flex-1 btn-outline">Annulla</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .admin-label { display:block; font-family:Cinzel,serif; font-size:0.6rem; letter-spacing:0.25em; color:#C9A84C; margin-bottom:0.5rem; text-transform:uppercase; }
        .admin-input { width:100%; background:#0d0d0d; border:1px solid #222222; color:#F0EBE0; padding:0.6rem 0.75rem; font-family:'EB Garamond',serif; font-size:1rem; transition:border-color 0.2s; outline:none; }
        .admin-input:focus { border-color:#B22222; }
        .admin-input::placeholder { color:#4A4A4A; }
      `}</style>
    </div>
  );
}
