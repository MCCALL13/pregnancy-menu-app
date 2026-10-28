// ui.jsx — 共享工具、图标、排餐算法、存储
const { useState, useEffect, useMemo, useRef, useCallback } = React;

const PD = window.PREGNANCY_DATA;

/* ---------- 存储 ---------- */
const LS = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  },
};
const K = {
  profile: 'pm_profile_v2',
  orders: 'pm_orders_v2',
  planOverrides: 'pm_plan_v2',
  favorites: 'pm_fav_v2',
  role: 'pm_role_v2',
};

/* ---------- 日期 / 孕周 ---------- */
function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function parseYmd(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
const WEEK_CN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const WEEK_KEY = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function weekOf(stageDate) {
  const lmp = parseYmd(PD.meta.lmp || '2026-09-18');
  const days = Math.floor((stageDate - lmp) / 86400000);
  const week = Math.max(1, Math.floor(days / 7) + 1);
  return { week: Math.min(week, 42), day: ((days % 7) + 7) % 7, days };
}
function stageOf(week) {
  if (week <= 13) return 'early';
  if (week <= 27) return 'mid';
  return 'late';
}
const STAGE_LABEL = { early: '孕早期', mid: '孕中期', late: '孕晚期' };

/* ---------- 排餐算法：确定性生成每日菜单 ---------- */
const MEAL_ORDER = ['早餐', '上午加餐', '午餐', '下午加餐', '晚餐', '睡前加餐'];
const MEAL_TIME = {
  '早餐': '7:00 - 8:30',
  '上午加餐': '10:00 - 10:30',
  '午餐': '12:00 - 13:00',
  '下午加餐': '15:00 - 16:00',
  '晚餐': '18:00 - 19:00',
  '睡前加餐': '21:00 前',
};
const MEAL_SLOTS = [
  { meal: '早餐', slots: [{ type: '主食', pool: '早餐' }] },
  { meal: '上午加餐', slots: [{ type: '加餐', pool: '上午加餐' }] },
  { meal: '午餐', slots: [
    { type: '主食', pool: '午餐' },
    { type: '荤菜', pool: '午餐' },
    { type: '素菜', pool: '午餐' },
    { type: '汤', pool: 'all' },
  ] },
  { meal: '下午加餐', slots: [{ type: '加餐', pool: '下午加餐' }] },
  { meal: '晚餐', slots: [
    { type: '主食', pool: '晚餐' },
    { type: '荤菜', pool: '晚餐' },
    { type: '素菜', pool: '晚餐' },
    { type: '汤', pool: 'all' },
  ] },
  { meal: '睡前加餐', slots: [{ type: '加餐', pool: '睡前加餐' }] },
];

function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function poolFor(slot, stage) {
  const byStage = PD.dishes.filter((d) => d.suitable.includes(stage));
  let list = byStage.filter(
    (d) => d.type === slot.type && (slot.pool === 'all' || d.meal === slot.pool)
  );
  if (list.length === 0) list = byStage.filter((d) => d.type === slot.type);
  if (list.length === 0) list = byStage;
  return list;
}

/** 某天完整菜单（确定性，同一天永远一样） */
function planForDate(dateStr, stage) {
  const seedBase = hashStr(dateStr + '|' + stage);
  const used = new Set();
  return MEAL_SLOTS.map((group, gi) => {
    const dishes = group.slots.map((slot, si) => {
      const pool = poolFor(slot, stage);
      let idx = (seedBase + gi * 37 + si * 11) % pool.length;
      let guard = 0;
      while (used.has(pool[idx].id) && guard < pool.length) {
        idx = (idx + 1) % pool.length;
        guard++;
      }
      const dish = pool[idx];
      used.add(dish.id);
      return { dish, type: slot.type, slot: si };
    });
    return { meal: group.meal, dishes };
  });
}

/** 某个菜位可替换的其它菜 */
function alternativesFor(meal, slotType, stage, excludeId) {
  const group = MEAL_SLOTS.find((g) => g.meal === meal);
  const slot = group ? group.slots.find((s) => s.type === slotType) : null;
  const cfg = slot || { type: slotType, pool: meal };
  return poolFor(cfg, stage).filter((d) => d.id !== excludeId);
}

/* ---------- 营养统计 ---------- */
const NUTRIENT_KEYS = [
  { key: '叶酸', match: ['叶酸'], label: '叶酸' },
  { key: '铁', match: ['铁'], label: '铁' },
  { key: '钙', match: ['钙'], label: '钙' },
  { key: 'DHA', match: ['DHA'], label: 'DHA' },
  { key: '蛋白质', match: ['蛋白'], label: '蛋白' },
  { key: '膳食纤维', match: ['膳食纤维'], label: '纤维' },
];

function nutrientCoverage(dishes) {
  return NUTRIENT_KEYS.map((n) => {
    const count = dishes.filter(
      (d) => d && d.nutrients && d.nutrients.some((x) => n.match.some((m) => x.includes(m)))
    ).length;
    return { ...n, count };
  });
}

function dietBalance(dishes) {
  const valid = dishes.filter(Boolean);
  const hasVeg = valid.some((d) => d.type === '素菜');
  const hasProtein = valid.some((d) => d.type === '荤菜' || d.nutrients.some((n) => n.includes('蛋白')));
  const hasGrain = valid.some((d) => d.type === '主食');
  const hasSoup = valid.some((d) => d.type === '汤');
  return { hasVeg, hasProtein, hasGrain, hasSoup };
}

/* ---------- 图标 ---------- */
function Icon({ name, size = 20, stroke = 1.7, style }) {
  const p = {
    home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V20h13V9.5" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5V5.5" /><path d="M8 7.5h8M8 11h6" /></>,
    leaf: <><path d="M20 4C10 4 4 9 4 16c0 2 .5 3.5 1 4" /><path d="M20 4c0 9-5.5 13-11 13H5" /></>,
    bell: <><path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" /><path d="M10.5 20a1.8 1.8 0 0 0 3 0" /></>,
    check: <path d="m4.5 12.5 5 5L20 6.5" />,
    swap: <><path d="M4 8h13l-3-3M20 16H7l3 3" /></>,
    chevron: <path d="m9 5 7 7-7 7" />,
    down: <path d="m5 9 7 7 7-7" />,
    close: <><path d="M6 6l12 12M18 6 6 18" /></>,
    heart: <path d="M12 20s-7-4.6-7-9.4A4 4 0 0 1 12 7.6 4 4 0 0 1 19 10.6C19 15.4 12 20 12 20z" />,
    gear: <><circle cx="12" cy="12" r="3.2" /><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
    pot: <><path d="M4 10h16v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" /><path d="M9 6.5c0-1 1-1 1-2M14 6.5c0-1 1-1 1-2" /></>,
    receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9.5 8h5M9.5 12h5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M4 12h15" /><path d="m14 6 6 6-6 6" /></>,
    shield: <><path d="M12 3.5 19 6v6c0 4.5-3 7-7 8.5C8 19 5 16.5 5 12V6z" /><path d="m9 12 2 2 4-4" /></>,
    flame: <><path d="M12 3c1 3.5-2 4.5-2 7a2 2 0 1 0 4 0c0-1 0-1.5-.5-2.5 2 1.5 3.5 3.5 3.5 6a5 5 0 1 1-10 0C7 9.5 11 8 12 3z" /></>,
    users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M16 5.5a3 3 0 0 1 0 5.6M17.5 20c0-2-.6-3.6-1.6-4.6" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...(style || {}) }}>
      {p[name] || p.home}
    </svg>
  );
}

/* ---------- 基础组件 ---------- */
function Sheet({ onClose, children, bodyStyle }) {
  return (
    <div className="sheet-mask" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab"></div>
        <div className="sheet-body" style={bodyStyle}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ text, tone = 'ink' }) {
  const bg = tone === 'green' ? 'var(--green)' : tone === 'coral' ? 'var(--coral)' : 'var(--ink)';
  return (
    <div className="toast" style={{ background: bg }}>
      <Icon name="check" size={16} stroke={2.2} />
      <span>{text}</span>
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 10px' }}>
      <div className="sec-title" style={{ flex: 1 }}>{children}</div>
      {right}
    </div>
  );
}

function DishTags({ dish, max = 3 }) {
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      {dish.tags.slice(0, max).map((t) => (
        <span key={t} className="chip">{t}</span>
      ))}
    </div>
  );
}

Object.assign(window, {
  PD, LS, K, ymd, parseYmd, WEEK_CN, WEEK_KEY, weekOf, stageOf, STAGE_LABEL,
  MEAL_ORDER, MEAL_TIME, MEAL_SLOTS, hashStr, planForDate, alternativesFor,
  NUTRIENT_KEYS, nutrientCoverage, dietBalance,
  Icon, Sheet, Toast, SectionTitle, DishTags,
});
