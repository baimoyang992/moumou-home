const labels = {
  brandName: '企业名称', brandEnglish: '英文品牌名', heroTitle: '首屏中文标题', heroSubtitle: '首屏副标题', heroEnglish: '首屏英文标题（可换行）',
  introTitle: '品牌故事标题', introText: '品牌故事正文', craftTitle: '制造实力标题', craftText: '制造实力正文', craftImage: '制造实力配图', craftImageUrl: '制造配图备用地址',
  aboutTitle: '企业介绍标题', aboutText: '企业介绍正文', aboutImage: '企业介绍配图', aboutImageUrl: '企业配图备用地址',
  phone: '联系电话', email: '商务邮箱', address: '企业地址', icp: 'ICP备案号', seoTitle: '搜索引擎标题', seoDescription: '搜索引擎描述', metrics: '企业实力数据',
  title: '标题', subtitle: '副标题', image: '图片（优先展示）', imageUrl: '备用图片地址', order: '显示顺序（小数值优先）',
  name: '名称 / 称呼', slug: '网址标识', category: '分类', description: '详细介绍', material: '产品材料', dimensions: '产品规格',
  location: '项目地点', year: '项目年份', type: '合作方向', message: '客户需求', status: '联系进度', createdAt: '创建时间', updatedAt: '更新时间',
};
module.exports = async function configureEditor(strapi) {
  const store = strapi.store({ type: 'core', name: 'home-editor' });
  if (await store.get({ key: 'chinese-labels-v1' })) return;
  const service = strapi.plugin('content-manager').service('content-types');
  for (const type of ['website', 'hero-slide', 'product', 'project', 'inquiry']) {
    const model = service.findContentType(`api::${type}.${type}`);
    const config = await service.findConfiguration(model);
    for (const [name, label] of Object.entries(labels)) {
      if (!config.metadatas[name]) continue;
      for (const mode of ['edit', 'list']) if (config.metadatas[name][mode]) config.metadatas[name][mode].label = label;
    }
    for (const name of ['imageUrl', 'craftImageUrl', 'aboutImageUrl']) {
      if (config.metadatas[name]?.edit) config.metadatas[name].edit.description = '上传了对应图片时优先使用上传图片。示例地址 /images/xxx.jpg 由官网提供。';
    }
    if (config.metadatas.category?.edit && type === 'product') config.metadatas.category.edit.description = 'living 客厅 / dining 餐厅 / bedroom 卧室 / office 办公';
    if (config.metadatas.status?.edit) config.metadatas.status.edit.description = 'pending 待联系 / contacted 已联系 / completed 已完成';
    if (config.metadatas.metrics?.edit) config.metadatas.metrics.edit.description = '数组格式，每项包含 value（数值文本）、unit（单位）、label（说明）。';
    const mainField = type === 'website' ? 'brandName' : type === 'hero-slide' ? 'title' : 'name';
    config.settings.mainField = mainField;
    if (type === 'product') config.layouts.list = ['name', 'category', 'order', 'updatedAt'];
    if (type === 'project') config.layouts.list = ['name', 'category', 'location', 'year'];
    if (type === 'hero-slide') config.layouts.list = ['title', 'order', 'updatedAt'];
    if (type === 'inquiry') config.layouts.list = ['name', 'phone', 'type', 'status', 'createdAt'];
    await service.updateConfiguration(model, config);
  }
  await store.set({ key: 'chinese-labels-v1', value: true });
};
