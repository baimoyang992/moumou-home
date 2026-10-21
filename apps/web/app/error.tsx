'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="error-page"><span className="eyebrow">MOU MOU HOME</span><h1>页面暂时无法加载</h1><p>内容服务正在恢复，请稍后重试。</p><button className="button dark" onClick={reset}>重新加载</button></main>;
}
