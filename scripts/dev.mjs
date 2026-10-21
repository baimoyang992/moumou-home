import { spawn, spawnSync } from 'node:child_process';
import './setup.mjs';
// pnpm executes this script with its own CLI path available as npm_execpath.
const cli = process.env.npm_execpath;
if (!cli) throw new Error('请通过 pnpm dev 启动。');
const production = process.argv.includes('--production');
const children = ['@home/cms', '@home/web'].map((name) => spawn(process.execPath, [cli, '--filter', name, production ? 'start' : name.endsWith('cms') ? 'develop' : 'dev'], { stdio: 'inherit', env: process.env }));
let stopping = false;
function stop(code = 0) {
  if (stopping) return; stopping = true;
  children.forEach((child) => {
    if (!child.pid || child.exitCode !== null) return;
    if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else child.kill('SIGTERM');
  });
  process.exitCode = code;
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
children.forEach((child) => child.on('exit', (code) => { if (!stopping) stop(code || 1); }));
