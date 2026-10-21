import Link from 'next/link';
import { ArrowLeft, ArrowDown, ArrowUpRight } from 'lucide-react';
import type { Product, Project, Website } from '@/lib/content';
import { imageUrl } from '@/lib/content';
import { Reveal } from './reveal';
import { Inquiry } from './inquiry';

export function Detail({ item, website, kind }: { item: Product | Project; website: Website; kind: 'product' | 'project' }) {
  return <main className="detail-page"><header className="detail-header"><Link href="/" className="detail-brand">m. <span>{website.brandName}</span></Link><Link href={kind === 'product' ? '/#products' : '/#projects'}><ArrowLeft size={17}/>返回{kind === 'product' ? '产品系列' : '空间案例'}</Link></header><section className="detail-hero"><img src={imageUrl(item)} alt={item.name} fetchPriority="high"/><div><span className="eyebrow">{kind === 'product' ? 'COLLECTION / FURNITURE' : 'SPACE / PROJECT'}</span><h1>{item.name}</h1><a href="#details">了解更多<ArrowDown size={18}/></a></div></section><section className="detail-body section" id="details"><Reveal><span className="eyebrow">DESIGNED AROUND YOU</span><h2>{item.name}</h2><p>{item.description}</p></Reveal><Reveal delay={150}><dl>{'material' in item ? <><div><dt>材料</dt><dd>{item.material}</dd></div><div><dt>规格</dt><dd>{item.dimensions}</dd></div></> : <><div><dt>项目类型</dt><dd>{item.category}</dd></div><div><dt>地点 / 年份</dt><dd>{item.location} / {item.year}</dd></div></>}</dl><Inquiry subject={item.name} label={kind === 'product' ? '咨询这件产品' : '咨询空间配套'}/></Reveal></section><div className="detail-end"><Link href="/">探索更多生活灵感<ArrowUpRight/></Link></div></main>;
}
