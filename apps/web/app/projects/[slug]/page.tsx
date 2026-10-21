import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { Detail } from '@/components/detail';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const { projects } = await getContent(); const p = projects.find((p) => p.slug === slug); return { title: p?.name || '案例未找到', description: p?.description }; }
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const { projects, website } = await getContent(); const item = projects.find((p) => p.slug === slug); if (!item) notFound(); return <Detail item={item} website={website} kind="project"/>; }
