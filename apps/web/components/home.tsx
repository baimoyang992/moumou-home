'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Menu, X, Plus } from 'lucide-react';
import type { SiteContent } from '@/lib/content';
import { Reveal } from './reveal';
import { Inquiry } from './inquiry';

const nav = [ ['01', '品牌故事', 'story'], ['02', '产品系列', 'products'], ['03', '品质制造', 'craft'], ['04', '空间案例', 'projects'], ['05', '关于我们', 'about'] ];
const categories = [{ key: 'all', name: '全部系列' }, { key: 'living', name: '客厅' }, { key: 'dining', name: '餐厅' }, { key: 'bedroom', name: '卧室' }, { key: 'office', name: '办公' }];

export function Home({ content }: { content: SiteContent }) {
  const { website: w, heroSlides, products, projects } = content;
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [category, setCategory] = useState('all');
  const [chapter, setChapter] = useState('top');
  const progress = useRef<HTMLDivElement>(null);
  const menuDialog = useRef<HTMLDialogElement>(null);
  const hero = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      if (progress.current) progress.current.style.transform = `scaleX(${y / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`;
      if (hero.current && !reduced.matches) hero.current.style.setProperty('--hero-y', `${Math.min(y * .23, 300)}px`);
      frame = 0;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update(); window.addEventListener('scroll', onScroll, { passive: true });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setChapter(entry.target.id); });
    }, { rootMargin: '-25% 0px -55% 0px' });
    document.querySelectorAll<HTMLElement>('[data-chapter]').forEach((s) => observer.observe(s));
    return () => { window.removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);
  useEffect(() => {
    if (paused || heroSlides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 7000);
    return () => clearInterval(timer);
  }, [paused, heroSlides.length]);
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    if (menu) menuDialog.current?.showModal(); else menuDialog.current?.close();
    return () => { document.body.style.overflow = ''; };
  }, [menu]);
  const closeMenu = () => { setMenu(false); menuButton.current?.focus(); };
  const selected = category === 'all' ? products : products.filter((p) => p.category === category);

  return <>
    <div className="reading-progress" ref={progress}/>
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <a className="brand" href="#top" aria-label={`${w.brandName}首页`}><span className="brand-symbol">m<span>.</span></span><span className="brand-text">{w.brandName}<small>{w.brandEnglish}</small></span></a>
      <nav className="desktop-nav" aria-label="主导航">{nav.slice(1).map(([n, name, id]) => <a className={chapter === id ? 'active' : ''} key={n} href={`#${id}`}>{name}</a>)}<a href="#contact">联系合作</a></nav>
      <button ref={menuButton} className="menu-button" aria-expanded={menu} aria-label="打开导航菜单" onClick={() => setMenu(true)}><span>MENU</span><Menu size={22} strokeWidth={1.4}/></button>
    </header>
    <dialog className="navigation-dialog" aria-label="网站导航" ref={menuDialog} onCancel={closeMenu} onClose={() => setMenu(false)}>
      <div className="menu-top"><span>{w.brandEnglish}</span><button aria-label="关闭导航菜单" onClick={closeMenu}><X size={26}/></button></div>
      <nav>{[...nav, ['06', '联系合作', 'contact']].map(([n, name, id]) => <a key={n} href={`#${id}`} onClick={closeMenu}><small>{n}</small><span>{name}</span><ArrowUpRight/></a>)}</nav><p>家具 · 空间 · 生活</p>
    </dialog>
    <aside className={`chapter-rail ${scrolled ? 'dark-rail' : ''}`} aria-label="章节导航">{[['00', '首页', 'top'], ...nav].map(([n, name, id]) => <a key={n} href={`#${id}`} className={chapter === id ? 'active' : ''} aria-label={name}><span>{n}</span><i/></a>)}</aside>
    <main>
      <section className="hero" ref={hero} id="top" data-chapter>
        <div className="hero-pictures" aria-live="off">
          {heroSlides.map((s, i) => <div key={s.title + i} className={`hero-picture ${i === slide ? 'active' : ''}`}><img src={s.imageUrl} alt={s.title} fetchPriority={i === 0 ? 'high' : 'auto'} loading={i === 0 ? 'eager' : 'lazy'}/></div>)}
        </div>
        <div className="hero-gradient"/>
        <div className="hero-body"><div className="hero-eyebrow"><span className="little-line"/>DESIGNED AROUND YOU</div><h1 className="hero-title">{w.heroEnglish?.split('\n').map((line, i) => <span key={i}>{line}</span>)}</h1><div className="hero-chinese"><h2>{w.heroTitle}</h2><p>{w.heroSubtitle}</p></div><a className="round-link" href="#story"><span className="circle"><ArrowDown size={20}/></span>探索某某企业</a></div>
        <div className="hero-bottom"><span className="hero-caption">{String(slide + 1).padStart(2, '0')}<span>—</span>{heroSlides[slide]?.title}</span><div className="slider-nav"><button aria-label="上一张轮播" onClick={() => setSlide((slide - 1 + heroSlides.length) % Math.max(1, heroSlides.length))}><ChevronLeft size={20}/></button>{heroSlides.map((_, i) => <button key={i} aria-label={`切换至第${i + 1}张`} aria-pressed={slide === i} className={`slider-dot ${slide === i ? 'active' : ''}`} onClick={() => setSlide(i)}/>)}<button aria-label="下一张轮播" onClick={() => setSlide((slide + 1) % Math.max(1, heroSlides.length))}><ChevronRight size={20}/></button><button className="pause-slider" onClick={() => setPaused(!paused)} aria-label={paused ? '播放轮播' : '暂停轮播'}>{paused ? '▷' : 'Ⅱ'}</button></div><span className="hero-coordinate">FURNITURE / SPACE / LIVING</span></div>
      </section>

      <section className="story section" id="story" data-chapter>
        <div className="section-index"><span>01 / BRAND STORY</span><span>让生活，回到舒适的本真。</span></div>
        <div className="story-grid"><Reveal><span className="eyebrow">A QUIET KIND OF BEAUTY</span><h2 className="section-title multiline">{w.introTitle}</h2></Reveal><Reveal delay={180}><p className="body-copy">{w.introText}</p><a href="#about" className="underlined-link">关于我们的故事<ArrowUpRight size={18}/></a></Reveal></div>
        <div className="metrics">{(Array.isArray(w.metrics) ? w.metrics : []).map((m, i) => <Reveal key={i} delay={i * 90}><div className="metric"><strong>{m.value}<sup>{m.unit}</sup></strong><span>{m.label}</span></div></Reveal>)}</div>
        <Reveal kind="image"><div className="story-panorama"><img src="/images/story.jpg" alt="原木与柔和光影构成的日常居所" loading="lazy"/><div className="panorama-note"><span>THE ART OF EVERYDAY</span><p>不是填满空间，<br/>而是让生活发生。</p></div></div></Reveal>
      </section>

      <section className="collection section" id="products" data-chapter>
        <div className="section-index"><span>02 / COLLECTIONS</span><span>以设计，回应每一种生活。</span></div>
        <div className="section-heading"><Reveal><span className="eyebrow">THOUGHTFULLY DESIGNED</span><h2 className="section-title">日常之选<span className="title-dot">.</span></h2></Reveal><Reveal delay={120}><p className="body-copy">从一处舒适的落座，到一餐温暖的相聚。<br/>让家具，成为生活自然的一部分。</p></Reveal></div>
        <div className="product-filters" role="group" aria-label="产品分类筛选">{categories.map((c, i) => <button key={c.key} aria-pressed={category === c.key} className={category === c.key ? 'active' : ''} onClick={() => setCategory(c.key)}><small>0{i + 1}</small>{c.name}<span>{category === c.key ? '−' : '+'}</span></button>)}</div>
        <div className="product-grid" key={category}>{selected.map((p, i) => <Reveal key={p.slug} delay={(i % 2) * 120} className={i % 2 === 1 ? 'product-offset' : ''}><Link href={`/products/${p.slug}`} className="product-card"><div className="product-photo"><img src={p.imageUrl} alt={p.name} loading="lazy"/><span className="product-open"><Plus size={20}/></span><span className="product-tag">{categories.find((c) => c.key === p.category)?.name || '家具'}</span></div><div className="product-caption"><div><small>MOU MOU / {String(i + 1).padStart(2,'0')}</small><h3>{p.name}</h3></div><ArrowUpRight size={25} strokeWidth={1.3}/></div></Link></Reveal>)}</div>
        {selected.length === 0 && <p className="empty-state">这一系列正在筹备，敬请期待。</p>}
        <Reveal className="collection-bottom"><span>为不同的空间，找到合适的答案。</span><Inquiry label="咨询产品与配套" className="underlined-link"/></Reveal>
      </section>

      <section className="craft" id="craft" data-chapter>
        <div className="craft-visual"><Reveal kind="image"><img src={w.craftImageUrl} alt="家具材质与空间细节" loading="lazy"/></Reveal><span className="vertical-label">QUALITY IS IN THE DETAILS</span></div>
        <div className="craft-copy"><Reveal><span className="eyebrow">03 / CRAFT & CARE</span><h2 className="section-title multiline">{w.craftTitle}</h2><p className="body-copy">{w.craftText}</p></Reveal><div className="craft-values">{[['甄选材料', '以天然质感，回应真实触感。'], ['精细工艺', '每一道工序，都有自己的标准。'], ['安心交付', '从方案到落地，始终认真以待。']].map(([title, text], i) => <Reveal delay={i*100} key={title}><div className="craft-value"><span>0{i+1}</span><div><h3>{title}</h3><p>{text}</p></div><Plus size={15}/></div></Reveal>)}</div><Reveal><Inquiry label="了解我们的制造与服务" className="underlined-link light"/></Reveal></div>
      </section>

      <section className="projects section" id="projects" data-chapter>
        <div className="section-index"><span>04 / SPACES & STORIES</span><span>让想象，成为真实的风景。</span></div>
        <div className="section-heading"><Reveal><span className="eyebrow">A PLACE TO BELONG</span><h2 className="section-title">空间叙事<span className="title-dot">.</span></h2></Reveal><Reveal delay={120}><p className="body-copy">每个空间，都有自己的性格。<br/>我们用家具，为它写下温柔的注脚。</p></Reveal></div>
        <div className="project-list">{projects.map((p, i) => <Reveal key={p.slug} kind="image" delay={i % 2 * 100} className={`project-item project-item-${i}`}><Link href={`/projects/${p.slug}`} className="project-card"><img src={p.imageUrl} alt={p.name} loading="lazy"/><div className="project-caption"><div><span>{p.category} / {p.location} / {p.year}</span><h3>{p.name}</h3></div><span className="circle"><ArrowUpRight size={23}/></span></div><span className="project-number">0{i + 1}</span></Link></Reveal>)}</div>
        {projects.length === 0 && <p className="empty-state">新的空间故事，正在发生。</p>}
      </section>

      <section className="about section" id="about" data-chapter>
        <div className="about-art"><Reveal kind="image"><img src={w.aboutImageUrl} alt="设计与协作的空间" loading="lazy"/></Reveal><Reveal className="about-stamp" delay={300}><span>MOU MOU</span><strong>以认真，<br/>回应信任。</strong><span>DESIGN · MAKE · LIVE</span></Reveal></div><div className="about-copy"><Reveal><span className="eyebrow">05 / WHO WE ARE</span><h2 className="section-title multiline">{w.aboutTitle}</h2><p className="body-copy">{w.aboutText}</p><div className="about-tags"><span>原创设计</span><span>品质制造</span><span>空间配套</span></div><a className="underlined-link" href="#contact">成为我们的伙伴<ArrowUpRight size={18}/></a></Reveal></div>
      </section>

      <section className="contact section" id="contact" data-chapter>
        <Reveal><div className="section-index"><span>LET’S MAKE IT HAPPEN</span><span>期待与您相遇。</span></div><div className="contact-heading"><h2>下一个好空间，<br/><span>从一次对话开始。</span></h2><Inquiry className="contact-circle" label="聊聊您的项目"/></div></Reveal>
      </section>
    </main>
    <footer className="footer"><div className="footer-top"><a className="brand" href="#top"><span className="brand-symbol">m<span>.</span></span><span className="brand-text">{w.brandName}<small>{w.brandEnglish}</small></span></a><span>用设计，让生活更有温度。</span><a href="#top" className="back-top">返回顶部<ArrowUpRight size={17}/></a></div><div className="footer-grid"><div><span className="eyebrow">GET IN TOUCH</span><a className="footer-phone" href={`tel:${w.phone}`}>{w.phone}</a><a href={`mailto:${w.email}`}>{w.email}</a><p>{w.address}</p></div><div className="footer-nav">{nav.map(([n,name,id])=><a href={`#${id}`} key={n}>{name}</a>)}</div><div className="footer-note"><span>DESIGNED FOR<br/><em>everyday living.</em></span><p>家具 · 空间 · 生活</p></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {w.brandName} 版权所有</span>{w.icp ? <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">{w.icp}</a> : <span>用心制造，长久陪伴。</span>}</div></footer>
  </>;
}
