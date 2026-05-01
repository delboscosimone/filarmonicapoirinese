export interface MediaLink {
  label: string;
  url: string;
  type: 'foto' | 'video' | 'altro';
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
  event_date?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
