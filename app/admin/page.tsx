'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import type { MediaSection, MediaLink } from '@/lib/types';

// ─── Types ───────────────────────────────────────────────
type LinkType = 'foto' | 'video' | 'altro';
type SectionType = 'foto' | 'video' | 'misto';

interface FormData {
  title: string;
  slug: string;
  description: string;
  type: SectionType;
  event_date: string;
  thumbnail_url: string;
  is_published: boolean;
  links: MediaLink[];
}

const emptyForm: FormData = {
  title: '',
  slug: '',
  description: '',
  type: 'misto',
  event_date: '',
  thumbnail_url: '',
  is_published: true,
  links: [],
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── QR Code (canvas-based, no library) ──────────────────
function QRDisplay({ url }: { url: string }) {
  const [imgSrc, setImgSrc] = useState('');
  useEffect(() => {
    import('qrcode.react').then(() => {
      // Use QRCode Server side via canvas
      const QRCode = require('qrcode');
      QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: { dark: '#C9A84C', light: '#111111' },
      }).then((dataUrl: string) => setImgSrc(dataUrl));
    }).catch(() => setImgSrc(''));
  }, [url]);

  if (!imgSrc) return <div className="w-64 h-64 bg-surface animate-pulse rounded" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imgSrc} alt="QR Code" className="w-64 h-64 rounded" />
  );
}

// ─── Inline QRCode using qrcode.react ────────────────────
let QRCodeCanvas: React.ComponentType<{value:string;size:number;bgColor:string;fgColor:string;includeMargin:boolean}> | null = null;

// ─── Main Admin Component ─────────────────────────────────
export default function AdminPage() {
  const [authState, setAuthState] = useState<'loading' | 'unauth' | 'auth'>('loading');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [sections, setSections] = useState<MediaSection[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  const [qrSection, setQrSection] = useState<MediaSection | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [qrImg, setQrImg] = useState('');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://filarmonicapoirinese.it';

  // Check auth
  useEffect(() => {
    fetch('/api/auth/check')
      .then((r) => r.json())
      .then((d) => setAuthState(d.authenticated ? 'auth' : 'unauth'))
      .catch(() => setAuthState('unauth'));
  }, []);

  // Load sections when authenticated
  const loadSections = useCallback(async () => {
    setLoadingSections(true);
    try {
      const r = await fetch('/api/media');
      const data = await r.json();
      setSections(Array.isArray(data) ? data : []);
    } catch { /* empty */ }
    setLoadingSections(false);
  }, []);

  useEffect(() => {
    if (authState === 'auth') loadSections();
  }, [authState, loadSections]);

  // Generate QR when qrSection changes
  useEffect(() => {
    if (!qrSection) { setQrImg(''); return; }
    const url = `${siteUrl}/media/${qrSection.slug}`;
    // Dynamic import of qrcode library
    import('qrcode').then((QRCode) => {
      QRCode.default.toDataURL(url, {
        width: 512,
        margin: 2,
        color: { dark: '#C9A84C', light: '#111111' },
      }).then((d: string) => setQrImg(d)).catch(() => setQrImg(''));
    }).catch(() => setQrImg(''));
  }, [qrSection, siteUrl]);

  // ── Login ──
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const d = await r.json();
      if (r.ok) {
        setAuthState('auth');
      } else {
        setLoginError(d.error ?? 'Errore');
      }
    } catch {
      setLoginError('Errore di rete');
    }
    setLoginLoading(false);
  }

  // ── Logout ──
  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    setAuthState('unauth');
    setSections([]);
  }

  // ── Form helpers ──
  function openCreate() {
    setForm(emptyForm);
    setEditId(null);
    setFormError('');
    setAutoSlug(true);
    setShowForm(true);
  }

  function openEdit(s: MediaSection) {
    setForm({
      title: s.title,
      slug: s.slug,
      description: s.description ?? '',
      type: s.type as SectionType,
      event_date: s.event_date ?? '',
      thumbnail_url: s.thumbnail_url ?? '',
      is_published: s.is_published,
      links: Array.isArray(s.links) ? [...s.links] : [],
    });
    setEditId(s.id);
    setFormError('');
    setAutoSlug(false);
    setShowForm(true);
  }

  function updateField(k: keyof FormData, v: unknown) {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === 'title' && autoSlug) {
      setForm((f) => ({ ...f, title: v as string, slug: slugify(v as string) }));
    }
  }

  // ── Links in form ──
  function addLink() {
    setForm((f) => ({
      ...f,
      links: [...f.links, { label: '', url: '', type: 'altro' as LinkType }],
    }));
  }

  function updateLink(i: number, field: keyof MediaLink, val: string) {
    setForm((f) => {
      const links = [...f.links];
      links[i] = { ...links[i], [field]: val };
      return { ...f, links };
    });
  }

  function removeLink(i: number) {
    setForm((f) => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }));
  }

  // ── Submit form ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const url = editId ? `/api/media/${editId}` : '/api/media';
      const method = editId ? 'PUT' : 'POST';
      const body: Record<string, unknown> = { ...form };
      if (!body.event_date) body.event_date = null;
      if (!body.thumbnail_url) body.thumbnail_url = null;
      if (!body.description) body.description = null;

      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (r.ok) {
        setShowForm(false);
        loadSections();
      } else {
        setFormError(d.error ?? 'Errore');
      }
    } catch {
      setFormError('Errore di rete');
    }
    setFormLoading(false);
  }

  // ── Delete ──
  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/media/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null);
    loadSections();
  }

  // ── QR download ──
  function downloadQR() {
    if (!qrImg || !qrSection) return;
    const a = document.createElement('a');
    a.href = qrImg;
    a.download = `qr-${qrSection.slug}.png`;
    a.click();
  }

  function copyUrl() {
    if (!qrSection) return;
    navigator.clipboard.writeText(`${siteUrl}/media/${qrSection.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Loading state ──
  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-muted animate-pulse" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.2em', fontSize: '0.75rem' }}>
          CARICAMENTO...
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // LOGIN FORM
  // ════════════════════════════════════════════════
  if (authState === 'unauth') {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, #1a0505 0%, #080808 70%)' }}
      >
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <Image src="/logo-filarmonica.png" alt="Logo" width={72} height={72} className="mb-4 opacity-80" />
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.3em', color: '#C9A84C' }}>
              ADMIN — FILARMONICA POIRINESE
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="pwd"
                style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.25em', color: '#C9A84C' }}
                className="block mb-2 uppercase"
              >
                Password
              </label>
              <input
                id="pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-border text-cream px-4 py-3 focus:outline-none focus:border-red"
                style={{ fontFamily: 'EB Garamond, serif', fontSize: '1.1rem' }}
                autoFocus
              />
            </div>
            {loginError && (
              <p className="text-red-light text-sm" style={{ fontFamily: 'EB Garamond, serif' }}>{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="btn-red w-full justify-center"
              style={{ display: 'flex', opacity: loginLoading ? 0.7 : 1 }}
            >
              {loginLoading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // ADMIN DASHBOARD
  // ════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo-filarmonica.png" alt="Logo" width={28} height={28} />
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#C9A84C' }}>
              PANNELLO ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              className="text-muted hover:text-cream text-xs transition-colors"
              style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}
            >
              Vedi sito ↗
            </a>
            <button
              onClick={handleLogout}
              className="text-muted hover:text-red-light text-xs transition-colors"
              style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}
            >
              Esci
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Sezioni totali', value: sections.length },
            { label: 'Pubblicate', value: sections.filter((s) => s.is_published).length },
            { label: 'Nascoste', value: sections.filter((s) => !s.is_published).length },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface border border-border rounded-sm p-5 text-center">
              <div
                style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', color: '#C9A84C' }}
              >
                {stat.value}
              </div>
              <div className="text-muted text-xs mt-1" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: '#F0EBE0' }}>
            Sezioni Media
          </h2>
          <button onClick={openCreate} className="btn-red">
            + Nuova sezione
          </button>
        </div>

        {/* Sections list */}
        {loadingSections ? (
          <div className="text-center py-16 text-muted" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.2em', fontSize: '0.65rem' }}>
            CARICAMENTO...
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-sm">
            <p className="text-5xl mb-4">🎵</p>
            <p className="text-muted mb-6" style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic' }}>
              Nessuna sezione ancora. Crea la prima sezione per generare un QR code.
            </p>
            <button onClick={openCreate} className="btn-red">
              Crea la prima sezione
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((s) => (
              <div
                key={s.id}
                className="bg-surface border border-border rounded-sm p-4 flex items-center gap-4"
                style={{ borderLeft: `3px solid ${s.is_published ? '#B22222' : '#333'}` }}
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span
                      style={{ fontFamily: 'Playfair Display, serif', color: '#F0EBE0', fontSize: '1.1rem' }}
                    >
                      {s.title}
                    </span>
                    {!s.is_published && (
                      <span
                        className="px-2 py-0.5 text-xs rounded-sm"
                        style={{ background: '#222', color: '#7A6A58', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}
                      >
                        Nascosta
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
                    <span style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
                      /{s.slug}
                    </span>
                    <span>·</span>
                    <span style={{ color: '#C9A84C' }}>
                      {s.type === 'foto' ? '📸 Foto' : s.type === 'video' ? '🎬 Video' : '📸🎬 Misto'}
                    </span>
                    {s.event_date && (
                      <>
                        <span>·</span>
                        <span>{formatDate(s.event_date)}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>{(s.links ?? []).length} link(s)</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setQrSection(s)}
                    title="QR Code"
                    className="p-2 text-gold hover:text-gold-light transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="3" height="3"/>
                      <rect x="19" y="14" width="2" height="2"/><rect x="14" y="19" width="2" height="2"/>
                      <rect x="19" y="19" width="2" height="2"/>
                    </svg>
                  </button>
                  <a
                    href={`/media/${s.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Vedi pagina"
                    className="p-2 text-muted hover:text-cream transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M7 17L17 7M17 7H7M17 7v10"/>
                    </svg>
                  </a>
                  <button
                    onClick={() => openEdit(s)}
                    title="Modifica"
                    className="p-2 text-muted hover:text-cream transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteId(s.id)}
                    title="Elimina"
                    className="p-2 text-muted hover:text-red-light transition-colors"
                  >
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
      </div>

      {/* ════════ FORM MODAL ════════ */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface border border-border rounded-sm"
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#F0EBE0' }}>
                {editId ? 'Modifica Sezione' : 'Nuova Sezione'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-muted hover:text-cream p-1"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="admin-label">Titolo *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Es: FOTO MAGGIO POIRINESE 2026"
                  required
                  className="admin-input"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="admin-label">Slug (URL) *</label>
                <div className="flex gap-2">
                  <span
                    className="flex items-center px-3 border border-border border-r-0 text-muted text-xs"
                    style={{ background: '#0d0d0d', fontFamily: 'Cinzel, serif' }}
                  >
                    /media/
                  </span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                    }}
                    placeholder="foto-maggio-poirinese-2026"
                    required
                    pattern="[a-z0-9-]+"
                    className="admin-input flex-1"
                    style={{ borderLeft: 0 }}
                  />
                </div>
                <p className="text-xs text-muted mt-1" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>
                  Usato nel link del QR code. Solo lettere minuscole, numeri e trattini.
                </p>
              </div>

              {/* Type + Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) => updateField('type', e.target.value)}
                    className="admin-input"
                  >
                    <option value="misto">📸🎬 Foto & Video</option>
                    <option value="foto">📸 Solo Foto</option>
                    <option value="video">🎬 Solo Video</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Data evento</label>
                  <input
                    type="date"
                    value={form.event_date}
                    onChange={(e) => updateField('event_date', e.target.value)}
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="admin-label">Descrizione</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={2}
                  placeholder="Breve descrizione dell'evento..."
                  className="admin-input resize-none"
                />
              </div>

              {/* Thumbnail */}
              <div>
                <label className="admin-label">URL Anteprima (immagine copertina)</label>
                <input
                  type="url"
                  value={form.thumbnail_url}
                  onChange={(e) => updateField('thumbnail_url', e.target.value)}
                  placeholder="https://..."
                  className="admin-input"
                />
              </div>

              {/* Links */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="admin-label" style={{ margin: 0 }}>Link Media</label>
                  <button type="button" onClick={addLink} className="btn-outline text-xs py-1 px-3">
                    + Aggiungi link
                  </button>
                </div>
                <div className="space-y-3">
                  {form.links.map((link, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <select
                        value={link.type}
                        onChange={(e) => updateLink(i, 'type', e.target.value)}
                        className="admin-input w-24 flex-shrink-0"
                      >
                        <option value="foto">📸 Foto</option>
                        <option value="video">🎬 Video</option>
                        <option value="altro">🔗 Altro</option>
                      </select>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateLink(i, 'label', e.target.value)}
                        placeholder="Etichetta (es: Guarda le foto)"
                        className="admin-input flex-1"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(i, 'url', e.target.value)}
                        placeholder="https://..."
                        className="admin-input flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(i)}
                        className="p-2 text-muted hover:text-red-light transition-colors flex-shrink-0 mt-0.5"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                  {form.links.length === 0 && (
                    <p className="text-muted text-sm italic text-center py-4 border border-dashed border-border rounded-sm" style={{ fontFamily: 'EB Garamond, serif' }}>
                      Nessun link. Aggiungi almeno un link per YouTube, Google Foto, ecc.
                    </p>
                  )}
                </div>
              </div>

              {/* Published */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={form.is_published}
                  onChange={(e) => updateField('is_published', e.target.checked)}
                  className="w-4 h-4 accent-red"
                />
                <label
                  htmlFor="is_published"
                  className="text-cream text-sm"
                  style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}
                >
                  Pubblicata (visibile nel sito)
                </label>
              </div>

              {formError && (
                <p className="text-red-light text-sm" style={{ fontFamily: 'EB Garamond, serif' }}>{formError}</p>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn-red flex-1 justify-center"
                  style={{ display: 'flex', opacity: formLoading ? 0.7 : 1 }}
                >
                  {formLoading ? 'Salvataggio...' : editId ? 'Salva modifiche' : 'Crea sezione'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-outline"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ QR MODAL ════════ */}
      {qrSection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.9)' }}
        >
          <div className="bg-surface border border-border rounded-sm w-full max-w-md p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#F0EBE0' }}>
                QR Code
              </h3>
              <button onClick={() => setQrSection(null)} className="text-muted hover:text-cream p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Section info */}
            <p className="text-muted text-sm mb-6" style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic' }}>
              {qrSection.title}
            </p>

            {/* QR */}
            <div className="flex justify-center mb-6 p-4 bg-bg rounded-sm border border-border">
              {qrImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrImg} alt="QR Code" className="w-48 h-48 rounded" />
              ) : (
                <div className="w-48 h-48 bg-surface animate-pulse rounded flex items-center justify-center">
                  <span className="text-muted text-xs" style={{ fontFamily: 'Cinzel, serif' }}>Generazione...</span>
                </div>
              )}
            </div>

            {/* URL */}
            <div className="bg-bg border border-border rounded-sm p-3 mb-6 flex items-center gap-2">
              <code
                className="text-gold text-xs flex-1 truncate"
                style={{ fontFamily: 'monospace' }}
              >
                {siteUrl}/media/{qrSection.slug}
              </code>
              <button
                onClick={copyUrl}
                className="text-muted hover:text-cream transition-colors text-xs flex-shrink-0"
                style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}
              >
                {copied ? '✓ Copiato!' : 'Copia'}
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={downloadQR}
                disabled={!qrImg}
                className="btn-red flex-1 justify-center"
                style={{ display: 'flex', opacity: qrImg ? 1 : 0.5 }}
              >
                ↓ Scarica PNG
              </button>
              <a
                href={`/media/${qrSection.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                Apri ↗
              </a>
            </div>

            <p className="text-muted text-xs text-center mt-4" style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic' }}>
              Stampa questo QR code e posizionalo vicino all&apos;evento per condividere foto e video.
            </p>
          </div>
        </div>
      )}

      {/* ════════ DELETE CONFIRM ════════ */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.9)' }}
        >
          <div className="bg-surface border border-red/30 rounded-sm w-full max-w-sm p-8 text-center">
            <p className="text-4xl mb-4">⚠️</p>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: '#F0EBE0' }} className="mb-3">
              Eliminare questa sezione?
            </h3>
            <p className="text-muted text-sm mb-8" style={{ fontFamily: 'EB Garamond, serif' }}>
              Questa azione è irreversibile. Il QR code non funzionerà più.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 btn-red justify-center"
                style={{ display: 'flex', background: '#8B1A1A', borderColor: '#8B1A1A' }}
              >
                Elimina
              </button>
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-outline">
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline styles for form inputs */}
      <style jsx global>{`
        .admin-label {
          display: block;
          font-family: Cinzel, serif;
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          color: #C9A84C;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }
        .admin-input {
          width: 100%;
          background: #0d0d0d;
          border: 1px solid #222222;
          color: #F0EBE0;
          padding: 0.6rem 0.75rem;
          font-family: 'EB Garamond', serif;
          font-size: 1rem;
          transition: border-color 0.2s;
          outline: none;
        }
        .admin-input:focus {
          border-color: #B22222;
        }
        .admin-input::placeholder {
          color: #4A4A4A;
        }
      `}</style>
    </div>
  );
}
