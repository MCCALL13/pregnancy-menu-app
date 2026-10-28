// NutritionGuide.jsx - 营养指南视图
const { useState } = React;

function NutritionGuideView({ guides, tips, currentStage }) {
  const [activeStage, setActiveStage] = useState(currentStage);

  const stageInfo = {
    early: { name: '孕早期', range: '1-13周', icon: '🌱', color: '#8BA888', bgLight: '#F0F5EE' },
    mid: { name: '孕中期', range: '14-27周', icon: '🌿', color: '#E8A84B', bgLight: '#FFF8EC' },
    late: { name: '孕晚期', range: '28-40周', icon: '🌳', color: '#D9656B', bgLight: '#FBEDEA' },
  };

  const currentGuide = guides.find(g => g.stage === activeStage);
  const currentInfo = stageInfo[activeStage];

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      paddingBottom: '24px',
    }}>
      {/* 阶段选择器 */}
      <div style={{
        padding: '16px 24px 12px',
        display: 'flex',
        gap: '8px',
      }}>
        {guides.map(guide => {
          const info = stageInfo[guide.stage];
          const isActive = activeStage === guide.stage;
          return (
            <button
              key={guide.stage}
              onClick={() => setActiveStage(guide.stage)}
              style={{
                flex: 1,
                padding: '14px 10px',
                borderRadius: '14px',
                border: isActive ? `2px solid ${info.color}` : '2px solid transparent',
                background: isActive ? 'white' : 'white',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? `0 4px 16px ${info.color}30` : 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div style={{ fontSize: '24px' }}>{info.icon}</div>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: isActive ? info.color : 'var(--text-secondary)',
              }}>
                {info.name}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                {info.range}
              </div>
              {guide.stage === currentStage && (
                <div style={{
                  position: 'absolute',
                  fontSize: '9px',
                  background: info.color,
                  color: 'white',
                  padding: '1px 8px',
                  borderRadius: '10px',
                  marginTop: '42px',
                }}>
                  当前
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 营养重点卡片 */}
      <div style={{
        margin: '0 24px 20px',
        background: 'white',
        borderRadius: '18px',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}
        className="animate-fadeIn"
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '16px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: currentInfo.bgLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}>
            {currentInfo.icon}
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentInfo.name}营养重点
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              {currentInfo.range}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentGuide?.focus.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: currentInfo.bgLight,
                color: currentInfo.color,
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                lineHeight: 1,
              }}>
                {idx + 1}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-primary)',
                lineHeight: 1.6,
                flex: 1,
                paddingTop: '2px',
              }}>
                {item}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 每周小贴士 */}
      <div style={{
        margin: '0 24px',
      }}>
        <div style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>💫</span> 孕期饮食小贴士
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className="animate-fadeIn"
              style={{
                background: 'white',
                borderRadius: '14px',
                padding: '14px 16px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                animationDelay: `${idx * 30}ms`,
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #F5C26B, #E88A7F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                flexShrink: 0,
                color: 'white',
                fontWeight: 700,
                fontSize: '12px',
              }}>
                {idx + 1}
              </div>
              <div style={{
                fontSize: '13px',
                color: 'var(--text-primary)',
                lineHeight: 1.6,
                flex: 1,
                paddingTop: '3px',
              }}>
                {tip}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部信息 */}
      <div style={{
        margin: '24px 24px 8px',
        padding: '16px',
        background: 'linear-gradient(135deg, #F0F5E8 0%, #E8F0E6 100%)',
        borderRadius: '14px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '13px', color: '#567054', fontWeight: 500, marginBottom: '4px' }}>
          🌸 科学饮食，快乐孕育
        </div>
        <div style={{ fontSize: '11px', color: '#7A9578', lineHeight: 1.5 }}>
          以上建议仅供参考，请结合自身情况遵医嘱
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  NutritionGuideView,
});
