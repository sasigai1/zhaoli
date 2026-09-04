/* ============ 提醒：系统通知 + 提示音 ============ */
'use strict';

const Reminder = {
  ctx: null,

  init() {
    setInterval(() => this.tick(), 20000);
    // 浏览器要求用户交互后才能播放声音，首次点击时恢复 AudioContext
    document.addEventListener('pointerdown', () => {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }, { passive: true });
  },

  tick() {
    const st = store.data.settings;
    if (!st.notify) return;
    const now = Date.now();
    let changed = false;
    store.data.schedules.forEach(s => {
      if (s.done || s.notified || !s.time || s.reminderMin < 0) return;
      const t = new Date(s.date + 'T' + s.time + ':00').getTime();
      const fireAt = t - (s.reminderMin || 0) * 60000;
      if (now >= fireAt && now <= t + 30 * 60000) {
        s.notified = true;
        changed = true;
        this.fire(s);
      }
    });
    if (changed) store.save();
  },

  fire(s) {
    toast(`提醒：${s.time} ${s.title}`, 5000);
    if (store.data.settings.sound) this.chime();
    // APK 环境：走原生系统通知
    if (window.AndroidBridge && AndroidBridge.notify) {
      AndroidBridge.notify('日程提醒', `${s.time || ''} ${s.title}`);
      return;
    }
    if ('Notification' in window && Notification.permission === 'granted') {
      try { new Notification('日程提醒', { body: `${s.time || ''} ${s.title}` }); } catch (e) {}
    }
  },

  /* 双音提示声 */
  chime() {
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const ctx = this.ctx, t = ctx.currentTime;
      [[880, 0], [659.25, 0.18]].forEach(([f, off]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t + off);
        g.gain.linearRampToValueAtTime(0.25, t + off + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + off + 0.9);
        o.connect(g).connect(ctx.destination);
        o.start(t + off);
        o.stop(t + off + 1);
      });
    } catch (e) {}
  },

  async ensurePermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    try { return (await Notification.requestPermission()) === 'granted'; }
    catch (e) { return false; }
  },
};
