export type Goal = 'lose' | 'maintain' | 'gain';
export function calculateNutrition(p: {
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  activity: number;
  goal: Goal;
}) {
  const { gender, age, height, weight, activity, goal } = p;
  if (
    ![age, height, weight, activity].every(Number.isFinite) ||
    !Number.isInteger(age) ||
    age < 18 ||
    age > 80 ||
    height < 120 ||
    height > 220 ||
    weight < 35 ||
    weight > 200 ||
    ![1.2, 1.375, 1.55, 1.725].includes(activity)
  )
    return null;
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161));
  const tdee = Math.round(bmr * activity);
  const target = tdee + (goal === 'lose' ? -400 : goal === 'gain' ? 400 : 0);
  if (target <= 0) return null;
  return {
    bmr,
    tdee,
    target,
    protein: Math.round((target * 0.3) / 4),
    carbs: Math.round((target * 0.4) / 4),
    fat: Math.round((target * 0.3) / 9),
  };
}
export function mealBudgets(target: number) {
  const first = [0.25, 0.4, 0.25].map((r) => Math.round(target * r));
  return [...first, target - first.reduce((s, n) => s + n, 0)];
}
