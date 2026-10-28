// Library.jsx — 菜谱库 + 菜谱详情
const { useState, useMemo } = React;

const PORTION_MAP = {
  '主食': [['grains', '谷类'], ['oil', '烹调油']],
  '荤菜': [['meat', '鱼禽肉蛋'], ['oil', '烹调油']],
  '素菜': [['vegetables', '蔬菜'], ['oil', '烹调油']],
  '汤': [['water', '饮水'], ['oil', '烹调油']],
  '加餐': [['fruit', '水果'], ['milk', '奶类'], ['nuts', '豆类坚果']],
};

const MEAL_FILTERS = [
  { key: 'all', label: '全部' },
  { key: '早餐', label: '早餐' },
  { key: '上午加餐', label: '上午加餐' },
  { key: '午餐', label: '午餐' },
  { key: '下午加餐', label: '下午加餐' },
  { key: '晚餐', label: '晚餐' },
  { key: '睡前加餐', label: '睡前加餐' },
];
const TYPE_FILTERS = ['全部', '主食', '荤菜', '素菜', '汤', '加餐'];

function RecipeSheet({ dish, stage, onClose, isFav, onFav }) {
  if (!dish) return null;
  const portions = PORTION_MAP[dish.type] || [];
  const covered = dish.suitable.includes(stage);

  return (
    <Sheet onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className="chip coral">{dish.meal}</span>
            <span className="chip">{dish.type}</span>
            <span style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{MEAL_TIME[dish.meal]}</span>
          </div>
          <h2 className="serif" style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.35, marginTop: 9 }}>
            {dish.name}
          </h2>
        </div>
        <button
          className="icon-btn"
          onClick={() => onFav(dish.id)}
          aria-label="收藏"
          style={{
            color: isFav ? 'var(--coral)' : 'var(--ink-3)',
            borderColor: 'var(--line)', background: 'var(--surface)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20s-7-4.6-7-9.4A4 4 0 0 1 12 7.6 4 4 0 0 1 19 10.6C19 15.4 12 20 12 20z" />
          </svg>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 12 }}>
        {dish.tags.map((t) => <span key={t} className="chip green">{t}</span>)}
        {!covered && <span className="chip gold">当前孕周慎选</span>}
      </div>

      {/* 做法 */}
      <div style={{ marginTop: 18 }}>
        <div className="sec-title" style={{ marginBottom: 8 }}>做法</div>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12,
          padding: '13px 15px', fontSize: 13.5, lineHeight: 1.75, color: 'var(--ink)',
        }}>
          {dish.desc}
        </div>
      </div>

      {/* 营养 */}
      <div style={{ marginTop: 16 }}>
        <div className="sec-title" style={{ marginBottom: 8 }}>提供营养</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {dish.nutrients.map((n) => (
            <span key={n} style={{
              fontSize: 12, fontWeight: 500, padding: '5px 11px', borderRadius: 8,
              background: 'var(--green-soft)', color: 'var(--green)',
            }}>{n}</span>
          ))}
        </div>
      </div>

      {/* 份量 */}
      {portions.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="sec-title" style={{ marginBottom: 8 }}>全日份量参考</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {portions.map(([k, label]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12 }}>
                <span style={{ color: 'var(--ink-2)' }}>{label}</span>
                <span style={{ color: 'var(--ink)', textAlign: 'right', flex: 1, fontWeight: 500 }}>
                  {PD.dailyTemplate.portions[k]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 适用阶段 */}
      <div style={{ marginTop: 16, display: 'flex', gap: 6 }}>
        {['early', 'mid', 'late'].map((s) => (
          <span key={s} style={{
            flex: 1, textAlign: 'center', fontSize: 11.5, padding: '9px 0', borderRadius: 9,
            background: dish.suitable.includes(s) ? 'var(--green-soft)' : 'var(--surface-2)',
            color: dish.suitable.includes(s) ? 'var(--green)' : 'var(--ink-3)',
            border: '1px solid ' + (dish.suitable.includes(s) ? 'transparent' : 'var(--line-soft)'),
            fontWeight: dish.suitable.includes(s) ? 600 : 400,
          }}>{STAGE_LABEL[s]}</span>
        ))}
      </div>

      <button className="btn btn-dark" style={{ width: '100%', marginTop: 18 }} onClick={onClose}>
        收起
      </button>
    </Sheet>
  );
}

function LibraryView({ stage, onOpenRecipe, favorites, onFav }) {
  const [mealFilter, setMealFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('全部');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return PD.dishes.filter((d) => {
      if (mealFilter !== 'all' && d.meal !== mealFilter) return false;
      if (typeFilter !== '全部' && d.type !== typeFilter) return false;
      if (query) {
        const hay = d.name + d.nutrients.join('') + d.tags.join('') + d.desc;
        if (!hay.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [mealFilter, typeFilter, q]);

  return (
    <div className="scroll" style={{ flex: 1 }}>
      <div style={{ padding: '14px 18px 6px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)',
          border: '1px solid var(--line)', borderRadius: 12, padding: '10px 13px',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜菜名、营养或食材做法"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13, fontFamily: 'inherit', color: 'var(--ink)', minWidth: 0,
            }}
          />
          {q && (
            <button onClick={() => setQ('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 2 }}>
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="hscroll" style={{ gap: 6, padding: '6px 18px 8px' }}>
        {MEAL_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setMealFilter(f.key)}
            style={{
              flexShrink: 0, border: '1px solid ' + (mealFilter === f.key ? 'transparent' : 'var(--line)'),
              background: mealFilter === f.key ? 'var(--green)' : 'var(--surface)',
              color: mealFilter === f.key ? '#F3F1E6' : 'var(--ink-2)',
              fontSize: 11.5, fontWeight: mealFilter === f.key ? 600 : 400,
              padding: '6px 12px', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >{f.label}</button>
        ))}
      </div>

      <div className="hscroll" style={{ gap: 6, padding: '0 18px 12px' }}>
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            style={{
              flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: typeFilter === t ? 'var(--coral-soft)' : 'transparent',
              color: typeFilter === t ? '#B44B36' : 'var(--ink-3)',
              fontSize: 11, fontWeight: typeFilter === t ? 600 : 400,
              padding: '5px 9px', borderRadius: 8,
            }}
          >{t}</button>
        ))}
      </div>

      <div style={{ padding: '0 18px 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 10 }}>
          {list.length} 道菜谱 · 按{STAGE_LABEL[stage]}营养需求标注
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {list.map((d, i) => {
            const ok = d.suitable.includes(stage);
            return (
              <div
                key={d.id}
                onClick={() => onOpenRecipe(d)}
                className="card fade-up"
                style={{
                  padding: '12px 14px', cursor: 'pointer', display: 'flex', gap: 11,
                  alignItems: 'center', animationDelay: `${Math.min(i, 8) * 25}ms`,
                  opacity: ok ? 1 : 0.62,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.name}
                    </span>
                    {favorites.includes(d.id) && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--coral)" style={{ flexShrink: 0 }}>
                        <path d="M12 20s-7-4.6-7-9.4A4 4 0 0 1 12 7.6 4 4 0 0 1 19 10.6C19 15.4 12 20 12 20z" />
                      </svg>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>{d.type}</span>
                    {d.nutrients.slice(0, 3).map((n) => (
                      <span key={n} className="chip green" style={{ fontSize: 9.5, padding: '1px 5px' }}>{n}</span>
                    ))}
                    {!ok && <span className="chip gold" style={{ fontSize: 9.5, padding: '1px 5px' }}>本阶段慎选</span>}
                  </div>
                </div>
                <Icon name="chevron" size={15} style={{ color: 'var(--ink-3)' }} />
              </div>
            );
          })}
          {list.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-3)', fontSize: 12.5 }}>
              没找到对应的菜谱，换个关键词试试
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LibraryView, RecipeSheet, PORTION_MAP });
