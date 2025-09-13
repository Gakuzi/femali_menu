import React, { useState, useEffect, useCallback } from 'react';
import ApiKeySetup from './components/ApiKeySetup';
import MenuGeneratorForm from './components/MenuGeneratorForm';
import LoadingScreen from './components/LoadingScreen';
import MenuDisplay from './components/MenuDisplay';
import RecipeView from './components/RecipeView';
import ShoppingList from './components/ShoppingList';
import BudgetView from './components/BudgetView';
import DataSync from './components/DataSync';
import BottomNav from './components/BottomNav';
import RemainingItemsView from './components/RemainingItemsView';
import ClarificationModal from './components/ClarificationModal';
import SettingsView from './components/SettingsView'; // New
import { AppState, View, GenerationParams, Recipe, GenerationLogEntry, AppSettings, ModalType } from './types';
import { verifyApiKey, analyzeSettings, generateMenu, generateRecipe, generateImageDescription, generateShoppingList, generateBudget } from './services/geminiService';
import { GearIcon } from './components/icons/Icons';

const initialSettings: AppSettings = {
  family: [],
  period: 7,
  budgetAmount: 10000,
  mealsPerDay: 5,
  generation: {
    avoidRepetition: true,
    useLeftovers: true,
    minimizeIngredients: true,
    preferSimple: true,
    isSeasonal: true,
    addVeggiDays: false,
    imageGenerationMode: 'main',
  }
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    apiKey: null,
    view: 'apiKeySetup',
    currentModal: null,
    isLoading: true,
    loadingMessage: 'Загрузка...',
    error: null,
    appSettings: initialSettings,
    menuData: null,
    recipes: {},
    shoppingList: null,
    shoppingListCheckedItems: [], // To be deprecated
    budget: null,
    remainingItems: [],
    generationParams: null, // To be deprecated
    activeDayIndex: 0,
    activeRecipeName: null,
    generationProgress: 0,
    generationLog: [],
    aiClarificationQuestion: null,
    userClarificationAnswer: '',
  });

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('familyMenuState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (parsedState.apiKey) {
            setAppState(prev => ({
                ...prev,
                ...parsedState,
                appSettings: parsedState.appSettings || initialSettings,
                isLoading: false,
                view: parsedState.menuData ? 'menu' : 'generatorForm'
            }));
        } else {
            setAppState(prev => ({ ...prev, isLoading: false, view: 'apiKeySetup' }));
        }
      } else {
        setAppState(prev => ({ ...prev, isLoading: false, view: 'apiKeySetup' }));
      }
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
      setAppState(prev => ({ ...prev, isLoading: false, view: 'apiKeySetup' }));
    }
  }, []);

  const saveState = useCallback((stateToSave: AppState) => {
    try {
      const persistableState = {
        apiKey: stateToSave.apiKey,
        appSettings: stateToSave.appSettings,
        menuData: stateToSave.menuData,
        recipes: stateToSave.recipes,
        shoppingList: stateToSave.shoppingList,
        budget: stateToSave.budget,
        remainingItems: stateToSave.remainingItems,
      };
      localStorage.setItem('familyMenuState', JSON.stringify(persistableState));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }, []);
  
  const handleApiKeySubmit = async (key: string) => {
    setAppState(prev => ({ ...prev, isLoading: true, loadingMessage: 'Проверяем ключ...', generationProgress: 0, generationLog: [{ title: "Подключение к Google Gemini...", details: ["Проверка ключа..."] }] }));
    const isValid = await verifyApiKey(key);
    if (isValid) {
      const newState = { ...appState, apiKey: key, view: 'generatorForm' as View, isLoading: false, error: null, generationProgress: 0, generationLog: [] };
      setAppState(newState);
      saveState(newState);
    } else {
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Неверный ключ или нет доступа к Gemini.'
      }));
    }
  };

  const handleApiKeyUpdate = async (key: string) => {
    const isValid = await verifyApiKey(key);
    if (isValid) {
        const newState = { ...appState, apiKey: key };
        setAppState(newState);
        saveState(newState);
        alert('API ключ успешно обновлен!');
        return true;
    } else {
        alert('Новый ключ недействителен.');
        return false;
    }
  };

  const handleApiKeyDelete = () => {
    const newState = { 
        ...appState, 
        apiKey: null, 
        view: 'apiKeySetup' as View,
        currentModal: null,
        menuData: null,
        recipes: {},
        shoppingList: null,
        budget: null,
    };
    setAppState(newState);
    localStorage.removeItem('familyMenuState');
  };
  
  const updateLog = (logEntry: Partial<GenerationLogEntry>) => {
    setAppState(prev => {
        const newLog = [...prev.generationLog];
        if (logEntry.title) {
            newLog.push({ title: logEntry.title, details: logEntry.details || [], preview: logEntry.preview || [] });
        } else {
             const lastEntry = newLog[newLog.length - 1];
             if (lastEntry) {
                if(logEntry.details) lastEntry.details.push(...logEntry.details);
                if(logEntry.preview) lastEntry.preview = (lastEntry.preview || []).concat(logEntry.preview);
             }
        }
        return { ...prev, generationLog: newLog };
    });
  };

  const handleClarificationSubmit = async (answer: string) => {
    setAppState(prev => ({...prev, userClarificationAnswer: answer, aiClarificationQuestion: null }));
  }
  
  const handleStartGeneration = () => {
      setAppState(prev => ({ ...prev, isLoading: true, currentModal: null, error: null, recipes: {}, menuData: null, shoppingList: null, budget: null, generationLog: [], generationProgress: 0, userClarificationAnswer: '' }));
  }
  
  const handleGeneration = async (params: GenerationParams) => {
     if (!appState.apiKey) return;
     const newSettings: AppSettings = {
         ...appState.appSettings,
         period: params.period,
         mealsPerDay: params.mealsPerDay,
          generation: {
            ...appState.appSettings.generation,
            imageGenerationMode: params.imageGenerationMode,
          },
         family: Array.from({length: params.people}).map((_, i) => ({
             id: `${i}`, name: `Человек ${i+1}`, age: 30, weight: 70, goal: 'maintain', activity: 'moderate', restrictions: params.restrictions, allergies: params.allergies
         }))
     };
     setAppState(prev => ({ ...prev, appSettings: newSettings }));
     handleStartGeneration();
  };
  
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    const continueGeneration = async () => {
        if (!appState.isLoading || (appState.generationLog.length > 0 && appState.generationProgress > 0)) return;
        
        const { apiKey, appSettings, userClarificationAnswer } = appState;
        if (!apiKey) return;
        
        try {
            await delay(1500);
            setAppState(prev => ({ ...prev, generationProgress: 5 }));
            updateLog({ title: `Шаг 1/7: Анализ настроек семьи...`, details: [`Семья из ${appSettings.family.length} чел.`, `Бюджет: ${appSettings.budgetAmount}₽`] });
            const analysisResult = await analyzeSettings(appSettings, apiKey, userClarificationAnswer);
            
            if (analysisResult.question) {
                updateLog({ details: [`🤔 ИИ требует уточнений...`] });
                setAppState(prev => ({ ...prev, aiClarificationQuestion: analysisResult.question }));
                return;
            }
            
            updateLog({ details: [`✅ Анализ завершен.`], preview: [analysisResult.analysis] });
            setAppState(prev => ({ ...prev, generationProgress: 10, userClarificationAnswer: '' }));
            
            await delay(1500);
            updateLog({ title: `Шаг 2/7: Генерация меню...`, details: [`На основе анализа создается структура меню...`] });
            const menuData = await generateMenu(appSettings, apiKey, analysisResult.analysis);
            if (!menuData || !Array.isArray(menuData.menu) || menuData.menu.length === 0) throw new Error("AI returned invalid menu data.");
            const menuPreview = menuData.menu.slice(0, 2).map(day => `- ${day.day}: ${day.lunch}`);
            updateLog({ details: [`✅ Сгенерировано ${menuData.menu.length} дней.`], preview: menuPreview });
            setAppState(prev => ({ ...prev, menuData, generationProgress: 20 }));

            const allDishes = [...new Set(menuData.menu.flatMap(day => Object.values(day)).filter(d => typeof d === 'string' && d && !d.includes('(остатки)')) as string[])];
            let recipes: Record<string, Recipe> = {};
            const recipeProgressIncrement = 30 / allDishes.length;
            updateLog({ title: `Шаг 3/7: Генерация ${allDishes.length} рецептов...`, details: [] });

            for (let i = 0; i < allDishes.length; i++) {
                const dish = allDishes[i];
                await delay(1500);
                updateLog({ details: [`- Обрабатывается: "${dish}"...`] });
                const recipeData = await generateRecipe(dish, [], apiKey); 
                recipes[dish] = recipeData;
                updateLog({ details: [`  ✅ Рецепт создан: ${recipeData.ingredients.length} инг., ${recipeData.steps.length} ш.`] });
                setAppState(prev => ({ ...prev, recipes: { ...prev.recipes, [dish]: recipeData }, generationProgress: Math.round(20 + ((i + 1) * recipeProgressIncrement)) }));
            }
            setAppState(prev => ({...prev, recipes}));
            updateLog({ details: [`✅ Все ${allDishes.length} рецептов сгенерированы.`] });
            
            // Conditional Image Generation
            const imageMode = appSettings.generation.imageGenerationMode;
            if (imageMode === 'none') {
                updateLog({ title: 'Шаг 4/7: Генерация изображений пропущена', details: ['Пользователь пропустил этот шаг.'] });
                setAppState(prev => ({ ...prev, generationProgress: 65 }));
            } else {
                const itemsToImage = imageMode === 'main'
                    ? Object.values(recipes)
                    : Object.values(recipes).flatMap(r => r.steps.map(s => ({ step: s, recipeName: r.name })));

                const imageProgressIncrement = 15 / itemsToImage.length;
                updateLog({ title: `Шаг 4/7: Генерация ${itemsToImage.length} изображений...`, details: [`Режим: ${imageMode === 'main' ? 'Только основные' : 'Для каждого шага'}`] });

                for (let i = 0; i < itemsToImage.length; i++) {
                    await delay(1500);
                    const item = itemsToImage[i];
                    let description = '';
                    if (imageMode === 'main') {
                        const recipe = item as Recipe;
                        updateLog({ details: [`- Основное изображение для "${recipe.name}"...`] });
                        description = await generateImageDescription(recipe.name, recipe.name, apiKey);
                        if (recipe.steps.length > 0) {
                            recipe.steps[0].imageUrl = `https://placehold.co/400x300/D4A373/F9F7F4?text=${encodeURIComponent(description)}`;
                        }
                    } else {
                        const stepInfo = item as { step: any, recipeName: string };
                        updateLog({ details: [`- Иллюстрация для "${stepInfo.step.title}"...`] });
                        description = await generateImageDescription(stepInfo.step.description, stepInfo.recipeName, apiKey);
                        stepInfo.step.imageUrl = `https://placehold.co/400x300/D4A373/F9F7F4?text=${encodeURIComponent(description)}`;
                    }
                    setAppState(prev => ({ ...prev, generationProgress: Math.round(50 + ((i + 1) * imageProgressIncrement)) }));
                }
                updateLog({ details: [`✅ Все ${itemsToImage.length} изображений сгенерированы.`] });
            }


            await delay(1500);
            updateLog({ title: 'Шаг 5/7: Формирование списка покупок...', details: ['Собираются ингредиенты...'] });
            const shoppingList = await generateShoppingList(Object.keys(recipes), appSettings, apiKey);
            updateLog({ details: [`✅ Список из ${shoppingList.shoppingList.length} продуктов.`, `План: ${shoppingList.plannedTotalCost} ₽`] });
            setAppState(prev => ({ ...prev, shoppingList, generationProgress: 85 }));
            
            await delay(1500);
            updateLog({ title: 'Шаг 6/7: Расчёт бюджета...', details: [`Плановая стоимость: ${shoppingList.plannedTotalCost} ₽`] });
            const budget = await generateBudget(shoppingList.plannedTotalCost, appSettings.budgetAmount, apiKey);
            updateLog({ details: [`✅ Бюджет сформирован. Остаток по плану: ${budget.remaining} ₽`] });
            setAppState(prev => ({ ...prev, budget, generationProgress: 95 }));
            
            updateLog({ title: 'Шаг 7/7: Завершение...', details: ['Ваше меню ждет вас!'] });
            setAppState(prev => ({ ...prev, generationProgress: 100 }));
            
            const finalState = {
                ...appState, apiKey, menuData, recipes, shoppingList, budget, appSettings,
                view: 'menu' as View, activeDayIndex: 0, activeRecipeName: null,
            };
            setTimeout(() => {
                setAppState({ ...finalState, isLoading: false });
                saveState(finalState);
            }, 2000);

        } catch (e) {
            const error = e instanceof Error ? e.message : 'Произошла неизвестная ошибка.';
            console.error("Generation failed:", e);
            setAppState(prev => ({ ...prev, isLoading: false, error, view: 'generatorForm' }));
        }
    }
    continueGeneration();
  }, [appState.isLoading, appState.userClarificationAnswer]);


  const setView = (view: View) => setAppState(prev => ({ ...prev, view }));
  const setModal = (modal: ModalType) => setAppState(prev => ({ ...prev, currentModal: modal }));
  
  const selectRecipe = (recipeName: string) => {
    const cleanRecipeName = recipeName.replace(/\s*\(остатки\)/i, '');
    if (appState.recipes[cleanRecipeName]) {
        setAppState(prev => ({ ...prev, view: 'recipe', activeRecipeName: cleanRecipeName }));
    }
  };
  
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setAppState(prev => ({ ...prev, appSettings: newSettings }));
  }

  const renderModal = () => {
    if (appState.aiClarificationQuestion) {
        return <ClarificationModal question={appState.aiClarificationQuestion} onSubmit={handleClarificationSubmit} />
    }
    switch (appState.currentModal) {
      case 'settings':
        return <SettingsView 
            settings={appState.appSettings} 
            onUpdate={handleUpdateSettings} 
            onClose={() => setModal(null)} 
            onRegenerate={handleStartGeneration} 
            apiKey={appState.apiKey}
            onUpdateApiKey={handleApiKeyUpdate}
            onDeleteApiKey={handleApiKeyDelete}
            />;
      default:
        return null;
    }
  };

  const renderView = () => {
    if (appState.isLoading && appState.generationLog.length > 0) {
      return <LoadingScreen log={appState.generationLog} progress={appState.generationProgress} />;
    }
    if (appState.isLoading) {
      return <LoadingScreen log={[{title: appState.loadingMessage, details:[]}]} progress={50} />;
    }

    switch (appState.view) {
      case 'apiKeySetup':
        return <ApiKeySetup onSubmit={handleApiKeySubmit} error={appState.error} />;
      case 'generatorForm':
        return <MenuGeneratorForm onGenerate={handleGeneration} />;
      case 'menu':
        return appState.menuData && <MenuDisplay menu={appState.menuData} activeDayIndex={appState.activeDayIndex} setActiveDayIndex={(i) => setAppState(p => ({...p, activeDayIndex: i}))} onSelectRecipe={selectRecipe} />;
      case 'recipe':
        const recipe = appState.activeRecipeName ? appState.recipes[appState.activeRecipeName] : null;
        return recipe ? <RecipeView recipe={recipe} onBack={() => setView('menu')} shoppingList={appState.shoppingList} checkedItems={[]} setView={setView}/> : <div>Рецепт не найден.</div>;
      case 'shoppingList':
        return appState.shoppingList && <ShoppingList list={appState.shoppingList} setList={(list) => setAppState(p => ({...p, shoppingList: list}))} recipes={appState.recipes} onSelectRecipe={selectRecipe} />;
      case 'budget':
        return appState.budget && <BudgetView budget={appState.budget} onUpdateBudget={(newBudget) => setAppState(prev => ({...prev, budget: newBudget}))} />;
      case 'dataSync':
        return <DataSync appState={appState} setAppState={setAppState} />;
      case 'remainingItems':
        return <RemainingItemsView items={appState.remainingItems} setItems={(items) => setAppState(prev => ({...prev, remainingItems: items}))} />;
      default:
        return <MenuGeneratorForm onGenerate={handleGeneration} />;
    }
  };

  return (
    <div className="bg-[#F9F7F4] min-h-screen text-[#333] font-lato texture-paper">
      <div className="container mx-auto max-w-lg pb-24">
        {appState.apiKey && !appState.isLoading && appState.view !== 'apiKeySetup' && (
            <div className="fixed top-4 right-4 z-40">
                <button onClick={() => setModal('settings')} className="p-3 bg-white/70 backdrop-blur-sm rounded-full shadow-lg">
                    <GearIcon className="w-6 h-6 text-[#8B5E3C]" />
                </button>
            </div>
        )}
        {renderView()}
        {renderModal()}
      </div>
      {appState.apiKey && appState.menuData && !appState.isLoading && appState.view !== 'generatorForm' && appState.view !== 'apiKeySetup' && (
        <BottomNav currentView={appState.view} setView={setView} />
      )}
    </div>
  );
};

export default App;