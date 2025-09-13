import React, { useState, useEffect } from 'react';
import { AppSettings, FamilyMember } from '../types';
import { calculateFamilyCalories } from '../services/geminiService';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onClose: () => void;
  onRegenerate: () => void;
  apiKey: string | null;
  onUpdateApiKey: (key: string) => Promise<boolean>;
  onDeleteApiKey: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdate, onClose, onRegenerate, apiKey, onUpdateApiKey, onDeleteApiKey }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [totalCalories, setTotalCalories] = useState(0);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(apiKey || '');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleUpdate = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onUpdate(newSettings);
  };
  
  const handleFamilyUpdate = (index: number, updatedMember: FamilyMember) => {
    const newFamily = [...localSettings.family];
    newFamily[index] = updatedMember;
    handleUpdate('family', newFamily);
  };

  const addFamilyMember = () => {
    const newMember: FamilyMember = {
      id: Date.now().toString(), name: `Семьянин ${localSettings.family.length + 1}`, age: 30, weight: 70, goal: 'maintain', activity: 'moderate', restrictions: [], allergies: ''
    };
    handleUpdate('family', [...localSettings.family, newMember]);
  };
  
  const handleRecalculateCalories = async () => {
      if (!apiKey) return;
      const calories = await calculateFamilyCalories(localSettings.family, apiKey);
      setTotalCalories(calories);
  }

  const handleSaveKey = async () => {
    setIsVerifying(true);
    const success = await onUpdateApiKey(localApiKey);
    setIsVerifying(false);
    if(success) {
        setIsEditingKey(false);
    }
  }

  useEffect(() => {
    if (apiKey) handleRecalculateCalories();
  }, [localSettings.family, apiKey]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 fade-in" onClick={onClose}>
      <div className="bg-[#F9F7F4] rounded-3xl p-6 w-full max-w-lg h-[90vh] overflow-y-auto shadow-2xl texture-paper" onClick={e => e.stopPropagation()}>
        <h2 className="font-nunito text-2xl font-bold text-[#8B5E3C] text-center mb-6">Настройки</h2>
        
        <div className="space-y-4">
            {/* API Key */}
            <Card title="API Ключ Google Gemini">
                {isEditingKey ? (
                    <div className="space-y-2">
                        <input type="password" value={localApiKey} onChange={e => setLocalApiKey(e.target.value)} className="w-full p-2 border rounded-lg text-gray-800" placeholder="Ваш API ключ"/>
                        <div className="flex space-x-2">
                            <button onClick={handleSaveKey} disabled={isVerifying} className="flex-1 py-2 bg-[#5E7A6E] text-white rounded-lg disabled:opacity-50">{isVerifying ? 'Проверка...' : 'Сохранить'}</button>
                            <button onClick={() => { setIsEditingKey(false); setLocalApiKey(apiKey || ''); }} className="px-4 py-2 bg-gray-200 rounded-lg">Отмена</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-gray-500">****{apiKey?.slice(-4)}</span>
                        <div>
                            <button onClick={() => setIsEditingKey(true)} className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md mr-2">Изменить</button>
                            <button onClick={onDeleteApiKey} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md">Удалить</button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Family Members */}
            <Card title="Члены семьи">
                {localSettings.family.map((member, index) => (
                    <div key={member.id} className="mb-2 p-2 border rounded-lg">
                        <input type="text" value={member.name} onChange={e => handleFamilyUpdate(index, {...member, name: e.target.value})} className="w-full font-semibold border-b mb-1 bg-transparent text-gray-800"/>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-gray-700">Возраст: <input type="number" value={member.age} onChange={e => handleFamilyUpdate(index, {...member, age: +e.target.value})} className="w-16 border-b bg-transparent text-gray-800"/></span>
                            <span className="text-gray-700">Вес: <input type="number" value={member.weight} onChange={e => handleFamilyUpdate(index, {...member, weight: +e.target.value})} className="w-16 border-b bg-transparent text-gray-800"/> кг</span>
                        </div>
                    </div>
                ))}
                <button onClick={addFamilyMember} className="w-full mt-2 py-2 bg-[#5E7A6E] text-white rounded-lg">+ Добавить человека</button>
            </Card>

            {/* Calories */}
            <Card title="Расчёт калорийности">
                <p className="text-center text-3xl font-nunito font-bold text-[#8B5E3C]">{totalCalories.toLocaleString('ru-RU')} <span className="text-lg">ккал/день</span></p>
                <button onClick={handleRecalculateCalories} className="w-full mt-2 text-sm text-[#8B5E3C]">Пересчитать</button>
            </Card>

            {/* Budget */}
            <Card title="Бюджет на период">
                 <input type="number" value={localSettings.budgetAmount} onChange={e => handleUpdate('budgetAmount', +e.target.value)} className="w-full p-2 text-2xl font-bold text-center border-b-2 bg-transparent text-[#8B5E3C]" />
            </Card>
            
            <Card title="Приложение на iPhone">
                 <p className="text-sm text-center">1. Откройте в Safari → 2. Нажмите 'Поделиться' → 3. 'Добавить на главный экран'.</p>
            </Card>

            <button onClick={onRegenerate} className="w-full py-4 mt-6 bg-red-500 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
                🔄 Перегенерировать всё
            </button>
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-white/80 p-4 rounded-xl shadow-md">
        <h3 className="font-nunito font-semibold text-[#8B5E3C] mb-2">{title}</h3>
        {children}
    </div>
);

export default SettingsView;