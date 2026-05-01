-- ============================================================
-- Filarmonica Poirinese — Supabase Schema
-- Esegui questo nel SQL Editor del tuo progetto Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS media_sections (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT        NOT NULL,
  slug          TEXT        UNIQUE NOT NULL,
  description   TEXT,
  type          TEXT        CHECK(type IN ('foto','video','misto')) DEFAULT 'misto',
  links         JSONB       DEFAULT '[]',
  thumbnail_url TEXT,
  event_date    DATE,
  is_published  BOOLEAN     DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON media_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security: lettura pubblica, scrittura solo via service role
ALTER TABLE media_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON media_sections
  FOR SELECT USING (is_published = true);

-- Le scritture usano il service role key (bypass RLS)
