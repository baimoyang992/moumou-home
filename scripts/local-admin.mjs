// Creates a local-only administrator with a random initial password, never a production default.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root = path.resolve(import.meta.dirname, '..');
const target = path.join(root, '.local/admin-credentials.json');
const origin = 'http://127.0.0.1:1337';
const init = await fetch(`${origin}/admin/init`).then((r) => r.json());
if (init.data.hasAdmin) {
  console.log('管理员已存在，不会修改账号或密码。');
  process.exit(0);
}
const credentials = { email: 'admin@moumou.local', password: `Mm!${crypto.randomBytes(18).toString('base64url')}9`, url: `${origin}/admin` };
const response = await fetch(`${origin}/admin/register-admin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstname: '网站', lastname: '管理员', email: credentials.email, password: credentials.password }) });
if (!response.ok) throw new Error(`无法创建本地管理员：HTTP ${response.status}`);
await fs.mkdir(path.dirname(target), { recursive: true });
await fs.writeFile(target, JSON.stringify(credentials, null, 2), { mode: 0o600 });
console.log('本地管理员已就绪。登录信息保存在 .local/admin-credentials.json（不进入版本控制）。');
