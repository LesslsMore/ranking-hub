/* 榜单平台 · 共享渲染核心
 * 榜单差异全部由 assets/data/boards.json 下发的 config 决定，
 * 页面只需要在 body 上声明 data-board="douban|imdb|podcast"。
 */
(function () {
  "use strict";

  var BOARDS_URL = "/assets/data/boards.json";
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------- 导航 ---------------- */
  function renderNav(boards, current) {
    var tabs = $("nav-tabs");
    if (!tabs) return;
    tabs.innerHTML = boards.map(function (b) {
      var cur = b.slug === current ? ' aria-current="page"' : "";
      var style = b.slug === current ? ' style="--tab-accent:' + b.accent + '"' : "";
      return '<a class="nav-tab" href="/' + b.slug + '/"' + cur + style + ">" + esc(b.name) + "</a>";
    }).join("");
  }

  /* ---------------- 榜单页 ---------------- */
  function initBoard(boards) {
    var slug = document.body.dataset.board;
    var bar = boards.filter(function (b) { return b.slug === slug; })[0];
    if (!bar) return;

    document.documentElement.style.setProperty("--accent", bar.accent);

    var state = { q: "", facetIndex: {}, sort: "rank", data: null };
    var grid = $("grid");
    var chips = $("chips");
    var resultLine = $("result");
    var emptyBox = $("empty");
    var modal = $("modal");
    var lastFocused = null;
    var board = null;

    /* ---- 卡片 ---- */
    function cardHTML(it) {
      var top = it.rank <= 3 ? ' data-top="' + it.rank + '"' : "";
      var tag = it.tags && it.tags.length ? it.tags[0] : "";
      return [
        '<article class="card" data-rank="' + it.rank + '"' + top + ' tabindex="0" role="button"',
        ' aria-label="' + esc(it.title) + " 第 " + it.rank + ' 名">',
        '<div class="thumb">',
        '<img class="cover" src="' + esc(it.image) + '" alt="' + esc(it.title) + '" loading="lazy">',
        '<span class="rank">TOP ' + it.rank + "</span>",
        "</div>",
        '<div class="body">',
        '<h3 class="name">' + esc(it.title) + "</h3>",
        '<p class="en">' + esc(it.subtitle) + "</p>",
        '<p class="sub">' + (tag ? '<span class="genre">' + esc(tag) + "</span>" : "") +
          '<span class="yr">' + esc(it.dateText) + "</span></p>",
        '<p class="score"><strong>' + esc(it.metricText) + '</strong><span class="unit">' + esc(it.metricUnit) + "</span></p>",
        '<p class="meta">' + esc(it.meta) + "</p>",
        "</div>",
        "</article>"
      ].join("");
    }

    /* ---- 筛选 / 排序 ---- */
    function matchFacet(it, facet, value) {
      if (!value || value === "全部") return true;
      if (facet.key === "tag") return it.tags.indexOf(value) !== -1;
      if (facet.key === "decade") return it.dateN && (Math.floor(it.dateN / 10) * 10) + "s" === value;
      if (facet.key === "active") return value === "近 14 天有更新" ? !!it.active : !it.active;
      return true;
    }

    function filtered() {
      var q = state.q.trim().toLowerCase();
      return board.items.filter(function (it) {
        for (var i = 0; i < board.facets.length; i++) {
          if (!matchFacet(it, board.facets[i], state.facetIndex[i])) return false;
        }
        if (!q) return true;
        return [it.title, it.subtitle, it.meta, (it.tags || []).join(" ")]
          .join(" ").toLowerCase().indexOf(q) !== -1;
      });
    }

    function sorted(items) {
      var arr = items.slice();
      var cmp = {
        rank: function (a, b) { return a.rank - b.rank; },
        metric: function (a, b) { return b.metric - a.metric || a.rank - b.rank; },
        metric2: function (a, b) { return b.metric2 - a.metric2 || a.rank - b.rank; },
        date: function (a, b) { return b.dateN - a.dateN || a.rank - b.rank; },
        dateAsc: function (a, b) { return a.dateN - b.dateN || a.rank - b.rank; },
        eps: function (a, b) { return (b.eps || 0) - (a.eps || 0) || a.rank - b.rank; }
      }[state.sort];
      if (cmp) arr.sort(cmp);
      return arr;
    }

    function render() {
      var items = sorted(filtered());
      grid.innerHTML = items.map(cardHTML).join("");
      emptyBox.hidden = items.length > 0;

      var parts = ["共 " + items.length + (board.slug === "podcast" ? " 档" : " 部")];
      board.facets.forEach(function (f, i) {
        var v = state.facetIndex[i];
        if (v && v !== "全部") parts.push(f.label + "「" + v + "」");
      });
      if (state.q.trim()) parts.push("搜索「" + state.q.trim() + "」");
      resultLine.textContent = parts.join(" · ");
    }

    /* ---- 控件 ---- */
    function buildChips(facet, index) {
      chips.innerHTML = facet.values.map(function (v) {
        var pressed = (state.facetIndex[index] || "全部") === v.name ? "true" : "false";
        return '<button class="chip" type="button" data-i="' + index + '" data-v="' + esc(v.name) +
          '" aria-pressed="' + pressed + '">' + esc(v.name) +
          '<span class="n">' + v.count + "</span></button>";
      }).join("");
    }

    function buildSelects() {
      board.facets.forEach(function (facet, i) {
        if (facet.type !== "select") return;
        var slot = $("select-" + i);
        if (!slot) return;
        slot.innerHTML = '<span>' + esc(facet.label) + "</span><select data-i=\"" + i + '">' +
          facet.values.map(function (v) {
            return '<option value="' + esc(v.name) + '">' + esc(v.name) + "（" + v.count + "）</option>";
          }).join("") + "</select>";
      });
    }

    function buildSorts() {
      var sel = $("sort");
      sel.innerHTML = board.sorts.map(function (s) {
        return '<option value="' + s.key + '">' + esc(s.label) + "</option>";
      }).join("");
    }

    /* ---- 弹窗 ---- */
    function openModal(it) {
      lastFocused = document.activeElement;
      var poster = $("m-poster");
      poster.src = it.image;
      poster.alt = it.title;
      $("m-name").textContent = it.title;
      $("m-en").textContent = it.subtitle || "";
      $("m-rank").textContent = "TOP " + it.rank + " · " + board.name + "第 " + it.rank + " 名";
      $("m-score").textContent = it.metricText;
      $("m-score-unit").textContent = it.metricUnit;

      $("m-tags").innerHTML = (it.tags || []).map(function (t) {
        return '<span class="genre">' + esc(t) + "</span>";
      }).join("") +
        '<span class="yr">' + esc(it.dateText) + (it.region ? " · " + esc(it.region) : "") + "</span>";

      var pairs = Object.keys(it.extra || {}).map(function (k) { return [k, it.extra[k]]; });
      $("m-stats").innerHTML = pairs.filter(function (p) {
        return p[0] !== "剧情简介" && p[0] !== "一句话短评";
      }).map(function (p) {
        return "<div><dt>" + esc(p[0]) + "</dt><dd>" + esc(p[1]) + "</dd></div>";
      }).join("");

      var plot = $("m-plot");
      var quote = (it.extra && (it.extra["一句话短评"] || it.extra["剧情简介"])) || "";
      if (quote) {
        plot.innerHTML = '<span class="plot-label">' +
          (it.extra["一句话短评"] ? "一句话短评" : "剧情简介 · IMDb 英文原文") +
          "</span>" + esc(quote);
        plot.hidden = false;
      } else {
        plot.hidden = true;
      }

      $("m-links").innerHTML =
        (it.link ? '<a class="primary" href="' + esc(it.link) + '" target="_blank" rel="noopener">' +
          esc(it.linkLabel || "查看原页") + "</a>" : "") +
        '<a href="#' + it.rank + '" id="m-copy">复制本片链接</a>';

      modal.hidden = false;
      document.body.style.overflow = "hidden";
      history.replaceState(null, "", "#" + it.rank);
      $("modal-close").focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = "";
      history.replaceState(null, "", location.pathname + location.search);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function openFromHash() {
      var m = location.hash.match(/^#(\d{1,3})$/);
      if (!m) return;
      var it = board.items.filter(function (x) { return x.rank === Number(m[1]); })[0];
      if (it) openModal(it);
    }

    /* ---- 事件 ---- */
    var timer;
    var qInput = $("q");
    qInput.addEventListener("input", function (e) {
      clearTimeout(timer);
      var v = e.target.value;
      timer = setTimeout(function () { state.q = v; render(); }, 120);
    });

    chips.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      var i = Number(btn.dataset.i);
      state.facetIndex[i] = btn.dataset.v;
      buildChips(board.facets[i], i);
      render();
    });

    document.addEventListener("change", function (e) {
      var sel = e.target.closest("select[data-i]");
      if (sel) {
        var i = Number(sel.dataset.i);
        state.facetIndex[i] = sel.value;
        render();
        return;
      }
      if (e.target.id === "sort") { state.sort = e.target.value; render(); }
    });

    grid.addEventListener("click", function (e) {
      var card = e.target.closest(".card");
      if (!card) return;
      var rank = Number(card.dataset.rank);
      var it = board.items.filter(function (x) { return x.rank === rank; })[0];
      if (it) openModal(it);
    });

    grid.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var card = e.target.closest(".card");
      if (!card) return;
      e.preventDefault();
      card.click();
    });

    $("modal-close").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });
    window.addEventListener("hashchange", openFromHash);

    modal.addEventListener("click", function (e) {
      var a = e.target.closest("#m-copy");
      if (!a) return;
      e.preventDefault();
      var url = location.origin + location.pathname + location.hash;
      var done = function () { a.textContent = "已复制链接"; setTimeout(function () { a.textContent = "复制本片链接"; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { window.prompt("复制链接", url); });
      } else {
        window.prompt("复制链接", url);
      }
    });

    /* ---- 启动 ---- */
    fetch("/assets/data/" + slug + ".json")
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (data) {
        board = data;

        // 搜索占位符来自榜单配置
        if (data.searchHint) $("q").placeholder = data.searchHint;

        // 头部元信息
        var head = $("head-note");
        if (head) head.innerHTML = "<span>数据来源：" + esc(data.source) + "</span><span>抓取时间：" + esc(data.snapshot) + "</span>";

        // 统计卡
        $("stats").innerHTML = data.stats.map(function (s) {
          return '<div class="stat"><span class="stat-num">' + esc(s.num) +
            '</span><span class="stat-label">' + esc(s.label) + "</span></div>";
        }).join("");

        // 筛选：第一个用 chips，其余的用下拉
        data.facets.forEach(function (f, i) {
          if (f.type === "chips") buildChips(f, i);
        });
        data.facets.forEach(function (f) {
          if (f.type === "select") {
            var holder = document.createElement("label");
            holder.className = "sort";
            holder.id = "select-" + data.facets.indexOf(f);
            document.querySelector(".controls").insertBefore(holder, document.querySelector(".controls").lastElementChild);
          }
        });
        buildSelects();
        buildSorts();
        render();
        openFromHash();
      })
      .catch(function (err) {
        resultLine.textContent = "数据加载失败：" + err.message;
        emptyBox.hidden = false;
        emptyBox.textContent = "数据加载失败，请刷新页面重试。";
      });
  }

  /* ---------------- 首页 ---------------- */
  function initHome(boards) {
    var wrap = $("board-cards");
    if (!wrap) return;
    wrap.innerHTML = boards.map(function (b) {
      var rows = (b.top || []).map(function (t) {
        return '<div class="bc-row"><span class="r">' + t.rank + "</span>" +
          '<img src="' + esc(t.image) + '" alt="" decoding="async">' +
          '<span class="t">' + esc(t.title) + "</span>" +
          '<span class="v">' + esc(t.metricText) + (t.metricUnit ? "<small>" + esc(t.metricUnit) + "</small>" : "") + "</span></div>";
      }).join("");
      return '<a class="board-card" href="/' + b.slug + '/" data-card="' + b.card + '" style="--bc:' + b.accent + '">' +
        '<div class="bc-head"><span class="bc-accent"></span>' +
        '<h2 class="bc-title">' + esc(b.title) + "</h2>" +
        '<span class="bc-meta">' + b.count + " 条 · " + esc(b.snapshot) + "</span></div>" +
        '<div class="bc-list">' + rows + "</div>" +
        '<span class="bc-go">进入榜单 →</span></a>';
    }).join("");
  }

  /* ---------------- 启动 ---------------- */
  fetch(BOARDS_URL)
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (meta) {
      var current = document.body.dataset.board || "";
      renderNav(meta.boards, current);
      if (current) initBoard(meta.boards);
      else initHome(meta.boards);
    })
    .catch(function (err) {
      var line = $("result");
      if (line) line.textContent = "榜单索引加载失败：" + err.message;
    });
})();
