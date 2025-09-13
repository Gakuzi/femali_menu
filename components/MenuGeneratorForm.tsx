import React, { useState } from 'react';
import { GenerationParams } from '../types';

interface MenuGeneratorFormProps {
  onGenerate: (params: GenerationParams) => void;
}

const MenuGeneratorForm: React.FC<MenuGeneratorFormProps> = ({ onGenerate }) => {
  const [params, setParams] = useState<GenerationParams>({
    people: 3,
    period: 7,
    protein: 'Курица',
    restrictions: [],
    allergies: '',
    mealsPerDay: 5,
    imageGenerationMode: 'main',
  });

  const handleRestrictionChange = (restriction: string) => {
    setParams(prev => ({
      ...prev,
      restrictions: prev.restrictions.includes(restriction)
        ? prev.restrictions.filter(r => r !== restriction)
        : [...prev.restrictions, restriction]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(params);
  };

  const restrictionsOptions = ['Без рыбы', 'Без грибов', 'Без молочных', 'Без яиц', 'Без сахара', 'Без глутамата'];

  return (
    <div className="p-4 pt-10 fade-in">
      <h2 className="font-nunito text-2xl font-semibold text-[#8B5E3C] text-center mb-6">Создайте своё меню с помощью ИИ</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <Card>
          <label className="font-nunito font-semibold text-[#8B5E3C]">Количество человек: {params.people}</label>
          <input type="range" min="1" max="6" value={params.people} onChange={e => setParams({...params, people: parseInt(e.target.value)})} 
            className="w-full h-2 bg-[#D4A373] rounded-lg appearance-none cursor-pointer accent-[#8B5E3C]" />
        </Card>
        
        <Card>
          <label className="font-nunito font-semibold text-[#8B5E3C]">Период</label>
          <div className="flex justify-around mt-2">
            {[1, 3, 5, 7].map(day => (
              <button key={day} type="button" onClick={() => setParams({...params, period: day})}
                className={`px-4 py-2 rounded-full transition-colors ${params.period === day ? 'bg-[#D4A373] text-white' : 'bg-gray-100 text-[#8B5E3C]'}`}>
                {day} {day === 1 ? 'день' : (day < 5 ? 'дня' : 'дней')}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <label className="font-nunito font-semibold text-[#8B5E3C]">Количество приёмов пищи</label>
          <div className="flex justify-around mt-2">
            {[3, 5].map(meals => (
              <button key={meals} type="button" onClick={() => setParams({...params, mealsPerDay: meals})}
                className={`px-4 py-2 rounded-full transition-colors w-1/2 ${params.mealsPerDay === meals ? 'bg-[#D4A373] text-white' : 'bg-gray-100 text-[#8B5E3C]'}`}>
                {meals} ({meals === 3 ? 'Основные' : 'С перекусами'})
              </button>
            ))}
          </div>
        </Card>
        
        <Card>
          <label className="font-nunito font-semibold text-[#8B5E3C]">Основной белок</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {['🐔 Курица', '🥩 Говядина', '🐖 Свинина', '🌱 Вегетарианский'].map(protein => (
              <button key={protein} type="button" onClick={() => setParams({...params, protein: protein.split(' ')[1]})}
                className={`px-4 py-2 rounded-lg transition-all ${params.protein === protein.split(' ')[1] ? 'bg-[#5E7A6E] text-white shadow-inner' : 'bg-gray-100'}`}>
                {protein}
              </button>
            ))}
          </div>
        </Card>
        
        <Card>
          <label className="font-nunito font-semibold text-[#8B5E3C]">Ограничения</label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {restrictionsOptions.map(option => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={params.restrictions.includes(option)} onChange={() => handleRestrictionChange(option)} 
                  className="w-5 h-5 text-[#5E7A6E] bg-gray-100 border-gray-300 rounded focus:ring-[#5E7A6E]" />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </Card>
        
        <Card>
           <label className="font-nunito font-semibold text-[#8B5E3C]">Аллергии</label>
           <input type="text" value={params.allergies} onChange={e => setParams({...params, allergies: e.target.value})}
             placeholder="Например: орехи, соя, лактоза" 
             className="w-full mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-[#D4A373] focus:border-[#D4A373]" />
        </Card>

        <Card>
          <label className="font-nunito font-semibold text-[#8B5E3C]">Генерация изображений</label>
            <div className="flex flex-col space-y-2 mt-2">
              <RadioOption name="imageGen" value="main" checked={params.imageGenerationMode === 'main'} onChange={e => setParams({...params, imageGenerationMode: 'main'})} label="Только для основных блюд (быстро)" />
              <RadioOption name="imageGen" value="all" checked={params.imageGenerationMode === 'all'} onChange={e => setParams({...params, imageGenerationMode: 'all'})} label="Для каждого шага (медленно)" />
              <RadioOption name="imageGen" value="none" checked={params.imageGenerationMode === 'none'} onChange={e => setParams({...params, imageGenerationMode: 'none'})} label="Не генерировать" />
            </div>
        </Card>

        <button type="submit" className="w-full h-16 text-white font-nunito font-bold text-xl rounded-2xl bg-gradient-to-r from-[#8B5E3C] to-[#D4A373] shadow-[0_8px_24px_rgba(139,94,60,0.2)] active:scale-95 transform transition-transform">
          Сгенерировать меню
        </button>
      </form>
    </div>
  );
};

const Card: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <div className="bg-white p-5 rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
        {children}
    </div>
);

const RadioOption: React.FC<{name:string, value:string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label:string}> = ({name, value, checked, onChange, label}) => (
    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="w-5 h-5 text-[#5E7A6E] bg-gray-100 border-gray-300 focus:ring-[#5E7A6E]" />
        <span>{label}</span>
    </label>
);


export default MenuGeneratorForm;