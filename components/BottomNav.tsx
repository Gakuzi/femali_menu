import React from 'react';
import { View } from '../types';
import { CalendarIcon, ShoppingCartIcon, BudgetIcon, SyncIcon } from './icons/Icons';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
}

const LeftoversIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h18v18H3z"></path>
        <path d="M9 9h6v6H9z"></path>
        <path d="M9 1v2M15 1v2M9 21v2M15 21v2M1 9h2M1 15h2M21 9h2M21 15h2"></path>
    </svg>
);


const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: 'menu' as View, icon: CalendarIcon, label: 'Меню' },
    { view: 'shoppingList' as View, icon: ShoppingCartIcon, label: 'Покупки' },
    { view: 'remainingItems' as View, icon: LeftoversIcon, label: 'Остатки' },
    { view: 'budget' as View, icon: BudgetIcon, label: 'Бюджет' },
    { view: 'dataSync' as View, icon: SyncIcon, label: 'Синхр.' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/80 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl">
      <div className="flex justify-around items-center h-20">
        {navItems.map(item => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors duration-200 w-1/5 ${
              currentView === item.view ? 'text-[#8B5E3C]' : 'text-gray-400'
            }`}
          >
            <item.icon className="w-7 h-7" />
            <span className="text-xs font-nunito">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
