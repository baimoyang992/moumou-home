import { getContent, imageUrl } from '@/lib/content';
import { Home } from '@/components/home';
export async function generateMetadata() {
  const { website } = await getContent();
  return { title: { absolute: website.seoTitle }, description: website.seoDescription, alternates: { canonical: '/' } };
}
export default async function Page() {
  const content = await getContent();
  return <Home content={{
    ...content,
    heroSlides: content.heroSlides.map((s) => ({ ...s, imageUrl: imageUrl(s) })),
    products: content.products.map((p) => ({ ...p, imageUrl: imageUrl(p) })),
    projects: content.projects.map((p) => ({ ...p, imageUrl: imageUrl(p) })),
    website: { ...content.website, craftImageUrl: imageUrl({ image: content.website.craftImage, imageUrl: content.website.craftImageUrl }), aboutImageUrl: imageUrl({ image: content.website.aboutImage, imageUrl: content.website.aboutImageUrl }) },
  }} />;
}
