# 后续服务器部署

目前仅准备部署配置，没有执行部署。本机未安装 Docker，以下容器配置未在真实 Linux 服务器上运行验证；Next.js 与 Strapi 的本机构建和联调验证请见根目录说明。

建议 Linux 服务器至少 2 核 4GB 内存；首次构建资源不足时可在 CI 或独立构建机生成镜像。需要 Docker Engine 与 Compose 插件，以及 `www` 和 `cms` 两个指向服务器的域名；开放 80、443 端口。

## 部署步骤

1. 将项目上传到服务器，不上传 `node_modules`、`.local`、本地 `.env`、`.tmp`、`.next`。
2. 在 `deploy` 中将 `.env.example` 复制为 `.env`，填写官网域名、后台域名和 ACME 邮箱。各密钥用 `openssl rand -hex 32` 独立生成，`APP_KEYS` 填四个以逗号分隔的随机值。不要使用占位值。
3. 在 `deploy` 目录执行：

```sh
docker compose --env-file .env config --quiet
docker compose --env-file .env up -d --build
docker compose logs -f --tail=100 cms web
```

4. 打开 `https://cms.你的域名/admin`，创建服务器自己的管理员账号。生产环境不会创建或复用本地体验账号。
5. 打开官网检查图片、产品详情和咨询；在后台编辑并发布一条内容，刷新确认同步。

Caddy 自动申请并续期 HTTPS 证书。官网、后台和数据库共四个服务；数据库不映射公网端口，上传图片及 PostgreSQL 使用持久卷。后台上传的图片由后台域名提供。

注意：`NEXT_PUBLIC_CMS_URL` 在前端构建时写入；`PUBLIC_URL` 会用于后台构建。域名变化后需要重新构建，不只是重启容器。

初始化默认装入示例数据（`SEED_DEMO=true`）；正式启动前可将其设为 `false`，再通过后台录入真实内容。修改首次数据文件不会覆盖已在后台编辑的数据。生产环境的默认管理员需首次打开后台自行创建。

## 备份与更新

PostgreSQL 备份示例（Linux）：

```sh
docker compose exec -T database pg_dump -U home home > home-backup.sql
```

同时备份上传图片持久卷 `moumou-home_uploads` 和 `deploy/.env`。环境文件包含密钥，应保存在受控位置。升级前先备份；`docker compose down` 不会删除持久卷，避免使用 `down -v`。

当前单实例官网对咨询提供每来源 10 分钟 5 次的内存限流；多副本时改为 Redis 等共享存储。Caddy 负责可信代理头，应用仅在容器内网络监听。邮件与短信通知、对象存储和监控可按正式运维需求接入；目前咨询以后台列表为准。
