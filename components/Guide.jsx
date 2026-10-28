// Guide.jsx — 营养指南 + 饮食红绿灯
const { useState } = React;

const STAGES = ['early', 'mid', 'late'];
const STAGE_RANGE = { early: '0-13周', mid: '14-27周', late: '28周-分娩' };

function NutrientGrid({ data }) {
  const rows = [
    { k: 'energyKcal', label: '能量', icon: 'flame' },
    { k: 'proteinG', label: '蛋白质', icon: 'shield' },
    { k: 'calciumMg', label: '钙', icon: 'leaf' },
    { k: 'ironMg', label: '铁', icon: 'pot' },
    { k: 'folateUg', label: '叶酸', icon: 'leaf' },
    { k: 'dhaNote', label: 'DHA', icon: 'clock' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {rows.map((r) => (
        <div key={r.k} style={{
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 12, padding: '11px 12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <span style={{ color: 'var(--green-2)' }}><Icon name={r.icon} size={13} /></span>
            <span style={{ fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '.04em' }}>{r.label}</span>
          </div>
          <div className="num" style={{
            fontSize: r.k === 'dhaNote' || r.k === 'energyKcal' ? 11.5 : 15,
            fontWeight: 600, lineHeight: 1.45, color: 'var(--ink)',
          }}>{data[r.k]}</div>
        </div>
      ))}
    </div>
  );
}

function PortionTable() {
  const rows = [
    ['grains', '谷类（全谷杂豆占 1/3-1/2）'],
    ['vegetables', '蔬菜（2/3 以上深色）'],
    ['fruit', '水果（优选低 GI）'],
    ['meat', '鱼禽肉蛋'],
    ['egg', '鸡蛋（含蛋黄）'],
    ['milk', '奶类'],
    ['nuts', '大豆与坚果'],
    ['oil', '烹调油 / 碘盐'],
    ['water', '饮水'],
  ];
  return (
    <div className="card" style={{ padding: '4px 14px' }}>
      {rows.map(([k, label], i) => (
        <div key={k} style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
          padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line-soft)',
        }}>
          <span style={{ fontSize: 12, color: 'var(--ink-2)', flex: '0 0 46%' }}>{label}</span>
          <span style={{ fontSize: 11.5, color: 'var(--ink)', textAlign: 'right', flex: 1, lineHeight: 1.5 }}>
            {PD.dailyTemplate.portions[k]}
          </span>
        </div>
      ))}
    </div>
  );
}

function LightSection() {
  const groups = [
    { key: 'green', title: '放心吃', hint: '日常主力，越多样越好', color: 'var(--green)', bg: 'var(--green-soft)', icon: 'check' },
    { key: 'yellow', title: '限量吃', hint: '控制频率与份量', color: '#8A6516', bg: 'var(--gold-soft)', icon: 'clock' },
    { key: 'red', title: '不要吃', hint: '孕期 0 容忍', color: 'var(--red)', bg: 'var(--red-soft)', icon: 'shield' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {groups.map((g) => (
        <div key={g.key} className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 14px', background: g.bg }}>
            <span style={{ color: g.color }}><Icon name={g.icon} size={15} /></span>
            <span className="serif" style={{ fontSize: 14.5, fontWeight: 600, color: g.color }}>{g.title}</span>
            <span style={{ fontSize: 10.5, color: g.color, opacity: .75 }}>{g.hint}</span>
          </div>
          <div style={{ padding: '6px 14px 10px' }}>
            {PD.lightRules[g.key].map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, alignItems: 'flex-start', padding: '7px 0',
                borderTop: i === 0 ? 'none' : '1px solid var(--line-soft)',
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: 3, marginTop: 7, flexShrink: 0,
                  background: g.color, opacity: .7,
                }}></span>
                <span style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--ink)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GuideView({ stage }) {
  const [tab, setTab] = useState('nutri');
  const [viewStage, setViewStage] = useState(stage);
  const data = PD.trimesterNutrients[viewStage];

  return (
    <div className="scroll" style={{ flex: 1 }}>
      <div style={{ padding: '14px 18px 26px' }}>
        <div style={{
          display: 'flex', background: 'var(--surface-2)', border: '1px solid var(--line)',
          borderRadius: 12, padding: 3, marginBottom: 14,
        }}>
          {[['nutri', '营养基准'], ['light', '饮食红绿灯']].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 12.5, fontWeight: tab === k ? 600 : 400,
                background: tab === k ? 'var(--surface)' : 'transparent',
                color: tab === k ? 'var(--ink)' : 'var(--ink-3)',
                boxShadow: tab === k ? 'var(--shadow-1)' : 'none',
              }}
            >{label}</button>
          ))}
        </div>

        {tab === 'nutri' ? (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 13 }}>
              {STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => setViewStage(s)}
                  style={{
                    flex: 1, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 11,
                    padding: '9px 0 8px', textAlign: 'center',
                    border: '1px solid ' + (viewStage === s ? 'transparent' : 'var(--line)'),
                    background: viewStage === s ? 'var(--green)' : 'var(--surface)',
                    color: viewStage === s ? '#F3F1E6' : 'var(--ink-2)',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{STAGE_LABEL[s]}</div>
                  <div style={{ fontSize: 9.5, opacity: .7, marginTop: 1 }}>{STAGE_RANGE[s]}</div>
                </button>
              ))}
            </div>

            {viewStage !== stage && (
              <div style={{
                fontSize: 10.5, color: 'var(--ink-3)', marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <Icon name="clock" size={11} /> 当前处于{STAGE_LABEL[stage]}，以上为{STAGE_LABEL[viewStage]}参考值
              </div>
            )}

            <div className="sec-title" style={{ marginBottom: 8 }}>每日营养目标</div>
            <NutrientGrid data={data} />

            <div style={{ height: 16 }}></div>
            <div className="sec-title" style={{ marginBottom: 8 }}>本阶段重点</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {data.focus.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 9, alignItems: 'flex-start',
                  background: 'var(--surface)', border: '1px solid var(--line)',
                  borderRadius: 11, padding: '10px 12px',
                }}>
                  <span className="num" style={{
                    fontSize: 10, fontWeight: 700, color: 'var(--coral)', marginTop: 2,
                    letterSpacing: '.02em',
                  }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontSize: 12.5, lineHeight: 1.6 }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ height: 16 }}></div>
            <div className="sec-title" style={{ marginBottom: 8 }}>吃法建议</div>
            <div style={{ background: 'var(--green-soft)', borderRadius: 12, padding: '4px 14px' }}>
              {data.tips.map((t, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start', padding: '9px 0',
                  borderTop: i === 0 ? 'none' : '1px solid rgba(47,85,69,.1)',
                }}>
                  <span style={{ fontSize: 10, color: 'var(--green)', marginTop: 5 }}>—</span>
                  <span style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--green)' }}>{t}</span>
                </div>
              ))}
            </div>

            <div style={{ height: 16 }}></div>
            <div className="sec-title" style={{ marginBottom: 8 }}>每日份量模板</div>
            <PortionTable />

            <div style={{
              marginTop: 14, fontSize: 10.5, lineHeight: 1.6, color: 'var(--ink-3)',
              textAlign: 'center', padding: '0 8px',
            }}>
              依据 {PD.meta.basis}
            </div>
          </>
        ) : (
          <LightSection />
        )}
      </div>
    </div>
  );
}

Object.assign(window, { GuideView, LightSection, PortionTable, NutrientGrid });
