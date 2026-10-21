import path from 'node:path';
import { spawn } from 'node:child_process';
const app = path.resolve(import.meta.dirname, '../apps/cms');
const child = spawn(process.execPath, [path.join(app, 'node_modules/@strapi/strapi/bin/strapi.js'), 'start'], { cwd: app, stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production', STRAPI_TELEMETRY_DISABLED: 'true' } });
child.on('exit', (code) => { process.exitCode = code || 0; });
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
