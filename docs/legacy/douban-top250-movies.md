> **历史说明（已归一）**：原独立站点 `https://douban-top250-movies.netlify.app` 已下线，对应榜单现由榜单中心统一提供：<https://ranking-hub.netlify.app/douban/>。原仓库 `LesslsMore/douban-top250-movies` 已删除，代码与数据并入 <https://github.com/LesslsMore/ranking-hub>。本文件仅作历史记录保留。

# 豆瓣电影 Top 250 · 静态榜单站

豆瓣电影 Top 250 榜（2026-11-21 快照）的完整中文榜单页：250 部影片的海报、片名、原名、年份、国家/地区、类型、导演、主演、豆瓣评分与评价人数，支持搜索、按类型 / 年代筛选、多种排序、单部详情弹窗与 `/#名次` 深链。

- 在线：<https://ranking-hub.netlify.app/douban/>
- 源码：<https://github.com/LesslsMore/ranking-hub>
- 视频版：B 站《【豆瓣】2026年最新 Top250 电影排行榜》

## 结构

```
site/
├── index.html
├── netlify.toml
├── README.md
├── assets/
│   ├── css/style.css
│   ├── js/app.js
│   ├── data/douban.json      # 94 KB / 250 条
│   ├── posters/*.webp        # 256px 宽，250 张共 4.7 MB
│   ├── favicon.svg
│   └── og.jpg                # 1200×630
└── .gitignore / .gitattributes
```

零依赖、零构建、无 CDN、无字体外链、无追踪；`fetch` 单个 JSON，改数据不用改代码。

## 本地预览

```bash
python -m http.server 8788 --directory site
# 打开 http://127.0.0.1:8788/
```

> 不要用 `file://` 直接打开——`fetch` 会被 CORS 拦掉，表现为“页面空白”。

## 数据说明

| 项 | 说明 |
|---|---|
| 来源 | <https://movie.douban.com/top250>（榜单页逐页 DOM 解析） |
| 快照 | 2026-11-21 |
| 名次口径 | 豆瓣官方 Top 250，按评分、评价人数等综合加权，**不是**纯星级排序 |
| 字段 | 片名、原名、年份、国家/地区、类型、导演、主演、评分、评价人数、一句话短评 |
| 海报 | 影片官方封面，版权归原版权方所有，本站仅作榜单展示 |

**关于排序**：豆瓣 Top 250 由官方综合评分与评价人数等因素生成，同一分数下评价人数更多的影片通常名次更靠前；本页名次、评分与评价人数均为当日页面快照，之后榜单可能已更新。

## 重新生成

数据与海报由上游脚本生成（不在本仓库内）：

```bash
python build_site.py     # 生成 assets/data/douban.json + assets/posters/*.webp
python gen_og.py         # 生成 assets/og.jpg
```

## 部署

```bash
# GitHub
gh repo create douban-top250-movies --public --source . --remote origin --push

# Netlify（CLI 部署不会自动绑定仓库；如需 push 自动构建，在 Netlify 后台连接 GitHub 仓库）
netlify deploy --prod --dir . --site-name douban-top250-movies
```

`netlify.toml` 里 `publish = "."`，海报 7 天缓存、CSS/JS 1 小时、HTML 不缓存（改数据立刻生效）。

## 相关

- 豆瓣电影 Top 250：<https://movie.douban.com/top250>
