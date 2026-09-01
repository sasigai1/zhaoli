/* mock.js — 每日记录 · mock 数据与只读 API（原型 stub，无真实后端） */
(function () {
  'use strict';

  /* ---------- 确定性伪随机（mulberry32，种子固定保证刷新可复现） ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rand = mulberry32(20260902);
  function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
  function chance(p) { return rand() < p; }

  /* ---------- 数据池 ---------- */
  var TAGS = ['工作', '阅读', '运动', '朋友', '家人', '美食', '学习', '创作', '休息', '散步'];
  var TAG_WEIGHT = { '工作': 3, '阅读': 2, '运动': 2, '朋友': 2, '家人': 1, '美食': 2, '学习': 2, '创作': 1, '休息': 2, '散步': 2 };
  var WEATHER = ['晴', '多云', '阴', '小雨', '微风', '雨后初晴', '晴', '多云'];

  var OPENERS = {
    1: ['今天不太顺利。', '状态有点差的一天。', '有点提不起劲。'],
    2: ['平平淡淡，略有疲惫。', '今天心情一般。', '有些无精打采。'],
    3: ['普通而安稳的一天。', '一切照常进行。', '平静的一天，没有什么波澜。'],
    4: ['今天是不错的一天。', '心情还算明朗。', '完成了一些想做的事。'],
    5: ['今天是很好的一天。', '难得的顺心。', '今天由衷地感到高兴。']
  };

  var BODIES = {
    '工作': [
      '上午开了两个会，把上周的方案重新过了一遍，下午终于把文档收尾了。',
      '把积压的事项一件件清掉，进度比预想的快一些。',
      '处理了不少邮件和琐事，节奏有点紧，但没有出错。',
      '方案终于通过了，虽然改了很多轮，结果还是好的。'
    ],
    '阅读': [
      '晚上读了五十页书，有一个段落很触动，抄进了笔记里。',
      '睡前翻了几页书，比刷手机踏实多了。',
      '把拖了很久的那本书读完了，结尾比想象中温柔。',
      '在书里读到一个说法，恰好回答了最近的困惑。'
    ],
    '运动': [
      '傍晚跑了五公里，配速一般，但出汗之后整个人都轻了。',
      '做了一组力量训练，肩膀酸，心里却很踏实。',
      '去游泳了，池子里没什么人，安静地来回了很多趟。',
      '拉伸的时候看见天边的晚霞，算是额外的奖励。'
    ],
    '朋友': [
      '和老朋友吃了顿饭，聊了很多近况，有些话还是只能对老朋友说。',
      '和朋友散步走回去，路上把最近的烦恼都讲了出来。',
      '收到朋友寄来的小礼物，被记挂着的感觉很好。'
    ],
    '家人': [
      '和家里通了很长的电话，妈妈还是那些叮嘱，听着安心。',
      '陪家人吃了晚饭，饭桌上聊了很多小时候的事。',
      '给爸爸打了电话，他话不多，但结尾说了一句注意身体。'
    ],
    '美食': [
      '尝试了一家新的面馆，汤头很好，下次还想去。',
      '晚饭做了简单的两菜一汤，味道出乎意料地好。',
      '下班路上买了糖炒栗子，一路暖到手心。'
    ],
    '学习': [
      '把课程的后半部分学完了，笔记整理了满满几页。',
      '复习了之前一直模糊的知识点，这次终于弄懂了。',
      '碎片时间听了几节播客，收获比想象中多。'
    ],
    '创作': [
      '写了一直想写的东西，虽然只完成了一半，但开始了就好。',
      '画了一张小稿，颜色还没有调准，但过程很专注。',
      '整理了最近的灵感，记满了两页纸。'
    ],
    '休息': [
      '什么也没做的一天，睡了个午觉，醒来时阳光正好。',
      '允许自己彻底放空，看完了攒了很久的纪录片。',
      '泡了壶茶，坐在窗边发了很久的呆，也算休息。'
    ],
    '散步': [
      '晚饭后沿着河边走了走，风把白天的燥热都吹散了。',
      '散步时看见路灯一盏盏亮起来，忽然觉得很安静。',
      '绕着公园走了一圈，桂花好像快开了。'
    ]
  };

  var CLOSERS = [
    '早点休息。', '明天也要好好过。', '就这样吧，晚安。',
    '记录于此，明天见。', '希望明天也是不错的一天。', '记得今天的味道。'
  ];

  var PHOTO_PROMPTS = {
    '散步': 'Evening walk along a quiet riverside path at dusk, soft warm street lights, film photography, muted tones, minimal composition',
    '美食': 'Simple home cooked noodles in a ceramic bowl on a light wooden table, soft window light, minimal Japanese aesthetic, film photography',
    '运动': 'Running shoes and a water bottle on a park bench, morning light, clean minimal composition, film photography',
    '创作': 'Open notebook with a fountain pen and coffee cup on a wooden desk, soft daylight, minimal Japanese aesthetic',
    '阅读': 'Open book on a linen sofa with a cup of tea, soft afternoon light through curtains, minimal aesthetic, film photography',
    '朋友': 'Two cups of coffee on a cafe table by the window, soft daylight, film photography, minimal composition',
    '家人': 'Warm family dinner table with simple dishes, cozy soft light, film photography, minimal composition'
  };
  function photoUrl(tag) {
    return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' +
      encodeURIComponent(PHOTO_PROMPTS[tag]) + '&image_size=square_hd';
  }

  /* ---------- 日期工具 ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function weightedTag() {
    var total = 0, i;
    for (i = 0; i < TAGS.length; i++) total += TAG_WEIGHT[TAGS[i]];
    var r = rand() * total;
    for (i = 0; i < TAGS.length; i++) {
      r -= TAG_WEIGHT[TAGS[i]];
      if (r <= 0) return TAGS[i];
    }
    return TAGS[TAGS.length - 1];
  }
  function pickMood() {
    var r = rand();
    if (r < 0.08) return 1;
    if (r < 0.22) return 2;
    if (r < 0.56) return 3;
    if (r < 0.86) return 4;
    return 5;
  }

  /* ---------- 生成近 90 天记录（不含今天，今天留给用户编写） ---------- */
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var GAPS = { 74: 1, 73: 1, 41: 1, 40: 1, 39: 1, 12: 1 }; // 人为留几段"断档"，让连续天数更真实
  var entries = {};

  for (var i = 90; i >= 1; i--) {
    if (GAPS[i]) continue;
    if (chance(0.05)) continue;
    var d = new Date(today); d.setDate(d.getDate() - i);
    var mood = pickMood();
    var nTags = 1 + (chance(0.5) ? 1 : 0) + (chance(0.25) ? 1 : 0);
    var tags = [], t;
    while (tags.length < nTags) {
      t = weightedTag();
      if (tags.indexOf(t) < 0) tags.push(t);
    }
    var parts = [pick(OPENERS[mood])];
    tags.slice(0, 2).forEach(function (tag) { parts.push(pick(BODIES[tag])); });
    if (chance(0.6)) parts.push(pick(CLOSERS));
    var photo = null;
    if (chance(0.3)) {
      var ptags = tags.filter(function (x) { return PHOTO_PROMPTS[x]; });
      if (ptags.length) photo = photoUrl(pick(ptags));
    }
    entries[fmt(d)] = {
      date: fmt(d), mood: mood, tags: tags,
      weather: pick(WEATHER), text: parts.join(''), photo: photo
    };
  }

  /* ---------- 只读 API stub ---------- */
  function allList() {
    return Object.keys(entries).sort().reverse().map(function (k) { return entries[k]; });
  }

  window.DB = {
    todayStr: fmt(today),
    allTags: function () { return TAGS.slice(); },

    getDay: function (dateStr) { return entries[dateStr] || null; },

    getAll: allList,

    dayIndex: function () {
      var ks = Object.keys(entries).sort();
      if (!ks.length) return 1;
      var first = new Date(ks[0] + 'T00:00:00');
      return Math.round((today - first) / 86400000) + 1;
    },

    getStats: function () {
      var list = allList();
      var moodDist = [0, 0, 0, 0, 0];
      var tagCount = {};
      var photos = 0;
      list.forEach(function (e) {
        moodDist[e.mood - 1]++;
        if (e.photo) photos++;
        e.tags.forEach(function (t) { tagCount[t] = (tagCount[t] || 0) + 1; });
      });
      // 连续记录天数（截至昨天）
      var streak = 0, d = new Date(today); d.setDate(d.getDate() - 1);
      while (entries[fmt(d)]) { streak++; d.setDate(d.getDate() - 1); }
      // 本月完成率
      var y = today.getFullYear(), m = today.getMonth(), rate = 0;
      var thisMonth = list.filter(function (e) {
        var p = e.date.split('-');
        return +p[0] === y && (+p[1] - 1) === m;
      }).length;
      rate = Math.round(thisMonth / today.getDate() * 100);
      // 标签排行
      var rank = Object.keys(tagCount).map(function (t) { return { tag: t, count: tagCount[t] }; });
      rank.sort(function (a, b) { return b.count - a.count; });
      var maxCount = rank.length ? rank[0].count : 1;
      rank = rank.slice(0, 6).map(function (r) {
        return { tag: r.tag, count: r.count, pct: Math.round(r.count / maxCount * 100) };
      });
      return { total: list.length, streak: streak, monthRate: rate, photos: photos, moodDist: moodDist, tagRank: rank };
    },

    search: function (q, from, to, tags) {
      return allList().filter(function (e) {
        if (q && e.text.indexOf(q) < 0) return false;
        if (from && e.date < from) return false;
        if (to && e.date > to) return false;
        for (var i = 0; i < tags.length; i++) if (e.tags.indexOf(tags[i]) < 0) return false;
        return true;
      });
    }
  };
})();
