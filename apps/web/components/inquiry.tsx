'use client';
import { useId, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, X, LoaderCircle } from 'lucide-react';

export function Inquiry({ label = '聊聊您的项目', className = 'button dark', subject = '' }: { label?: string; className?: string; subject?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [state, setState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const open = () => { setState('idle'); setError(''); dialog.current?.showModal(); };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    setState('pending'); setError('');
    try {
      const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || '暂时无法提交，请稍后再试。');
      setState('success'); form.reset();
    } catch (err) { setState('error'); setError(err instanceof Error ? err.message : '网络连接失败，请稍后重试。'); }
  }
  return <>
    <button type="button" onClick={open} className={className}>{label}<ArrowUpRight size={18}/></button>
    <dialog ref={dialog} className="inquiry" aria-labelledby={titleId} onClick={(e) => { if (e.target === dialog.current) { const rect = dialog.current.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.current.close(); } }}>
      <button type="button" className="close-button" aria-label="关闭咨询窗口" onClick={() => dialog.current?.close()}><X/></button>
      {state === 'success' ? <div className="inquiry-success"><Check size={42}/><span className="eyebrow">THANK YOU</span><h2 id={titleId}>期待与您，一起创造。</h2><p>您的需求已成功提交，我们会尽快与您联系。</p><button className="button dark" onClick={() => dialog.current?.close()}>完成 <Check size={16}/></button></div> : <>
        <span className="eyebrow">LET’S CREATE SOMETHING</span><h2 id={titleId}>从一个想法开始。</h2><p className="form-intro">留下您的需求，让我们一起探索空间的可能。</p>
        <form onSubmit={submit}>
          <label>您的称呼<input name="name" autoComplete="name" required maxLength={80} placeholder="怎么称呼您"/></label>
          <label>联系电话<input name="phone" type="tel" autoComplete="tel" required minLength={6} maxLength={40} placeholder="方便联系的电话号码"/></label>
          <label className="full">合作方向<select name="type"><option>家具采购</option><option>全屋配套</option><option>工程项目</option><option>经销合作</option></select></label>
          <label className="full">您的想法<textarea name="message" rows={3} maxLength={2000} defaultValue={subject ? `我想了解：${subject}` : ''} placeholder="产品、风格、空间面积，或任何想和我们聊的事…"/></label>
          <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
          {error && <p role="alert" className="form-error full">{error}</p>}
          <button disabled={state === 'pending'} className="button dark full" type="submit">{state === 'pending' ? <>提交中 <LoaderCircle className="spin" size={18}/></> : <>提交需求 <ArrowUpRight size={18}/></>}</button>
          <small className="full privacy-note">您提供的信息仅用于本次业务联系。</small>
        </form>
      </>}
    </dialog>
  </>;
}
