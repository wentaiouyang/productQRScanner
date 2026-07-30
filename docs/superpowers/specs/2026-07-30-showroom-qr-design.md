# ShowRoomQR — 展厅产品二维码扫描应用

**日期**：2026-07-30
**状态**：设计已确认，等待外部依赖（见「外部依赖与阻塞项」）
**区域**：`au`（仅澳洲）

---

## 1. 目标

展厅每件展品贴一张二维码标签。客户用手机相机扫码，直接打开一个展厅专属的产品页面，看到图片、规格、价格、库存和资料下载。同一个网址，ABI 员工用 Microsoft 工作账号登录后，额外看到成本价、毛利等内部数据。

不需要安装任何 App——二维码就是一个网址，手机相机原生支持。

## 2. 用户与范围

| 用户 | 身份 | 看到什么 |
|---|---|---|
| 展厅客户 | 匿名 | 产品名称、表面处理、图片、规格、价格、库存、资料下载、同系列其他表面处理、官网购买链接 |
| ABI 员工 | Microsoft 工作账号（Entra） | 以上全部，外加成本价（`unitCost`）、毛利、库存数量明细、Woo 后台链接 |

## 3. 已确认的决策

| 决策 | 选择 | 理由 |
|---|---|---|
| 受众 | 客户公开页 + 员工登录后的扩展视图，同一个 URL | 一张标签服务两种人，不用印两套 |
| 数据来源 | ABI Gateway，实时查询 | 单一数据源，不会出现「二维码页面价格和官网不一致」 |
| 二维码粒度 | 每个 SKU 一个二维码 | 标签可重复印刷、任意展厅通用；per-item 粒度的收益（扫码分析、单件备注）当前不需要 |
| 价格 | 客户可见 | |
| 库存 | 客户可见，显示真实数量 + 状态标签 | 纯数字对客户不友好，配合「有货 / 库存紧张 / 订制」文字 |
| 部署形态 | 独立 Next.js 应用，部署到 Coolify | |
| 客户页实现 | 自己渲染展厅专属页面（服务端，应用身份调 gateway） | |
| 员工登录 | Entra + MSAL（gateway 官方模板方案） | 无需发信服务、无需 session 表、权限来自 Entra App Role |
| 状态存储 | 无。v1 完全无状态，不部署数据库 | 唯一需要写入的功能（内部备注）已砍掉 |

## 4. 架构

**技术栈**：Next.js 15（App Router，服务端渲染）+ TypeScript + Tailwind CSS。部署到 Coolify（Docker）。无数据库。

### 4.1 两条数据通路

刻意分开，因为它们的信任边界不同。

```
客户（匿名）
  手机相机扫码 → GET /p/TAP-001-BB
    → Next.js 服务端 (Server Component)
    → Gateway，应用身份（client credentials；密钥仅存于服务端环境变量）
    → 字段白名单过滤
    → 渲染 HTML 返回

员工（已登录）
  同一个网址 → 页面底部「员工视图」区块（Client Component）
    → MSAL 弹窗登录（Microsoft 工作账号，公共客户端，无密钥）
    → 浏览器直接调 Gateway，携带该员工本人的 token
    → 渲染成本价、毛利、库存明细
```

**员工数据为什么不走服务端**：这样「谁能看成本价」完全由 Entra 的 App Role 决定，应用代码里没有任何一处需要自行判断权限。服务端进程永远不持有 `unitCost`——该字段只出现在一个已经通过 Entra 授权的浏览器里。若员工区块走服务端，就必须自己实现「此人是否有权看成本」的逻辑，等于自造安全漏洞。

### 4.2 Gateway 调用契约

**Base URL**
- dev：`https://gatewaydev.abiinteriors.com/api/v1`
- prod：`https://gateway.abiinteriors.com/api/v1`

**每个请求两个 header，都必需**

```
Authorization: Bearer <entra access token>
x-client-id: entra
```

`x-client-id: entra` 漏掉会导致 gateway 用 HS256 共享密钥去验证一个 RS256 的 Microsoft token，必然 401。遇到无法解释的 401，先查这个 header。

**公共 Entra 配置**（全部是公开值，来自 gateway skill 的 `template/config.js`）

| Key | Value |
|---|---|
| `CLIENT_ID` | `9bc8a435-2c4a-4b1d-bf20-ac25e14f8a50` |
| `TENANT_ID` | `2c42d7d8-136f-403a-b86e-e3836664a207` |
| `API_SCOPE` | `api://9bc8a435-2c4a-4b1d-bf20-ac25e14f8a50/access_as_user` |

**唯一使用的接口**：`GET /tyche/wooproducts/search/advanced`，需要 `products.read` App Role。

按 SKU 精确查询（专用的 `/tyche/wooproducts/sku` 接口不对 app 开放，会 403；下面的写法拿到同一条记录）：

```json
{"bool":{"filter":[
  {"term":{"region":"au"}},
  {"term":{"sku.keyword":"TAP-001-BB"}}
]}}
```

`query` 参数必须是 URL 编码后的 JSON 字符串：`?query=` + `encodeURIComponent(JSON.stringify(q))`。JSON 非法返回 `400 "Invalid query JSON"`。

必须遵守的三条：

1. **这个接口没有 `region` 参数**，区域只能写在 query 的 filter 里。漏掉会同时搜索 au/nz/uk 三个区域，返回错误记录。
2. **必须带 `computeBundlePrices=true`**（严格的字符串 `"true"`，`=1` 或 `=True` 无效）。套装产品自身的 `regularPrice` 存的是 `"0"`，不加这个参数所有套装都显示免费。
3. **禁止 `script` / `script_score`**，会返回 `400`。只用 `bool`/`term`/`match`/`range`/`match_all`。

**响应形状**：`{ "data": [ ...一页记录... ], "total": <全部匹配数> }`。按 SKU 查询预期 `total` 为 1；`total > 1` 视为数据异常（见 6.3）。

### 4.3 字段白名单 —— 事前排除，不是事后剥离

公开页请求 gateway 时用 `source=` 参数显式列出所需字段：

```
source=name,images,shortDescription,attributes,documents,bim,warrantyResults,
       regularPrice,salePrice,stockStatus,stockQuantity,colour,rainbowFamily,
       permalink,status,catalogVisibility
```

`unitCost` **不在列表中，因此根本不会进入服务端进程**。这比「全量获取后在模板层删除」安全得多——后者只要有人改动模板就可能泄露成本价到公网。

`id`、`region`、`wooId`、`sku`、`name`、`type` 由 gateway 强制返回，无法排除，也无敏感性。

### 4.4 凭证抽象 —— 隔离唯一的不确定点

```
lib/gateway/
  client.ts                    查询构造、重试、缓存（不关心凭证来源）
  token-provider.ts            interface TokenProvider { getToken(): Promise<string> }
  providers/
    client-credentials.ts      生产环境；依赖待批准的应用级授权
    static-token.ts            开发期；使用手工粘贴的员工 token（环境变量）
```

授权批准之前，用 `static-token.ts` 完成整个应用的开发和真实测试（`localhost` 已登记为 redirect URI，浏览器登录随时可用，token 有效期约 1 小时，开发期足够）。批准当天只替换 provider，其余代码不动。

若技术团队的答复是「gateway 的 entra 分支不接受应用专属 token」（见风险 1），则客户页临时降级为 302 跳转到该 SKU 的 `permalink`（官网产品页），员工功能不受影响，二维码和标签**无需重印**。

### 4.5 缓存

Next.js data cache，**每次页面访问只发一个 gateway 请求**，`revalidate = 60` 秒。

早期设计考虑过分两档 TTL（库存 60 秒、其余 10 分钟），已否决：那需要对同一个 SKU 发两个请求、维护两套 `source` 列表，而收益只是减少 gateway 调用量——展厅扫码的流量规模下这不是问题。统一 60 秒同时保证了库存的新鲜度。若日后 gateway 负载确实成为问题，再拆分。

缓存过期时 Next.js 会先返回旧数据再后台刷新（stale-while-revalidate），这正是 6.4 想要的行为。

## 5. 路由

| 路由 | 访问 | 说明 |
|---|---|---|
| `/p/[sku]` | 公开（员工登录后扩展） | 产品页。二维码指向此地址 |
| `/labels` | 需员工登录 | 二维码标签批量生成 |
| `/` | 公开 | 简短说明页 |

**二维码内容**：`https://<host>/p/<SKU>`，纯 URL，无参数。SKU 直接出现在路径里，因此标签生成不依赖任何持久化存储——给一批 SKU 就能出一批标签，任何时候可重印。

`[sku]` 段做大小写规范化（统一转大写）和字符白名单校验（`[A-Za-z0-9._-]`），不合法直接返回 404，不发起 gateway 调用。

## 6. 可见性规则与错误处理

### 6.1 未发布 / 隐藏产品

查询**故意不加 `status` 过滤**，这样员工扫描尚未上线的样品也能查到记录。随后按角色分别处理：

- **员工（已登录）**：正常显示，页面顶部加一个明显的「未发布 / 已隐藏」标记。
- **匿名客户**：若 `status != "publish"` 或 `catalogVisibility == "hidden"`，**不渲染产品信息**，改为显示「这件展品的资料尚未公开，请咨询展厅同事」。

展厅摆放未发布新品是常态，而把 draft 产品的价格暴露给客户不可接受。

### 6.2 SKU 不存在（`total == 0`）

友好的 404 页面：说明这个标签可能已过期或产品已下架，请咨询展厅同事。**不显示技术错误信息**——客户会看到这个页面。同时记录服务端日志（含 SKU），便于发现印错或过期的标签。

### 6.3 SKU 命中多条（`total > 1`）

按 SKU + region 精确查询理论上唯一。若返回多条：取第一条渲染，同时记 warning 日志（含 SKU 和命中数），因为这代表 Woo 里有重复 SKU，是需要人工处理的数据问题。

### 6.4 Gateway 不可用 / 超时

- 超时设 5 秒，失败重试 1 次（指数退避）。
- 仍失败 → 显示「暂时无法获取产品信息，请稍后重试或咨询展厅同事」页面，HTTP 状态 503。
- 有缓存的旧数据时优先展示旧数据并标注更新时间（stale-while-revalidate），好过展厅里出现一个错误页。

### 6.5 认证类错误（员工侧）

按 gateway 文档的诊断表，把三种情况区分清楚地告诉员工，不要笼统说「权限问题」：

| 现象 | 提示文案 |
|---|---|
| 401 | 登录已过期，请重新登录（MSAL 静默续期失败后自动弹窗） |
| 403 | 你的账号还没有 `products.read` 权限，请联系管理员为你所在的安全组分配 |
| Microsoft 拒绝登录 | 当前域名未登记为 redirect URI，属于配置问题，需管理员处理 |

## 7. 客户页内容与字段映射

| 展示项 | Gateway 字段 |
|---|---|
| 产品名称 | `name` |
| 表面处理 | `colour` |
| 主图 + 相册 | `images` |
| 卖点描述 | `shortDescription`（HTML，需过滤后渲染） |
| 规格表 | `attributes[]` |
| 保修 | `warrantyResults` |
| 价格 | `regularPrice`、`salePrice`（有 `salePrice` 时显示折扣价与原价） |
| 库存 | `stockStatus` + `stockQuantity`（状态标签 + 真实数量） |
| 资料下载 | `documents` |
| CAD / BIM | `bim` |
| 同系列其他表面处理 | `rainbowFamily` |
| 在线购买 | `permalink` |

**价格是字符串**。`regularPrice`/`salePrice`/`unitCost` 在索引里都是 keyword 字符串。这带来一条硬性约束：**绝不在 gateway query 里对这些字段做 `range` 过滤**，因为 OpenSearch 会按字典序比较，得出 `"100" < "99"` 这类错误结果。需要数值排序时用接口的 `sortBy=regularPrice|unitCost` 参数，由服务端正确解析。

在我们的应用内部把字符串 `parseFloat` 后用于展示格式化和毛利计算是允许且必要的（见第 8 节）——被禁止的是把字符串字段当数字塞进查询条件，两者不冲突。解析失败时该数值区块不显示，不显示 `NaN`。

`shortDescription` 是 HTML，渲染前必须做 sanitize（白名单标签），避免把 Woo 里的内容当作可信 HTML 直接注入。

`rainbowFamily` 是产品记录上的字段，可直接使用；专门的 `/tyche/productgroups/*` 接口不对 app 开放。若该字段为空则不显示这一区块。

## 8. 员工视图内容

员工区块**独立发起自己的 gateway 请求**，从浏览器直接调用，携带该员工本人的 Entra token。查询条件与公开页相同（`region` + `sku.keyword`），但 `source` 列表不同——这是唯一包含 `unitCost` 的请求，且它只存在于浏览器中：

```
source=sku,name,unitCost,regularPrice,salePrice,stockStatus,stockQuantity,status,catalogVisibility
```

| 展示项 | 来源 |
|---|---|
| 成本价 | `unitCost` |
| 毛利 / 毛利率 | 由 `regularPrice` 与 `unitCost` 在浏览器内计算（`parseFloat`，见第 7 节末） |
| 库存数量 | `stockQuantity` |
| 发布状态 | `status`、`catalogVisibility` |
| Woo 后台链接 | 由 `wooId` 拼接 |

因此一次「员工扫码」共产生两个 gateway 请求：服务端一个（应用身份，无成本字段）、浏览器一个（员工身份，含成本字段）。这是刻意的——它让权限边界和网络边界重合，便于审计。

## 9. 标签生成（`/labels`）

需员工登录。流程：

1. 员工粘贴一批 SKU（每行一个），或用关键词搜索产品后勾选（`/tyche/wooproducts/search`，`region=au`）。
2. 应用逐个校验 SKU 在 `au` 区域存在，列出无效 SKU 供修正——**避免印出扫不到的标签**。
3. 浏览器本地生成二维码（`qrcode` 库，纯客户端，不上传任何数据）。
4. 配合打印 CSS 输出 A4 标签页，每张标签含二维码、SKU、产品名称、表面处理。

标签内容完全由 SKU 决定，因此可随时重印，且不产生任何需要维护的状态。

## 10. 测试策略

| 层次 | 内容 |
|---|---|
| 单元 | query 构造（region 必在、`sku.keyword` 用 term）、`source` 白名单不含 `unitCost`、SKU 规范化与校验、价格格式化、毛利计算 |
| 单元 | 可见性规则：draft/hidden × 匿名/员工 四种组合的输出 |
| 集成（mock gateway） | `total == 0`、`total > 1`、超时、401、403、套装产品价格为 0 时 `computeBundlePrices` 生效 |
| 契约 | 用真实 dev gateway + 一个真实 SKU 跑一次，断言返回记录包含设计中依赖的所有字段。gateway 变更时这个测试先红 |
| 手工 | 真机扫码：iOS 相机、Android 相机各测一次，确认从扫码到看到内容的完整链路 |

契约测试特别重要：本设计依赖 `images`、`attributes`、`documents`、`bim`、`warrantyResults`、`rainbowFamily` 这些字段的存在与结构，而 gateway skill 的文档明确说「要看产品的完整形状，去取一条真实记录读它的键，不要相信记忆里的字段列表」。**实施第一步就是取一条真实 AU 产品记录，核对全部字段名与结构。**

## 11. 不在 v1 范围内

| 项 | 原因 |
|---|---|
| 员工内部备注 | gateway 只读，需自建数据库。为一个次要功能引入数据库不值得，等有实际需求再加 |
| 采购单 / 预计到货 | `/tyche/purchase-orders` 只对 `apiKeyUser` 开放，app 拿不到（需 Type 2 申请） |
| 多仓库库存 | gateway 只有单一 `stockQuantity` |
| 每件展品独立二维码（per-item） | 已评估并否决；需要注册流程和数据库，当前收益不足 |
| 扫码统计分析 | 依赖 per-item 粒度或额外埋点存储 |
| NZ / UK 区域 | 当前仅 `au`。未来加区域选择器即可，二维码无需重印 |
| 任何写操作 | app 可达的 4 个 gateway 接口全部只读 |

## 12. 外部依赖与阻塞项

**这三项都不是代码问题，且都会完全阻塞上线。**

| # | 项 | 类型 | 状态 |
|---|---|---|---|
| 1 | gateway 的 entra 分支是否接受 client credentials 应用专属 token | 待确认（Type 1 或 Type 2） | **需提交申请** |
| 2 | 生产域名登记为 SPA 类型 redirect URI | Entra 管理操作 | 待办 |
| 3 | `products.read` App Role 分配给部门安全组 | Type 1，Entra 管理操作 | **待补充组名** |

**需要 Owen 提供**：第 3 项的 Entra 安全组名称，以及该权限是给展厅团队还是全公司任何人。这个信息必须写在申请里，缺了技术团队无法执行。

### 申请草稿（待补齐组名后提交）

> **谁**：〔部门名〕，Entra 安全组〔组名待补〕
> **要什么**：
> 1. 请确认 gateway 的 `entra` 认证分支是否接受 client credentials（应用专属）token。我们要建一个展厅二维码应用，客户匿名扫码后由服务端代为查询产品数据，因此需要应用身份而非用户身份。若当前 `verifyEntraToken()` 假设 token 内含用户身份，这项需要 authorizer 侧改动（Type 2）；若已支持，则只需把 App Role 分配给 service principal（Type 1）。
> 2. `products.read` 分配给上述安全组（Type 1），供员工视图使用。
> 3. 生产域名登记为 SPA redirect URI。
>
> **读还是写**：只读。不需要任何写权限。
> **区域**：au
> **环境**：dev 和 prod 都要
> **谁会用**：客户页面对展厅所有到店客户（匿名）；员工视图仅限〔部门〕
> **为什么**：展厅每件展品贴二维码，客户扫码即看到准确的产品资料与价格，避免纸质标签过期；员工扫同一个码可查成本与库存。

## 13. 风险

**风险 1：client credentials 可能不被 gateway 接受。** 这是唯一可能改变工期的不确定点。文档把这种形态列为受支持，但 authorizer 的 `entraUser` 分支是围绕「签到的员工」设计的，App Role claim 在用户委派 token 与应用专属 token 中结构不同。缓解措施：凭证抽象（4.4）把影响面收敛到一个文件；降级方案（302 跳官网）已设计好，不影响二维码。

**风险 2：字段结构与文档不一致。** gateway skill 自己声明 `swagger.json` 在两处是错的/不完整的，并要求以真实记录为准。缓解措施：实施第一步取真实记录核对，并用契约测试锁定（第 10 节）。

**风险 3：成本价泄露到公网。** 缓解措施：`source` 白名单让 `unitCost` 不进服务端（4.3）；员工数据只经浏览器 + Entra 授权（4.1）。这两条是结构性的，不依赖某个开发者记得别写错模板。

**风险 4：展厅网络质量。** 客户手机走自己的移动网络，但页面重量仍需控制——图片用响应式尺寸与懒加载，首屏只加载主图。
