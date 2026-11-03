import { normalize } from './domain';

export type Difficulty = 'Dễ' | 'Vừa' | 'Nâng cao';
type DifficultyInput = {
  difficulty?: string;
  title?: string;
  totalMinutes?: number | null;
  steps?: { title?: string; instruction: string }[];
  ingredients?: unknown[];
  lines?: unknown[];
};

const labels: Record<string, Difficulty> = {
  de: 'Dễ',
  easy: 'Dễ',
  vua: 'Vừa',
  'trung binh': 'Vừa',
  medium: 'Vừa',
  kho: 'Nâng cao',
  'nang cao': 'Nâng cao',
  hard: 'Nâng cao',
};
export function canonicalDifficulty(value: string): Difficulty | undefined {
  const key = normalize(value);
  return Object.hasOwn(labels, key) ? labels[key] : undefined;
}

// A transparent estimate of technique/coordination, independent of publication or cook testing.
// Existing editorial/source ratings take precedence. Waiting time alone never makes a dish advanced.
export function recipeDifficulty(recipe: DifficultyInput): {
  difficulty: Difficulty | '';
  difficultyBasis: 'PROVIDED' | 'ESTIMATED' | 'UNKNOWN';
} {
  const supplied = canonicalDifficulty(recipe.difficulty || '');
  if (supplied) return { difficulty: supplied, difficultyBasis: 'PROVIDED' };
  const steps = recipe.steps || [];
  if (!steps.length) return { difficulty: '', difficultyBasis: 'UNKNOWN' };
  const method = normalize(steps.map((step) => step.instruction).join('\n'));
  const text = `${normalize(recipe.title || '')}\n${method}`;
  const techniques = [
    /\b(xao|ap chao)\b/,
    /\b(chien|ran)\b/,
    /\b(kho|rim|ham|om)\b/,
    /\b(hap|chung cach thuy)\b/,
    /\b(nuong|lo nuong)\b/,
    /\b(luoc|chan|dun soi)\b|\btrung (soi|mi|bun|pho|rau|gia|banh|hu tieu)\b/,
  ].filter((pattern) => pattern.test(method)).length;
  const dough = /\b(nhao|nhoi|can)\s+(khoi\s+)?bot\b/.test(method);
  const shape = /\b(nan|tao hinh|goi|boc nhan|can mong|gap bot|cat soi)\b/.test(method);
  const meringue =
    /danh[^.\n]{0,90}bong[^.\n]{0,60}long trang|long trang[^.\n]{0,90}danh[^.\n]{0,30}bong/.test(method);
  const precision = /\b(keo mi|keo soi mi|can bot ngan lop|souffle|macaron)\b/.test(text);
  if (
    precision ||
    (meringue && /nuong/.test(method)) ||
    (dough && shape) ||
    (steps.length >= 9 && techniques >= 3)
  ) {
    return { difficulty: 'Nâng cao', difficultyBasis: 'ESTIMATED' };
  }
  const ingredientCount = recipe.ingredients?.length ?? recipe.lines?.length ?? 0;
  const fermentation = /\b(u bot|len men|u men)\b/.test(method);
  if (
    steps.length <= 6 &&
    ingredientCount <= 10 &&
    techniques <= 2 &&
    !fermentation &&
    (recipe.totalMinutes === null || recipe.totalMinutes === undefined || recipe.totalMinutes <= 45)
  ) {
    return { difficulty: 'Dễ', difficultyBasis: 'ESTIMATED' };
  }
  return { difficulty: 'Vừa', difficultyBasis: 'ESTIMATED' };
}
