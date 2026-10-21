import type { NextConfig } from 'next';
import path from 'node:path';
const config: NextConfig = {
  output: 'standalone', outputFileTracingRoot: path.join(process.cwd(), '../..'),
  turbopack: { root: path.join(process.cwd(), '../..') },
  poweredByHeader: false,
  devIndicators: false,
};
export default config;
