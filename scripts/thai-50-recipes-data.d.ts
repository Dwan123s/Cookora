export type ThaiRecipeData = {
  id: number;
  slug: string;
  title: string;
  category: string;
  summary: string;
  prepMinutes: number;
  cookMinutes: number;
  totalMinutes: number;
  preconditions: string;
  imageQuery?: string;
  ingredients: { name: string; quantity: string; unit: string; role: 'MAIN' | 'SUPPORTING' | 'SEASONING' }[];
  steps: { order: number; title: string; instruction: string }[];
};
export const THAI_50_RECIPES: ThaiRecipeData[];
