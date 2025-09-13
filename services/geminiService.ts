import { GoogleGenAI, Type } from "@google/genai";
import { AppSettings, MenuData, Recipe, ShoppingList, Budget, MenuDay } from '../types';

let ai: GoogleGenAI | null = null;

const getAiClient = (apiKey: string): GoogleGenAI => {
    if (!ai || (ai as any).apiKey !== apiKey) {
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};

const parseJsonResponse = async <T,>(text: string, promptForRetry: string, apiKey: string): Promise<T> => {
    try {
        const cleanedText = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanedText) as T;
    } catch (e) {
        console.warn("Failed to parse JSON, attempting to fix with AI.", e);
        return fixJsonWithAi(text, e instanceof Error ? e.message : "Unknown parsing error", promptForRetry, apiKey);
    }
};

const fixJsonWithAi = async <T,>(originalResponse: string, errorMessage: string, originalPrompt: string, apiKey:string): Promise<T> => {
    const ai = getAiClient(apiKey);
    const fixPrompt = `The following JSON response was invalid. Original prompt: "${originalPrompt}". Response: "${originalResponse}". Error: "${errorMessage}". Please correct the JSON and return ONLY the valid JSON object.`;
    
    const result = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: fixPrompt });
    const fixedText = result.text;
    try {
        const cleanedText = fixedText.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanedText) as T;
    } catch (e) {
        throw new Error("Не удалось получить корректные данные от ИИ после попытки исправления.");
    }
};

export const verifyApiKey = async (apiKey: string): Promise<boolean> => {
    try {
        const ai = getAiClient(apiKey);
        const result = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: "Ответь одним словом: OK" });
        return result.text.trim().toUpperCase() === "OK";
    } catch (error) {
        console.error("API Key verification failed:", error);
        ai = null;
        return false;
    }
};

export const analyzeSettings = async (settings: AppSettings, apiKey: string, userAnswer: string = ''): Promise<{ analysis: string, question?: null } | { analysis?: null, question: string }> => {
    const prompt = `
      Проанализируй настройки семьи для плана питания:
      Семья: ${JSON.stringify(settings.family)}
      Период: ${settings.period} дней, ${settings.mealsPerDay} приема пищи/день.
      Бюджет: ${settings.budgetAmount} ₽.
      Предпочтения: ${JSON.stringify(settings.generation)}.
      ${userAnswer ? `Уточнение от пользователя: "${userAnswer}"` : ''}

      Твоя задача:
      1. Если настройки ясны, дай краткое резюме на 1-2 предложения о кулинарном стиле. JSON: {"analysis": "Твое резюме..."}.
      2. Если есть неоднозначность (например, "вегетарианский" - какой?), задай ОДИН уточняющий вопрос. JSON: {"question": "Твой вопрос..."}.
      Возвращай только JSON.
    `;
    const ai = getAiClient(apiKey);
    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    const parsed = await parseJsonResponse<{ analysis?: string, question?: string }>(result.text, prompt, apiKey);
    if (parsed.question) return { question: parsed.question };
    if (parsed.analysis) return { analysis: parsed.analysis };
    throw new Error("AI returned unexpected analysis format.");
};

export const generateMenu = async (settings: AppSettings, apiKey: string, analysis: string): Promise<MenuData> => {
    const mealKeys = settings.mealsPerDay === 5 
        ? `"breakfast", "snack", "lunch", "afternoonSnack", "dinner"`
        : `"breakfast", "lunch", "dinner"`;

    const prompt = `На основе анализа: "${analysis}", создай меню на ${settings.period} дней для семьи: ${JSON.stringify(settings.family)}. 
    Каждый день должен включать: ${mealKeys}. Учти предпочтения: ${JSON.stringify(settings.generation)}.
    Формат: JSON объект { "menu": [ { "day": "...", "breakfast": "...", "lunch": "...", "dinner": "...", "calories": ... } ] }.
    Рассчитай примерную калорийность на день.`;

    const ai = getAiClient(apiKey);
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    const parsedData = await parseJsonResponse<MenuData | MenuDay[]>(result.text, prompt, apiKey);
    if (Array.isArray(parsedData)) return { menu: parsedData };
    if (parsedData && 'menu' in parsedData) return parsedData as MenuData;
    throw new Error("Не удалось распознать структуру меню от ИИ.");
};

export const generateRecipe = async (dishName: string, restrictions: string[], apiKey: string): Promise<Recipe> => {
    const prompt = `Создай подробный рецепт для блюда: "${dishName}". Учти общие ограничения семьи. Ингредиенты должны быть доступны в России. Добавь 5–7 шагов с временем в секундах, если нужно ждать. Формат: JSON объект {"recipe": {"name": "...", "ingredients": [...], "steps": [...], "calories": ...}} без лишнего текста.`;
    const ai = getAiClient(apiKey);
    
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    return parseJsonResponse<{ recipe: Recipe }>(result.text, prompt, apiKey).then(data => data.recipe);
};

export const generateShoppingList = async (recipeNames: string[], settings: AppSettings, apiKey: string): Promise<ShoppingList> => {
    const prompt = `На основе рецептов: ${recipeNames.join(', ')} создай список покупок для семьи ${JSON.stringify(settings.family)} на ${settings.period} дней. 
    Для каждого продукта верни: category, item, plannedQuantity (например "1.5 кг"), plannedPrice (число), isPartial (true, если можно купить частями), minQty (минимальная порция для покупки, если isPartial).
    Используй средние цены РФ. 
    Формат: JSON объект {"shoppingList": [...], "plannedTotalCost": ...}.`;
    const ai = getAiClient(apiKey);

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    // Post-process to add client-side fields
    const parsed = await parseJsonResponse<{ shoppingList: any[], plannedTotalCost: number }>(result.text, prompt, apiKey);
    const processedList = parsed.shoppingList.map(item => ({
        ...item,
        purchasedQuantity: 0,
        purchasedPrice: 0,
        purchases: [],
        isCompleted: false,
    }));

    return { shoppingList: processedList, plannedTotalCost: parsed.plannedTotalCost, actualTotalCost: 0 };
};

export const generateBudget = async (plannedCost: number, totalBudget: number, apiKey: string): Promise<Budget> => {
    const prompt = `На основе списка покупок с плановой стоимостью ${plannedCost} ₽ создай бюджет семьи. Общий бюджет ${totalBudget} ₽. 
    Раздели расходы на категории: Продукты, Бытовая химия, Прочее. 
    Формат: JSON объект {"budget": {"total": ..., "plannedSpent": ..., "actualSpent": 0, "remaining": ..., "savings": 0, "categories": [...]}} без лишнего текста.`;
    const ai = getAiClient(apiKey);

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    return parseJsonResponse<{ budget: Budget }>(result.text, prompt, apiKey).then(data => data.budget);
};

export const generateImageDescription = async (stepDescription: string, recipeName: string, apiKey: string): Promise<string> => {
    const prompt = `Создай краткое описание для изображения к шагу: "${stepDescription}" для блюда "${recipeName}". Стиль: "реалистичная фотография еды, натуральное освещение, деревянная доска, мягкая тень". Формат: только строка текста, до 12 слов.`;
    const ai = getAiClient(apiKey);
    
    const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return result.text.trim();
};

export const calculateFamilyCalories = async (family: any, apiKey: string): Promise<number> => {
    if (!family || family.length === 0) return 2000;
    const prompt = `Рассчитай общую суточную калорийность семьи по Mifflin-St Jeor + коэффициент активности: ${JSON.stringify(family)}. Верни только число в ккал.`;
    const ai = getAiClient(apiKey);
    const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return parseInt(result.text.replace(/\D/g, ''), 10) || 2000;
}
