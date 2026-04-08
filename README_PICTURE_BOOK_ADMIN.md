# 绘本管理后台（web-ele）

基于 **Vben Admin 5** 的 **Element Plus** 应用（`apps/web-ele`），对接 **picture_books_backend** 的 `/api/v1/admin` 接口与 Casbin 权限码。

## 本地联调

1. 启动依赖与后端（需配置 `ADMIN_JWT_SECRET`，见后端 README），默认 `http://127.0.0.1:8080`。
2. 在本仓库根目录安装依赖：`pnpm install`（或 `pnpm bootstrap`）。
3. 启动管理端：`pnpm dev:ele`（仅 web-ele），浏览器一般为 `http://localhost:5777`。
4. 开发环境下 `VITE_GLOB_API_URL=/admin-api`，由 `apps/web-ele/vite.config.ts` 代理至 `http://127.0.0.1:8080/api/v1/admin`。
5. 使用种子或环境变量创建的首个管理员账号登录（`POST /api/v1/admin/auth/login`，表单字段 `username` / `password`）。

## 权限与菜单

- 路由 `meta.authority` 与后端 [`picture_books_backend/internal/admin/perm/codes.go`](../picture_books_backend/internal/admin/perm/codes.go) 中权限码一致（如 `book:list`、`dashboard:view`）。
- 使用 **前端静态菜单模式**（`accessMode: frontend`）。首次进入应用时，[`apps/web-ele/src/router/guard.ts`](apps/web-ele/src/router/guard.ts) 使用 `/auth/codes` 返回的权限码参与菜单过滤（与 Vben 默认仅用 `userInfo.roles` 不同，已与 Casbin 对齐）。
- 按钮级控制可使用 `v-access:code="['权限码']"`。

## 业务页面目录

| 模块                 | 路由前缀              | 视图目录                                      |
| -------------------- | --------------------- | --------------------------------------------- |
| 仪表盘               | `/analytics`          | `apps/web-ele/src/views/dashboard/analytics/` |
| App 用户             | `/ops/app-users`      | `apps/web-ele/src/views/ops/app-user/`        |
| 绘本                 | `/ops/books`          | `apps/web-ele/src/views/ops/book/`            |
| 市场推荐             | `/ops/books/recommend`| `apps/web-ele/src/views/ops/book/recommend.vue` |
| 生成任务             | `/ops/book-gen-tasks` | `apps/web-ele/src/views/ops/task/`            |
| 意见反馈             | `/ops/feedbacks`      | `apps/web-ele/src/views/ops/feedback/`（列表 `list.vue`、详情 `detail.vue`） |
| 管理员 / 角色 / 权限 | `/system/...`         | `apps/web-ele/src/views/system/`              |
| App 关于文案         | `/system/app-about`   | `apps/web-ele/src/views/system/app-about/`   |

API 封装：`apps/web-ele/src/api/admin/`（含 `feedback.ts` 与 `system.ts` 内 `app-about`）。

### 市场推荐（App 市场 Tab）

- `GET /books/recommendations`：当前推荐顺序列表（权限 `book:recommend_list`）。
- `PUT /books/recommendations`：body `{ book_ids: number[] }` 整表替换，仅允许**已发布**绘本（`book:recommend_write`）。
- `POST /books/recommendations/suggest?limit=30`：按阅读次数、收藏数、阅读时长返回候选（`book:recommend_list`）。

## 生产部署注意

- 打包默认 `VITE_GLOB_API_URL=/admin-api`，需在 **Nginx / 网关** 将 `/admin-api` 反代到后端 `https://<host>/api/v1/admin`，或改为完整后端 origin（需处理 CORS）。
- 若直连 Go 端口且跨域，需在后端增加 CORS；推荐静态资源与 API 同域反代。

## OpenAPI

与 Swagger 路径一致时，以后端 `make swagger` 生成的 `docs/swagger.yaml` 为准（管理端标签见 `admin` 相关接口）。
