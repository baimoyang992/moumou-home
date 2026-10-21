import fs from 'node:fs/promises';
import path from 'node:path';
const destination = path.resolve(import.meta.dirname, '../apps/web/public/images');
const images = {
  'hero-living': '1600210492486-724fe5c67fb0',
  'hero-dining': '1616486338812-3dadae4b4ace',
  'hero-bedroom': '1618221195710-dd6b41faaea6',
  story: '1600566753190-17f0baa2a6c3',
  sofa: '1555041469-a586c61ea9bc',
  dining: '1617806118233-18e1de247200',
  bedroom: '1505693416388-ac5ce068fe85',
  office: '1497366754035-f200968a6e72',
  craft: '1533090161767-e6ffed986c88',
  'case-home': '1600566753086-00f18fb6b3ea',
  'case-office': '1497366811353-6870744d04b2',
  'case-hotel': '1549497538-303791108f95',
  about: '1524758631624-e2822e304c36',
};
await fs.mkdir(destination, { recursive: true });
const queue = Object.entries(images);
await Promise.all(Array.from({ length: 4 }, async () => {
  for (;;) {
    const entry = queue.shift(); if (!entry) return;
    const [name, id] = entry;
    const filename = path.join(destination, `${name}.jpg`);
    try { if ((await fs.stat(filename)).size > 1000) { console.log(`已有素材 ${name}`); continue; } } catch {}
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${name.startsWith('hero') || name === 'story' ? 1920 : 1400}&q=85&fm=jpg`, { signal: AbortSignal.timeout(60000) });
        if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`HTTP ${response.status}`);
        await fs.writeFile(filename, Buffer.from(await response.arrayBuffer()));
        console.log(`素材就绪 ${name}`); break;
      } catch (error) { if (attempt === 2) throw new Error(`${name}: ${error.message}`); }
    }
  }
}));
