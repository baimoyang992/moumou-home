import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const cms = 'http://127.0.0.1:1337';
const web = 'http://127.0.0.1:3000';
const check = (name) => console.log(`PASS ${name}`);
const get = async (url, options) => { const r = await fetch(url, options); return { status: r.status, body: await r.json() }; };
assert.equal((await get(`${web}/api/health`)).status, 200); check('Next.js health');
const products = await get(`${cms}/api/products?populate=*&sort=order:asc`);
assert.equal(products.status, 200); assert.ok(products.body.data.length >= 4); check('Strapi published products');
assert.equal((await fetch(`${web}/products/${products.body.data[0].slug}`)).status, 200); check('Product detail SSR');
assert.equal((await fetch(`${web}/products/this-product-does-not-exist`)).status, 404); check('Missing product returns 404');
const invalid = await get(`${web}/api/inquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json', origin: web }, body: JSON.stringify({ name: '联调测试', phone: 'abc', type: '家具采购' }) });
assert.equal(invalid.status, 400); check('Inquiry validation');
assert.equal((await get(`${web}/api/inquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json', origin: 'https://invalid.example' }, body: '{}' })).status, 403); check('Cross-origin submission rejected');
assert.equal((await get(`${cms}/api/inquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: { name: '匿名测试', phone: '00000000000', type: '家具采购' } }) })).status, 401); check('Direct CMS writes require server secret');
assert.equal((await fetch(`${cms}/api/inquiries`)).status, 404); check('Customer inquiry records are not publicly readable');
assert.equal((await get(`${web}/api/revalidate`, { method: 'POST' })).status, 401); check('Revalidation requires secret');

if (process.argv.includes('--write')) {
  const credentials = JSON.parse(await fs.readFile(path.join(root, '.local/admin-credentials.json'), 'utf8'));
  const login = await get(`${cms}/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
  assert.equal(login.status, 200);
  const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${login.body.data.token}` };
  const stamp = `integration-${Date.now()}`;
  let documentId;
  try {
    const result = await get(`${web}/api/inquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json', origin: web }, body: JSON.stringify({ name: '自动联调测试', phone: '00000000000', type: '家具采购', message: stamp, website: '' }) });
    assert.equal(result.status, 200);
    const stored = await get(`${cms}/content-manager/collection-types/api::inquiry.inquiry?filters[message][$eq]=${stamp}`, { headers: auth });
    assert.equal(stored.status, 200); assert.equal(stored.body.results.length, 1);
    documentId = stored.body.results[0].documentId;
    check('Website inquiry persisted and is visible to administrator');
  } finally {
    if (documentId) {
      const deleted = await fetch(`${cms}/content-manager/collection-types/api::inquiry.inquiry/${documentId}`, { method: 'DELETE', headers: auth });
      assert.ok(deleted.ok); check('Removed only the synthetic test inquiry');
    }
  }
  let productId;
  let uploadId;
  try {
    const upload = new FormData();
    upload.append('files', new Blob([await fs.readFile(path.join(root, 'apps/web/public/images/sofa.jpg'))], { type: 'image/jpeg' }), `${stamp}.jpg`);
    const uploaded = await get(`${cms}/upload`, { method: 'POST', headers: { Authorization: auth.Authorization }, body: upload });
    assert.equal(uploaded.status, 201); uploadId = uploaded.body[0].id;
    assert.ok(uploadId); check('Strapi media library accepts image upload');
    const created = await get(`${cms}/content-manager/collection-types/api::product.product`, { method: 'POST', headers: auth, body: JSON.stringify({ name: '自动联调临时产品', slug: stamp, category: 'living', description: '临时验证发布与撤稿', image: uploadId, imageUrl: '/images/sofa.jpg', order: 99 }) });
    assert.equal(created.status, 201); productId = created.body.data?.documentId || created.body.documentId;
    assert.ok(productId);
    assert.equal((await get(`${cms}/api/products?filters[slug][$eq]=${stamp}`)).body.data.length, 0); check('Unpublished drafts stay private');
    const published = await fetch(`${cms}/content-manager/collection-types/api::product.product/${productId}/actions/publish`, { method: 'POST', headers: auth, body: '{}' });
    assert.ok(published.ok);
    assert.equal((await get(`${cms}/api/products?filters[slug][$eq]=${stamp}`)).body.data.length, 1); check('Admin publication appears in content API');
    const html = await (await fetch(`${web}/products/${stamp}`)).text();
    assert.ok(html.includes('自动联调临时产品')); check('Published CMS content appears on Next.js detail page');
    assert.ok(html.includes(uploaded.body[0].url));
    assert.equal((await fetch(`${cms}${uploaded.body[0].url}`)).status, 200); check('Uploaded image overrides demo image on frontend');
    const unpublished = await fetch(`${cms}/content-manager/collection-types/api::product.product/${productId}/actions/unpublish`, { method: 'POST', headers: auth, body: '{}' });
    assert.ok(unpublished.ok);
    assert.equal((await get(`${cms}/api/products?filters[slug][$eq]=${stamp}`)).body.data.length, 0); check('Unpublish removes public content');
  } finally {
    if (productId) { const deleted = await fetch(`${cms}/content-manager/collection-types/api::product.product/${productId}`, { method: 'DELETE', headers: auth }); assert.ok(deleted.ok); check('Removed only the temporary integration product'); }
    if (uploadId) { const deleted = await fetch(`${cms}/upload/files/${uploadId}`, { method: 'DELETE', headers: auth }); assert.ok(deleted.ok); check('Removed only the temporary uploaded image'); }
  }
}
console.log('全部联调检查通过。');
