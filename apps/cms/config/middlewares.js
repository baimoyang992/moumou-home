module.exports = [
  'strapi::logger', 'strapi::errors',
  { name: 'strapi::security', config: { contentSecurityPolicy: { useDefaults: true, directives: { 'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io'], 'media-src': ["'self'", 'data:', 'blob:'], upgradeInsecureRequests: null } } } },
  { name: 'strapi::cors', config: { origin: ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.WEB_URL].filter(Boolean) } },
  'strapi::poweredBy', 'strapi::query',
  { name: 'strapi::body', config: { jsonLimit: '1mb', formLimit: '1mb', formidable: { maxFileSize: 20 * 1024 * 1024 } } },
  'strapi::session', 'strapi::favicon', 'strapi::public',
];
