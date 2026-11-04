import React, { useId } from 'react';
import { CookingPot, LoaderCircle, Moon, PencilLine, Plus, Soup, Sun, Trash2 } from 'lucide-react';
import type { MealEntry, Recipe } from '@cookora/contracts';
import { matcherMedia } from '../matcher-media';
import { addDays } from '../date';
import { mealSlotEntries } from '../meal-plan-slots';

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
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      )}
    </span>
  );
}

const weekdays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const meals = [
  { type: 'BREAKFAST', label: 'Bữa sáng', Icon: Sun },
  { type: 'LUNCH', label: 'Bữa trưa', Icon: Soup },
  { type: 'DINNER', label: 'Bữa tối', Icon: Moon },
] as const;
const dayLabel = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}`;

export function WeeklyDayPlanner({
  entries,
  week,
  selectedDate,
  today,
  disabled,
  loading,
  onSelectDate,
  onAdd,
  onEdit,
  onRemove,
  onServingsChange,
}: {
  entries: MealEntry[];
  week: string;
  selectedDate: string;
  today: string;
  disabled: boolean;
  loading: boolean;
  onSelectDate: (date: string) => void;
  onAdd: (date: string, type: MealEntry['mealType']) => void;
  onEdit: (entry: MealEntry) => void;
  onRemove: (entry: MealEntry) => void;
  onServingsChange: (entry: MealEntry, servings: number) => void;
}) {
  const id = useId();
  const dates = weekdays.map((_, index) => addDays(week, index));
  const selectedEntries = entries.filter((entry) => entry.date === selectedDate);
  return (
    <div className="weekly-day-planner">
      <div className="weekly-day-strip" role="group" aria-label="Chọn ngày trong tuần">
        {dates.map((date, index) => {
          const count = entries.filter((entry) => entry.date === date).length;
          return (
            <button
              type="button"
              key={date}
              aria-pressed={date === selectedDate}
              aria-current={date === today ? 'date' : undefined}
              disabled={disabled}
              onClick={() => onSelectDate(date)}
              aria-label={`${weekdays[index]}, ${dayLabel(date)}${date === today ? ', hôm nay' : ''}: ${count} món`}
            >
              <span>{weekdays[index]}</span>
              <strong>{dayLabel(date)}</strong>
              <small>{loading ? 'Đang tải…' : count ? `${count} món` : 'Chưa có món'}</small>
              {date === today && <i aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <div className="weekly-day-heading">
        <div>
          <h3 id={`${id}-day`}>
            {selectedDate === today ? 'Hôm nay' : weekdays[dates.indexOf(selectedDate)]},{' '}
            {dayLabel(selectedDate)}
          </h3>
          <p>
            {loading
              ? 'Đang tải thực đơn…'
              : `${selectedEntries.length} món · Chọn món để chỉnh, đổi số người ngay bên cạnh.`}
          </p>
        </div>
        {selectedDate !== today && (
          <button type="button" disabled={disabled} onClick={() => onSelectDate(today)}>
            Về hôm nay
          </button>
        )}
      </div>
      <div className="weekly-day-meals" aria-labelledby={`${id}-day`} aria-busy={loading}>
        {meals.map(({ type, label, Icon }) => {
          const dishes = mealSlotEntries(entries, selectedDate, type);
          return (
            <section className="weekly-day-meal" key={type} aria-labelledby={`${id}-${type}`}>
              <header>
                <span className={`weekly-day-meal-icon ${type.toLowerCase()}`}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h4 id={`${id}-${type}`}>
                  {label}
                  <small>{dishes.length} món</small>
                </h4>
                <button
                  type="button"
                  className="weekly-day-add"
                  disabled={disabled}
                  onClick={() => onAdd(selectedDate, type)}
                  aria-label={`${label}, ${dayLabel(selectedDate)}: Thêm món`}
                >
                  <Plus size={17} />
                  Thêm món
                </button>
              </header>
              {dishes.length ? (
                <ul className="weekly-day-dishes">
                  {dishes.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className="weekly-day-dish"
                        disabled={disabled}
                        onClick={() => onEdit(entry)}
                        aria-label={`${label}: Chỉnh ${entry.recipe.title}, ${entry.servings} người ăn`}
                      >
                        <MealImage recipe={entry.recipe} />
                        <span>{entry.recipe.title}</span>
                        <PencilLine size={15} aria-hidden="true" />
                      </button>
                      <select
                        aria-label={`Số người ăn ${entry.recipe.title}`}
                        value={entry.servings}
                        disabled={disabled}
                        onChange={(event) => onServingsChange(entry, Number(event.target.value))}
                      >
                        {Array.from({ length: 20 }, (_, index) => (
                          <option key={index} value={index + 1}>
                            {index + 1} người
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="weekly-day-remove"
                        disabled={disabled}
                        aria-label={`Bỏ ${entry.recipe.title} khỏi ${label.toLowerCase()}`}
                        title="Bỏ món khỏi bữa"
                        onClick={() => onRemove(entry)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="weekly-day-empty">
                  {loading ? (
                    <>
                      <LoaderCircle className="spin" size={17} />
                      Đang tải món…
                    </>
                  ) : (
                    'Chưa có món. Thêm món chính, canh hoặc rau cho bữa này.'
                  )}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
