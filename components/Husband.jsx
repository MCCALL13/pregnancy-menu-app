// Husband.jsx — 老公接单端
const { useState } = React;

const STATUS_META = {
  new: { label: '待接单', color: 'var(--coral)', bg: 'var(--coral-soft)' },
  accepted: { label: '已接单', color: 'var(--green)', bg: 'var(--green-soft)' },
  done: { label: '已完成', color: 'var(--ink-2)', bg: 'var(--surface-2)' },
};

function fmtTime(iso) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getMonth() + 1}月${d.getDate()}日 ${hh}:${mm}`;
}

function OrderCard({ order, onAccept, onDone, onOpen }) {
  const meta = STATUS_META[order.status];
  const count = order.items.reduce((s, g) => s + g.dishes.length, 0);
  return (
    <div className="card fade-up" style={{
      padding: '13px 15px',
      borderColor: order.status === 'new' ? 'rgba(228,103,79,.35)' : 'var(--line)',
      boxShadow: order.status === 'new' ? '0 6px 20px -12px rgba(228,103,79,.7)' : 'var(--shadow-1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9, background: 'var(--green)',
            color: '#F3F1E6', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, flexShrink: 0,
          }}>美</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {order.from} 点了 {order.dateLabel} 的菜
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{fmtTime(order.createdAt)} · {count} 道菜</div>
          </div>
        </div>
        <span style={{
          fontSize: 10.5, fontWeight: 600, color: meta.color, background: meta.bg,
          padding: '3px 8px', borderRadius: 7, flexShrink: 0,
        }}>{meta.label}</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 11 }}>
        {order.items.map((g) => g.dishes.map((d) => (
          <span key={g.meal + d.id} className="chip" style={{ fontSize: 10 }}>{d.name}</span>
        )))}
      </div>

      {order.note && (
        <div style={{
          marginTop: 10, fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.55,
          background: 'var(--surface-2)', borderRadius: 8, padding: '7px 10px',
          borderLeft: '2px solid var(--gold)',
        }}>
          “{order.note}”
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn btn-ghost" style={{ flex: 1, padding: '9px 0' }} onClick={() => onOpen(order)}>
          看做菜清单
        </button>
        {order.status === 'new' && (
          <button className="btn btn-primary" style={{ flex: 1, padding: '9px 0', fontSize: 13 }} onClick={() => onAccept(order)}>
            接单
          </button>
        )}
        {order.status === 'accepted' && (
          <button className="btn btn-dark" style={{ flex: 1, padding: '9px 0', fontSize: 13 }} onClick={() => onDone(order)}>
            做好了
          </button>
        )}
        {order.status === 'done' && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 5, fontSize: 12, color: 'var(--ink-3)',
          }}>
            <Icon name="check" size={13} /> 今日已上菜
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersView({ orders, onAccept, onDone, onOpenOrder, nickname }) {
  const news = orders.filter((o) => o.status === 'new');
  const rest = orders.filter((o) => o.status !== 'new');

  return (
    <div className="scroll" style={{ flex: 1 }}>
      <div style={{ padding: '14px 18px 26px' }}>
        {news.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
            background: 'var(--coral-soft)', borderRadius: 12, marginBottom: 14,
            border: '1px solid rgba(228,103,79,.2)',
          }}>
            <span style={{
              width: 30, height: 30, borderRadius: 15, background: 'var(--coral)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}><Icon name="bell" size={15} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#B44B36' }}>
                {news.length} 张新的点菜单
              </div>
              <div style={{ fontSize: 10.5, color: '#B44B36', opacity: .8 }}>
                {nickname}在等你确认，接单后开始备菜
              </div>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '56px 20px', color: 'var(--ink-3)',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 20, background: 'var(--surface)',
              border: '1px solid var(--line)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 14px', color: 'var(--ink-3)',
            }}>
              <Icon name="receipt" size={26} />
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 500, marginBottom: 4 }}>
              还没有收到点菜单
            </div>
            <div style={{ fontSize: 11.5, lineHeight: 1.7 }}>
              把链接发到{nickname}的微信，<br />她点完菜，飞书群会立刻收到通知
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...news, ...rest].map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                onAccept={onAccept}
                onDone={onDone}
                onOpen={onOpenOrder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderDetailSheet({ order, onClose }) {
  return (
    <Sheet onClose={onClose}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--ink-3)' }}>做菜清单</div>
          <div className="serif" style={{ fontSize: 19, fontWeight: 600, marginTop: 2 }}>
            {order.dateLabel} · {order.items.reduce((s, g) => s + g.dishes.length, 0)} 道
          </div>
        </div>
        <button
          className="icon-btn"
          onClick={onClose}
          style={{ color: 'var(--ink-2)', borderColor: 'var(--line)', background: 'var(--surface)' }}
        ><Icon name="close" size={16} /></button>
      </div>

      {order.note && (
        <div style={{
          marginTop: 12, padding: '10px 12px', background: 'var(--gold-soft)',
          borderRadius: 10, fontSize: 12, color: '#7A5C1C', lineHeight: 1.55,
        }}>
          备注：{order.note}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
        {order.items.map((g) => (
          <div key={g.meal}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 7 }}>
              <span className="serif" style={{ fontSize: 14, fontWeight: 600 }}>{g.meal}</span>
              <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>{MEAL_TIME[g.meal]}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {g.dishes.map((d) => (
                <div key={d.id} style={{
                  background: 'var(--surface)', border: '1px solid var(--line)',
                  borderRadius: 11, padding: '10px 12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</span>
                    <span style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>{d.type}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.65, marginTop: 4 }}>
                    {d.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-dark" style={{ width: '100%', marginTop: 18 }} onClick={onClose}>
        知道了，开始备菜
      </button>
    </Sheet>
  );
}

/* 老公端只读菜谱预览 */
function SchedulePreview({ plan, stage, onOpenRecipe }) {
  return (
    <div className="scroll" style={{ flex: 1 }}>
      <div style={{ padding: '14px 18px 26px' }}>
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginBottom: 12 }}>
          {STAGE_LABEL[stage]}参考菜谱 · 点菜品看做法
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {plan.map((g, gi) => (
            <div key={g.meal} className="card fade-up" style={{ padding: '12px 14px', animationDelay: `${gi * 35}ms` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                  <span className="serif" style={{ fontSize: 14.5, fontWeight: 600 }}>{g.meal}</span>
                  <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>{MEAL_TIME[g.meal]}</span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>{g.dishes.length} 道</span>
              </div>
              {g.dishes.map((it) => (
                <div
                  key={it.dish.id}
                  onClick={() => onOpenRecipe(it.dish)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 10, padding: '8px 0', cursor: 'pointer',
                    borderTop: '1px solid var(--line-soft)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {it.dish.name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>
                      {it.type} · {it.dish.nutrients.slice(0, 2).join(' / ')}
                    </div>
                  </div>
                  <Icon name="chevron" size={13} style={{ color: 'var(--ink-3)' }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OrdersView, OrderDetailSheet, SchedulePreview, STATUS_META });
