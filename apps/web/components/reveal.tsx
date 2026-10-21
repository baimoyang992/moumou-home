'use client';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

export function Reveal({ children, className = '', delay = 0, kind = 'up' }: { children: ReactNode; className?: string; delay?: number; kind?: 'up' | 'image' | 'left' }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    element.dataset.motion = 'pending';
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { element.dataset.motion = 'visible'; observer.disconnect(); }
    }, { threshold: .12, rootMargin: '0px 0px -25px 0px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal reveal-${kind} ${className}`} style={{ '--delay': `${delay}ms` } as CSSProperties}>{children}</div>;
}
