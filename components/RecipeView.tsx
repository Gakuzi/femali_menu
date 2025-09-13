import React, { useState, useEffect, useRef } from 'react';
import { Recipe, ShoppingList as ShoppingListType, View, ShoppingListItem } from '../types';
import { ArrowLeftIcon, PlayIcon, PauseIcon, ResetIcon } from './icons/Icons';

interface RecipeViewProps {
  recipe: Recipe;
  onBack: () => void;
  shoppingList: ShoppingListType | null;
  checkedItems: string[]; // This is now less relevant
  setView: (view: View) => void;
  // onComplete: (usedIngredients: Record<string, number>) => void; // A way to report back
}

const RecipeView: React.FC<RecipeViewProps> = ({ recipe, onBack, shoppingList, setView }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = recipe.steps[activeStepIndex];

  const [timeLeft, setTimeLeft] = useState(activeStep.time || 0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  const [missingIngredients, setMissingIngredients] = useState<string[]>([]);
  const [showMissingModal, setShowMissingModal] = useState(false);

  useEffect(() => {
    notificationSound.current = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU9vT18=');
    
    // Check for missing ingredients on first load
    const missing = recipe.ingredients.filter(ing => {
        const itemInList = shoppingList?.shoppingList.find(i => ing.toLowerCase().includes(i.item.toLowerCase()));
        return !itemInList || !itemInList.isCompleted;
    });
    if (missing.length > 0) {
        setMissingIngredients(missing);
        setShowMissingModal(true);
    }
  }, [recipe, shoppingList]);

  useEffect(() => {
    setTimeLeft(recipe.steps[activeStepIndex].time || 0);
    setIsTimerRunning(false);
  }, [activeStepIndex, recipe.steps]);
  
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') return;
    await Notification.requestPermission();
  };

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      notificationSound.current?.play();
      if (Notification.permission === 'granted') {
          new Notification(`⏱️ Этап "${activeStep.title}" завершён!`, {
              body: `Пора переходить к следующему шагу в рецепте "${recipe.name}".`,
              icon: '/assets/logo.svg' // You need to host this or use a data URI
          });
      }
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft]);
  
  const formatTime = (seconds: number) => `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
  const toggleTimer = () => {
    requestNotificationPermission();
    setIsTimerRunning(!isTimerRunning);
  };
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(activeStep.time || 0);
  };
  
  const nextStep = () => {
      if (activeStepIndex === recipe.steps.length - 1) {
          // TODO: Trigger recipe completion modal
          alert('Рецепт завершен!');
          onBack();
      } else {
          setActiveStepIndex(prev => prev + 1);
      }
  };
  const prevStep = () => setActiveStepIndex(prev => Math.max(prev - 1, 0));
  
  const getIngredientStatus = (ingredientName: string) => {
    const shoppingListItem = shoppingList?.shoppingList.find(item => ingredientName.toLowerCase().includes(item.item.toLowerCase()));
    if (!shoppingListItem) return { icon: '⚠️' };
    return shoppingListItem.isCompleted ? { icon: '✅' } : { icon: '❌' };
  };

  if (showMissingModal) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
                <h2 className="text-2xl font-nunito font-bold text-[#E07A5F] mb-4">⚠️ Не хватает ингредиентов!</h2>
                <p className="mb-4">Необходимо купить:</p>
                <ul className="text-left mb-6 space-y-1">
                    {missingIngredients.map(ing => <li key={ing} className="font-semibold"> • {ing}</li>)}
                </ul>
                <p className="mb-6">Продолжить без них? (не рекомендуется)</p>
                <div className="flex justify-between space-x-4">
                    <button onClick={onBack} className="w-1/2 py-3 bg-gray-200 rounded-lg font-bold">Отмена</button>
                    <button onClick={() => setShowMissingModal(false)} className="w-1/2 py-3 bg-[#5E7A6E] text-white rounded-lg font-bold">Продолжить</button>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="p-4 fade-in">
      <header className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="p-2 mr-2"><ArrowLeftIcon className="w-6 h-6 text-[#8B5E3C]" /></button>
        <h2 className="font-nunito text-xl font-bold text-[#8B5E3C] truncate flex-1">{recipe.name}</h2>
        <div className="w-10 text-sm text-gray-500 text-right">{activeStepIndex + 1}/{recipe.steps.length}</div>
      </header>
       <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
          <div className="bg-[#D4A373] h-1.5 rounded-full" style={{ width: `${((activeStepIndex + 1) / recipe.steps.length) * 100}%` }}></div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        {activeStep.imageUrl && <img src={activeStep.imageUrl} alt={activeStep.title} className="w-full h-48 object-cover rounded-lg mb-4" />}
        <h3 className="font-nunito text-2xl font-semibold mb-2">{activeStep.title}</h3>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">{activeStep.description}</p>

        <div className="border-t pt-4">
            <h4 className="font-nunito font-semibold text-lg mb-2 text-[#8B5E3C]">Ингредиенты:</h4>
            <ul className="space-y-2">
                {recipe.ingredients.map(ing => (
                    <li key={ing} onClick={() => setView('shoppingList')} className="flex items-center space-x-2 cursor-pointer">
                        <span className="text-xl">{getIngredientStatus(ing).icon}</span>
                        <span className={missingIngredients.includes(ing) ? 'text-red-500 font-bold' : ''}>{ing}</span>
                    </li>
                ))}
            </ul>
        </div>
        
        {activeStep.time && (
          <div className="mt-6 text-center border-t pt-6">
            <p className="font-nunito text-4xl font-bold text-[#8B5E3C] tracking-wider mb-4">{formatTime(timeLeft)}</p>
            <div className="flex justify-center space-x-4">
              <button onClick={toggleTimer} className={`px-6 py-3 rounded-full text-white font-semibold transition-transform active:scale-95 ${isTimerRunning ? 'bg-[#E07A5F]' : 'bg-[#5E7A6E]'}`}>
                {isTimerRunning ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
              </button>
              <button onClick={resetTimer} className="p-3 rounded-full bg-gray-200 text-[#8B5E3C] transition-transform active:scale-95">
                <ResetIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={prevStep} disabled={activeStepIndex === 0} className="px-6 py-3 bg-white text-[#8B5E3C] rounded-full shadow-md disabled:opacity-40">← Назад</button>
        <button onClick={nextStep} className="px-6 py-3 bg-[#8B5E3C] text-white rounded-full shadow-md">
            {activeStepIndex === recipe.steps.length - 1 ? 'Завершить 🎉' : 'Далее →'}
        </button>
      </div>
    </div>
  );
};

export default RecipeView;
