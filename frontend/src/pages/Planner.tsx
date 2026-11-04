import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  CookingPot,
  Leaf,
  LoaderCircle,
  Moon,
  Plus,
  Search,
  ShoppingCart,
  Shuffle,
  Soup,
  Sun,
  Trash2,
  Users,
  Utensils,
} from 'lucide-react';
import type { Envelope, MealEntry, MealPlan, Recipe, ShoppingList } from '@cookora/contracts';
import { request } from '../api';
import { addDays, weekOf } from '../date';
import { errorText, Modal, useNotice, useUser } from '../shared';
import { matcherMedia } from '../matcher-media';
import { loadEatFitDays } from '../eatfit-storage';
import { groceryAmount, syncEatFitDayToMealPlan, weeklyEstimate, weeklyGroceries, type GroceryRow } from '../weekly-plan';
import '../planner-reference.css';

type MealType = MealEntry['mealType'];
type LocalEntry = Omit<MealEntry, 'recipe'> & { recipeId: string };
type LocalWeek = { entries: LocalEntry[]; checked: Record<string, boolean> };
const dayLabel = (value: string) => `${value.slice(8, 10)}/${value.slice(5, 7)}`;
const storageKey = 'cookora.guest-week-plans.document-v2';
const rows: { type: MealType; label: string; Icon: typeof Sun }[] = [
  { type: 'BREAKFAST', label: 'Bữa sáng', Icon: Sun },
  { type: 'LUNCH', label: 'Bữa trưa', Icon: Soup },
  { type: 'DINNER', label: 'Bữa tối', Icon: Moon },
];
const weekdays = ['THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7', 'CN'];
const shortTitle = (title: string) => title.match(/\(([^()]+)\)\s*$/)?.[1] || title.replace(' · ', ' ');
function readLocalWeeks(): Record<string, LocalWeek> {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const valid: Record<string, LocalWeek> = {};
    for (const [week, value] of Object.entries(data)) {
      const item = value as LocalWeek;
      if (/^\d{4}-\d{2}-\d{2}$/.test(week) && Array.isArray(item.entries)) {
        valid[week] = {
          entries: item.entries
            .filter(
              (e) =>
                typeof e.id === 'string' &&
                typeof e.recipeId === 'string' &&
                typeof e.date === 'string' &&
                e.date >= week &&
                e.date <= addDays(week, 6) &&
                rows.some((r) => r.type === e.mealType) &&
                Number.isInteger(e.servings) &&
                e.servings >= 1 &&
                e.servings <= 20,
            )
            .slice(0, 100),
          checked: item.checked && typeof item.checked === 'object' ? item.checked : {},
        };
      }
    }
    return valid;
  } catch {
    return {};
  }
}
function initialEntries(week: string, pool: Recipe[], shift = 0, servings = 2): LocalEntry[] {
  return rows.flatMap((row, rowIndex) =>
    weekdays.map((_, day) => ({
      id: crypto.randomUUID(),
      date: addDays(week, day),
      mealType: row.type,
      servings,
      recipeId: pool[(day + rowIndex * 3 + shift) % pool.length].id,
    })),
  );
}
async function allRecipes() {
  const first = await request<Recipe[]>('/recipes?pageSize=50');
  const pagination = first.meta.pagination as { totalPages?: number } | undefined;
  const remaining = await Promise.all(
    Array.from({ length: Math.max(0, (pagination?.totalPages || 1) - 1) }, (_, index) =>
      request<Recipe[]>(`/recipes?pageSize=50&page=${index + 2}`),
    ),
  );
  return [...first.data, ...remaining.flatMap((page) => page.data)];
}
function MealImage({ recipe }: { recipe: Recipe }) {
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
export function Planner() {
  const [parameters] = useSearchParams();
  const incomingBudget = Number(parameters.get('budget'));
  const incomingServings = Number(parameters.get('servings'));
  const preferredServings =
    Number.isInteger(incomingServings) && incomingServings >= 1 && incomingServings <= 20
      ? incomingServings
      : 2;
  const user = useUser(),
    notice = useNotice(),
    qc = useQueryClient();
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
  const currentWeek = weekOf(today);
  const [week, setWeek] = useState(currentWeek);
  const [localWeeks, setLocalWeeks] = useState(readLocalWeeks);
  const [slot, setSlot] = useState<{ date: string; type: MealType; entryId?: string } | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [selectedServings, setSelectedServings] = useState(preferredServings);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [budget, setBudget] = useState(
    Number.isFinite(incomingBudget) && incomingBudget > 0 && incomingBudget <= 700000000
      ? incomingBudget
      : 300000,
  );
  const recipes = useQuery({ queryKey: ['recipes', 'weekly-reference'], queryFn: allRecipes });
  const recipeList = recipes.data || [];
  const recipeMap = useMemo(() => new Map(recipeList.map((recipe) => [recipe.id, recipe])), [recipeList]);
  const planKey = ['weekly-reference', user?.id, week];
  const plan = useQuery({
    queryKey: planKey,
    queryFn: () => request<MealPlan | null>(`/meal-plans?week=${week}`),
    enabled: !!user,
  });
  const planData = plan.data?.data;
  const shoppingKey = ['shopping', user?.id, planData?.id];
  const shopping = useQuery({
    queryKey: shoppingKey,
    queryFn: () => request<ShoppingList | null>(`/meal-plans/${planData!.id}/shopping`),
    enabled: !!user && !!planData,
  });
  useEffect(() => {
    if (!user && recipeList.length && !localWeeks[week])
      setLocalWeeks((previous) =>
        previous[week]
          ? previous
          : {
              ...previous,
              [week]: {
                entries: [],
                checked: {},
              },
            },
      );
  }, [user, week, recipeList.length, localWeeks, currentWeek]);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(localWeeks));
    } catch {
      /* The planner can still run in memory. */
    }
  }, [localWeeks]);
  const localWeek = localWeeks[week] || { entries: [], checked: {} };
  const guestEntries = localWeek.entries.flatMap((entry) => {
    const recipe = recipeMap.get(entry.recipeId);
    return recipe ? [{ ...entry, recipe }] : [];
  });
  const entries = user ? planData?.entries || [] : guestEntries;
  const derivedGroceries = useMemo(() => weeklyGroceries(entries), [entries]);
  const groceries: GroceryRow[] =
    user && shopping.data?.data
      ? shopping.data.data.items
      : derivedGroceries.map((row) => ({
          ...row,
          purchased: !!localWeek.checked[`${row.id}:${row.quantity}`],
        }));
  const checkedCount = groceries.filter((row) => row.purchased).length;
  const estimate = weeklyEstimate(derivedGroceries);
  const money = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  const setPlanCache = (value: Envelope<MealPlan>) => {
    qc.setQueryData(planKey, value);
    void qc.invalidateQueries({ queryKey: ['shopping', user?.id, value.data.id] });
  };
  const syncedDaysRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!recipeList.length) return;
    if (user && (plan.isPending || plan.isError)) return;
    const savedEatFitDays = loadEatFitDays();
    const daysInWeek = savedEatFitDays.filter(
      (d) => d.date >= week && d.date <= addDays(week, 6),
    );
    if (!daysInWeek.length) return;
    const mealTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER'];
    const unsyncedDays = daysInWeek.filter((d) => {
      const syncKey = `${d.date}:${d.meals.map((m) => m?.slug || '').join(',')}`;
      if (syncedDaysRef.current.has(syncKey)) return false;
      return [0, 1, 2].some((idx) => {
        const meal = d.meals[idx];
        if (!meal) return false;
        return !entries.some(
          (e) => e.date === d.date && e.mealType === mealTypes[idx],
        );
      });
    });
    if (!unsyncedDays.length) return;
    let isCancelled = false;
    void (async () => {
      for (const d of unsyncedDays) {
        if (isCancelled) break;
        const syncKey = `${d.date}:${d.meals.map((m) => m?.slug || '').join(',')}`;
        syncedDaysRef.current.add(syncKey);
        const updated = await syncEatFitDayToMealPlan(d.date, d.meals, recipeList, user);
        if (user && updated) {
          if (plan.data) setPlanCache({ ...plan.data, data: updated });
          else void qc.invalidateQueries({ queryKey: planKey });
        } else if (!user) {
          setLocalWeeks(readLocalWeeks());
        }
      }
      if (!isCancelled) {
        notice('Đã đồng bộ các món đã xếp lịch từ Eat Fit vào thực đơn tuần.');
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [recipeList.length, user, plan.isPending, plan.isError, week, entries]);
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(errorText(e));
      if (user) void plan.refetch();
    } finally {
      setBusy(false);
    }
  };
  const openSlot = (date: string, type: MealType, entry?: MealEntry) => {
    setSlot({ date, type, entryId: entry?.id });
    setSelectedRecipe(entry?.recipe.id || '');
    setSelectedServings(entry?.servings || 2);
    setRecipeSearch('');
    setError('');
  };
  const saveSlot = () =>
    run(async () => {
      if (!slot || !selectedRecipe) return;
      if (!user) {
        setLocalWeeks((previous) => {
          const existing = previous[week] || { entries: [], checked: {} };
          const next: LocalEntry = {
            id: slot.entryId || crypto.randomUUID(),
            date: slot.date,
            mealType: slot.type,
            servings: selectedServings,
            recipeId: selectedRecipe,
          };
          return {
            ...previous,
            [week]: {
              ...existing,
              entries: slot.entryId
                ? existing.entries.map((entry) => (entry.id === slot.entryId ? next : entry))
                : [...existing.entries, next],
            },
          };
        });
      } else {
        let current: MealPlan =
          planData ??
          (await request<MealPlan>('/meal-plans', { method: 'POST', body: { weekStart: week } })).data;
        const result = slot.entryId
          ? await request<MealPlan>(`/meal-plans/${current.id}/entries/${slot.entryId}`, {
              method: 'PATCH',
              body: { recipeId: selectedRecipe, servings: selectedServings, version: current.version },
            })
          : await request<MealPlan>(`/meal-plans/${current.id}/entries`, {
              method: 'POST',
              body: {
                date: slot.date,
                mealType: slot.type,
                recipeId: selectedRecipe,
                servings: selectedServings,
                version: current.version,
                clientKey: crypto.randomUUID(),
              },
            });
        setPlanCache(result);
      }
      setSlot(null);
      notice('Đã cập nhật món trong thực đơn.');
    });
  const removeSlot = () =>
    run(async () => {
      if (!slot?.entryId) return;
      if (!user)
        setLocalWeeks((previous) => ({
          ...previous,
          [week]: {
            ...previous[week],
            entries: previous[week].entries.filter((entry) => entry.id !== slot.entryId),
          },
        }));
      else if (planData)
        setPlanCache(
          await request<MealPlan>(`/meal-plans/${planData.id}/entries/${slot.entryId}`, {
            method: 'DELETE',
            body: { version: planData.version },
          }),
        );
      setSlot(null);
      notice('Đã bỏ món khỏi bữa ăn.');
    });
  const autoPlan = () =>
    run(async () => {
      const pool = recipeList;
      if (!pool.length) return;
      const proposals = initialEntries(
        week,
        pool,
        Math.floor(Math.random() * pool.length),
        preferredServings,
      );
      if (!user)
        setLocalWeeks((previous) => ({
          ...previous,
          [week]: { entries: proposals, checked: previous[week]?.checked || {} },
        }));
      else {
        let current: MealPlan =
          planData ??
          (await request<MealPlan>('/meal-plans', { method: 'POST', body: { weekStart: week } })).data;
        for (const proposal of proposals) {
          if (
            current.entries.some(
              (entry) => entry.date === proposal.date && entry.mealType === proposal.mealType,
            )
          )
            continue;
          const result: Envelope<MealPlan> = await request<MealPlan>(`/meal-plans/${current.id}/entries`, {
            method: 'POST',
            body: {
              date: proposal.date,
              mealType: proposal.mealType,
              recipeId: proposal.recipeId,
              servings: proposal.servings,
              version: current.version,
              clientKey: crypto.randomUUID(),
            },
          });
          current = result.data;
          qc.setQueryData(planKey, result);
        }
        void qc.invalidateQueries({ queryKey: ['shopping', user?.id, current.id] });
      }
      notice(user ? 'Đã xếp món vào các bữa còn trống.' : 'Đã tạo một gợi ý thực đơn mới cho tuần này.');
    });
  const generateShopping = async () => {
    if (!planData) return null;
    const result = await request<ShoppingList>(`/meal-plans/${planData.id}/shopping`, {
      method: 'POST',
      body: { version: planData.version },
    });
    qc.setQueryData(shoppingKey, result);
    return result.data;
  };
  const tick = (row: GroceryRow) =>
    run(async () => {
      if (!user) {
        const key = `${row.id}:${row.quantity}`;
        setLocalWeeks((previous) => {
          const existing = previous[week] || { entries: [], checked: {} };
          return {
            ...previous,
            [week]: { ...existing, checked: { ...existing.checked, [key]: !row.purchased } },
          };
        });
      } else {
        let list = shopping.data?.data;
        if (!list || list.stale) list = await generateShopping();
        if (!list) return;
        const item = list.items.find(
          (item) => item.ingredientId === row.ingredientId && item.unit === row.unit,
        );
        if (!item) return;
        const result = await request<ShoppingList>(`/shopping-items/${item.id}`, {
          method: 'PATCH',
          body: { purchased: !item.purchased, version: list.version },
        });
        qc.setQueryData(shoppingKey, result);
      }
    });
  const exportShopping = () =>
    run(async () => {
      let current = groceries;
      if (user && (!shopping.data?.data || shopping.data.data.stale)) {
        const list = await generateShopping();
        if (!list) return;
        current = list.items;
      }
      const cell = (value: string) => '"' + value.replace(/^[=+@-]/, "'$&").replaceAll('"', '""') + '"';
      const csv =
        '\uFEFF' +
        [
          ['Nguyên liệu', 'Định lượng', 'Tình trạng'],
          ...current.map((row) => [row.name, groceryAmount(row), row.purchased ? 'Đã có' : 'Cần mua']),
        ]
          .map((row) => row.map(cell).join(','))
          .join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `Cookora_di_cho_${week}.csv`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notice('Đã xuất danh sách đi chợ.');
    });
  const dateCaption = `${dayLabel(week)} – ${dayLabel(addDays(week, 6))}/${addDays(week, 6).slice(0, 4)}`;
  const currentEntry = entries.find((entry) => entry.id === slot?.entryId);
  const filteredRecipes = recipeList.filter((recipe) =>
    recipe.title.toLocaleLowerCase('vi').includes(recipeSearch.toLocaleLowerCase('vi')),
  );
  return (
    <main className="weekly-reference">
      <section className="weekly-hero">
        <div>
          <p className="weekly-eyebrow">— LÊN KẾ HOẠCH NHẸ NHÀNG</p>
          <div className="weekly-title">
            <h1>Thực đơn tuần</h1>
            <span aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
          <p>Bữa ăn được sắp xếp rõ ràng. Danh sách mua sắm tổng hợp tự động theo các món đã chọn.</p>
        </div>
        <img src="/images/planner-weekly-hero.webp" alt="Lịch thực đơn cùng rau củ và dầu ô liu" />
      </section>
      {error && !slot && (
        <p className="weekly-error" role="alert">
          {error}
        </p>
      )}
      {recipes.isError && (
        <div className="weekly-error" role="alert">
          {errorText(recipes.error)}
          <button type="button" onClick={() => void recipes.refetch()}>
            Thử lại
          </button>
        </div>
      )}
      <div className="weekly-layout">
        <section className="weekly-calendar weekly-surface" aria-labelledby="weekly-heading">
          <header className="weekly-calendar-head">
            <span className="weekly-heading-icon">
              <CalendarDays strokeWidth={1.7} />
            </span>
            <div>
              <h2 id="weekly-heading">
                {week === currentWeek ? 'Tuần này' : week > currentWeek ? 'Tuần tiếp theo' : 'Tuần trước'}
              </h2>
              <p>
                <CalendarDays size={19} />
                {dateCaption}
                <span>·</span>
                <Users size={17} />
                {entries.length
                  ? `${Math.min(...entries.map((entry) => entry.servings))}${new Set(entries.map((entry) => entry.servings)).size > 1 ? '–' + Math.max(...entries.map((entry) => entry.servings)) : ''}`
                  : 2}{' '}
                người ăn
              </p>
            </div>
            <nav className="weekly-navigation" aria-label="Chọn tuần">
              <button
                type="button"
                aria-label="Tuần trước"
                disabled={busy}
                onClick={() => {
                  setWeek(addDays(week, -7));
                  setError('');
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                aria-label="Tuần sau"
                disabled={busy}
                onClick={() => {
                  setWeek(addDays(week, 7));
                  setError('');
                }}
              >
                <ChevronRight size={20} />
              </button>
              <span>
                {dayLabel(week)} – {dayLabel(addDays(week, 6))}
              </span>
            </nav>
          </header>
          <div className="weekly-table-scroll">
            <table className="weekly-table">
              <thead>
                <tr>
                  <th aria-label="Bữa ăn" />
                  {weekdays.map((day, index) => (
                    <th scope="col" key={day}>
                      <span>{day}</span>
                      <small>{dayLabel(addDays(week, index))}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ type, label, Icon }) => (
                  <tr key={type}>
                    <th scope="row">
                      <span className={`weekly-row-label weekly-row-${type.toLowerCase()}`}>
                        <Icon strokeWidth={1.6} />
                        <strong>{label}</strong>
                      </span>
                    </th>
                    {weekdays.map((_, index) => {
                      const date = addDays(week, index);
                      const meals = entries.filter((entry) => entry.date === date && entry.mealType === type);
                      const meal = meals[0];
                      return (
                        <td key={date}>
                          <button
                            type="button"
                            className={`weekly-meal${!meal ? ' is-empty' : ''}`}
                            onClick={() => openSlot(date, type, meal)}
                            disabled={busy || recipes.isPending || (!!user && plan.isPending)}
                            aria-label={`${label}, ${dayLabel(date)}${meal ? ': ' + meal.recipe.title : ': Thêm món'}`}
                          >
                            {meal ? (
                              <>
                                <MealImage recipe={meal.recipe} />
                                <span className="weekly-meal-title">{shortTitle(meal.recipe.title)}</span>
                                {meals.length > 1 && <small>+{meals.length - 1} món khác</small>}
                              </>
                            ) : (
                              <>
                                <span className="weekly-empty-thumb">
                                  {recipes.isPending || (!!user && plan.isPending) ? (
                                    <LoaderCircle className="spin" size={21} />
                                  ) : (
                                    <Plus size={23} />
                                  )}
                                </span>
                                <span>Thêm món</span>
                              </>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="weekly-calendar-footer">
            <span className="weekly-footer-icon">
              <Utensils size={29} strokeWidth={1.7} />
            </span>
            <div>
              <strong>
                {new Set(entries.map((entry) => `${entry.date}:${entry.mealType}`)).size} bữa ăn trong tuần
              </strong>
              <p>Nhấn một ô để thay món hoặc đổi khẩu phần.</p>
            </div>
            <button
              className="weekly-auto"
              type="button"
              disabled={busy || recipes.isPending || !recipeList.length}
              onClick={autoPlan}
            >
              {busy ? <LoaderCircle className="spin" size={21} /> : <Shuffle size={23} />}Tự động tạo thực đơn
              <ArrowRight size={20} />
            </button>
          </footer>
          <p className="weekly-save-status">
            {user ? (
              'Thực đơn được lưu vào tài khoản của bạn.'
            ) : (
              <>
                Bản dùng thử · Lưu trên thiết bị này.{' '}
                <Link to="/dang-nhap" state={{ from: '/thuc-don' }}>
                  Đăng nhập để lưu vào tài khoản.
                </Link>
              </>
            )}
          </p>
          {plan.isError && (
            <p className="weekly-error" role="alert">
              {errorText(plan.error)}
              <button type="button" onClick={() => void plan.refetch()}>
                Tải lại thực đơn
              </button>
            </p>
          )}
        </section>
        <aside className="weekly-groceries weekly-surface" aria-labelledby="weekly-shopping-heading">
          <div className="weekly-shopping-head">
            <span>
              <ShoppingCart strokeWidth={1.7} />
            </span>
            <h2 id="weekly-shopping-heading">Danh sách đi chợ</h2>
            <b>
              {checkedCount} / {groceries.length} đã có
            </b>
          </div>
          <p className="weekly-shopping-description">Gộp nguyên liệu theo các bữa ăn, tránh mua trùng.</p>
          {shopping.data?.data?.stale && (
            <div className="weekly-stale" role="status">
              Thực đơn đã thay đổi.{' '}
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await generateShopping();
                  })
                }
              >
                Cập nhật danh sách
              </button>
            </div>
          )}
          <div className="weekly-grocery-list">
            {groceries.length ? (
              groceries.map((row) => (
                <label className={`weekly-grocery-row${row.purchased ? ' is-checked' : ''}`} key={row.id}>
                  <span className="weekly-checkbox">
                    <input
                      type="checkbox"
                      checked={row.purchased}
                      disabled={busy || !!shopping.data?.data?.stale}
                      onChange={() => void tick(row)}
                      aria-label={`Đã có ${row.name}`}
                    />
                    {row.purchased && <Check size={17} strokeWidth={2.5} />}
                  </span>
                  <strong>{row.name}</strong>
                  <span>{groceryAmount(row)}</span>
                </label>
              ))
            ) : (
              <div className="weekly-shopping-empty">
                <ShoppingCart size={37} />
                <p>Chọn món vào thực đơn để tự động tổng hợp nguyên liệu.</p>
              </div>
            )}
          </div>
          <section className="weekly-budget" aria-label="Ngân sách dự kiến">
            <div>
              <Coins size={25} />
              <strong>Ngân sách dự kiến</strong>
              <b>{estimate.known ? '~ ' + money(estimate.total) : 'Chưa có giá'}</b>
            </div>
            <div className="weekly-budget-track">
              <span style={{ width: `${budget ? Math.min(100, (estimate.total / budget) * 100) : 0}%` }} />
            </div>
            <label>
              Ngân sách tuần
              <input
                type="number"
                aria-label="Ngân sách tuần"
                min={0}
                max={100000000}
                step={50000}
                value={budget}
                onChange={(event) => setBudget(Math.max(0, Number(event.target.value)))}
              />
              <span>đ</span>
            </label>
            <p>
              Giá minh họa cho {estimate.known}/{derivedGroceries.length} nguyên liệu.{' '}
              {estimate.missing ? 'Một số nguyên liệu chưa có giá.' : 'Có thể cập nhật theo nơi mua.'}
            </p>
          </section>
          <button
            className="weekly-export"
            type="button"
            disabled={busy || !groceries.length}
            onClick={exportShopping}
          >
            {busy ? <LoaderCircle className="spin" size={22} /> : <ShoppingCart size={25} />}Xuất danh sách
            mua sắm
            <ArrowRight size={21} />
          </button>
        </aside>
      </div>
      <Leaf className="weekly-leaf weekly-leaf-left" aria-hidden="true" />
      <Leaf className="weekly-leaf weekly-leaf-right" aria-hidden="true" />
      {slot && (
        <Modal
          title={`${rows.find((row) => row.type === slot.type)?.label} · ${dayLabel(slot.date)}`}
          onClose={() => {
            if (!busy) setSlot(null);
          }}
        >
          <div className="weekly-slot-editor">
            {currentEntry && (
              <div className="weekly-current-dish">
                <MealImage recipe={currentEntry.recipe} />
                <div>
                  <strong>{currentEntry.recipe.title}</strong>
                  <Link to={`/cong-thuc/${currentEntry.recipe.slug}`}>
                    Xem công thức <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}
            {entries.filter((entry) => entry.date === slot.date && entry.mealType === slot.type).length >
              1 && (
              <label className="weekly-slot-label">
                Món cần chỉnh
                <select
                  value={slot.entryId || ''}
                  onChange={(event) => {
                    const entry = entries.find((entry) => entry.id === event.target.value);
                    if (entry) openSlot(slot.date, slot.type, entry);
                  }}
                >
                  {entries
                    .filter((entry) => entry.date === slot.date && entry.mealType === slot.type)
                    .map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.recipe.title}
                      </option>
                    ))}
                </select>
              </label>
            )}
            <label className="weekly-recipe-search">
              <Search size={18} />
              <input
                aria-label="Tìm món cho thực đơn"
                value={recipeSearch}
                onChange={(event) => setRecipeSearch(event.target.value)}
                placeholder="Tìm tên món ăn..."
                disabled={busy}
              />
            </label>
            <div className="weekly-recipe-options">
              {filteredRecipes.map((recipe) => (
                <button
                  type="button"
                  key={recipe.id}
                  aria-pressed={selectedRecipe === recipe.id}
                  disabled={busy}
                  onClick={() => setSelectedRecipe(recipe.id)}
                >
                  <MealImage recipe={recipe} />
                  <span>{shortTitle(recipe.title)}</span>
                  {selectedRecipe === recipe.id && <Check size={18} />}
                </button>
              ))}
              {!filteredRecipes.length && <p>Chưa tìm thấy món. Hãy thử tên khác.</p>}
            </div>
            <label className="weekly-slot-label">
              Khẩu phần
              <select
                aria-label="Khẩu phần"
                value={selectedServings}
                onChange={(event) => setSelectedServings(Number(event.target.value))}
                disabled={busy}
              >
                {Array.from({ length: 20 }, (_, index) => (
                  <option key={index} value={index + 1}>
                    {index + 1} người ăn
                  </option>
                ))}
              </select>
            </label>
            {error && (
              <p className="weekly-error" role="alert">
                {error}
              </p>
            )}
            <div className="weekly-slot-actions">
              {slot.entryId && (
                <button type="button" className="weekly-remove" onClick={removeSlot} disabled={busy}>
                  <Trash2 size={16} />
                  Bỏ món
                </button>
              )}
              <button
                type="button"
                className="weekly-export"
                onClick={saveSlot}
                disabled={busy || !selectedRecipe}
              >
                {busy ? <LoaderCircle size={18} className="spin" /> : <Check size={18} />}Lưu bữa ăn
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
