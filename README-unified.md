# 榜单站归一说明

## 现状（2026-11-22 起）

**唯一源 = `ranking-hub/`**（本目录）。它把三个榜收在一个站点里：

```
ranking-hub/
├── index.html                首页「榜单中心」
├── douban/index.html         豆瓣 Top250
├── imdb/index.html           IMDb Top250
├── podcast/index.html        中文播客榜 TOP100
├── assets/css/style.css
├── assets/js/core.js         四页共用渲染内核（按 body[data-board] 取数）
├── assets/data/boards.json   榜单配置（颜色、标题、Top5 预览）
├── assets/data/{douban,imdb,podcast}.json   全量数据
├── assets/media/{...}/*.webp  600 张海报
└── netlify.toml              publish = "."，可单独部署
```

线上：<https://lesslsmore-rank.netlify.app>（site id `c4f2174d-1042-45ba-8692-0972edb72b33`）

主站 `https://lesslsmore.netlify.app` 里的 `/rank/` 是它的**带前缀副本**，由 `../scripts/build-preview.mjs`
自动搬入并改写 `/assets/` → `/rank/assets/`，不要再单独手改 `preview/rank/`。

## 被取代的三个旧站（已归一，不再维护）

| GitHub 仓库 | Netlify 站点 | 内容 |
|---|---|---|
| `LesslsMore/douban-top250-movies` | `douban-top250-movies.netlify.app` | 只有豆瓣一榜 |
| `LesslsMore/imdb-top250` | `imdb-top250-movies.netlify.app` | 只有 IMDb 一榜 |
| `LesslsMore/podcast-top100` | `podcast-top100.netlify.app` | 只有播客一榜 |

这三套页面是早期分开的样式（每页 4.7–5.4KB，各自独立），已经被 `ranking-hub` 的
「同一套渲染内核 + 三份配置」取代。它们的榜单数据已经并入
`assets/data/douban.json` / `imdb.json` / `podcast.json`，代码不再需要保留。

## 本地如何复现

```bat
cd E:\T\Documents\VSCode\1-github
node scripts/build-preview.mjs
netlify deploy --prod --site 3382c8f1-fd9d-4710-987a-44aa1d5a8549   :: 主站（含 /rank/ 副本）
```

单独发布榜单站（不经过主站）：

```bat
cd E:\T\Documents\VSCode\1-github\03-ranking-douban\ranking-hub
netlify deploy --prod --site c4f2174d-1042-45ba-8692-0972edb72b33
```
