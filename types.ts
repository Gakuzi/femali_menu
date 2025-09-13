import { GoogleGenAI } from "@google/genai";

export type View = 'apiKeySetup' | 'generatorForm' | 'menu' | 'recipe' | 'shoppingList' | 'budget' | 'dataSync' | 'remainingItems' | 'settings';

export type ModalType = 'settings' | 'recipeEdit' | 'ingredientCheck' | 'recipeCompletion' | 'shoppingItemEdit' | null;

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  weight: number;
  goal: 'maintain' | 'lose' | 'gain' | 'health';
  activity: 'sedentary' | 'moderate' | 'active' | 'very_active';
  restrictions: string[];
  allergies: string;
}

export interface GenerationSettings {
  avoidRepetition: boolean;
  useLeftovers: boolean;
  minimizeIngredients: boolean;
  preferSimple: boolean;
  isSeasonal: boolean;
  addVeggiDays: boolean;
  imageGenerationMode: 'main' | 'all' | 'none';
}

export interface AppSettings {
  family: FamilyMember[];
  period: number;
  budgetAmount: number;
  mealsPerDay: number;
  generation: GenerationSettings;
}

// Kept for initial form, but AppSettings is the main source of truth
export interface GenerationParams {
  people: number;
  period: number;
  protein: string;
  restrictions: string[];
  allergies: string;
  mealsPerDay: number;
  imageGenerationMode: 'main' | 'all' | 'none';
}

export interface MenuDay {
  day: string;
  breakfast?: string;
  snack?: string;
  lunch: string;
  afternoonSnack?: string;
  dinner: string;
  calories?: number;
  [key: string]: string | number | undefined;
}


export interface MenuData {
  menu: MenuDay[];
}

export interface RecipeStep {
  title: string;
  description: string;
  time?: number; // in seconds
  imageUrl?: string;
}

export interface Recipe {
  name: string;
  ingredients: string[]; // This will now just be a simple list of names for the recipe display
  steps: RecipeStep[];
  calories?: number;
}

export interface Purchase {
  id: string;
  quantity: string;
  price: number;
  date: string; // ISO
}

export interface ShoppingListItem {
  category: string;
  item: string;
  
  // Planned values
  plannedQuantity: string;
  plannedPrice: number;
  
  // Actual tracking
  purchasedQuantity: number; // A numeric value for easier calculation
  purchasedPrice: number;
  
  // For partial buys
  isPartial: boolean;
  minQty?: string;
  
  purchases: Purchase[];
  isCompleted: boolean;
}

export interface ShoppingList {
  shoppingList: ShoppingListItem[];
  plannedTotalCost: number;
  actualTotalCost: number;
}

export interface BudgetCategory {
  name: string;
  plannedAmount: number;
  actualAmount: number;
}

export interface Budget {
  total: number;
  plannedSpent: number;
  actualSpent: number;
  remaining: number;
  savings: number;
  categories: BudgetCategory[];
}

export interface RemainingItem {
  id: string;
  name: string;
  quantity: string;
  expiryDate: string; // ISO string
  source: string; // e.g., "From recipe: Chili"
}

export interface GenerationLogEntry {
    title: string;
    details: string[];
    preview?: string[];
}

export interface AppState {
  apiKey: string | null;
  view: View;
  currentModal: ModalType;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  
  appSettings: AppSettings;
  
  menuData: MenuData | null;
  recipes: Record<string, Recipe>;
  shoppingList: ShoppingList | null;
  budget: Budget | null;
  remainingItems: RemainingItem[];
  
  // Old params, will be deprecated by appSettings
  generationParams: GenerationParams | null;
  
  activeDayIndex: number;
  activeRecipeName: string | null;
  
  // Generation process state
  generationProgress: number;
  generationLog: GenerationLogEntry[];
  aiClarificationQuestion: string | null;
  userClarificationAnswer: string;
  
  // UI state
  shoppingListCheckedItems: string[]; // This might become deprecated in favor of isCompleted in item
}