const fs = require('node:fs');
const path = require('node:path');
const configureEditor = require('./editor');
const contentTypes = ['website', 'hero-slide', 'product', 'project'];

module.exports = {
  register({ strapi }) {
    strapi.documents.use(async (context, next) => {
      const result = await next();
      if (contentTypes.some((type) => context.uid === `api::${type}.${type}`) && ['publish', 'unpublish', 'delete'].includes(context.action)) {
        // Revalidation is an optimization; the frontend also refreshes its cache every 30 seconds.
        fetch(`${process.env.WEB_URL || 'http://127.0.0.1:3000'}/api/revalidate`, {
          method: 'POST', headers: { 'x-revalidate-secret': process.env.REVALIDATE_SECRET || '' }, signal: AbortSignal.timeout(3000),
        }).catch(() => {});
      }
      return result;
    });
  },
  async bootstrap({ strapi }) {
    const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
    if (publicRole) {
      for (const type of contentTypes) {
        for (const operation of ['find', 'findOne']) {
          const action = `api::${type}.${type}.${operation}`;
          const exists = await strapi.db.query('plugin::users-permissions.permission').findOne({ where: { action, role: publicRole.id } });
          if (!exists) await strapi.db.query('plugin::users-permissions.permission').create({ data: { action, role: publicRole.id, enabled: true } });
        }
      }
    }
    // Prevent public account creation: content editors use the separate Strapi administrator system.
    const store = strapi.store({ type: 'plugin', name: 'users-permissions' });
    const advanced = await store.get({ key: 'advanced' });
    await store.set({ key: 'advanced', value: { ...advanced, allow_register: false } });
    await configureEditor(strapi);

    if (process.env.SEED_DEMO !== 'true') return;
    const seed = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../content/seed.json'), 'utf8'));
    for (const [type, entries] of Object.entries({ website: [seed.website], 'hero-slide': seed.heroSlides, product: seed.products, project: seed.projects })) {
      const uid = `api::${type}.${type}`;
      // Idempotent seed: preserve all existing content, including an intentionally empty collection.
      const key = `seeded-${type}-v1`;
      const appStore = strapi.store({ type: 'core', name: 'home-seed' });
      if (await appStore.get({ key })) continue;
      if ((await strapi.documents(uid).count()) === 0) {
        for (const data of entries) await strapi.documents(uid).create({ data, status: 'published' });
      }
      await appStore.set({ key, value: true });
    }
    strapi.log.info('某某企业：内容已就绪。前往 /admin 创建管理员并编辑官网。');
  },
};
