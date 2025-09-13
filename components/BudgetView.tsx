import React, { useState } from 'react';
import { Budget, BudgetCategory } from '../types';

interface BudgetViewProps {
  budget: Budget;
  onUpdateBudget: (newBudget: Budget) => void;
}

const BudgetView: React.FC<BudgetViewProps> = ({ budget, onUpdateBudget }) => {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Прочее');

  const colors = ['#8B5E3C', '#D4A373', '#E07A5F', '#5E7A6E'];

  const getConicGradient = (type: 'planned' | 'actual') => {
    let gradient = '';
    let currentPercentage = 0;
    const total = type === 'planned' ? budget.plannedSpent : budget.actualSpent;
    if (total > 0 && Array.isArray(budget.categories)) {
      budget.categories.forEach((cat, index) => {
        const amount = type === 'planned' ? cat.plannedAmount : cat.actualAmount;
        const percentage = (amount / total) * 100 || 0;
        gradient += `${colors[index % colors.length]} ${currentPercentage}% ${currentPercentage + percentage}%, `;
        currentPercentage += percentage;
      });
    }
    return `conic-gradient(${gradient.slice(0, -2) || '#E5E7EB 0% 100%'})`;
  };
  
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const expenseAmount = parseFloat(amount);
    if (!expenseAmount || expenseAmount <= 0) return;

    const newActualSpent = budget.actualSpent + expenseAmount;
    
    const newCategories = budget.categories.map(c => 
      c.name === category ? { ...c, actualAmount: c.actualAmount + expenseAmount } : c
    );
    if (!newCategories.some(c => c.name === category)) {
      newCategories.push({ name: category, plannedAmount: 0, actualAmount: expenseAmount });
    }

    onUpdateBudget({
        ...budget,
        actualSpent: newActualSpent,
        remaining: budget.total - newActualSpent,
        savings: budget.plannedSpent - newActualSpent,
        categories: newCategories
    });
    setAmount('');
    setDescription('');
    setShowForm(false);
  };

  return (
    <div className="p-4 pt-10 fade-in">
      <h2 className="font-nunito text-2xl font-semibold text-[#8B5E3C] text-center mb-6">Бюджет</h2>
      
      <div className="flex justify-center mb-8">
        <div 
          className="relative w-64 h-64 rounded-full flex items-center justify-center transition-all duration-500 p-4"
          style={{ background: getConicGradient('planned') }}
        >
          <div
             className="absolute w-56 h-56 rounded-full flex items-center justify-center transition-all duration-500 p-4"
             style={{ background: getConicGradient('actual') }}
          >
              <div className="w-40 h-40 bg-[#F9F7F4] rounded-full flex flex-col items-center justify-center text-center">
                <span className="text-gray-500 text-sm">Потрачено</span>
                <span className="font-nunito font-extrabold text-3xl text-[#8B5E3C]">{budget.actualSpent} ₽</span>
              </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
        <div className="flex justify-between items-center"><span className="text-gray-600">Бюджет:</span><span className="font-nunito font-bold text-lg">{budget.total} ₽</span></div>
        <div className="flex justify-between items-center"><span className="text-gray-600">План:</span><span className="font-nunito font-bold text-lg text-gray-500">{budget.plannedSpent} ₽</span></div>
        <div className="flex justify-between items-center"><span className="text-gray-600">Факт:</span><span className="font-nunito font-bold text-lg text-[#E07A5F]">{budget.actualSpent} ₽</span></div>
        <div className="flex justify-between items-center border-t pt-4">
            <span className="text-gray-600">Экономия:</span>
            <span className={`font-nunito font-bold text-2xl ${budget.savings >= 0 ? 'text-[#5E7A6E]' : 'text-red-500'}`}>{budget.savings} ₽</span>
        </div>
         <div className="flex justify-between items-center"><span className="text-gray-600">Осталось:</span><span className="font-nunito font-bold text-2xl text-[#5E7A6E]">{budget.remaining} ₽</span></div>
      </div>
      
      <div className="mt-6">
        <button onClick={() => setShowForm(!showForm)} className="w-full py-3 bg-white text-[#8B5E3C] rounded-full shadow-md font-semibold">
          {showForm ? 'Отмена' : 'Добавить расход'}
        </button>
        {showForm && (
            <form onSubmit={handleAddExpense} className="mt-4 bg-white p-4 rounded-xl shadow-md space-y-3 fade-in">
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Сумма, ₽" className="w-full p-2 border rounded" required />
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Описание (необязательно)" className="w-full p-2 border rounded" />
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded bg-white">
                    {budget.categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    {!budget.categories.some(c => c.name === "Прочее") && <option value="Прочее">Прочее</option>}
                </select>
                <button type="submit" className="w-full py-2 bg-[#5E7A6E] text-white rounded-lg">Добавить</button>
            </form>
        )}
      </div>

    </div>
  );
};

export default BudgetView;
