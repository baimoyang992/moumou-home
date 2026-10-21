# 某某企业 · 家具官网

官网：Next.js 16 App Router + React 19 + TypeScript。可视化后台：Strapi 5（独立使用 React 18）。本地数据库：SQLite；服务器部署配置：PostgreSQL 17 + Docker Compose + Caddy HTTPS。

## 本地体验

- 官网：<http://127.0.0.1:3000>
- 后台：<http://127.0.0.1:1337/admin>
- 本机管理员登录信息：`.local/admin-credentials.json`。仅生成一次，随机密码，不进入 Git，也不会打包进 Docker。该账号仅存在于本机 SQLite 数据库。

需要 Node.js 24 LTS 与 pnpm 11。在项目根目录执行：

```sh
pnpm install
pnpm setup
pnpm dev
```

Windows 环境如果 PowerShell 找不到 `pnpm`，使用 `pnpm.cmd`。`pnpm setup` 只生成缺失的本地配置，不会覆盖现有配置或数据库。首次运行自动载入示例产品、案例和首页内容。

本机管理员已初始化。如果在全新环境安装，可以直接在后台创建自己的管理员，也可以在后台启动后执行 `node scripts/local-admin.mjs` 生成仅用于本机体验的随机账号。

分别启动：`pnpm dev:cms` 和 `pnpm dev:web`。停止：在各自终端按 Ctrl+C。

本次交付已在本机使用构建后的版本运行。之后若要重新启动同样的预览，执行 `pnpm build` 和 `pnpm start`；如需改代码并热更新，则用 `pnpm dev`。两种启动方式使用相同的 SQLite 数据库，启动前先停止旧进程，避免端口冲突。

## 后台使用

登录后进入 **Content Manager / 内容管理器**。语言可在登录页下拉框或账户设置中切换为简体中文。

| 入口 | 可管理内容 |
| --- | --- |
| 官网设置 | 品牌名称、首屏中英文标题、品牌介绍、制造与企业介绍、联系方式、SEO、企业数据 |
| 首页轮播 | 图片、文案、排序；数字越小越靠前 |
| 产品中心 | 产品名称、分类、独立网址、图片、描述、材料、尺寸、排序 |
| 空间案例 | 名称、独立网址、地点、年份、图片、介绍、排序 |
| 客户咨询 | 称呼、电话、合作类型、需求，以及联系进度 |

产品分类：`living` 客厅、`dining` 餐厅、`bedroom` 卧室、`office` 办公。咨询状态：`pending` 待联系、`contacted` 已联系、`completed` 已完成。

修改内容后点击 **Publish / 发布**。仅保存草稿不会影响官网。发布、撤稿和删除会自动通知 Next.js 清除缓存，刷新官网即可看到；通知失败时，30 秒缓存到期后由访问触发更新。已打开的页面需刷新。

图片优先使用 `image` 上传字段；留空则使用 `imageUrl`。官网设置中 `craftImage` / `aboutImage` 同理。可以在 Media Library / 媒体库上传图片，然后在内容中选择。示例图片保存在 `apps/web/public/images`，不需要外部图片 CDN 才能显示。

`metrics` 为 JSON 数组，示例结构：`[{"value":"12","unit":"+","label":"年家具制造经验"}]`。

企业名称、经营数据、电话、地址、案例和产品信息均为演示占位内容，正式使用前替换。咨询目前真实保存到本机 Strapi；没有配置短信、邮件或第三方通知。

## 交互效果

大幅首屏轮播与轻微视差、文字向上渐显、图片遮罩展开、同组内容错峰出现、产品悬停放大、阅读进度线、章节导航、分类筛选、产品/案例详情页、带焦点管理的原生对话框与咨询提交。手机端自动调整版式，系统设置“减少动态效果”时禁用位移和自动轮播。

## 验证

```sh
pnpm check
pnpm build
node scripts/smoke.mjs
# 本机已有 .local/admin-credentials.json 时，可测试真实提交与后台发布链路
node scripts/smoke.mjs --write
```

`--write` 仅用于本地测试服务，会创建和清理自己生成的临时咨询和产品，验证保存、草稿隔离、发布及撤稿。不会删除示例或业务数据。后端只开放公开内容的读取；咨询列表不开放给访客，提交必须经 Next.js 服务端校验后传递共享密钥。

## 目录与数据

```text
apps/web/          Next.js 官网
apps/cms/          Strapi 可视化后台及内容模型
content/seed.json  首次启动的示例数据；日常编辑请使用后台
scripts/          初始化、素材下载、启动与联调脚本
deploy/           后续服务器部署配置与说明
.local/           本地管理员凭据（忽略提交）
```

本地数据位于 `apps/cms/.tmp/data.db`，上传图片位于 `apps/cms/public/uploads`，环境配置位于 `apps/cms/.env` 和 `apps/web/.env.local`。备份请包含这几处；复制 SQLite 数据库前停止 Strapi。

原静态 Demo 的 `index.html`、`styles.css`、`script.js` 保留用于对比，不参与新应用构建。新应用入口为 `apps/web/app/page.tsx`。

图片来自 Unsplash，用作演示素材，不代表企业自有产品或真实项目；来源映射见 `scripts/assets.mjs`。字体通过 Google Fonts 加载，网络不可达时自动使用系统字体。原生图标使用打包的 Lucide React，无运行时图标 CDN 依赖。

服务器部署见 [deploy/README.md](deploy/README.md)。本次按要求只在本地运行，未连接或变更任何服务器。
