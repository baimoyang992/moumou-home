import Link from 'next/link';
export default function NotFound() { return <main className="error-page"><span className="eyebrow">404 / NOT FOUND</span><h1>这一页，暂未陈列。</h1><p>内容可能已调整，回首页看看吧。</p><Link href="/" className="button dark">返回首页</Link></main>; }
