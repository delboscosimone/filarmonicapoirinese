export interface MediaLink {
  label: string;
  url: string;
  type: 'foto' | 'video' | 'altro';
  preview_url?: string;
  preview_ratio?: string;
  icon?: string;
}

export interface MediaSection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  type: 'foto' | 'video' | 'misto';
  links: MediaLink[];
  thumbnail_url?: string;
  thumbnail_ratio?: string;
  event_date?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BandinaContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  message: string;
}

export interface SiteSettings {
  direttore: string;
  bandina_contacts: BandinaContact[];
}

export const defaultSettings: SiteSettings = {
  direttore: 'Alessio Mollo',
  bandina_contacts: [],
};
