import type { Goal } from './eatfit-calculations';

export type EatFitMeal = {
  number: number;
  slug: string;
  title: string;
  image: string;
  ingredients: string;
  recipeContext: string;
  reason: string;
};
export type EatFitProposal = {
  meals: EatFitMeal[];
  target: number;
  goal: Goal;
  signature: string;
  round: number;
  seenSlugs: string[];
};
export type EatFitProfile = {
  gender: 'female' | 'male';
  age: string;
  height: string;
  weight: string;
  activity: number;
  goal: Goal;
};
export type EatFitDay = {
  date: string;
  training: boolean;
  target: number | null;
  goal: Goal;
  meals: (EatFitMeal | null)[];
};
type Draft = {
  profile: EatFitProfile;
  proposal: EatFitProposal | null;
  scheduleDate: string;
  training: boolean;
};
const draftKey = 'cookora.eatfit.draft.v1';
const daysKey = 'cookora.eatfit.calendar.v1';
const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isGoal = (value: unknown): value is Goal => value === 'lose' || value === 'maintain' || value === 'gain';
const positive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;
function isMeal(value: unknown): value is EatFitMeal {
  return object(value) && positive(value.number) && Number.isInteger(value.number)
    && ['slug', 'title', 'image', 'ingredients', 'recipeContext', 'reason'].every((key) => typeof value[key] === 'string');
}
function isProposal(value: unknown): value is EatFitProposal {
  return object(value) && Array.isArray(value.meals) && value.meals.length > 0 && value.meals.length <= 6 && value.meals.every(isMeal)
    && positive(value.target) && isGoal(value.goal) && typeof value.signature === 'string'
    && typeof value.round === 'number' && Number.isInteger(value.round) && value.round >= 0
    && Array.isArray(value.seenSlugs) && value.seenSlugs.every((slug) => typeof slug === 'string');
}
function isProfile(value: unknown): value is EatFitProfile {
  return object(value) && (value.gender === 'female' || value.gender === 'male') && isGoal(value.goal)
    && ['age', 'height', 'weight'].every((key) => typeof value[key] === 'string')
    && typeof value.activity === 'number' && [1.2, 1.375, 1.55, 1.725].includes(value.activity);
}
export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function validPlanDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && localDateKey(date) === value;
}
export function formatPlanDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
}
export function planWeek(value: string) {
  const monday = new Date(`${value}T12:00:00`);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return localDateKey(date);
  });
}
export function loadEatFitDraft(): Draft | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(draftKey) || 'null');
    if (!object(value) || !isProfile(value.profile)) return null;
    return {
      profile: value.profile,
      proposal: isProposal(value.proposal) ? value.proposal : null,
      scheduleDate: validPlanDate(value.scheduleDate) ? value.scheduleDate : localDateKey(),
      training: value.training === true,
    };
  } catch { return null; }
}
export function loadEatFitDays(): EatFitDay[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(daysKey) || '[]');
    if (!Array.isArray(value)) return [];
    const valid = value.filter((day): day is EatFitDay => object(day) && validPlanDate(day.date)
      && typeof day.training === 'boolean' && (day.target === null || positive(day.target)) && isGoal(day.goal)
      && Array.isArray(day.meals) && day.meals.length === 4 && day.meals.every((meal) => meal === null || isMeal(meal)));
    return [...new Map(valid.map((day) => [day.date, day])).values()].sort((a, b) => a.date.localeCompare(b.date));
  } catch { return []; }
}
export function saveEatFitDraft(value: Draft) {
  localStorage.setItem(draftKey, JSON.stringify(value));
}
export function saveEatFitDays(value: EatFitDay[]) {
  localStorage.setItem(daysKey, JSON.stringify(value));
}
