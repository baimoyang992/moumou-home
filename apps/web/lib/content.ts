import 'server-only';
import { cache } from 'react';
import { connection } from 'next/server';
import seed from '../../../content/seed.json';

export interface Media { url: string; alternativeText?: string; }
export interface Product { documentId?: string; name: string; slug: string; category: string; description: string; imageUrl: string; image?: Media; material: string; dimensions: string; order: number; }
export interface Project { documentId?: string; name: string; slug: string; category: string; location: string; year: string; description: string; imageUrl: string; image?: Media; order: number; }
export interface Slide { title: string; subtitle: string; imageUrl: string; image?: Media; order: number; }
export type Website = typeof seed.website & { craftImage?: Media; aboutImage?: Media };
export interface SiteContent { website: Website; products: Product[]; projects: Project[]; heroSlides: Slide[]; }

const cmsUrl = process.env.STRAPI_URL || 'http://127.0.0.1:1337';
export const imageUrl = (item: { image?: Media; imageUrl: string }) => {
  if (!item.image?.url) return item.imageUrl;
  return item.image.url.startsWith('/') ? `${process.env.NEXT_PUBLIC_CMS_URL || 'http://127.0.0.1:1337'}${item.image.url}` : item.image.url;
};

async function read<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${cmsUrl}/api/${endpoint}`, { next: { revalidate: 30, tags: ['cms'] }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`CMS returned ${response.status} for ${endpoint}`);
  return (await response.json()).data;
}
export const getContent = cache(async (): Promise<SiteContent> => {
  // Render on request so builds never need a running CMS, while keeping the explicit fetch cache.
  await connection();
  try {
    const [website, products, projects, heroSlides] = await Promise.all([
      read<Website>('website?populate=*'), read<Product[]>('products?populate=*&sort=order:asc&pagination[pageSize]=100'),
      read<Project[]>('projects?populate=*&sort=order:asc&pagination[pageSize]=100'), read<Slide[]>('hero-slides?populate=*&sort=order:asc'),
    ]);
    // Empty collections are intentional; never replace an editor's deletion with demo content.
    return { website: website || { ...seed.website, brandName: '某某企业' }, products, projects, heroSlides };
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error;
    console.warn('Strapi 暂不可用，本地开发临时显示示例内容。', error instanceof Error ? error.message : error);
    return seed;
  }
});
export const categories: Record<string, string> = { living: '客厅家具', dining: '餐厅家具', bedroom: '卧室家具', office: '办公家具' };
