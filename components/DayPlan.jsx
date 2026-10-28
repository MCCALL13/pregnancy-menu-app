// DayPlan.jsx — 今日菜谱 / 点菜端
const { useState, useMemo } = React;

function CoverageCard({ dishes, stage }) {
  const cov = nutrientCoverage(dishes);
  const bal = dietBalance(dishes);
  const checks = [
    { on: bal.hasGrain, label: '谷类' },
    { on: bal.hasProtein, label: '蛋白' },
    { on: bal.hasVeg, label: '蔬菜' },
    { on: bal.hasSoup, label: '汤水' },
  ];

  return (
    <div className="card" style={{ padding: '14px 16px 13px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <span className="serif" style={{ fontSize: 15, fontWeight: 600 }}>今日营养覆盖</span>
          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{STAGE_LABEL[stage]} · 已选 {dishes.length} 道</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '11px 10px' }}>
        {cov.map((n) => (
          <div key={n.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--ink-2)' }}>{n.label}</span>
              <span className="num" style={{ fontSize: 10.5, color: n.count >= 2 ? 'var(--green)' : 'var(--ink-3)', fontWeight: 600 }}>
                {n.count}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: i < n.count ? (n.count >= 2 ? 'var(--green)' : 'var(--gold)') : 'var(--line-soft)',
                  transition: 'background .25s',
                }}></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 13, paddingTop: 11, borderTop: '1px solid var(--line-soft)' }}>
        {checks.map((c) => (
          <div key={c.label} style={{
            display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5,
            color: c.on ? 'var(--green)' : 'var(--ink-3)',
          }}>
            <span style={{
              width: 13, height: 13, borderRadius: 4, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: c.on ? 'var(--green)' : 'transparent',
              border: c.on ? 'none' : '1px solid var(--line)',
              color: '#fff',
            }}>
              {c.on && <Icon name="check" size={9} stroke={3} />}
            </span>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function DishRow({ item, meal, selected, onToggle, onSwap, onOpen }) {
  const d = item.dish;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0',
      borderTop: '1px solid var(--line-soft)',
    }}>
      <button
        onClick={() => onToggle(d.id)}
        aria-label={selected ? '取消这道' : '点这道'}
        style={{
          width: 21, height: 21, borderRadius: 7, flexShrink: 0, cursor: 'pointer',
          border: selected ? 'none' : '1.5px solid var(--line)',
          background: selected ? 'var(--coral)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', transition: 'all .16s',
        }}
      >
        {selected && <Icon name="check" size={13} stroke={3} />}
      </button>

      <div onClick={() => onOpen(d)} style={{ flex: 1, minWidth: 0, cursor: 'pointer', opacity: selected ? 1 : 0.45 }}>
        <div style={{
          fontSize: 14, fontWeight: 500, lineHeight: 1.4,
          textDecoration: selected ? 'none' : 'line-through',
          textDecorationColor: 'var(--ink-3)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{d.name}</div>
        <div style={{ display: 'flex', gap: 4, marginTop: 3, alignItems: 'center', overflow: 'hidden' }}>
          <span style={{ fontSize: 10, color: 'var(--ink-3)', flexShrink: 0 }}>{item.type}</span>
          {d.nutrients.slice(0, 2).map((n) => (
            <span key={n} className="chip green" style={{ fontSize: 9.5, padding: '1px 5px' }}>{n}</span>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSwap(meal, item)}
        aria-label="换一道"
        style={{
          border: '1px solid var(--line)', background: 'var(--surface)', cursor: 'pointer',
          width: 28, height: 28, borderRadius: 9, color: 'var(--ink-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <Icon name="swap" size={13} />
      </button>
    </div>
  );
}

function DayPlanView({ dateStr, stage, plan, excluded, onToggle, onSwap, onOpenRecipe, onSubmit, onOpenSettings, showCoverage, lmp }) {
  const isToday = dateStr === ymd(new Date());
  const allDishes = plan.flatMap((g) => g.dishes);
  const selectedIds = allDishes.filter((x) => !excluded[x.dish.id]).map((x) => x.dish.id);
  const selectedDishes = allDishes.filter((x) => !excluded[x.dish.id]).map((x) => x.dish);
  const weekday = WEEK_CN[parseYmd(dateStr).getDay()];
  const tip = PD.weekdayTips[WEEK_KEY[parseYmd(dateStr).getDay()]];

  return (
    <div className="scroll" style={{ flex: 1, position: 'relative' }}>
      <div style={{ padding: '14px 18px 96px' }}>
        {/* 当日主题提示 */}
        <div style={{
          display: 'flex', gap: 9, alignItems: 'flex-start', padding: '11px 13px',
          background: 'var(--gold-soft)', borderRadius: 'var(--r-s)', marginBottom: 14,
          borderLeft: '3px solid var(--gold)',
        }}>
          <Icon name="leaf" size={15} style={{ color: '#8A6516', marginTop: 2 }} />
          <div style={{ fontSize: 11.5, lineHeight: 1.55, color: '#7A5C1C' }}>{tip}</div>
        </div>

        {showCoverage !== false && <CoverageCard dishes={selectedDishes} stage={stage} />}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <span className="serif" style={{ fontSize: 16, fontWeight: 600 }}>
            {isToday ? '今天吃什么' : `${weekday}的菜谱`}
          </span>
          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            点一下菜品看做法 · 勾选你要的
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {plan.map((group, gi) => {
            const count = group.dishes.length;
            return (
              <div key={group.meal} className="card fade-up" style={{ padding: '12px 14px 12px', animationDelay: `${gi * 40}ms` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                    <span className="serif" style={{ fontSize: 15, fontWeight: 600 }}>{group.meal}</span>
                    <span style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{MEAL_TIME[group.meal]}</span>
                  </div>
                  <span style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{count} 道</span>
                </div>
                {group.dishes.map((item) => (
                  <DishRow
                    key={group.meal + item.dish.id + item.slot}
                    item={item}
                    meal={group.meal}
                    selected={!excluded[item.dish.id]}
                    onToggle={onToggle}
                    onSwap={onSwap}
                    onOpen={onOpenRecipe}
                  />
                ))}
              </div>
            );
          })}
        </div>

        <button
          onClick={onOpenSettings}
          style={{
            width: '100%', marginTop: 18, padding: '11px', borderRadius: 12,
            border: '1px dashed var(--line)', background: 'transparent',
            color: 'var(--ink-3)', fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          末次月经 {lmp} · 修改孕周信息
        </button>
      </div>

      {/* 提交条 */}
      <div style={{
        position: 'sticky', bottom: 0, padding: '10px 18px 14px',
        background: 'linear-gradient(180deg, rgba(244,243,236,0) 0%, var(--bg) 34%)',
      }}>
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'space-between', padding: '13px 18px' }}
          disabled={selectedIds.length === 0}
          onClick={() => onSubmit(selectedDishes, selectedIds)}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="receipt" size={17} />
            提交点菜
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, opacity: .9 }}>
            {selectedIds.length} 道 · 共 6 餐
            <Icon name="arrow" size={15} />
          </span>
        </button>
      </div>
    </div>
  );
}

/* ---------- 换菜面板 ---------- */
function SwapSheet({ meal, item, stage, onPick, onClose }) {
  const options = useMemo(
    () => alternativesFor(meal, item.type, stage, item.dish.id),
    [meal, item.type, stage, item.dish.id]
  );
  return (
    <Sheet onClose={onClose}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--ink-3)' }}>替换 · {meal}</div>
          <div className="serif" style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>
            换一道{item.type}
          </div>
        </div>
        <button className="icon-btn" style={{ color: 'var(--ink-2)', borderColor: 'var(--line)', background: 'var(--surface)' }} onClick={onClose}>
          <Icon name="close" size={16} />
        </button>
      </div>

      <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--ink-3)' }}>
        当前：{item.dish.name}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {options.map((d) => (
          <button
            key={d.id}
            onClick={() => onPick(d)}
            style={{
              textAlign: 'left', background: 'var(--surface)', border: '1px solid var(--line)',
              borderRadius: 12, padding: '11px 13px', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{d.name}</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                {d.tags.slice(0, 3).map((t) => <span key={t} className="chip" style={{ fontSize: 9.5 }}>{t}</span>)}
              </div>
            </div>
            <Icon name="plus" size={15} style={{ color: 'var(--coral)' }} />
          </button>
        ))}
      </div>
    </Sheet>
  );
}

Object.assign(window, { DayPlanView, SwapSheet, CoverageCard, DishRow });
