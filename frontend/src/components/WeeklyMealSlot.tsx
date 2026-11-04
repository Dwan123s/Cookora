import React from 'react';
import { CookingPot, LoaderCircle, Plus } from 'lucide-react';
import type { MealEntry, Recipe } from '@cookora/contracts';
import { matcherMedia } from '../matcher-media';

export const shortMealTitle = (title: string) =>
  title.match(/\(([^()]+)\)\s*$/)?.[1] || title.replace(' · ', ' ');

export function MealImage({ recipe }: { recipe: Recipe }) {
  const media = matcherMedia(recipe);
  return (
    <span className="weekly-meal-thumb">
      <CookingPot aria-hidden="true" />
      {media.src && (
        <img
          src={media.src}
          alt={`${media.label}: ${recipe.title}`}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      )}
    </span>
  );
}

export function WeeklyMealSlot({
  meals,
  label,
  disabled,
  loading,
  onEdit,
  onAdd,
}: {
  meals: MealEntry[];
  label: string;
  disabled: boolean;
  loading: boolean;
  onEdit: (meal: MealEntry) => void;
  onAdd: () => void;
}) {
  if (!meals.length)
    return (
      <button
        type="button"
        className="weekly-meal is-empty"
        disabled={disabled}
        aria-label={`${label}: Thêm món`}
        onClick={onAdd}
      >
        <span className="weekly-empty-thumb">
          {loading ? <LoaderCircle className="spin" size={21} /> : <Plus size={23} />}
        </span>
        <span>Thêm món</span>
      </button>
    );
  return (
    <div className={`weekly-meal-slot${meals.length > 1 ? ' has-many' : ''}`}>
      <ul className="weekly-slot-dishes" aria-label={`${label}: ${meals.length} món`}>
        {meals.map((meal) => (
          <li key={meal.id}>
            <button
              type="button"
              className="weekly-meal"
              onClick={() => onEdit(meal)}
              disabled={disabled}
              aria-label={`${label}: Chỉnh ${meal.recipe.title}, ${meal.servings} người ăn`}
            >
              <MealImage recipe={meal.recipe} />
              <span className="weekly-meal-title">{shortMealTitle(meal.recipe.title)}</span>
              <small>{meal.servings} người ăn</small>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="weekly-add-dish"
        onClick={onAdd}
        disabled={disabled}
        aria-label={`${label}: Thêm món vào bữa`}
      >
        <Plus size={14} />
        Thêm món
      </button>
    </div>
  );
}
