/* ============================================================
   mock.js — 「留白」日程 App · 单一数据源
   Event: { id, date:'YYYY-MM-DD', start:'HH:MM', dur(分钟),
            title, cat: work|life|health|blank, note, done, remind }
   ============================================================ */

// 工具：以"今天"真实日期为基准生成日期串，保证时间轴/now-line 可用
function ymd(d){ const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), s=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${s}`; }
const TODAY = ymd(new Date());
function dayOffset(n){ const d=new Date(); d.setDate(d.getDate()+n); return ymd(d); }

const DB = {
  user: { name: '未名', greetMorning: '早安', streak: 12 },

  events: [
    // —— 今天 ——（时间刻意横跨 now 前后，晨间事项已完成）
    { id:'e1', date:TODAY, start:'07:30', dur:30,  title:'晨间拉伸',      cat:'health', done:true,  remind:10 },
    { id:'e2', date:TODAY, start:'09:00', dur:90,  title:'产品评审 · 留白 v2.0', cat:'work', done:true, remind:15, note:'带上上周的节奏复盘' },
    { id:'e3', date:TODAY, start:'11:00', dur:45,  title:'和一苇喝咖啡',  cat:'life',   done:true,  remind:30 },
    { id:'e4', date:TODAY, start:'12:30', dur:60,  title:'午间小憩',      cat:'blank',  done:true,  remind:0,  note:'不看手机，让眼睛休息' },
    { id:'e5', date:TODAY, start:'14:30', dur:90,  title:'写季度方案',    cat:'work',   done:false, remind:10 },
    { id:'e6', date:TODAY, start:'16:30', dur:30,  title:'产品散步 · 不带耳机', cat:'blank', done:false, remind:0 },
    { id:'e7', date:TODAY, start:'18:00', dur:60,  title:'游泳',          cat:'health', done:false, remind:30 },
    { id:'e8', date:TODAY, start:'20:30', dur:45,  title:'读《夜航西飞》', cat:'life',   done:false, remind:15 },
    { id:'e9', date:TODAY, start:'22:00', dur:30,  title:'睡前的十分钟静坐', cat:'blank', done:false, remind:0 },

    // —— 昨天 ——
    { id:'e10', date:dayOffset(-1), start:'09:30', dur:60,  title:'周会',        cat:'work',   done:true,  remind:15 },
    { id:'e11', date:dayOffset(-1), start:'13:00', dur:45,  title:'午后的空白',  cat:'blank',  done:true,  remind:0 },
    { id:'e12', date:dayOffset(-1), start:'15:00', dur:90,  title:'整理素材库',  cat:'work',   done:true,  remind:10 },
    { id:'e13', date:dayOffset(-1), start:'19:00', dur:60,  title:'夜跑 5km',    cat:'health', done:true,  remind:30 },

    // —— 明天 ——
    { id:'e14', date:dayOffset(1), start:'10:00', dur:120, title:'设计工作坊',  cat:'work',   done:false, remind:15 },
    { id:'e15', date:dayOffset(1), start:'14:00', dur:60,  title:'留白：什么都不安排', cat:'blank', done:false, remind:0 },
    { id:'e16', date:dayOffset(1), start:'16:00', dur:45,  title:'日语课',      cat:'life',   done:false, remind:20 },

    // —— 后天 ——
    { id:'e17', date:dayOffset(2), start:'09:00', dur:60,  title:'晨跑',        cat:'health', done:false, remind:20 },
    { id:'e18', date:dayOffset(2), start:'11:00', dur:90,  title:'写复盘文章',  cat:'work',   done:false, remind:10 },
  ],

  // 近 7 天节奏数据（留白率 %、完成事件数、专注分钟）
  rhythm: [
    { date: dayOffset(-6), blankRate: 32, done: 5, focusMin: 45 },
    { date: dayOffset(-5), blankRate: 41, done: 6, focusMin: 75 },
    { date: dayOffset(-4), blankRate: 28, done: 8, focusMin: 50 },
    { date: dayOffset(-3), blankRate: 45, done: 4, focusMin: 100 },
    { date: dayOffset(-2), blankRate: 38, done: 6, focusMin: 60 },
    { date: dayOffset(-1), blankRate: 52, done: 5, focusMin: 90 },
    { date: TODAY,         blankRate: 40, done: 4, focusMin: 25 },
  ],

  // 专注会话记录
  focusSessions: [
    { id:'f1', label:'写季度方案',   min:50, at:'14:35' },
    { id:'f2', label:'整理收件箱',   min:25, at:'11:10' },
    { id:'f3', label:'读《夜航西飞》', min:40, at:'08:20', planned:false },
  ],

  // 提醒设置
  settings: {
    breathe: true,   // 呼吸提醒
    gentle: true,    // 轻震动
    suggestBlank: true, // 留白建议
  },
};

if (typeof module !== 'undefined') module.exports = { DB };
