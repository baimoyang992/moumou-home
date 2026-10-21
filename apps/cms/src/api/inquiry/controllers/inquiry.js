const { timingSafeEqual } = require('node:crypto');
module.exports = {
  async create(ctx) {
    const expected = process.env.INQUIRY_SECRET;
    const provided = ctx.get('x-inquiry-secret');
    if (!expected || !provided || Buffer.byteLength(expected) !== Buffer.byteLength(provided) || !timingSafeEqual(Buffer.from(expected), Buffer.from(provided))) return ctx.unauthorized();
    const { name, phone, type, message = '' } = ctx.request.body?.data || {};
    if (typeof name !== 'string' || !name.trim() || name.length > 80 || typeof phone !== 'string' || !/^[+\d\s()-]{6,40}$/.test(phone) || !['家具采购','全屋配套','工程项目','经销合作'].includes(type) || typeof message !== 'string' || message.length > 2000) return ctx.badRequest('请检查称呼、电话及需求信息。');
    await strapi.documents('api::inquiry.inquiry').create({ data: { name: name.trim(), phone: phone.trim(), type, message: message.trim(), status: 'pending' } });
    ctx.status = 201;
    ctx.body = { ok: true }; // Never expose a customer record to public clients.
  },
};
