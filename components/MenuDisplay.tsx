import React from 'react';
import { MenuData, MenuDay } from '../types';

interface MenuDisplayProps {
  menu: MenuData;
  activeDayIndex: number;
  setActiveDayIndex: (index: number) => void;
  onSelectRecipe: (recipeName: string) => void;
}

const MealIcons: Record<string, string> = {
  breakfast: '☀️',
  snack: '🍎',
  lunch: '🍲',
  afternoonSnack: '🥛',
  dinner: '🌙',
};

const MealLabels: Record<string, string> = {
  breakfast: 'Завтрак',
  snack: 'Перекус',
  lunch: 'Обед',
  afternoonSnack: 'Полдник',
  dinner: 'Ужин',
};

// Defined order of meals
const mealOrder: (keyof MenuDay)[] = ['breakfast', 'snack', 'lunch', 'afternoonSnack', 'dinner'];

const MenuDisplay: React.FC<MenuDisplayProps> = ({ menu, activeDayIndex, setActiveDayIndex, onSelectRecipe }) => {
  const activeDay = menu.menu[activeDayIndex];

  const changeDay = (offset: number) => {
    const newIndex = activeDayIndex + offset;
    if (newIndex >= 0 && newIndex < menu.menu.length) {
      setActiveDayIndex(newIndex);
    }
  };
  
  return (
    <div className="p-4 pt-10 fade-in overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeDay(-1)} disabled={activeDayIndex === 0} className="p-2 disabled:opacity-30">
          <svg className="w-6 h-6 text-[#8B5E3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="font-nunito text-2xl font-bold text-[#8B5E3C] text-center">{activeDay.day}</h2>
        <button onClick={() => changeDay(1)} disabled={activeDayIndex === menu.menu.length - 1} className="p-2 disabled:opacity-30">
          <svg className="w-6 h-6 text-[#8B5E3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      
       <div className="flex justify-center mb-6 space-x-1">
          {menu.menu.map((_, index) => (
              <div key={index} className={`w-2 h-2 rounded-full transition-colors ${index === activeDayIndex ? 'bg-[#8B5E3C]' : 'bg-[#D4A373]'}`}></div>
          ))}
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-3">
        {/* FIX: Iterate over the predefined `mealOrder` and add a type guard to ensure `dish` is a string.
            This prevents properties like `calories` (a number) from being processed, resolving the type errors. */}
        {mealOrder.map(mealKey => {
            const dish = activeDay[mealKey as keyof MenuDay];
            if (typeof dish !== 'string') {
              return null;
            }
            return (
                 <MealItem 
                    key={mealKey}
                    icon={MealIcons[mealKey] || '🍴'}
                    dish={dish} 
                    onClick={() => onSelectRecipe(dish)} 
                    isActionable={mealKey === 'lunch' || mealKey === 'dinner'} 
                />
            )
        })}
      </div>
    </div>
  );
};

interface MealItemProps {
  icon: string;
  dish: string;
  onClick?: () => void;
  isActionable?: boolean;
}

const MealItem: React.FC<MealItemProps> = ({ icon, dish, onClick, isActionable }) => {
    const isLeftover = typeof dish === 'string' && dish.includes('(остатки)');
    const dishName = typeof dish === 'string' ? dish.replace(/\s*\(остатки\)/i, '') : '';
    
    const content = (
        <div className="flex items-center space-x-4">
            <span className="text-2xl">{icon}</span>
            <p className={`font-nunito ${isActionable ? 'font-semibold text-lg text-[#8B5E3C]' : 'text-gray-700'}`}>{dishName || '---'}</p>
        </div>
    );

    const containerClasses = `w-full flex justify-between items-center text-left p-4 rounded-2xl transition-all duration-200 ${isActionable ? 'bg-[#F0E7DD] hover:bg-[#EAE0D5]' : 'hover:bg-gray-50'}`;

    return (
        <button onClick={onClick} className={containerClasses} disabled={!dishName}>
            {content}
            {isLeftover && <span className="text-2xl opacity-50 text-[#D4A373]">🔄</span>}
        </button>
    );
};

export default MenuDisplay;
