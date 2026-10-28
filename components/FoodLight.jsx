// FoodLight.jsx - 饮食红绿灯视图
const { useState } = React;

function FoodLightView({ red, yellow, green }) {
  const [activeTab, setActiveTab] = useState('green');

  const tabs = [
    { key: 'green', label: '绿灯推荐', icon: '✅', color: '#6BAE7F', bgColor: '#E8F3EA' },
    { key: 'yellow', label: '黄灯慎吃', icon: '⚠️', color: '#E8A84B', bgColor: '#FFF1DC' },
    { key: 'red', label: '红灯禁用', icon: '🚫', color: '#D9656B', bgColor: '#FBE5E6' },
  ];

  const activeColor = tabs.find(t => t.key === activeTab);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        padding: '12px 24px',
        gap: '8px',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '13px',
              fontWeight: activeTab === tab.key ? 600 : 500,
              background: activeTab === tab.key ? tab.color : 'white',
              color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: activeTab === tab.key ? `0 4px 12px ${tab.color}40` : 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '14px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 说明条 */}
      <div style={{
        margin: '0 24px 16px',
        padding: '12px 16px',
        borderRadius: '12px',
        background: activeColor?.bgColor,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
      }}>
        <div style={{ fontSize: '18px' }}>{activeColor?.icon}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
          {activeTab === 'green' && '这些食物营养丰富，孕期可以放心食用，搭配均衡更健康。'}
          {activeTab === 'yellow' && '这些食物需要适量食用，注意控制频率和摄入量。'}
          {activeTab === 'red' && '这些食物在孕期存在安全风险，请尽量避免食用。'}
        </div>
      </div>

      {/* 内容区 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 24px 24px',
      }}>
        {activeTab === 'green' && <GreenList items={green} />}
        {activeTab === 'yellow' && <YellowList items={yellow} />}
        {activeTab === 'red' && <RedList items={red} />}
      </div>
    </div>
  );
}

// 绿灯列表
function GreenList({ items }) {
  const icons = ['🥬', '🍳', '🌾', '🧈', '🥜', '🍎'];
  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            background: 'white',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            animationDelay: `${idx * 40}ms`,
          }}
          className="animate-fadeIn"
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#E8F3EA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0,
          }}>
            {icons[idx % icons.length]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '15px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '4px',
            }}>
              {item}
            </div>
            <div style={{ fontSize: '12px', color: '#6BAE7F', fontWeight: 500 }}>
              ✓ 推荐食用
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 黄灯列表
function YellowList({ items }) {
  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            background: 'white',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)',
            animationDelay: `${idx * 40}ms`,
          }}
          className="animate-fadeIn"
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#FFF1DC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}>
              ⚠️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '2px',
              }}>
                {item.item}
              </div>
              <div style={{ fontSize: '12px', color: '#E8A84B', fontWeight: 500 }}>
                {item.limit}
              </div>
            </div>
          </div>
          <div style={{
            background: '#FFF8EC',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '12px',
            color: '#8A6820',
            lineHeight: 1.5,
          }}>
            <span style={{ fontWeight: 600 }}>小贴士：</span>{item.note}
          </div>
        </div>
      ))}
    </div>
  );
}

// 红灯列表
function RedList({ items }) {
  const [expandedIdx, setExpandedIdx] = useState(-1);

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            background: 'white',
            borderRadius: '14px',
            padding: '14px 16px',
            boxShadow: 'var(--shadow-sm)',
            border: expandedIdx === idx ? '1px solid #F5D0D2' : '1px solid transparent',
            transition: 'all 0.25s ease',
            animationDelay: `${idx * 40}ms`,
          }}
          className="animate-fadeIn"
        >
          <div
            onClick={() => setExpandedIdx(expandedIdx === idx ? -1 : idx)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#FBE5E6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}>
              🚫
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                {item.item}
              </div>
            </div>
            <div style={{
              fontSize: '12px',
              color: '#D9656B',
              fontWeight: 500,
              transition: 'transform 0.25s',
              transform: expandedIdx === idx ? 'rotate(180deg)' : 'rotate(0)',
            }}>
              ▼
            </div>
          </div>

          {/* 展开内容 */}
          {expandedIdx === idx && (
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
              className="animate-fadeIn"
            >
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '3px' }}>
                  为什么不能吃
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {item.why}
                </div>
              </div>
              <div style={{
                background: '#FBE5E6',
                borderRadius: '10px',
                padding: '10px 12px',
              }}>
                <div style={{ fontSize: '11px', color: '#B04A50', marginBottom: '3px', fontWeight: 500 }}>
                  替代方案
                </div>
                <div style={{ fontSize: '13px', color: '#8A3A40', lineHeight: 1.5 }}>
                  {item.action}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  FoodLightView,
});
