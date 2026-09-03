/* ============================================================
   app.js — 「留白」· SPA 状态 / 路由 / 渲染 / 交互
   结构：icons → state → utils → views(today/week/focus/rhythm)
        → sheet(添加/详情) → 呼吸提醒 → 专注计时 → init
   数据：mock.js(DB) ← patch(localStorage 持久化用户改动)
   ============================================================ */

/* ---------- 内联 Lucide SVG（离线零依赖） ---------- */
const I = (name, extra='') => {
  const P = {
    'plus':'<path d="M5 12h14"/><path d="M12 5v14"/>',
    'check':'<path d="M20 6 9 17l-5-5"/>',
    'x':'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'chevron-left':'<path d="m15 18-6-6 6-6"/>',
    'chevron-right':'<path d="m9 18 6-6-6-6"/>',
    'bell':'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    'calendar-days':'<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
    'timer':'<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
    'activity':'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    'wind':'<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
    'sparkles':'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/>',
    'leaf':'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    'coffee':'<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>',
    'briefcase':'<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    'heart-pulse':'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    'clock':'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'play':'<polygon points="6 3 20 12 6 21 6 3"/>',
    'trash-2':'<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    'sun-medium':'<circle cx="12" cy="12" r="4"/><path d="M12 3v1"/><path d="M12 20v1"/><path d="M3 12h1"/><path d="M20 12h1"/><path d="m6.3 6.3.7.7"/><path d="m17 17 .7.7"/><path d="m17.7 6.3-.7.7"/><path d="m6.3 17.7.7-.7"/>',
    'settings-2':'<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
    'circle-dash':'<path d="M12 3a9 9 0 1 0 9 9"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" ${extra}>${P[name]||''}</svg>`;
};

/* ---------- 分类定义 ---------- */
const CATS = {
  work:   { label:'工作', color:'var(--mist)',    hex:'#5F7186', icon:'briefcase' },
  life:   { label:'生活', color:'var(--clay)',    hex:'#B4715B', icon:'coffee' },
  health: { label:'健康', color:'var(--sage)',    hex:'#7F9078', icon:'heart-pulse' },
  blank:  { label:'留白', color:'var(--celadon)', hex:'#93A69B', icon:'leaf' },
};

/* ---------- 状态 ---------- */
const state = {
  tab: 'today',
  weekSel: TODAY,           // 周历选中日
  weekOffset: 0,            // 周历翻页
  focus: { dur: 25*60, left: 25*60, running: false, label: '专注' },
  focusTimer: null,
  breatheShown: false,      // 自动呼吸演示只触发一次
  add: { cat: 'work', dur: 60 },
};
let patch = { added: [], done: {}, deleted: [], settings: {} };

/* ---------- 工具 ---------- */
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2,'0');
const WD = ['周日','周一','周二','周三','周四','周五','周六'];
function dstr(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function parseHM(hm){ const [h,m]=hm.split(':').map(Number); return h*60+m; }
function fmtRange(start, dur){
  const s=parseHM(start), e=s+dur;
  return `${start} – ${pad(Math.floor(e/60))}:${pad(e%60)}`;
}
function monthCN(d){ return ['一','二','三','四','五','六','七','八','九','十','十一','十二'][d.getMonth()]+'月'; }
function nowMin(){ const d=new Date(); return d.getHours()*60+d.getMinutes(); }
function loadPatch(){
  try{ const p = JSON.parse(localStorage.getItem('liubai.patch')); if(p) patch = p; }catch(e){}
  // 应用用户改动到 DB
  patch.added.forEach(e => { if(!DB.events.find(x=>x.id===e.id)) DB.events.push(e); });
  Object.entries(patch.done).forEach(([id,d])=>{ const e=DB.events.find(x=>x.id===id); if(e) e.done=d; });
  DB.events = DB.events.filter(e => !patch.deleted.includes(e.id));
  Object.assign(DB.settings, patch.settings||{});
}
function savePatch(){
  patch.added = DB.events.filter(e => e.id.startsWith('u'));
  patch.done = {}; DB.events.forEach(e => { if(e.done) patch.done[e.id]=true; });
  patch.settings = DB.settings;
  try{ localStorage.setItem('liubai.patch', JSON.stringify(patch)); }catch(e){}
}

/* ---------- Toast ---------- */
let toastTimer=null;
function toast(msg){
  const t=$('#toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ============================================================
   视图 · 今日
   ============================================================ */
const HOUR_H = 64, DAY_START = 6, DAY_END = 23;

function renderToday(){
  const now = new Date();
  const evts = DB.events.filter(e=>e.date===TODAY).sort((a,b)=>parseHM(a.start)-parseHM(b.start));
  const blanks = evts.filter(e=>e.cat==='blank');
  const blankMin = blanks.reduce((s,e)=>s+e.dur,0);
  const dayMin = (22-8)*60;
  const blankRate = Math.round(blankMin/dayMin*100);
  const doneN = evts.filter(e=>e.done).length;

  const hours = [];
  for(let h=DAY_START; h<=DAY_END; h++) hours.push(h);

  // 事件块定位（越界裁剪到 6:00–23:00 网格内）
  const gridH = (DAY_END-DAY_START+1)*HOUR_H;
  const evtHtml = evts.map(e=>{
    let top=(parseHM(e.start)-DAY_START*60)/60*HOUR_H + 1;
    let hgt=Math.max(e.dur/60*HOUR_H-6, 40);
    top = Math.max(top, 1);
    hgt = Math.min(hgt, gridH-top-2);
    const past = parseHM(e.start)+e.dur < nowMin() && !e.done;
    return `<div class="evt c-${e.cat} ${e.done?'done':''} ${e.cat==='blank'?'blank':''} ${past?'past':''}"
      style="top:${top}px;height:${hgt}px" data-id="${e.id}">
      <div class="et"><span class="cdot"></span><span class="txt">${e.title}</span></div>
      ${hgt>=54?`<div class="em">${fmtRange(e.start,e.dur)}${e.cat==='blank'?' · 一段空白':''}</div>`:''}
      <button class="ck" data-ck="${e.id}" aria-label="完成">${I('check')}</button>
    </div>`;
  }).join('');

  // now-line
  const nm=nowMin();
  const nowLine = (nm>=DAY_START*60 && nm<=DAY_END*60)
    ? `<div class="now-line" style="top:${(nm-DAY_START*60)/60*HOUR_H}px">
        <span class="pt"></span><span class="bar"></span><span class="lab">${pad(now.getHours())}:${pad(now.getMinutes())}</span>
      </div>` : '';

  $('#main').innerHTML = `
    <div class="today-head reveal">
      <div>
        <h1 class="h-greeting">${now.getHours()<11?'早安':now.getHours()<18?'午安':'晚上好'}，今天有 ${evts.length} 个约定</h1>
        <div class="h-date">${monthCN(now)} ${now.getDate()} 日 · ${WD[now.getDay()]} · 其中 ${blanks.length} 段留白</div>
      </div>
      <button class="head-bell" id="bellBtn" style="position:relative" aria-label="预览提醒">${I('bell')}<span class="dot"></span></button>
    </div>

    <div class="card blank-card reveal" style="animation-delay:.06s">
      <div class="blank-ring">
        <svg width="88" height="88">
          <circle cx="44" cy="44" r="38" fill="none" stroke="var(--line-soft)" stroke-width="5"/>
          <circle cx="44" cy="44" r="38" fill="none" stroke="var(--celadon)" stroke-width="5"
            stroke-linecap="round" stroke-dasharray="${2*Math.PI*38}"
            stroke-dashoffset="${2*Math.PI*38*(1-blankRate/100)}"/>
        </svg>
        <div class="num"><b>${blankRate}<span style="font-size:13px">%</span></b><i>留白率</i></div>
      </div>
      <div class="blank-info">
        <h3>今天为自己留了 ${(blankMin/60).toFixed(1)} 小时</h3>
        <p class="quote">"日程是纸，留白是呼吸。"</p>
        <p>已完成 ${doneN}/${evts.length} 项 · 未排满，很好。</p>
      </div>
    </div>

    <div class="week-strip reveal" style="animation-delay:.12s">
      ${weekStripDays().map(d=>{
        const ds=dstr(d);
        return `<div class="wd ${ds===TODAY?'today':''} ${ds===TODAY?'sel':''}" data-go="${ds}">
          <div class="n serif">${d.getDate()}</div><div class="l">${WD[d.getDay()].slice(1)}</div>
          ${DB.events.some(e=>e.date===ds)?'<div class="bdot"></div>':''}
        </div>`;
      }).join('')}
    </div>

    <div class="section-title reveal" style="animation-delay:.18s"><b>时间之页</b><small>轻点圆点完成 · 点块看详情</small></div>
    <div class="timeline reveal" style="animation-delay:.22s">
      <div class="tl-grid" style="height:${(DAY_END-DAY_START+1)*HOUR_H}px">
        ${hours.map(h=>`<div class="tl-hour" style="top:${(h-DAY_START)*HOUR_H}px;position:absolute"><span class="t">${pad(h)}:00</span></div>`).join('')}
        ${evtHtml}${nowLine}
      </div>
    </div>
    <div class="legend">
      ${Object.entries(CATS).map(([k,c])=>`<span><i style="background:${c.hex}"></i>${c.label}</span>`).join('')}
    </div>`;

  // 事件交互
  $('#main').querySelectorAll('.evt').forEach(el=>{
    el.addEventListener('click', ev=>{
      if(ev.target.closest('.ck')) return;
      openDetail(el.dataset.id);
    });
  });
  $('#main').querySelectorAll('.ck').forEach(b=>{
    b.addEventListener('click', async ev=>{
      ev.stopPropagation();
      const id=b.dataset.ck;
      const e=DB.events.find(x=>x.id===id);
      e.done=!e.done;
      await api.completeEvent(id, e.done);
      savePatch();
      b.closest('.evt').classList.toggle('done', e.done);
      if(e.done) toast(e.cat==='blank'?'这段留白，好好度过了':'已完成 · '+e.title);
    });
  });
  // 周条 → 周历
  $('#main').querySelectorAll('.wd').forEach(el=>el.addEventListener('click',()=>{
    state.weekSel = el.dataset.go; state.tab='week'; location.hash='#week';
  }));
  $('#bellBtn').addEventListener('click', ()=> showBreathe(true));
}

function weekStripDays(){
  const now=new Date(); const days=[];
  const mon=new Date(now); mon.setDate(now.getDate()-((now.getDay()+6)%7));
  for(let i=0;i<7;i++){ const d=new Date(mon); d.setDate(mon.getDate()+i); days.push(d); }
  return days;
}

/* ============================================================
   视图 · 周历（能量曲线）
   ============================================================ */
function renderWeek(){
  const sel = new Date(state.weekSel+'T00:00:00');
  const mon = new Date(sel); mon.setDate(sel.getDate()-((sel.getDay()+6)%7));
  const days=[]; for(let i=0;i<7;i++){ const d=new Date(mon); d.setDate(mon.getDate()+i); days.push(d); }
  const from=dstr(days[0]), to=dstr(days[6]);
  const evts = DB.events.filter(e=>e.date>=from && e.date<=to && e.date===state.weekSel)
                        .sort((a,b)=>parseHM(a.start)-parseHM(b.start));

  const mn = monthCN(days[0]);

  $('#main').innerHTML = `
    <div class="month-nav reveal">
      <button class="mnav-btn" id="wPrev" aria-label="上一周">${I('chevron-left')}</button>
      <b>${mn}${monthCN(days[6])!==mn?' – '+monthCN(days[6]):''}<span style="font-size:12px;color:var(--ink-3);letter-spacing:1px;margin-left:10px">${days[0].getFullYear()}</span></b>
      <button class="mnav-btn" id="wNext" aria-label="下一周">${I('chevron-right')}</button>
    </div>

    <div class="week-strip reveal" style="animation-delay:.05s">
      ${days.map(d=>{ const ds=dstr(d);
        return `<div class="wd ${ds===TODAY?'today':''} ${ds===state.weekSel?'sel':''}" data-day="${ds}">
          <div class="n serif">${d.getDate()}</div><div class="l">${WD[d.getDay()].slice(1)}</div>
          ${DB.events.some(e=>e.date===ds)?'<div class="bdot"></div>':''}
        </div>`;}).join('')}
    </div>

    <div class="card energy-card reveal" style="animation-delay:.1s">
      <div class="energy-head"><b>能量节律</b><small>按精力安排，而非按时间填满</small></div>
      ${energySvg(evts)}
    </div>

    <div class="section-title reveal" style="animation-delay:.14s">
      <b>${state.weekSel===TODAY?'今天':monthCN(sel)+' '+sel.getDate()+' 日'}的安排</b><small>${evts.length} 项</small>
    </div>
    <div class="day-list reveal" style="animation-delay:.18s">
      ${evts.length ? evts.map(e=>`
        <div class="dl-item" data-id="${e.id}">
          <span class="bar" style="background:${CATS[e.cat].hex}"></span>
          <div class="tt"><b style="${e.done?'text-decoration:line-through;color:var(--ink-3)':''}">${e.title}</b>
            <span>${CATS[e.cat].label}${e.cat==='blank'?' · 不安排任何事':''}</span></div>
          <span class="tm">${e.start}</span>
        </div>`).join('')
      : `<div class="empty-state card" style="border-style:dashed;box-shadow:none">
           ${I('leaf')}<p class="serif">整整一天空白</p><p>什么都没有，也很好。</p>
         </div>`}
    </div>`;

  $('#wPrev').onclick = ()=> shiftWeek(-7);
  $('#wNext').onclick = ()=> shiftWeek(7);
  $('#main').querySelectorAll('.wd').forEach(el=>el.addEventListener('click',()=>{ state.weekSel=el.dataset.day; renderWeek(); }));
  $('#main').querySelectorAll('.dl-item').forEach(el=>el.addEventListener('click',()=>openDetail(el.dataset.id)));
}

function shiftWeek(n){
  const d = new Date(state.weekSel+'T00:00:00'); d.setDate(d.getDate()+n);
  state.weekSel = dstr(d); renderWeek();
}

/* 能量曲线：6:00–23:00 的精力基线 + 事件落点 */
function energySvg(evts){
  const W=320, H=110, PX=14, PY=14;
  const energy = { 6:.35, 7:.5, 8:.72, 9:.9, 10:.95, 11:.85, 12:.6, 13:.45, 14:.55, 15:.75, 16:.85, 17:.75, 18:.6, 19:.55, 20:.5, 21:.4, 22:.3, 23:.2 };
  const x = h => PX + (h-6)/17*(W-PX*2);
  const y = v => H-PY - v*(H-PY*2);
  // 平滑曲线
  let d = `M ${x(6)} ${y(energy[6])}`;
  for(let h=7; h<=23; h++){
    const x0=x(h-1), y0=y(energy[h-1]), x1=x(h), y1=y(energy[h]);
    d += ` C ${x0+(x1-x0)/2} ${y0}, ${x0+(x1-x0)/2} ${y1}, ${x1} ${y1}`;
  }
  // 事件落点（按开始时刻取能量值）
  const dots = evts.filter(e=>{const h=parseHM(e.start)/60; return h>=6 && h<=23;}).map(e=>{
    const t=parseHM(e.start)/60, v=energy[Math.min(23,Math.max(6,Math.round(t)))]||.5;
    return `<circle cx="${x(t).toFixed(1)}" cy="${y(v).toFixed(1)}" r="4.5" fill="${CATS[e.cat].hex}" stroke="#fff" stroke-width="1.8"/>`;
  }).join('');
  return `<svg class="energy-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <path d="${d} L ${x(23)} ${H-2} L ${x(6)} ${H-2} Z" fill="rgba(147,166,155,.08)"/>
    <path d="${d}" fill="none" stroke="var(--brass)" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>
    ${dots}
  </svg>`;
}

/* ============================================================
   视图 · 专注（呼吸环）
   ============================================================ */
const RC = 2*Math.PI*104;

function renderFocus(){
  const f=state.focus;
  const mm = Math.floor(f.left/60), ss=f.left%60;
  const todayMin = DB.focusSessions.reduce((s,x)=>s+x.min,0);
  $('#main').innerHTML = `
    <div class="focus-hero reveal">
      <div class="focus-ring ${f.running?'running':''}" id="focusRing">
        <svg width="240" height="240">
          <circle cx="120" cy="120" r="104" fill="none" stroke="var(--line-soft)" stroke-width="6"/>
          <circle id="frBar" cx="120" cy="120" r="104" fill="none" stroke="var(--celadon)" stroke-width="6"
            stroke-linecap="round" stroke-dasharray="${RC}" stroke-dashoffset="${RC*(1-f.left/f.dur)}"/>
        </svg>
        <div class="fr-core">
          <div class="fr-breath" style="display:flex;flex-direction:column;align-items:center;gap:6px">
            <div class="time serif">${pad(mm)}:${pad(ss)}</div>
            <div class="lbl">${f.running?'呼吸，并专注':'准备好开始了吗'}</div>
          </div>
        </div>
      </div>
      <div class="focus-label" id="fLabel">${f.label}</div>
      <div class="focus-ctl">
        <button class="fbtn ${f.running?'stop':'start'}" id="fBtn">${f.running?'暂停':'开始'}</button>
        <button class="fbtn stop" id="fReset" style="padding:14px 22px">重置</button>
      </div>
      <div class="dur-chips">
        ${[15,25,45,60].map(m=>`<button class="chip ${f.dur===m*60?'sel':''}" data-min="${m}">${m} 分钟</button>`).join('')}
      </div>
    </div>

    <div class="section-title reveal" style="animation-delay:.1s"><b>今日专注</b><small>共 ${todayMin} 分钟</small></div>
    <div class="sess-list reveal" style="animation-delay:.14s">
      ${DB.focusSessions.map(s=>`
        <div class="sess">${I(s.planned===false?'circle-dash':'check')}
          <span class="tt">${s.label}</span><span class="mn serif">${s.min} 分钟</span>
        </div>`).join('')}
    </div>
    <p style="text-align:center;font-size:11px;color:var(--ink-4);letter-spacing:2px;margin-top:22px;line-height:2">
      番茄钟是节拍器，呼吸是旋律。
    </p>`;

  $('#fBtn').onclick = toggleFocus;
  $('#fReset').onclick = ()=>{ stopTick(); state.focus.running=false; state.focus.left=state.focus.dur; renderFocus(); };
  $('#main').querySelectorAll('[data-min]').forEach(b=>b.addEventListener('click',()=>{
    stopTick(); state.focus.running=false;
    state.focus.dur = b.dataset.min*60; state.focus.left = state.focus.dur;
    renderFocus();
  }));
}

function toggleFocus(){
  const f = state.focus;
  if(f.running){ stopTick(); f.running=false; renderFocus(); }
  else{
    f.running = true;
    // 用 label 记住本次专注（可来自"写季度方案"等，这里保持简单）
    startTick(); renderFocus();
  }
}
function startTick(){
  state.focusTimer = setInterval(()=>{
    const f = state.focus;
    f.left--;
    if(f.left<=0){
      stopTick(); f.running=false; f.left=f.dur;
      api.saveFocusSession(f.label, Math.round(f.dur/60));
      toast('专注完成 · 已记入今日节奏');
      renderFocus(); return;
    }
    // 轻量刷新：只更新数字与环，避免整页重绘
    const mm=Math.floor(f.left/60), ss=f.left%60;
    const t=$('#main .time'), bar=$('#frBar');
    if(t) t.textContent = `${pad(mm)}:${pad(ss)}`;
    if(bar) bar.setAttribute('stroke-dashoffset', RC*(1-f.left/f.dur));
  }, 1000);
}
function stopTick(){ clearInterval(state.focusTimer); state.focusTimer=null; }

/* ============================================================
   视图 · 节奏（统计 / 设置）
   ============================================================ */
function renderRhythm(){
  const r = DB.rhythm;
  const avg = Math.round(r.reduce((s,x)=>s+x.blankRate,0)/r.length);
  const focusSum = r.reduce((s,x)=>s+x.focusMin,0);
  const maxRate = Math.max(...r.map(x=>x.blankRate));

  $('#main').innerHTML = `
    <div class="section-title reveal" style="margin-top:18px"><b>本周节奏</b><small>留白不是浪费，是休止符</small></div>
    <div class="stat-grid reveal" style="animation-delay:.05s">
      <div class="stat"><b class="serif">${avg}<em>%</em></b><span>平均留白率</span></div>
      <div class="stat"><b class="serif">${DB.user.streak}<em>天</em></b><span>连续记录</span></div>
      <div class="stat"><b class="serif">${focusSum}<em>分</em></b><span>本周专注</span></div>
    </div>

    <div class="card bars-card reveal" style="animation-delay:.1s">
      <div class="energy-head"><b>七日留白</b><small>目标 ≥ 30%</small></div>
      <div class="bars">
        ${r.map(x=>{ const d=new Date(x.date+'T00:00:00');
          return `<div class="bcol ${x.date===TODAY?'today':''}">
            <span class="bv">${x.blankRate}</span>
            <div class="bbar" style="height:${Math.max(x.blankRate/maxRate*78,6)}px"></div>
            <span class="bl">${WD[d.getDay()].slice(1)}</span>
          </div>`;}).join('')}
      </div>
    </div>

    <div class="section-title reveal" style="animation-delay:.14s"><b>提醒的方式</b><small>温柔，但到达</small></div>
    <div class="set-list reveal" style="animation-delay:.18s">
      ${[
        {k:'breathe', icon:'wind',   t:'呼吸提醒', s:'提醒以全屏呼吸呈现，跟随四次呼吸后淡出'},
        {k:'gentle',  icon:'sparkles', t:'轻柔到达', s:'提前 10 分钟，只震动一次，不催促'},
        {k:'suggestBlank', icon:'leaf', t:'留白建议', s:'当一天排满时，建议挪出一段空白'},
      ].map(it=>`
        <div class="set-item">
          ${I(it.icon)}
          <div class="tt"><b>${it.t}</b><span>${it.s}</span></div>
          <button class="switch ${DB.settings[it.k]?'on':''}" data-k="${it.k}" role="switch" aria-checked="${!!DB.settings[it.k]}"></button>
        </div>`).join('')}
    </div>

    <div class="card about-card reveal" style="animation-delay:.24s">
      <div class="logo serif">留白</div>
      <p>LIÚ BÁI · 日程是纸，留白是呼吸<br>V 0.1 · 纸白设计</p>
    </div>`;

  $('#main').querySelectorAll('.switch').forEach(sw=>sw.addEventListener('click',()=>{
    const k=sw.dataset.k; DB.settings[k]=!DB.settings[k]; savePatch();
    sw.classList.toggle('on', DB.settings[k]);
    toast(k==='breathe' ? (DB.settings[k]?'呼吸提醒 · 已开启':'呼吸提醒 · 已关闭') : '已更新');
  }));
}

/* ============================================================
   Sheet · 快速添加 / 事件详情
   ============================================================ */
function openSheet(html){
  $('#sheet').innerHTML = `<div class="grip"></div>`+html;
  $('#sheetMask').classList.add('show'); $('#sheet').classList.add('show');
}
function closeSheet(){
  $('#sheetMask').classList.remove('show'); $('#sheet').classList.remove('show');
}
$('#sheetMask').addEventListener('click', closeSheet);

function openAdd(){
  const next = new Date(Date.now()+30*60000); next.setMinutes(next.getMinutes()<30?30:0,0,0);
  const defStart = `${pad(next.getHours())}:${pad(next.getMinutes())}`;
  openSheet(`
    <h3>写下一段时光</h3>
    <div class="sub">不急着填满 · 今天</div>
    <input class="f-input" id="fTitle" maxlength="24" placeholder="给这段时间起个名字" />
    <div class="f-label">开始</div>
    <div class="row2">
      <input class="f-input" id="fStart" type="time" value="${defStart}" />
      <input class="f-input" id="fDate" type="date" value="${TODAY}" min="${TODAY}" />
    </div>
    <div class="f-label">时长</div>
    <div class="chips" id="fDur">
      ${[30,45,60,90,120].map(m=>`<button class="chip ${m===state.add.dur?'sel':''}" data-m="${m}">${m>=60?(m/60)+' 小时':m+' 分钟'}</button>`).join('')}
    </div>
    <div class="f-label">性质</div>
    <div class="chips" id="fCat">
      ${Object.entries(CATS).map(([k,c])=>`<button class="chip catc ${k===state.add.cat?'sel':''}" data-c="${k}" style="--cc:${c.hex}">${c.label}</button>`).join('')}
    </div>
    <button class="btn-primary" id="fSave">放 进 今 天</button>
  `);
  setTimeout(()=>$('#fTitle')&&$('#fTitle').focus(), 380);

  let dur=state.add.dur, cat=state.add.cat;
  $('#fDur').querySelectorAll('.chip').forEach(b=>b.onclick=()=>{
    dur=+b.dataset.m;
    $('#fDur').querySelectorAll('.chip').forEach(x=>x.classList.toggle('sel',x===b));
  });
  $('#fCat').querySelectorAll('.chip').forEach(b=>b.onclick=()=>{
    cat=b.dataset.c;
    $('#fCat').querySelectorAll('.chip').forEach(x=>x.classList.toggle('sel',x===b));
  });
  $('#fSave').onclick = async ()=>{
    const title=$('#fTitle').value.trim() || (cat==='blank'?'一段留白':'新日程');
    const start=$('#fStart').value||defStart;
    const date=$('#fDate').value||TODAY;
    const ev={ id:'u'+Date.now(), date, start, dur, title, cat, done:false,
               remind: cat==='blank'?0:10, note: cat==='blank'?'什么都不做，也是安排':'', _new:true };
    await api.saveEvent(ev);
    savePatch(); closeSheet();
    state.add={cat,dur};
    toast(cat==='blank' ? '已为今天留出一段白' : '已加入 · '+title);
    if(date===TODAY) renderToday();
  };
}

function openDetail(id){
  const e = DB.events.find(x=>x.id===id); if(!e) return;
  const c = CATS[e.cat];
  openSheet(`
    <div class="detail-body">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="width:10px;height:10px;border-radius:50%;background:${c.hex}"></span>
        <span style="font-size:11px;letter-spacing:3px;color:${c.hex};font-weight:600">${c.label}${e.cat==='blank'?' · 一段空白':''}</span>
      </div>
      <h3 class="serif" style="margin-top:12px;font-size:22px;font-weight:600;letter-spacing:1px">${e.title}</h3>
      <div class="detail-when">${I('clock')} ${fmtRange(e.start,e.dur)} · 共 ${e.dur>=60?(e.dur/60)+' 小时':e.dur+' 分钟'}</div>
      ${e.remind?`<div class="detail-when">${I('bell')} 提前 ${e.remind} 分钟 · 呼吸式提醒</div>`:`<div class="detail-when">${I('wind')} 静静到来，不打扰</div>`}
      ${e.note?`<div class="detail-note">${e.note}</div>`:''}
      <div class="detail-actions">
        <button class="btn-ghost" id="dDone">${I('check')} ${e.done?'取消完成':'完成了'}</button>
        ${e.remind?`<button class="btn-ghost" id="dBell">${I('wind')} 试一试提醒</button>`:''}
        <button class="btn-ghost warn" id="dDel">${I('trash-2')}</button>
      </div>
    </div>
  `);
  $('#dDone').onclick = async ()=>{
    e.done=!e.done; await api.completeEvent(e.id,e.done); savePatch(); closeSheet();
    toast(e.done?'已完成 · '+e.title:'已恢复待办');
    rerender();
  };
  const db=$('#dBell'); if(db) db.onclick=()=>{ closeSheet(); showBreathe(false, e); };
  $('#dDel').onclick = async ()=>{
    await api.deleteEvent(e.id);
    patch.deleted.push(e.id); savePatch(); closeSheet();
    toast('已移除 · 愿它以别的方式发生'); rerender();
  };
}

/* ============================================================
   呼吸提醒（新意核心）
   ============================================================ */
let breatheTimer=null;
function showBreathe(manual, forceEvt){
  // 找"下一个"今天未完成、未过期的提醒型事件
  const nm=nowMin();
  const next = forceEvt || DB.events.find(e=>
    e.date===TODAY && !e.done && e.remind>0 && parseHM(e.start)>nm
  ) || DB.events.find(e=>e.date===TODAY && !e.done && parseHM(e.start)>nm);
  if(!next){ toast('今天没有待赴的约定了'); return; }

  const b=$('#breathe');
  b.innerHTML = `
    <div class="br-ring"><div class="br-core">${I('wind')}<span>吸气 · 呼气</span></div></div>
    <div class="br-title">${next.title}</div>
    <div class="br-sub">${next.start} · ${CATS[next.cat].label}${next.cat==='blank'?' · 是时候空白了':' · 快到时间了'}</div>
    <div class="br-tip">跟着圆环，呼吸四次</div>
    <div class="br-actions">
      <button class="br-btn sub" id="brLater">稍后提醒</button>
      <button class="br-btn main" id="brGo">我现在开始</button>
    </div>`;
  b.classList.add('show');

  $('#brGo').onclick = ()=>{ hideBreathe(); toast('开始了 · '+next.title); };
  $('#brLater').onclick = ()=>{ hideBreathe(); toast('十分钟后，再轻轻叫你'); };
  // 16 秒后自动淡出（约四个呼吸周期）
  clearTimeout(breatheTimer);
  breatheTimer = setTimeout(hideBreathe, 16000);
}
function hideBreathe(){ clearTimeout(breatheTimer); $('#breathe').classList.remove('show'); }

/* ============================================================
   Tabbar / 路由 / 启动
   ============================================================ */
const TABS = [
  { key:'today', label:'今日', icon:'sun-medium' },
  { key:'week',  label:'周历', icon:'calendar-days' },
  { key:'focus', label:'专注', icon:'timer' },
  { key:'rhythm',label:'节奏', icon:'activity' },
];
function renderTabbar(){
  $('#tabbar').innerHTML = TABS.map(t=>`
    <button class="tab ${state.tab===t.key?'active':''}" data-tab="${t.key}">
      ${I(t.icon)}<span>${t.label}</span>
    </button>`).join('');
  $('#tabbar').querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{
    if(state.tab===b.dataset.tab) return;
    location.hash = '#'+b.dataset.tab;
  }));
}
function route(){
  const h = (location.hash||'#today').slice(1);
  state.tab = TABS.some(t=>t.key===h) ? h : 'today';
  renderTabbar(); rerender();
  $('#fab').style.display = state.tab==='today' ? 'flex' : 'none';
}
function rerender(){
  ({today:renderToday, week:renderWeek, focus:renderFocus, rhythm:renderRhythm})[state.tab]();
}

(function init(){
  loadPatch();
  $('#fab').innerHTML = I('plus');
  $('#fab').addEventListener('click', openAdd);
  window.addEventListener('hashchange', route);
  route();

  // 首次进入 8 秒后，来一次真实的呼吸提醒演示
  setTimeout(()=>{ if(!state.breatheShown){ state.breatheShown=true; showBreathe(false); } }, 8000);
})();
