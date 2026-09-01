/* mock.js — 每日记录 · 全新应用（空数据）+ 内存 stub API（原型，无真实后端） */
(function () {
  'use strict';

  /* ---------- 标签池（含活动类：看视频 / 听音乐 / 游戏 等） ---------- */
  var TAGS = ['工作', '学习', '阅读', '看视频', '听音乐', '游戏', '运动', '朋友', '家人', '美食', '散步', '休息'];

  /* ---------- 日期工具 ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  var today = new Date(); today.setHours(0, 0, 0, 0);

  /* 全新应用：无任何历史记录。
     一天 = { date, mood(0=未标记), entries: [{ time, text, tags }] }，仅保存在内存（刷新还原）。 */
  var store = {};

  function ensureDay(ds) {
    if (!store[ds]) store[ds] = { date: ds, mood: 0, entries: [] };
    return store[ds];
  }
  function hasContent(d) { return d && d.entries.length; }

  window.DB = {
    todayStr: fmt(today),
    allTags: function () { return TAGS.slice(); },

    getDay: function (dateStr) {
      var d = store[dateStr];
      return hasContent(d) ? d : null;
    },

    getAll: function () {
      return Object.keys(store).sort().reverse().map(function (k) { return store[k]; })
        .filter(hasContent);
    },

    /* ---------- 今日视图写入（仅内存，刷新还原） ---------- */
    addEntry: function (text, tags, timeStr) {
      ensureDay(DB.todayStr).entries.push({ time: timeStr, text: text, tags: tags.slice() });
    },
    setMood: function (mood) { ensureDay(DB.todayStr).mood = mood; },

    dayIndex: function () {
      var ks = Object.keys(store).sort();
      if (!ks.length) return 1;
      var first = new Date(ks[0] + 'T00:00:00');
      return Math.round((today - first) / 86400000) + 1;
    },

    getStats: function () {
      var list = DB.getAll();
      var moodDist = [0, 0, 0, 0, 0];
      var tagCount = {};
      var totalEntries = 0;
      list.forEach(function (e) {
        if (e.mood >= 1 && e.mood <= 5) moodDist[e.mood - 1]++;
        e.entries.forEach(function (en) {
          totalEntries++;
          en.tags.forEach(function (t) { tagCount[t] = (tagCount[t] || 0) + 1; });
        });
      });
      // 连续记录天数（截至昨天）
      var streak = 0, d = new Date(today); d.setDate(d.getDate() - 1);
      while (DB.getDay(fmt(d))) { streak++; d.setDate(d.getDate() - 1); }
      // 本月完成率
      var y = today.getFullYear(), m = today.getMonth();
      var thisMonth = list.filter(function (e) {
        var p = e.date.split('-');
        return +p[0] === y && (+p[1] - 1) === m;
      }).length;
      var rate = Math.round(thisMonth / today.getDate() * 100);
      // 标签排行
      var rank = Object.keys(tagCount).map(function (t) { return { tag: t, count: tagCount[t] }; });
      rank.sort(function (a, b) { return b.count - a.count; });
      var maxCount = rank.length ? rank[0].count : 1;
      rank = rank.slice(0, 6).map(function (r) {
        return { tag: r.tag, count: r.count, pct: Math.round(r.count / maxCount * 100) };
      });
      return { total: list.length, entries: totalEntries, streak: streak, monthRate: rate, moodDist: moodDist, tagRank: rank };
    },

    search: function (q, from, to, tags) {
      return DB.getAll().filter(function (e) {
        if (from && e.date < from) return false;
        if (to && e.date > to) return false;
        var text = e.entries.map(function (en) { return en.text; }).join('\n');
        if (q && text.indexOf(q) < 0) return false;
        var etags = [];
        e.entries.forEach(function (en) {
          en.tags.forEach(function (t) { if (etags.indexOf(t) < 0) etags.push(t); });
        });
        for (var i = 0; i < tags.length; i++) if (etags.indexOf(tags[i]) < 0) return false;
        return true;
      });
    }
  };
})();
