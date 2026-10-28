// DishLibrary.jsx - 菜谱库视图
const { useState, useMemo } = React;

function DishLibraryView({ dishes, meals, trimester, onSelectDish }) {
  const [activeMeal, setActiveMeal] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const mealFilterOptions = [
    { key: 'all', label: '全部' },
    { key: 'breakfast', label: '早餐' },
    { key: 'morning_snack', label: '上午加餐' },
    { key: 'lunch', label: '午餐' },
    { key: 'afternoon_snack', label: '下午加餐' },
    { key: 'dinner', label: '晚餐' },
    { key: 'night_snack', label: '睡前加餐' },
  ];

  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => {
      // 阶段过滤：只显示当前阶段可用的
      if (!dish.stages.includes(trimester.stage)) return false;
      // 餐次过滤
      if (activeMeal !== 'all' && dish.meal !== activeMeal) return false;
      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return dish.name.toLowerCase().includes(query) ||
               dish.nutrition.some(n => n.toLowerCase().includes(query));
      }
      return true;
    });
  }, [dishes, activeMeal, searchQuery, trimester.stage]);

  // 按餐次分组
  const groupedDishes = useMemo(() => {
    if (activeMeal !== 'all') {
      return [{ mealKey: activeMeal, dishes: filteredDishes }];
    }
    const groups = {};
    filteredDishes.forEach(dish => {
      if (!groups[dish.meal]) groups[dish.meal] = [];
      groups[dish.meal].push(dish);
    });
    return Object.keys(meals)
      .filter(key => groups[key] && groups[key].length > 0)
      .map(key => ({ mealKey: key, dishes: groups[key] }));
  }, [filteredDishes, activeMeal, meals]);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      {/* 搜索栏 */}
      <div style={{ padding: '12px 24px', background: 'var(--bg)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'white',
          borderRadius: '12px',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <span style={{ fontSize: '16px', marginRight: '8px', opacity: 0.5 }}>🔍</span>
          <input
            type="text"
            placeholder="搜索菜名或营养素..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: 'var(--text-primary)',
              background: 'transparent',
              fontFamily: 'inherit',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                opacity: 0.4,
                cursor: 'pointer',
                padding: '2px 6px',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 餐次筛选 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '0 24px 12px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        <style>{`
          div[style*="overflowX: auto"]::-webkit-scrollbar { display: none; }
        `}</style>
        {mealFilterOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setActiveMeal(opt.key)}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: '18px',
              border: 'none',
              fontSize: '13px',
              fontWeight: activeMeal === opt.key ? 600 : 400,
              background: activeMeal === opt.key ? 'var(--primary)' : 'white',
              color: activeMeal === opt.key ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeMeal === opt.key ? '0 2px 8px rgba(232, 138, 127, 0.3)' : 'var(--shadow-sm)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 结果数量 */}
      <div style={{
        padding: '4px 24px 12px',
        fontSize: '12px',
        color: 'var(--text-tertiary)',
      }}>
        共 {filteredDishes.length} 道菜 · 适合{trimester.name}
      </div>

      {/* 菜品列表 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 24px 24px',
      }}>
        {groupedDishes.length === 0 ? (
          <EmptySearchResult />
        ) : (
          groupedDishes.map(group => (
            <div key={group.mealKey} style={{ marginBottom: '20px' }}>
              {activeMeal === 'all' && (
                <div style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span>{meals[group.mealKey]?.icon}</span>
                  {meals[group.mealKey]?.name}
                  <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: '12px' }}>
                    {group.dishes.length}道
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {group.dishes.map((dish, idx) => (
                  <DishItem
                    key={dish.id}
                    dish={dish}
                    meal={meals[dish.meal]}
                    onClick={() => onSelectDish(dish)}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 菜品列表项
function DishItem({ dish, meal, onClick, index }) {
  return (
    <div
      onClick={onClick}
      className="animate-fadeIn"
      style={{
        background: 'white',
        borderRadius: '14px',
        padding: '14px',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        animationDelay: `${index * 30}ms`,
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
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
      {/* 菜名首字图标 */}
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, var(--primary-light), var(--secondary-light))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: meal?.icon ? '22px' : '16px',
        flexShrink: 0,
      }}>
        {meal?.icon || dish.name.charAt(0)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: '6px',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {dish.name}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {dish.nutrition.slice(0, 3).map((n, i) => (
            <span key={i} style={{
              fontSize: '10px',
              color: 'var(--secondary)',
              background: '#F0F5EE',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 500,
            }}>
              {n}
            </span>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
        ›
      </div>
    </div>
  );
}

// 空状态
function EmptySearchResult() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      color: 'var(--text-tertiary)',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🍽️</div>
      <div style={{ fontSize: '14px', marginBottom: '4px' }}>没有找到相关菜品</div>
      <div style={{ fontSize: '12px' }}>试试其他关键词吧</div>
    </div>
  );
}

Object.assign(window, {
  DishLibraryView,
  DishItem,
});
