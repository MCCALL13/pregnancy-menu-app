// TodayMenu.jsx - 今日菜单视图
const { useState } = React;

function TodayMenuView({ menu, meals, onChangeDish, onRegenerateAll, trimester, week, onSelectDish }) {
  const mealOrder = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'night_snack'];

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      paddingBottom: '20px',
    }}>
      {/* 欢迎语 + 换一换按钮 */}
      <div style={{
        padding: '16px 24px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            今天给{MENU_DATA.app.wife_nickname}准备了 💕
          </div>
        </div>
        <button
          onClick={onRegenerateAll}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseDown={(e) => { e.currentTarget.style.background = 'var(--border)'; }}
          onMouseUp={(e) => { e.currentTarget.style.background = 'white'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
        >
          <span>🔄</span> 换一批
        </button>
      </div>

      {/* 营养提示条 */}
      <div style={{
        margin: '0 24px 16px',
        background: 'linear-gradient(135deg, #E8F0E6 0%, #D4E5D0 100%)',
        borderRadius: '14px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
      }}>
        <div style={{ fontSize: '20px', lineHeight: 1.2 }}>🌿</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#3E5A3C', marginBottom: '2px' }}>
            {trimester.name}营养重点
          </div>
          <div style={{ fontSize: '12px', color: '#567054', lineHeight: 1.5 }}>
            {MENU_DATA.trimester_guide.find(g => g.stage === trimester.stage)?.focus[0]}
          </div>
        </div>
      </div>

      {/* 餐次列表 */}
      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {mealOrder.map((mealKey, index) => {
          const meal = meals[mealKey];
          const dish = menu[mealKey];
          if (!dish) return null;
          return (
            <MealCard
              key={mealKey}
              meal={meal}
              dish={dish}
              index={index}
              onChange={() => onChangeDish(mealKey)}
              onClick={() => onSelectDish(dish)}
            />
          );
        })}
      </div>

      {/* 底部温馨提示 */}
      <div style={{
        margin: '24px 24px 8px',
        padding: '16px',
        background: 'white',
        borderRadius: '14px',
        border: '1px dashed var(--border)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          🍱 一日六餐，少食多餐<br/>
          每顿吃到七八分饱就好
        </div>
      </div>
    </div>
  );
}

// 单餐卡片
function MealCard({ meal, dish, index, onChange, onClick }) {
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = (e) => {
    e.stopPropagation();
    setIsChanging(true);
    onChange();
    setTimeout(() => setIsChanging(false), 400);
  };

  const mealColors = {
    breakfast: { bg: '#FFF5E6', iconBg: '#FFE4B8', text: '#A07020' },
    morning_snack: { bg: '#F0F5E8', iconBg: '#D8E8C0', text: '#5A7A3A' },
    lunch: { bg: '#FFE8E0', iconBg: '#FFCCB8', text: '#B06040' },
    afternoon_snack: { bg: '#E8ECF5', iconBg: '#C8D0E8', text: '#4A5A8A' },
    dinner: { bg: '#EDE4F0', iconBg: '#D4C4DC', text: '#7A5A8A' },
    night_snack: { bg: '#E4E8EC', iconBg: '#C8D0D8', text: '#5A6A7A' },
  };

  const color = mealColors[dish.meal] || mealColors.breakfast;

  return (
    <div
      onClick={onClick}
      className="animate-fadeIn"
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '1px solid transparent',
        animationDelay: `${index * 50}ms`,
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.98)';
        e.currentTarget.style.background = '#FAFAFA';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.background = 'white';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.background = 'white';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* 左侧餐次图标 */}
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: color.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '26px',
          flexShrink: 0,
        }}>
          {meal.icon}
        </div>

        {/* 右侧内容 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 餐次+时间 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              {meal.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              {meal.time}
            </div>
          </div>

          {/* 菜名 */}
          <div style={{
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            transition: isChanging ? 'opacity 0.2s' : 'none',
            opacity: isChanging ? 0.4 : 1,
          }}>
            {dish.name}
          </div>

          {/* 营养标签 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
            {dish.nutrition.slice(0, 3).map((n, i) => (
              <span key={i} style={{
                fontSize: '10px',
                color: color.text,
                background: color.bg,
                padding: '2px 8px',
                borderRadius: '10px',
                fontWeight: 500,
              }}>
                {n}
              </span>
            ))}
          </div>

          {/* 底部操作 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              {meal.desc}
            </div>
            <button
              onClick={handleChange}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                background: 'none',
                border: 'none',
                fontSize: '11px',
                color: 'var(--primary)',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '6px',
                transition: 'background 0.2s',
              }}
              onMouseDown={(e) => { e.stopPropagation(); e.currentTarget.style.background = 'var(--primary-light)'; }}
              onMouseUp={(e) => { e.stopPropagation(); e.currentTarget.style.background = 'transparent'; }}
              onMouseLeave={(e) => { e.stopPropagation(); e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '12px' }}>🔀</span> 换一个
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  TodayMenuView,
  MealCard,
});
