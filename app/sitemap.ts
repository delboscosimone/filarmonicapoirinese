import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.filarmonicapoirinese.it';

  const { data: sections } = await supabase
    .from('media_sections')
    .select('slug, updated_at')
    .eq('is_published', true);

  const mediaPages: MetadataRoute.Sitemap = (sections ?? []).map(s => ({
    url: `${baseUrl}/media/${s.slug}`,
    lastModified: new Date(s.updated_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/galleria`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...mediaPages,
  ];
}
