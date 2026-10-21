import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { Detail } from '@/components/detail';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const { products } = await getContent(); const p = products.find((p) => p.slug === slug); return { title: p?.name || '产品未找到', description: p?.description }; }
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const { products, website } = await getContent(); const item = products.find((p) => p.slug === slug); if (!item) notFound(); return <Detail item={item} website={website} kind="product"/>; }
