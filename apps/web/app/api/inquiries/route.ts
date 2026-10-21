import { NextResponse } from 'next/server';
import { z } from 'zod';
export const runtime = 'nodejs';
const schema = z.object({
  name: z.string().trim().min(1, '请填写称呼').max(80),
  phone: z.string().trim().regex(/^[+\d\s()-]{6,40}$/, '请填写有效的联系电话'),
  type: z.enum(['家具采购', '全屋配套', '工程项目', '经销合作']),
  message: z.string().trim().max(2000).default(''),
  website: z.string().max(0).optional(),
});
// Single-instance limit; use a shared rate-limit store if scaling to multiple web containers.
const requests = new Map<string, { count: number; expires: number }>();
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const allowed = new Set([process.env.SITE_URL || 'http://localhost:3000']);
  if (process.env.NODE_ENV !== 'production') { allowed.add('http://127.0.0.1:3000'); allowed.add('http://localhost:3000'); }
  if (!origin || !allowed.has(origin)) return NextResponse.json({ error: '请求来源无效，请从官网提交。' }, { status: 403 });
  if (Number(request.headers.get('content-length')) > 12000) return NextResponse.json({ error: '内容过长。' }, { status: 413 });
  const now = Date.now();
  for (const [key, item] of requests) if (item.expires < now) requests.delete(key);
  // Only trust the client header from the deployment's reverse proxy. No proxy means one local bucket.
  const key = process.env.TRUST_PROXY === 'true' ? (request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local') : 'local';
  const bucket = requests.get(key) || { count: 0, expires: now + 600000 };
  if (bucket.count >= 5 || requests.size > 10000) return NextResponse.json({ error: '提交较频繁，请稍后再试。' }, { status: 429 });
  const raw = await request.text();
  if (raw.length > 12000) return NextResponse.json({ error: '内容过长。' }, { status: 413 });
  let body;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: '提交内容无效。' }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  bucket.count++; requests.set(key, bucket);
  try {
    if (!process.env.INQUIRY_SECRET) throw new Error('Inquiry secret is missing');
    const { website: _honeypot, ...data } = parsed.data;
    const response = await fetch(`${process.env.STRAPI_URL || 'http://127.0.0.1:1337'}/api/inquiries`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-inquiry-secret': process.env.INQUIRY_SECRET }, body: JSON.stringify({ data }), signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`CMS inquiry returned ${response.status}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Inquiry storage failed', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: '暂时无法提交，请拨打页面下方的电话联系我们。' }, { status: 503 });
  }
}
