# 🎼 Filarmonica Poirinese — Sito Ufficiale

Sito vetrina con galleria media e pannello admin per la Filarmonica Poirinese di Poirino (TO).

## ✨ Funzionalità

- **Homepage** elegante con storia, attività e contatti
- **Galleria** con sezioni foto/video collegate a QR code
- **Pagine evento** (`/media/[slug]`) — destinazione dei QR code stampati
- **Pannello Admin** a `/admin` (nessun link pubblico) per gestire tutto
- **QR Code** generati automaticamente, scaricabili in PNG

---

## 🚀 Setup — Passo dopo passo

### 1. Crea il progetto Supabase (gratis)

1. Vai su [supabase.com](https://supabase.com) → crea un account
2. Crea un **Nuovo progetto** (scegli la regione EU)
3. Vai su **SQL Editor** e incolla il contenuto di `supabase-schema.sql`
4. Clicca **Run** — la tabella è pronta

### 2. Copia le credenziali Supabase

1. Vai su **Settings → API** nel tuo progetto Supabase
2. Copia:
   - **Project URL** (es: `https://xxxxx.supabase.co`)
   - **anon / public key** (chiave lunga che inizia con `eyJ`)
   - **service_role key** (chiave SEGRETA — non esporla mai nel frontend)

### 3. Configura le variabili d'ambiente

Copia `.env.local.example` in `.env.local` e compila:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

ADMIN_PASSWORD=la-tua-password-segreta
ADMIN_SECRET=stringa-casuale-qualsiasi-es-poirino2024

NEXT_PUBLIC_SITE_URL=https://filarmonicapoirinese.it
```

### 4. Installa e avvia in locale

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy su Vercel

1. Carica il progetto su **GitHub** (crea un repository)
2. Vai su [vercel.com](https://vercel.com) → Import project → seleziona il repo GitHub
3. In **Environment Variables** su Vercel, aggiungi le stesse variabili di `.env.local`
4. Clicca **Deploy** 🎉
5. Configura il dominio `filarmonicapoirinese.it` nelle impostazioni Vercel

> **Nota sul dominio**: le variabili cambieranno da `.env.local` a quelle impostate nel pannello Vercel. Nessun file `.env` va mai caricato su GitHub.

---

## 🔐 Accesso Admin

L'admin è accessibile **solo** all'URL:
```
https://filarmonicapoirinese.it/admin
```

Non c'è nessun link pubblico nel sito. La password è quella impostata in `ADMIN_PASSWORD`.

### Cosa puoi fare dall'admin:
- **Creare sezioni media** (es: "FOTO MAGGIO POIRINESE 2026")
- **Aggiungere link** a Google Foto, YouTube, ecc.
- **Generare il QR code** per quella sezione
- **Scaricare il QR** in PNG per stampa
- **Nascondere/pubblicare** sezioni
- **Eliminare** sezioni

---

## 📱 Come usare i QR code

1. Vai su `/admin` → crea una nuova sezione (es: "VIDEO 25 APRILE 2026", slug: `video-25-aprile-2026`)
2. Aggiungi il link YouTube della serata
3. Clicca l'icona QR → scarica il PNG
4. Stampa il QR e posizionalo al banchetto, locandina, ecc.
5. Chi scansiona va su `filarmonicapoirinese.it/media/video-25-aprile-2026`

---

## 📸 Dove caricare foto e video

| Tipo | Servizio consigliato | Costo |
|------|---------------------|-------|
| Video | **YouTube** (canale della Filarmonica) | Gratis |
| Foto (album) | **Google Foto** (album condivisi) | Gratis 15GB |
| Foto (alternativa) | **Facebook Album** | Gratis |
| Foto alta qualità | **Flickr** | Gratis 1000 foto |

Nell'admin aggiungi semplicemente il link all'album/playlist.

---

## 🛠 Struttura progetto

```
app/
  page.tsx           ← Homepage
  galleria/page.tsx  ← Galleria eventi
  media/[slug]/      ← Pagine QR code
  admin/page.tsx     ← Pannello admin
  api/auth/          ← Login/check sessione
  api/media/         ← CRUD sezioni
components/
  Navbar.tsx
  Footer.tsx
lib/
  supabase.ts        ← Client Supabase
  auth.ts            ← Verifica token admin
  types.ts           ← TypeScript types
public/
  logo-filarmonica.png
  logo-bandina.png
```

---

## ✏️ Personalizzazioni consigliate

- **Footer**: aggiungi P.IVA/C.F., telefono, indirizzo sede
- **Homepage**: aggiorna il testo "Vieni a far parte" con i contatti reali
- **Social**: se avete un canale YouTube, aggiungetelo nel footer

---

Fatto con ❤️ per la Filarmonica Poirinese · Est. 1810
