/* app.js — 每日记录 · 视图路由 / 径向菜单 / 交互（原型） */
(function () {
  'use strict';

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  var WEEK = ['日', '一', '二', '三', '四', '五', '六'];
  var MOODS = [null,
    { icon: 'angry', label: '很糟' },
    { icon: 'frown', label: '低落' },
    { icon: 'meh', label: '平静' },
    { icon: 'smile', label: '不错' },
    { icon: 'laugh', label: '很好' }
  ];
  var TITLES = { today: '今日', calendar: '日历', stats: '统计', search: '搜索' };

  var state = {
    view: 'today',
    calCursor: new Date(),
    calMode: 'grid',
    search: { q: '', from: '', to: '', tags: [] },
    draft: { mood: 3, tags: [], text: '' }
  };

  var root, phone;

  /* ---------- 工具 ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function cnDate(ds) { var p = ds.split('-'); return p[0] + '.' + p[1] + '.' + p[2]; }
  function weekday(ds) { var p = ds.split('-'); return WEEK[new Date(+p[0], +p[1] - 1, +p[2]).getDay()]; }
  function icons() { if (window.lucide) window.lucide.createIcons(); }

  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1600);
  }

  function openMenu() { phone.dataset.menu = 'open'; }
  function closeMenu() { phone.dataset.menu = 'closed'; }

  function setView(v) {
    state.view = v;
    $('#view-title').textContent = TITLES[v];
    $$('.r-item').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-target') === v);
    });
    closeMenu();
    render();
  }

  function emptyState(icon, text) {
    return '<section class="card empty"><i data-lucide="' + icon + '"></i><p>' + text + '</p></section>';
  }

  /* ---------- 时间线 / 搜索结果共用行 ---------- */
  function dayRow(e, showMonth) {
    var tagsHtml = e.tags.map(function (t) { return '<span class="mini-tag">' + esc(t) + '</span>'; }).join('');
    var thumb = e.photo ? '<img class="tl-thumb" src="' + e.photo + '" alt="当天的照片">' : '';
    var dayNum = showMonth ? e.date.slice(5).replace('-', '.') : String(+e.date.slice(8));
    return '<button class="tl-row" data-day="' + e.date + '">' +
      '<span class="tl-d"><b class="' + (showMonth ? 'sm' : '') + '">' + dayNum + '</b><i>周' + weekday(e.date) + '</i></span>' +
      '<span class="tl-body">' +
        '<span class="tl-mood"><i data-lucide="' + MOODS[e.mood].icon + '"></i>' + MOODS[e.mood].label + '</span>' +
        '<span class="tl-text">' + esc(e.text) + '</span>' +
        '<span class="tl-tags">' + tagsHtml + '</span>' +
      '</span>' + thumb + '</button>';
  }

  /* ---------- 今日 ---------- */
  function renderToday() {
    var t = new Date();
    var html =
      '<section class="hero">' +
        '<p class="hero-ym">' + t.getFullYear() + ' 年 ' + (t.getMonth() + 1) + ' 月</p>' +
        '<h2 class="hero-date">' + pad(t.getMonth() + 1) + '<em>.</em>' + pad(t.getDate()) + '</h2>' +
        '<p class="hero-sub">周' + WEEK[t.getDay()] + ' · 记录的第 ' + DB.dayIndex() + ' 天</p>' +
      '</section>' +
      '<section class="card">' +
        '<h3 class="card-label">今日心情</h3>' +
        '<div class="moods">' + MOODS.slice(1).map(function (m, i) {
          return '<button class="mood' + (state.draft.mood === i + 1 ? ' on' : '') + '" data-mood="' + (i + 1) + '" aria-label="' + m.label + '">' +
            '<i data-lucide="' + m.icon + '"></i><span>' + m.label + '</span><span class="mood-bar"></span></button>';
        }).join('') + '</div>' +
      '</section>' +
      '<section class="card">' +
        '<h3 class="card-label">标签</h3>' +
        '<div class="chips">' + DB.allTags().map(function (tg) {
          var on = state.draft.tags.indexOf(tg) >= 0;
          return '<button class="chip' + (on ? ' on' : '') + '" data-tag="' + esc(tg) + '">' + esc(tg) + '</button>';
        }).join('') + '</div>' +
      '</section>' +
      '<section class="card">' +
        '<h3 class="card-label">记录</h3>' +
        '<textarea class="ta" id="ta" placeholder="今天发生了什么……">' + esc(state.draft.text) + '</textarea>' +
      '</section>' +
      '<section class="card">' +
        '<h3 class="card-label">照片</h3>' +
        '<button class="photo-add" id="photo-add"><i data-lucide="camera"></i><span>添加一张照片</span></button>' +
      '</section>' +
      '<button class="btn btn-primary" id="save-btn"><i data-lucide="check"></i>保存今日记录</button>';

    root.innerHTML = html;
    icons();

    $$('.mood').forEach(function (b) {
      b.addEventListener('click', function () { state.draft.mood = +b.getAttribute('data-mood'); render(); });
    });
    $$('.chip').forEach(function (b) {
      b.addEventListener('click', function () {
        var tag = b.getAttribute('data-tag');
        var i = state.draft.tags.indexOf(tag);
        if (i >= 0) state.draft.tags.splice(i, 1); else state.draft.tags.push(tag);
        render();
      });
    });
    $('#ta').addEventListener('input', function () { state.draft.text = this.value; });
    $('#photo-add').addEventListener('click', function () { toast('原型演示：照片上传为 stub'); });
    $('#save-btn').addEventListener('click', function () { toast('已记录 · 原型演示'); });
  }

  /* ---------- 日历（月历 / 时间线） ---------- */
  function moveMonth(delta) {
    state.calCursor = new Date(
      state.calCursor.getFullYear(),
      state.calCursor.getMonth() + delta, 1
    );
    render();
  }

  function renderGrid(y, m) {
    var offset = (new Date(y, m, 1).getDay() + 6) % 7; // 周一起始
    var days = new Date(y, m + 1, 0).getDate();
    var cells = '';
    for (var i = 0; i < offset; i++) cells += '<span class="cal-cell"></span>';
    for (var d = 1; d <= days; d++) {
      var ds = y + '-' + pad(m + 1) + '-' + pad(d);
      var has = !!DB.getDay(ds);
      var future = ds > DB.todayStr;
      cells += '<button class="cal-cell cal-day' +
        (future ? ' dim' : '') +
        (ds === DB.todayStr ? ' today' : '') + '"' +
        ' data-day="' + ds + '"' + (future ? ' disabled' : '') + '>' +
        '<span>' + d + '</span>' + (has ? '<span class="dot"></span>' : '') +
        '</button>';
    }
    return '<section class="card">' +
      '<div class="cal-dows">' + ['一', '二', '三', '四', '五', '六', '日'].map(function (w) {
        return '<span>' + w + '</span>';
      }).join('') + '</div>' +
      '<div class="cal-grid">' + cells + '</div>' +
    '</section>' +
    '<p class="cal-hint">圆点表示当天留有记录 · 点击任意日期查看</p>';
  }

  function renderTimeline() {
    var list = DB.getAll();
    if (!list.length) return emptyState('feather', '还没有任何记录');
    var html = '', lastYm = '';
    list.forEach(function (e) {
      var ym = e.date.slice(0, 7);
      if (ym !== lastYm) {
        lastYm = ym;
        html += '<p class="tl-group">' + e.date.slice(0, 4) + ' 年 ' + (+e.date.slice(5, 7)) + ' 月</p>';
      }
      html += dayRow(e, false);
    });
    return '<section class="tl">' + html + '</section>';
  }

  function renderCalendar() {
    var y = state.calCursor.getFullYear(), m = state.calCursor.getMonth();
    var html =
      '<section class="card">' +
        '<div class="cal-head">' +
          '<button class="icon-btn" id="cal-prev" aria-label="上个月"><i data-lucide="chevron-left"></i></button>' +
          '<span class="cal-title">' + y + ' 年 ' + (m + 1) + ' 月</span>' +
          '<button class="icon-btn" id="cal-next" aria-label="下个月"><i data-lucide="chevron-right"></i></button>' +
        '</div>' +
        '<div class="seg">' +
          '<button data-mode="grid" class="' + (state.calMode === 'grid' ? 'on' : '') + '">月历</button>' +
          '<button data-mode="list" class="' + (state.calMode === 'list' ? 'on' : '') + '">时间线</button>' +
        '</div>' +
      '</section>';

    html += state.calMode === 'grid' ? renderGrid(y, m) : renderTimeline();
    root.innerHTML = html;
    icons();

    $('#cal-prev').addEventListener('click', function () { moveMonth(-1); });
    $('#cal-next').addEventListener('click', function () { moveMonth(1); });
    $$('.seg button').forEach(function (b) {
      b.addEventListener('click', function () { state.calMode = b.getAttribute('data-mode'); render(); });
    });
    $$('.cal-day:not(.dim)').forEach(function (c) {
      c.addEventListener('click', function () { openDay(c.getAttribute('data-day')); });
    });
    $$('.tl-row').forEach(function (r) {
      r.addEventListener('click', function () { openDay(r.getAttribute('data-day')); });
    });
  }

  /* ---------- 统计 ---------- */
  function renderStats() {
    var s = DB.getStats();
    var moodMax = Math.max.apply(null, s.moodDist);
    var moodRows = s.moodDist.map(function (c, i) {
      var pct = moodMax ? Math.round(c / moodMax * 100) : 0;
      return '<div class="mood-row">' +
        '<span class="mood-name">' + MOODS[i + 1].label + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="width:' + pct + '%"></span></span>' +
        '<span class="bar-n">' + c + ' 天</span>' +
      '</div>';
    }).join('');

    var tagRows = s.tagRank.map(function (r, i) {
      return '<div class="tag-rank-row">' +
        '<span class="rank-n">' + (i + 1) + '</span>' +
        '<span class="rank-tag">' + esc(r.tag) + '</span>' +
        '<span class="bar-track slim"><span class="bar-fill" style="width:' + r.pct + '%"></span></span>' +
        '<span class="bar-n">' + r.count + '</span>' +
      '</div>';
    }).join('');

    root.innerHTML =
      '<section class="kpis">' +
        '<div class="kpi card"><span class="kpi-l"><i data-lucide="calendar-check"></i>累计记录</span><span class="kpi-v">' + s.total + '<em>天</em></span></div>' +
        '<div class="kpi card"><span class="kpi-l"><i data-lucide="flame"></i>连续记录</span><span class="kpi-v">' + s.streak + '<em>天</em></span></div>' +
        '<div class="kpi card"><span class="kpi-l"><i data-lucide="target"></i>本月完成</span><span class="kpi-v">' + s.monthRate + '<em>%</em></span></div>' +
        '<div class="kpi card"><span class="kpi-l"><i data-lucide="image"></i>记录照片</span><span class="kpi-v">' + s.photos + '<em>张</em></span></div>' +
      '</section>' +
      '<p class="group-label">心情分布</p>' +
      '<section class="card">' + moodRows + '</section>' +
      '<p class="group-label">常用标签</p>' +
      '<section class="card">' + tagRows + '</section>';
    icons();
  }

  /* ---------- 搜索 ---------- */
  var debounceTimer = null;

  function renderResults() {
    var el = $('#results');
    if (!el) return;
    var res = DB.search(state.search.q, state.search.from, state.search.to, state.search.tags);
    if (!res.length) {
      el.innerHTML = emptyState('search-x', '没有找到相关的记录');
    } else {
      el.innerHTML =
        '<p class="res-count">共 ' + res.length + ' 条记录</p>' +
        '<section class="tl">' + res.map(function (e) { return dayRow(e, true); }).join('') + '</section>';
      $$('.tl-row', el).forEach(function (r) {
        r.addEventListener('click', function () { openDay(r.getAttribute('data-day')); });
      });
    }
    icons();
  }

  function renderSearch() {
    root.innerHTML =
      '<section class="card">' +
        '<div class="search-row">' +
          '<span class="search-ic"><i data-lucide="search"></i></span>' +
          '<input class="inp" id="sq" placeholder="搜索记录内容…" value="' + esc(state.search.q) + '">' +
        '</div>' +
        '<div class="date-row">' +
          '<input type="date" class="inp" id="sfrom" value="' + state.search.from + '" aria-label="开始日期">' +
          '<span class="dash">—</span>' +
          '<input type="date" class="inp" id="sto" value="' + state.search.to + '" aria-label="结束日期">' +
        '</div>' +
        '<div class="chips">' + DB.allTags().map(function (tg) {
          var on = state.search.tags.indexOf(tg) >= 0;
          return '<button class="chip' + (on ? ' on' : '') + '" data-tag="' + esc(tg) + '">' + esc(tg) + '</button>';
        }).join('') + '</div>' +
      '</section>' +
      '<div id="results"></div>';

    $('#sq').addEventListener('input', function () {
      state.search.q = this.value;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(renderResults, 120);
    });
    $('#sfrom').addEventListener('change', function () { state.search.from = this.value; renderResults(); });
    $('#sto').addEventListener('change', function () { state.search.to = this.value; renderResults(); });
    $$('.chip').forEach(function (b) {
      b.addEventListener('click', function () {
        var tag = b.getAttribute('data-tag');
        var i = state.search.tags.indexOf(tag);
        if (i >= 0) { state.search.tags.splice(i, 1); b.classList.remove('on'); }
        else { state.search.tags.push(tag); b.classList.add('on'); }
        renderResults();
      });
    });

    renderResults();
  }

  /* ---------- 日详情覆盖层 ---------- */
  function openDay(ds) {
    var e = DB.getDay(ds);
    var p = ds.split('-');
    var inner;

    if (e) {
      inner =
        '<div class="hero">' +
          '<p class="hero-ym">' + p[0] + ' 年 ' + (+p[1]) + ' 月</p>' +
          '<h2 class="hero-date">' + p[1] + '<em>.</em>' + p[2] + '</h2>' +
          '<p class="hero-sub">周' + weekday(ds) + ' · ' + esc(e.weather) + '</p>' +
        '</div>' +
        '<section class="card day-meta">' +
          '<span class="day-mood"><i data-lucide="' + MOODS[e.mood].icon + '"></i>' + MOODS[e.mood].label + '</span>' +
          '<span class="chips-inline">' + e.tags.map(function (t) {
            return '<span class="mini-tag">' + esc(t) + '</span>';
          }).join('') + '</span>' +
        '</section>' +
        (e.photo ? '<img class="day-photo" src="' + e.photo + '" alt="当天的照片">' : '') +
        '<section class="card"><p class="day-text">' + esc(e.text) + '</p></section>';
    } else {
      inner =
        '<div class="hero">' +
          '<p class="hero-ym">' + p[0] + ' 年 ' + (+p[1]) + ' 月</p>' +
          '<h2 class="hero-date">' + p[1] + '<em>.</em>' + p[2] + '</h2>' +
          '<p class="hero-sub">周' + weekday(ds) + '</p>' +
        '</div>' +
        emptyState('feather', '这一天，还没有留下记录');
    }

    $('#sheet-date').textContent = cnDate(ds) + ' 周' + weekday(ds);
    $('#sheet-body').innerHTML = inner;
    $('#sheet-body').scrollTop = 0;
    $('#sheet').classList.add('open');
    $('#sheet-mask').classList.add('open');
    icons();
  }

  function closeSheet() {
    $('#sheet').classList.remove('open');
    $('#sheet-mask').classList.remove('open');
  }

  /* ---------- 渲染入口 ---------- */
  function render() {
    if (state.view === 'today') renderToday();
    else if (state.view === 'calendar') renderCalendar();
    else if (state.view === 'stats') renderStats();
    else renderSearch();
    root.scrollTop = 0;
  }

  /* ---------- 初始化 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    root = $('#view-root');
    phone = $('#phone');

    var t = new Date();
    $('#date-badge').textContent = cnDate(fmt(t)) + ' 周' + WEEK[t.getDay()];

    $('#fab').addEventListener('click', function () {
      phone.dataset.menu = phone.dataset.menu === 'open' ? 'closed' : 'open';
    });
    $('#menu-mask').addEventListener('click', closeMenu);
    $$('.r-item').forEach(function (b) {
      b.addEventListener('click', function () { setView(b.getAttribute('data-target')); });
    });
    $('#sheet-close').addEventListener('click', closeSheet);
    $('#sheet-mask').addEventListener('click', closeSheet);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { closeSheet(); closeMenu(); }
    });

    render();
  });
})();
