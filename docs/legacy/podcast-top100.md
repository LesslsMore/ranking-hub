> **历史说明（已归一）**：原独立站点 `https://podcast-top100.netlify.app` 已下线，对应榜单现由榜单中心统一提供：<https://ranking-hub.netlify.app/podcast/>。原仓库 `LesslsMore/podcast-top100` 已删除，代码与数据并入 <https://github.com/LesslsMore/ranking-hub>。本文件仅作历史记录保留。

# 中文播客订阅榜 TOP 100 · 静态站点

| | |
|---|---|
| 🌐 在线站点 | https://ranking-hub.netlify.app/podcast/ |
| 🎬 视频版（B站） | https://www.bilibili.com/video/BV1GeytzfEiN/ |
| 📦 源码仓库 | https://github.com/LesslsMore/ranking-hub |
| 📊 数据来源 | 小宇宙（经「中文播客榜」聚合），快照 2026-11-09 |

一个零依赖的静态网站，用来浏览「中文播客订阅量 TOP 100」榜单。视觉沿用视频封面的浅色卡片风格：白卡片、大字号订阅数、前三名金/银/铜色标线。

配套的 B站 榜单视频就是用同一份数据渲染的（从第 100 名倒数到第 1 名），站点里的每个条目和视频里的卡片一一对应。

- 数据：小宇宙（经「中文播客榜」聚合），快照 2026-11-09
- 技术：纯 HTML + CSS + 原生 JS，无框架、无构建步骤
- 体积：页面 + 数据 + 100 张封面 ≈ 1.2 MB

## 功能

- **桌面端**：横版卡片（左封面 + 右信息），1920 宽 3 列，≤1360 变 2 列
- **移动端**：≤960 切换为 2 列瀑布流（JS 计算行跨度，保持 1→100 的排名顺序，不打乱阅读次序）
- 关键词搜索（节目名 / 主播 / 分类）
- 分类筛选（33 个分类，横向滚动 chips）
- 排序：名次 / 订阅量 / 集数 / 更新频率 / 最近更新
- 点击卡片打开详情：订阅量、集数、更新间隔、平均播放、打开率、评论、时长、首更、Apple 中国区排名，以及小宇宙 / Apple / RSS 三个外链
- 深链 `/#12` 直达第 12 名，可分享
- 键盘可用（Tab 聚焦卡片，Enter 打开，Esc 关闭）

## 本地预览

```bash
# 任意静态服务器都行，别用 file:// 直接打开（fetch 会被浏览器拦住）
python -m http.server 8777
# 然后访问 http://127.0.0.1:8777/
```

## 目录结构

```
podcast-site/
├── index.html
├── netlify.toml
├── assets/
│   ├── css/style.css
│   ├── js/app.js
│   ├── data/podcasts.json      # 榜单数据（100 条）
│   ├── logos/001.webp …        # 封面图，256×256 WebP
│   ├── favicon.svg
│   └── og.jpg                  # 社交分享图 1200×630
└── README.md
```

## 发布到 GitHub

```bash
cd podcast-site
git init
git add .
git commit -m "feat: 中文播客订阅榜 TOP 100 静态站点"
git branch -M main
git remote add origin https://github.com/<你的账号>/<仓库名>.git
git push -u origin main
```

## 部署到 Netlify

**方式 A：连接 Git 仓库（推荐，之后每次 push 自动部署）**

1. 登录 Netlify → Add new site → Import an existing project
2. 选择 GitHub → 选中刚才的仓库
3. Build command 留空，Publish directory 填 `.`（`netlify.toml` 里已写好）
4. Deploy，几十秒后拿到 `https://<随机名>.netlify.app`
5. 想换域名：Site settings → Domain management → 添加自定义域名

**方式 B：直接拖文件夹（最快，适合先看效果）**

1. Netlify 首页 → 把整个 `podcast-site` 文件夹拖进 Deploy 区域
2. 立刻得到一个可访问链接，无需 Git

## 更新榜单数据

榜单每周一更新。重新跑一遍生成脚本即可（脚本在仓库上一级的 `video_build/` 里）：

```bash
python video_build/build_site.py   # 重新生成 podcasts.json 与 WebP 封面
```

`build_site.py` 读取同目录的 `中文播客订阅榜Top100.csv`，输出到 `podcast-site/assets/`。改完 commit + push，Netlify 会自动重新发布。

## 数据口径

- **订阅数**：站点未直接公开订阅数，按「平均打开率 = 平均播放量 ÷ 订阅用户数」反推（平均播放量 ÷ 平均打开率），为估算值
- **平均值**：播放、评论、打开率、时长、更新间隔均取最近 15 期计算
- **分类**：主播在 Apple Podcast 提交的一级分类，颗粒度偏细
- **覆盖**：只含「有 RSS 且被小宇宙 / Apple 收录」的节目，站内独家或付费节目会缺失

## 许可

页面代码可自由使用；榜单数据版权归各节目与平台所有，转载时请注明数据来源（小宇宙 / 中文播客榜）。
