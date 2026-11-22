# 榜单中心 · Ranking Hub

把结构相同的公开榜单收进同一个站点：一套渲染内核 + 每个榜单一份配置 + 一份统一格式的数据。

| 子路径 | 榜单 | 条数 | 数据快照 | 强调色 |
| --- | --- | --- | --- | --- |
| `/` | 平台首页（三榜入口 + 各自 TOP5） | — | — | 三色 |
| `/douban/` | 豆瓣电影 Top 250 | 250 | 2026-11-21 | `#00b51d` |
| `/imdb/` | IMDb 电影 Top 250 | 250 | 2026-11-21 | `#c79100` |
| `/podcast/` | 中文播客订阅榜 Top 100 | 100 | 2026-11-09 | `#7a5cff` |

纯静态、无框架、无外链 CDN，直接 `http.server` 就能跑。

## 本地预览

```bash
cd ranking-hub
python -m http.server 8790 --bind 127.0.0.1
# http://127.0.0.1:8790/
```

任意静态托管（Netlify / GitHub Pages / Vercel / 对象存储）都能直接部署，子目录结构原样上传即可。

## 目录结构

```
ranking-hub/
├── index.html              首页（由 tools/gen_pages.py 生成）
├── douban/index.html       榜页，各自 title/description/OG
├── imdb/index.html
├── podcast/index.html
├── assets/
│   ├── css/style.css       全站唯一样式表，--accent 由榜级 class 覆盖
│   ├── js/core.js          唯一渲染内核，靠 body[data-board] 分流
│   ├── data/boards.json    榜级配置（名称、单位、统计卡、分面、排序）
│   ├── data/douban.json    榜单条目（统一 schema）
│   ├── data/imdb.json
│   ├── data/podcast.json
│   └── media/{douban,imdb,podcast}/*.webp   海报 256 宽 / 播客方图 256×256
├── netlify.toml            缓存策略（media 7d、data 10min、html 不缓存）
└── favicon.svg
```

## 数据模型

每个条目共用一套骨架，差异字段丢进 `extra`：

```
rank  title  subtitle  image  metric  metricText  metricUnit
metric2  metric2Text  metric2Label  tags  dateN  dateText
region  meta  extra{...}  link  linkLabel
```

- `metric` 是主指标（评分 / 订阅数），用于排序与大字显示；`metric2` 是副指标（评价人数 / 集数）。
- `meta` 是卡片底部一行摘要，例如「337万人评价 · 美国」「87 集 · 约 23.6 天/期」。
- `extra` 是弹窗里的键值块（导演 / 主演 / 国家 / 一句话短评…），键名即中文标签。

榜单级配置在 `boards.json`，一张榜一个对象：

```
slug  name  title  fullTitle  desc  source  accent  card(poster|logo)
count  snapshot  stats[4]  facets[]  sorts[]  searchHint
```

分面（`facets`）和排序项（`sorts`）都从这里来，所以加一张榜不需要动 JS。

## 加一张新榜

1. 在 `tools/normalize.py` 里加一个源数据的映射函数，输出统一 schema；
2. 给它一份 board 配置（强调色、单位、统计卡、分面、排序）；
3. `python tools/normalize.py && python tools/gen_pages.py`；
4. 需要新卡片形态时，在 `style.css` 里加 `.board-<slug> .thumb{...}` 一类的覆盖。

## 交互

- 搜索：片名 / 原名 / 导演 / 主演 / 类型，即时过滤。
- 分面：类型 / 分类 chips + 年代 / 更新状态下拉。
- 排序：按名次、按评分、按人数 / 集数。
- 详情：点卡片开弹窗，`#1` 这样的深链可以直接跳转到某一名次。
