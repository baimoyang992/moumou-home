import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/content';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, projects } = await getContent();
  const base = process.env.SITE_URL || 'http://localhost:3000';
  return [{ url: base, changeFrequency: 'weekly', priority: 1 }, ...products.map((p) => ({ url: `${base}/products/${p.slug}`, priority: .8 })), ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, priority: .7 }))];
}
