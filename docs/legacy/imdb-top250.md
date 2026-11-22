> **历史说明（已归一）**：原独立站点 `https://imdb-top250-movies.netlify.app` 已下线，对应榜单现由榜单中心统一提供：<https://ranking-hub.netlify.app/imdb/>。原仓库 `LesslsMore/imdb-top250` 已删除，代码与数据并入 <https://github.com/LesslsMore/ranking-hub>。本文件仅作历史记录保留。

# IMDb 电影 Top 250 · 静态榜单站

IMDb Top 250 电影榜（2026-11-21 快照）的完整中文榜单页：250 部影片的海报、中文名、英文原名、年份、IMDb 评分、评价人数、类型、片长、分级，支持搜索、按类型 / 年代筛选、多种排序、单部详情弹窗与深链。

- 在线：<https://ranking-hub.netlify.app/imdb/>
- 视频版：B站《【IMDb】2026年最新 Top250 电影排行榜》

## 结构

```
imdb-site/
├── index.html
├── netlify.toml
├── assets/
│   ├── css/style.css
│   ├── js/app.js
│   ├── data/imdb.json      # 96 KB / 250 条
│   ├── posters/*.webp      # 300×450，250 张共 6.2 MB
│   ├── favicon.svg
│   └── og.jpg              # 1200×630
└── README.md
```

零依赖、零构建、无 CDN、无字体外链、无追踪；`fetch` 单个 JSON，改数据不用改代码。

## 本地预览

```bash
python -m http.server 8788 --directory imdb-site
# 打开 http://127.0.0.1:8788/
```

> 不要用 `file://` 直接打开——`fetch` 会被 CORS 拦掉，表现为"页面空白"。

## 数据说明

| 项 | 说明 |
|---|---|
| 来源 | <https://www.imdb.com/chart/top/>（榜单页 `__NEXT_DATA__`） |
| 快照 | 2026-11-21 |
| 名次口径 | IMDb 官方 Top 250，按加权评分排序，**不是**纯星级排序 |
| 中文名 | IMDb 官方中文别名库（`title.akas` 数据集），14 部按大陆通行译名人工统一 |
| 简介 | IMDb 剧情简介英文原文 |

**关于排序**：250 部里有 30 处名次与星级不同序。例如 8.9 分的《进击的巨人 完结篇》排第 88（4.1 万人评分），而 8.2 分的《帝国的毁灭》排第 130（40.6 万人评分）；第 250 名《瓦塞浦黑帮》8.2 分高于第 249 名《圣女贞德蒙难记》8.1 分。

**关于片名**：库里只有英文或港台译名的 14 部（如《致命魔术》《美国往事》《禁闭岛》《两杆大烟枪》《砂之女》），按大陆通行译名改写；`IMDb_Top250_2026.csv` 的「中文名来源」列记录了每一条的取值来源。

## 重新生成

数据与海报由上游仓库的脚本生成（不在本仓库内）：

```bash
python video_build2/build_site.py     # 生成 assets/data/imdb.json + assets/posters/*.webp
```

## 部署

```bash
netlify deploy --prod --dir . --site-name imdb-top250-movies
```

`netlify.toml` 里 `publish = "."`，海报 7 天缓存、CSS/JS 1 小时、HTML 不缓存（改数据立刻生效）。

## 相关

- IMDb Top 250：<https://www.imdb.com/chart/top/>
- 姊妹项目：中文播客订阅榜 TOP 100 · <https://github.com/LesslsMore/podcast-top100>
