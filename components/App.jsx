// App.jsx — 应用外壳
const { useState, useEffect, useMemo, useCallback } = React;

const DEFAULT_PROFILE = { nickname: '美晨', husband: '老公', lmp: '2026-09-18' };

const TABS = {
  wife: [
    { key: 'today', label: '点菜', icon: 'pot' },
    { key: 'library', label: '菜谱', icon: 'book' },
    { key: 'guide', label: '营养', icon: 'leaf' },
  ],
  husband: [
    { key: 'orders', label: '接单', icon: 'bell' },
    { key: 'schedule', label: '菜谱', icon: 'book' },
    { key: 'guide', label: '营养', icon: 'leaf' },
  ],
};

const ACCENT_OPTIONS = ['#E4674F', '#2F5545', '#3E6C8A', '#8A5A7A'];

function useWeek(profile, dateStr) {
  return useMemo(() => {
    const lmp = parseYmd(profile.lmp);
    const target = parseYmd(dateStr);
    const days = Math.floor((target - lmp) / 86400000);
    const week = Math.min(42, Math.max(1, Math.floor(days / 7) + 1));
    const stage = stageOf(week);
    const edc = new Date(lmp.getTime() + 280 * 86400000);
    const left = Math.ceil((edc - new Date()) / 86400000);
    return { week, stage, left, edc };
  }, [profile.lmp, dateStr]);
}

/* ---------- 身份选择 ---------- */
function Welcome({ onPick }) {
  return (
    <div className="sheet-mask" style={{ alignItems: 'center', padding: 24, zIndex: 150 }}>
      <div className="pop" style={{
        width: '100%', background: 'var(--bg)', borderRadius: 24, padding: '26px 22px 22px',
        boxShadow: 'var(--shadow-3)',
      }}>
        <div style={{ color: 'var(--green)', marginBottom: 14 }}>
          <Icon name="pot" size={28} />
        </div>
        <div className="serif" style={{ fontSize: 23, fontWeight: 600, lineHeight: 1.35 }}>
          两个人的一张点菜单
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.7, marginTop: 8 }}>
          她在微信里点菜，你接单备菜。<br />先选一下你是谁：
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 20 }}>
          <button className="btn btn-primary" style={{ justifyContent: 'flex-start', padding: '14px 16px' }} onClick={() => onPick('wife')}>
            <Icon name="heart" size={17} />
            <span style={{ textAlign: 'left', flex: 1 }}>
              <span style={{ display: 'block', fontSize: 14.5 }}>我是美晨，来点菜</span>
              <span style={{ display: 'block', fontSize: 10.5, fontWeight: 400, opacity: .85 }}>看今天的菜谱，勾选想吃的</span>
            </span>
            <Icon name="arrow" size={16} />
          </button>
          <button className="btn btn-dark" style={{ justifyContent: 'flex-start', padding: '14px 16px' }} onClick={() => onPick('husband')}>
            <Icon name="bell" size={17} />
            <span style={{ textAlign: 'left', flex: 1 }}>
              <span style={{ display: 'block', fontSize: 14.5 }}>我是老公，来收单</span>
              <span style={{ display: 'block', fontSize: 10.5, fontWeight: 400, opacity: .75 }}>接单、看做菜清单</span>
            </span>
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 提交确认 ---------- */
function SubmitSheet({ dishes, note, setNote, onConfirm, onClose, nickname }) {
  const grouped = useMemo(() => {
    const map = {};
    dishes.forEach((d) => { (map[d.meal] = map[d.meal] || []).push(d); });
    return MEAL_ORDER.filter((m) => map[m]).map((m) => ({ meal: m, dishes: map[m] }));
  }, [dishes]);

  return (
    <Sheet onClose={onClose}>
      <div className="eyebrow" style={{ color: 'var(--ink-3)' }}>确认点菜</div>
      <div className="serif" style={{ fontSize: 20, fontWeight: 600, marginTop: 3 }}>
        {dishes.length} 道菜，发给老公
      </div>

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {grouped.map((g) => (
          <div key={g.meal} style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: '0 0 58px', fontSize: 11.5, color: 'var(--ink-3)', paddingTop: 2 }}>{g.meal}</div>
            <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.65 }}>
              {g.dishes.map((d) => d.name).join(' · ')}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginBottom: 7 }}>想跟他说点什么（选填）</div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="例：今天想清淡一点，汤多一点～"
          rows={3}
          style={{
            width: '100%', border: '1px solid var(--line)', borderRadius: 11,
            padding: '11px 13px', fontSize: 13, fontFamily: 'inherit', lineHeight: 1.6,
            background: 'var(--surface)', color: 'var(--ink)', outline: 'none', resize: 'none',
          }}
        />
      </div>

      <div style={{
        marginTop: 12, fontSize: 10.5, color: 'var(--ink-3)', lineHeight: 1.6,
        display: 'flex', gap: 6, alignItems: 'flex-start',
      }}>
        <Icon name="bell" size={12} style={{ marginTop: 2 }} />
        提交后飞书群「{window.FEISHU ? window.FEISHU.GROUP_NAME : '宝贝计划'}」会立刻收到点菜卡片
      </div>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={onConfirm}>
        <Icon name="receipt" size={17} />
        发送点菜单
      </button>
    </Sheet>
  );
}

/* ---------- 设置 ---------- */
function SettingsSheet({ profile, onSave, onClose, onResetRole, onShare, lastNotify }) {
  const [nick, setNick] = useState(profile.nickname);
  const [lmp, setLmp] = useState(profile.lmp);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    const r = await window.FEISHU.sendTest();
    setTestResult(r);
    setTesting(false);
  };

  return (
    <Sheet onClose={onClose}>
      <div className="eyebrow" style={{ color: 'var(--ink-3)' }}>设置</div>
      <div className="serif" style={{ fontSize: 19, fontWeight: 600, marginTop: 3 }}>孕周与昵称</div>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 13 }}>
        <label style={{ display: 'block' }}>
          <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginBottom: 6 }}>她的昵称</div>
          <input
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            style={{
              width: '100%', border: '1px solid var(--line)', borderRadius: 10, padding: '11px 13px',
              fontSize: 13.5, fontFamily: 'inherit', background: 'var(--surface)',
              color: 'var(--ink)', outline: 'none',
            }}
          />
        </label>
        <label style={{ display: 'block' }}>
          <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginBottom: 6 }}>末次月经第一天</div>
          <input
            type="date"
            value={lmp}
            onChange={(e) => setLmp(e.target.value)}
            style={{
              width: '100%', border: '1px solid var(--line)', borderRadius: 10, padding: '11px 13px',
              fontSize: 13.5, fontFamily: 'inherit', background: 'var(--surface)',
              color: 'var(--ink)', outline: 'none',
            }}
          />
        </label>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginBottom: 7 }}>点菜通知</div>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 11,
          padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ color: 'var(--green)' }}><Icon name="bell" size={15} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>飞书群 · {window.FEISHU ? window.FEISHU.GROUP_NAME : '宝贝计划·个人专属'}</div>
            <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              自定义机器人 · webhook 已接通
            </div>
          </div>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: 'var(--green)' }}></span>
        </div>
        <button
          className="btn btn-ghost"
          style={{ width: '100%', marginTop: 8, justifyContent: 'center', padding: '10px' }}
          onClick={runTest}
          disabled={testing}
        >
          {testing ? '正在发送…' : '发送一条测试消息'}
        </button>
        {lastNotify && !testResult && (
          <div style={{ marginTop: 7, fontSize: 10, color: 'var(--ink-3)' }}>
            上次点菜通知：{lastNotify.ok ? '已发送' : '发送失败'} ·
            {' '}{new Date(lastNotify.at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
        {testResult && (
          <div style={{
            marginTop: 8, fontSize: 11, lineHeight: 1.6, borderRadius: 9, padding: '8px 11px',
            background: testResult.ok ? 'var(--green-soft)' : 'var(--red-soft)',
            color: testResult.ok ? 'var(--green)' : 'var(--red)',
          }}>
            {testResult.ok ? '发送成功：' : '发送失败：'}{testResult.msg}
          </div>
        )}
      </div>

      <div style={{
        marginTop: 14, fontSize: 10.5, color: 'var(--ink-3)', lineHeight: 1.7,
        background: 'var(--surface-2)', borderRadius: 10, padding: '10px 12px',
      }}>
        菜谱与营养标准来自《中国孕期妇女膳食指南(2022)》与 WS/T801-2022。孕周按末次月经推算，仅供参考，具体请遵医嘱。
      </div>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}
        onClick={() => onSave({ nickname: nick.trim() || '美晨', lmp })}>
        保存
      </button>
      <button className="btn btn-ghost" style={{ width: '100%', marginTop: 8, justifyContent: 'center' }} onClick={onShare}>
        <Icon name="arrow" size={14} /> 复制页面链接，发到她的微信
      </button>
      <button
        onClick={onResetRole}
        style={{
          width: '100%', marginTop: 9, padding: '11px', background: 'none', border: 'none',
          color: 'var(--ink-3)', fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >切换身份（{profile.nickname === '美晨' ? '当前：点菜端' : '当前：接单端'}）</button>
    </Sheet>
  );
}

/* ---------- 主应用 ---------- */
function App() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS_INIT || { accent: '#E4674F', showCoverage: true });
  const [profile, setProfile] = useState(() => LS.get(K.profile, DEFAULT_PROFILE));
  const [role, setRole] = useState(() => LS.get(K.role, 'wife'));
  const [lastNotify, setLastNotify] = useState(() => LS.get('pm_last_notify', null));
  const [tab, setTab] = useState('today');
  const [dateStr, setDateStr] = useState(ymd(new Date()));
  const [orders, setOrders] = useState(() => LS.get(K.orders, []));
  const [overrides, setOverrides] = useState(() => LS.get(K.planOverrides, {}));
  const [excluded, setExcluded] = useState({});
  const [favorites, setFavorites] = useState(() => LS.get(K.favorites, []));
  const [recipe, setRecipe] = useState(null);
  const [swap, setSwap] = useState(null);
  const [submitDishes, setSubmitDishes] = useState(null);
  const [note, setNote] = useState('');
  const [settings, setSettings] = useState(false);
  const [toast, setToast] = useState(null);
  const [push, setPush] = useState(null);

  const { week, stage, left } = useWeek(profile, dateStr);

  /* 主题色 */
  useEffect(() => {
    document.documentElement.style.setProperty('--coral', t.accent);
  }, [t.accent]);

  /* 持久化 */
  useEffect(() => { LS.set(K.profile, profile); }, [profile]);
  useEffect(() => { LS.set(K.orders, orders); }, [orders]);
  useEffect(() => { LS.set(K.planOverrides, overrides); }, [overrides]);
  useEffect(() => { LS.set(K.favorites, favorites); }, [favorites]);
  useEffect(() => { if (role) LS.set(K.role, role); }, [role]);

  /* 日期变化：回到今天时重算 */
  const todayStr = ymd(new Date());

  const basePlan = useMemo(() => planForDate(dateStr, stage), [dateStr, stage]);
  const plan = useMemo(() => {
    const ov = overrides[dateStr] || {};
    return basePlan.map((g) => ({
      ...g,
      dishes: g.dishes.map((it) => {
        const id = ov[g.meal + '|' + it.type];
        if (id) {
          const alt = PD.dishes.find((d) => d.id === id);
          if (alt) return { ...it, dish: alt };
        }
        return it;
      }),
    }));
  }, [basePlan, overrides, dateStr]);

  const excludedToday = excluded[dateStr] || {};

  const toggleDish = useCallback((id) => {
    setExcluded((prev) => {
      const cur = { ...(prev[dateStr] || {}) };
      if (cur[id]) delete cur[id]; else cur[id] = true;
      return { ...prev, [dateStr]: cur };
    });
  }, [dateStr]);

  const pickSwap = (dish) => {
    if (!swap) return;
    const key = swap.meal + '|' + swap.item.type;
    setOverrides((prev) => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), [key]: dish.id },
    }));
    setSwap(null);
    setToast({ text: '已换成「' + dish.name + '」' });
  };

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const toggleFav = (id) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSubmit = (dishes) => {
    setNote('');
    setSubmitDishes(dishes);
  };

  const confirmOrder = async () => {
    const grouped = MEAL_ORDER.map((meal) => ({
      meal,
      dishes: submitDishes.filter((d) => d.meal === meal).map((d) => ({
        id: d.id, name: d.name, type: d.type, desc: d.desc, nutrients: d.nutrients,
      })),
    })).filter((g) => g.dishes.length > 0);

    const d = parseYmd(dateStr);
    const order = {
      id: 'o' + Date.now(),
      date: dateStr,
      dateLabel: `${d.getMonth() + 1}月${d.getDate()}日`,
      createdAt: new Date().toISOString(),
      from: profile.nickname,
      status: 'new',
      items: grouped,
      note: note.trim(),
    };
    setOrders((prev) => [order, ...prev]);
    setSubmitDishes(null);
    setNote('');
    setToast({ text: '正在发送通知到飞书群…' });

    const count = grouped.reduce((s, g) => s + g.dishes.length, 0);
    const res = await window.FEISHU.send(order);
    const record = { ok: res.ok, msg: res.msg, at: Date.now() };
    setLastNotify(record);
    LS.set('pm_last_notify', record);

    if (res.ok) {
      setToast({ text: '点菜单已发到飞书群 · ' + window.FEISHU.GROUP_NAME, tone: 'green' });
      setTimeout(() => {
        setPush({ title: '点菜通知已送达', body: `${profile.nickname}点了${order.dateLabel}的菜 · ${count} 道` });
      }, 700);
    } else {
      window.FEISHU.copyText(window.FEISHU.buildText(order));
      setToast({ text: '发送失败，点菜单已复制，可手动发到群里' });
    }
  };

  const acceptOrder = (o) => {
    setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status: 'accepted' } : x));
    setToast({ text: '已接单，开始备菜', tone: 'green' });
  };
  const doneOrder = (o) => {
    setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status: 'done' } : x));
    setToast({ text: '已标记为上菜完成' });
  };

  const newsCount = orders.filter((o) => o.status === 'new').length;
  const tabs = TABS[role || 'wife'];

  const switchRole = (r) => {
    setRole(r);
    setTab(r === 'wife' ? 'today' : 'orders');
    setPush(null);
  };

  const weekDays = useMemo(() => {
    const today = new Date();
    const dow = (today.getDay() + 6) % 7;
    const monday = new Date(today.getTime() - dow * 86400000);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday.getTime() + i * 86400000);
      return {
        str: ymd(d),
        label: WEEK_CN[d.getDay()].replace('周', ''),
        num: d.getDate(),
        isToday: ymd(d) === todayStr,
      };
    });
  }, [todayStr]);

  const titles = {
    today: { eyebrow: `第 ${week} 周 · ${STAGE_LABEL[stage]}`, title: `${profile.nickname}，今天想吃什么` },
    library: { eyebrow: `共 ${PD.dishes.length} 道菜谱`, title: '菜谱库' },
    guide: { eyebrow: '中国孕期妇女膳食指南 2022', title: '营养指南' },
    orders: { eyebrow: newsCount > 0 ? `${newsCount} 张待接单` : '接单台', title: '今天的点菜单' },
    schedule: { eyebrow: `${STAGE_LABEL[stage]}参考`, title: '今日菜谱' },
  };
  const head = titles[tab] || titles.today;

  return (
    <div className="app">
      {/* 头部 */}
      <header className="hdr">
        <div className="hdr-top">
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow">{head.eyebrow}</div>
            <div className="hdr-name serif">{head.title}</div>
            <div className="hdr-sub">
              {left > 0 ? `距离预产期 ${left} 天 · 预产期 ${fmtEDC(profile.lmp)}` : '宝宝随时可能来报到'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            {role === 'husband' && newsCount > 0 && (
              <div style={{
                width: 36, height: 36, borderRadius: 11, background: 'var(--coral)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 13,
              }}>{newsCount}</div>
            )}
            <button className="icon-btn" aria-label="设置" onClick={() => setSettings(true)}>
              <Icon name="gear" size={17} />
            </button>
            <button className="icon-btn" aria-label="切换身份" onClick={() => switchRole(role === 'husband' ? 'wife' : 'husband')}>
              <Icon name="users" size={17} />
            </button>
          </div>
        </div>

        {role !== 'husband' && tab === 'today' && (
          <div className="week">
            {weekDays.map((d) => (
              <button
                key={d.str}
                className={'wd' + (dateStr === d.str ? ' on' : '') + (d.isToday ? ' today' : '')}
                onClick={() => setDateStr(d.str)}
              >
                <span>{d.isToday ? '今天' : d.label}</span>
                <span>{d.num}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* 内容 */}
      {role === 'wife' && tab === 'today' && (
        <DayPlanView
          dateStr={dateStr}
          stage={stage}
          plan={plan}
          excluded={excludedToday}
          onToggle={toggleDish}
          onSwap={(meal, item) => setSwap({ meal, item })}
          onOpenRecipe={setRecipe}
          onSubmit={handleSubmit}
          onOpenSettings={() => setSettings(true)}
          showCoverage={t.showCoverage}
          lmp={profile.lmp}
        />
      )}
      {role === 'wife' && tab === 'library' && (
        <LibraryView stage={stage} onOpenRecipe={setRecipe} favorites={favorites} onFav={toggleFav} />
      )}
      {role === 'wife' && tab === 'guide' && <GuideView stage={stage} />}

      {role === 'husband' && tab === 'orders' && (
        <OrdersView
          orders={orders}
          onAccept={acceptOrder}
          onDone={doneOrder}
          onOpenOrder={(o) => setRecipe({ __order: o })}
          nickname={profile.nickname}
        />
      )}
      {role === 'husband' && tab === 'schedule' && (
        <SchedulePreview plan={plan} stage={stage} onOpenRecipe={setRecipe} />
      )}
      {role === 'husband' && tab === 'guide' && <GuideView stage={stage} />}

      {/* 底部导航 */}
      <nav className="nav">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            className={'nav-item' + (tab === tb.key ? ' on' : '')}
            onClick={() => setTab(tb.key)}
          >
            {tb.key === 'orders' && newsCount > 0 && (
              <span className="nav-badge">{newsCount}</span>
            )}
            <Icon name={tb.icon} size={20} stroke={tab === tb.key ? 2 : 1.7} />
            <span>{tb.label}</span>
          </button>
        ))}
      </nav>

      {/* 浮层 */}
      {recipe && recipe.__order && (
        <OrderDetailSheet order={recipe.__order} onClose={() => setRecipe(null)} />
      )}
      {recipe && !recipe.__order && (
        <RecipeSheet
          dish={recipe}
          stage={stage}
          onClose={() => setRecipe(null)}
          isFav={favorites.includes(recipe.id)}
          onFav={toggleFav}
        />
      )}
      {swap && (
        <SwapSheet
          meal={swap.meal}
          item={swap.item}
          stage={stage}
          onPick={pickSwap}
          onClose={() => setSwap(null)}
        />
      )}
      {submitDishes && (
        <SubmitSheet
          dishes={submitDishes}
          note={note}
          setNote={setNote}
          onConfirm={confirmOrder}
          onClose={() => setSubmitDishes(null)}
          nickname={profile.nickname}
        />
      )}
      {settings && (
        <SettingsSheet
          profile={profile}
          onSave={(p) => { setProfile(p); setSettings(false); setToast({ text: '已更新孕周信息' }); }}
          onClose={() => setSettings(false)}
          lastNotify={lastNotify}
          onResetRole={() => { setSettings(false); setRole(null); LS.set(K.role, null); }}
          onShare={() => {
            const url = window.location.href;
            const done = () => { setSettings(false); setToast({ text: '链接已复制，粘贴到微信发给她', tone: 'green' }); };
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(url).then(done, done);
            } else { done(); }
          }}
        />
      )}

      {/* 微信推送模拟 */}
      {push && (
        <div className="push" onClick={() => { switchRole('husband'); }}>
          <div className="push-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.2 4C5.8 4 3 6.3 3 9.1c0 1.6.9 3 2.3 4l-.6 1.8 2.1-1.1c.7.2 1.5.3 2.4.3h.5a5 5 0 0 1-.2-1.3c0-2.6 2.6-4.7 5.8-4.7h.6C15.4 5.7 12.6 4 9.2 4zm-2 2.6a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zm4 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z" />
              <path d="M21 12.8c0-2.3-2.3-4.2-5-4.2s-5 1.9-5 4.2 2.3 4.2 5 4.2c.7 0 1.3-.1 1.9-.3l1.7.9-.5-1.5c1.2-.8 1.9-2 1.9-3.3zm-6.6-1.3a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6zm3.4 0a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6z" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>微信 · {push.title}</span>
              <span style={{ fontSize: 10, color: '#9A9A9A' }}>现在</span>
            </div>
            <div style={{ fontSize: 11.5, color: '#4A4A4A', lineHeight: 1.5, marginTop: 2 }}>{push.body}</div>
            <div style={{ fontSize: 10, color: '#1AAD19', marginTop: 4, fontWeight: 500 }}>点击查看点菜单 ›</div>
          </div>
        </div>
      )}

      {toast && <Toast text={toast.text} tone={toast.tone} />}

      {!role && <Welcome onPick={switchRole} />}

      <TweaksPanel>
        <TweakSection label="外观" />
        <TweakColor
          label="强调色"
          value={t.accent}
          options={ACCENT_OPTIONS}
          onChange={(v) => setTweak('accent', v)}
        />
        <TweakToggle
          label="显示营养覆盖"
          value={t.showCoverage !== false}
          onChange={(v) => setTweak('showCoverage', v)}
        />
        <TweakSection label="关于" />
        <div style={{ fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.6, padding: '0 2px' }}>
          孕期点菜 v2 · {PD.dishes.length} 道菜谱<br />
          依据《中国孕期妇女膳食指南(2022)》
        </div>
      </TweaksPanel>
    </div>
  );
}

function fmtEDC(lmp) {
  const d = new Date(parseYmd(lmp).getTime() + 280 * 86400000);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
Object.assign(window, { App, SubmitSheet, SettingsSheet, Welcome });
