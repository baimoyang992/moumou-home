import { timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  const provided = request.headers.get('x-revalidate-secret');
  if (!expected || !provided || Buffer.byteLength(expected) !== Buffer.byteLength(provided) || !timingSafeEqual(Buffer.from(expected), Buffer.from(provided))) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  revalidateTag('cms', { expire: 0 });
  revalidatePath('/', 'layout');
  return Response.json({ revalidated: true });
}
