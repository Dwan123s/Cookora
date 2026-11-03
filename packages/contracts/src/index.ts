export type Cuisine = { code: string; name: string; flag: string };
export type User = { id: string; email: string; displayName: string; role: 'USER' | 'EDITOR' | 'ADMIN' };
export type Ingredient = { id: string; name: string; aliases: string[]; unit: string; category: string };
export type RecipeLine = {
  id: string;
  ingredientId: string;
  name: string;
  quantity: string | null;
  unit: string;
  optional: boolean;
  role: 'MAIN' | 'SUPPORTING' | 'SEASONING';
  note?: string;
};
export type Recipe = {
  id: string;
  slug: string;
  revision: number;
  title: string;
  summary: string;
  cuisine: string;
  category: string;
  image: string;
  imageCredit: string;
  baseServings: number;
  prepMinutes: number | null;
  cookMinutes: number | null;
  waitMinutes: number | null;
  totalMinutes: number | null;
  timingStatus: 'ESTIMATED' | 'VERIFIED';
  preconditions: string;
  difficulty: string;
  difficultyBasis?: 'PROVIDED' | 'ESTIMATED' | 'UNKNOWN';
  contentStatus: 'DRAFT' | 'APPROVED';
  sourceUrl: string;
  sourceName: string;
  createdAt?: string;
  ingredients: RecipeLine[];
  steps: { id: string; recipeId?: string; order: number; title: string; instruction: string }[];
};
export type ScaledRecipe = {
  recipeId: string;
  servings: number;
  lines: (RecipeLine & { exactQuantity: string | null })[];
  warnings: string[];
};
export type MatchItem = { ingredientId: string; quantity?: string; unit?: string };
export type MatchResult = {
  recipe: Recipe;
  score: number;
  canCookConfirmed: boolean;
  missing: { ingredientId: string; name: string; quantity: string | null; unit: string }[];
  unknown: string[];
  mode: 'identity' | 'quantity';
};
export type MealEntry = {
  id: string;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  servings: number;
  recipe: Recipe;
};
export type MealPlan = { id: string; weekStart: string; version: number; entries: MealEntry[] };
export type ShoppingItem = {
  id: string;
  ingredientId: string;
  name: string;
  category: string;
  unit: string;
  quantity: string | null;
  purchased: boolean;
  sources: string[];
};
export type ShoppingList = {
  id: string;
  planId: string;
  planVersion: number;
  version: number;
  stale: boolean;
  items: ShoppingItem[];
};
export type BacklogItem = {
  id: string;
  cuisine_group: string;
  cuisine_label: string;
  title_proposed: string;
  category_proposed: string;
  priority: string;
  milestone: string;
  status: string;
  core_ingredients_proposed: string[];
  research_brief_id: string | null;
};

export type AiSuggestedStep = {
  order: number;
  title: string;
  instruction: string;
};

export type AiSuggestedIngredient = {
  name: string;
  quantity: string | null;
  unit: string;
  note?: string;
};

export type AiSuggestedDish = {
  id: string;
  title: string;
  summary: string;
  cuisine: string;
  category: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  totalMinutes: number;
  difficulty: string;
  usedIngredients: AiSuggestedIngredient[];
  pantryIngredientsNeeded: AiSuggestedIngredient[];
  steps: AiSuggestedStep[];
};

export type AiParsedIngredient = {
  name: string;
  quantity: string | null;
  unit: string | null;
  original: string;
};

export type AiChefSuggestionResponse = {
  prompt: string;
  servings: number;
  parsedIngredients: AiParsedIngredient[];
  menuOverview: string;
  catalogDishes: { recipe: Recipe; reason: string }[];
  dishes: AiSuggestedDish[];
};
export type AiChatMessage = { role: 'user' | 'assistant'; content: string };

export type BudgetSuggestionInput = {
  amount: number;
  mode: 'week' | 'day';
  days: number;
  people: number;
  mealsPerDay: number;
  region: string;
  preferences: string;
};
export type BudgetSuggestionResponse = {
  input: BudgetSuggestionInput;
  budget: number;
  overview: string;
  meals: {
    day: number;
    meal: number;
    dishes: { recipe: Recipe; estimatedCost: number; reason: string }[];
    estimatedCost: number;
  }[];
  estimatedTotal: number;
  remaining: number;
  withinBudget: boolean;
  shoppingList: { ingredientId: string; name: string; quantity: string | null; unit: string; note: string }[];
  tips: string[];
  priceNote: string;
  generatedAt: string;
};

export type Envelope<T> = { data: T; meta: { requestId: string; [key: string]: unknown } };
