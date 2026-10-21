import logo from '../../public/brand.svg';
export default {
  config: {
    auth: { logo }, menu: { logo },
    locales: ['zh-Hans'],
    translations: { 'zh-Hans': { 'app.components.LeftMenu.navbrand.title': '某某企业', 'app.components.LeftMenu.navbrand.workplace': '内容管理', 'Auth.form.welcome.title': '某某企业 · 内容管理', 'Auth.form.welcome.subtitle': '管理官网内容，让品牌生动呈现。' } },
    tutorials: false, notifications: { releases: false },
  },
  bootstrap() {},
};
