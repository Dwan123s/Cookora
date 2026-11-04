import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Leaf,
  LoaderCircle,
  Moon,
  Search,
  ShoppingCart,
  Shuffle,
  Soup,
  Sun,
  Trash2,
  Users,
  Utensils,
  Undo2,
} from 'lucide-react';
import type { Envelope, MealEntry, MealPlan, Recipe, ShoppingList } from '@cookora/contracts';
import { request } from '../api';
import { addDays, weekOf } from '../date';
import { errorText, Modal, useNotice, useUser } from '../shared';
import { resolveCategory } from '../recipe-catalog';
import { MealImage, shortMealTitle as shortTitle, WeeklyDayPlanner } from '../components/WeeklyDayPlanner';
import {
  fillEmptyMealSlots,
  guestWeekStorageKey as storageKey,
  mealSlotEntries,
  readGuestWeeks,
  saveLocalDishes,
  validPlanDate,
  type LocalEntry,
} from '../meal-plan-slots';
import { loadEatFitDays } from '../eatfit-storage';
import { groceryAmount, syncEatFitDayToMealPlan, weeklyGroceries, type GroceryRow } from '../weekly-plan';
import { WeeklyBudgetCard } from '../components/WeeklyBudgetCard';
import '../planner-reference.css';
import '../weekly-day-planner.css';

type MealType = MealEntry['mealType'];
const dayLabel = (value: string) => `${value.slice(8, 10)}/${value.slice(5, 7)}`;
const rows: { type: MealType; label: string; Icon: typeof Sun }[] = [
  { type: 'BREAKFAST', label: 'Bữa sáng', Icon: Sun },
  { type: 'LUNCH', label: 'Bữa trưa', Icon: Soup },
  { type: 'DINNER', label: 'Bữa tối', Icon: Moon },
];
const weekdays = ['THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7', 'CN'];
const readLocalWeeks = () => readGuestWeeks(localStorage);
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
export function Planner() {
  const [parameters, setParameters] = useSearchParams();
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
  const selectedDate = validPlanDate(parameters.get('day')) ? parameters.get('day')! : today;
  const week = weekOf(selectedDate);
  const selectDate = (date: string) => {
    setParameters(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set('day', date);
        return next;
      },
      { replace: true },
    );
    setError('');
  };
  const [localWeeks, setLocalWeeks] = useState(readLocalWeeks);
  const [slot, setSlot] = useState<{ date: string; type: MealType; entryId?: string } | null>(null);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [selectedServings, setSelectedServings] = useState(preferredServings);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [recipeFilter, setRecipeFilter] = useState('all');
  const [removedDish, setRemovedDish] = useState<{ entry: MealEntry; week: string; key: string } | null>(
    null,
  );
  const pendingKeys = useRef(new Map<string, string>());
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [budget, setBudget] = useState(
    Number.isFinite(incomingBudget) && incomingBudget > 0 && incomingBudget <= 100000000
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
          purchased: !user && !!localWeek.checked[`${row.id}:${row.quantity}`],
        }));
  const checkedCount = groceries.filter((row) => row.purchased).length;
  const setPlanCache = (value: Envelope<MealPlan>) => {
    qc.setQueryData(planKey, value);
    void qc.invalidateQueries({ queryKey: ['shopping', user?.id, value.data.id] });
  };
  const syncedDaysRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!recipeList.length) return;
    if (user && (plan.isPending || plan.isError)) return;
    const savedEatFitDays = loadEatFitDays();
    const daysInWeek = savedEatFitDays.filter((d) => d.date >= week && d.date <= addDays(week, 6));
    if (!daysInWeek.length) return;
    const mealTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER'];
    const unsyncedDays = daysInWeek.filter((d) => {
      const syncKey = `${d.date}:${d.meals.map((m) => m?.slug || '').join(',')}`;
      if (syncedDaysRef.current.has(syncKey)) return false;
      return [0, 1, 2].some((idx) => {
        const meal = d.meals[idx];
        if (!meal) return false;
        return !mealSlotEntries(entries, d.date, mealTypes[idx]).some(
          (e) => e.recipe.slug === meal.slug || e.recipe.title === meal.title,
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
    pendingKeys.current.clear();
    setSlot({ date, type, entryId: entry?.id });
    setSelectedRecipes(entry ? [entry.recipe.id] : []);
    setSelectedServings(
      entry?.servings || mealSlotEntries(entries, date, type)[0]?.servings || preferredServings,
    );
    setRecipeSearch('');
    setRecipeFilter('all');
    setError('');
  };
  const saveSlot = () =>
    run(async () => {
      if (!slot || !selectedRecipes.length) return;
      if (!user) {
        setLocalWeeks((previous) => {
          const existing = previous[week] || { entries: [], checked: {} };
          const additions: LocalEntry[] = selectedRecipes.map((recipeId) => ({
            id: slot.entryId || crypto.randomUUID(),
            date: slot.date,
            mealType: slot.type,
            servings: selectedServings,
            recipeId,
          }));
          return {
            ...previous,
            [week]: {
              ...existing,
              entries: saveLocalDishes(existing.entries, additions, slot.entryId),
            },
          };
        });
      } else {
        let current: MealPlan =
          qc.getQueryData<Envelope<MealPlan>>(planKey)?.data ??
          planData ??
          (await request<MealPlan>('/meal-plans', { method: 'POST', body: { weekStart: week } })).data;
        for (const recipeId of selectedRecipes) {
          const mutationKey = JSON.stringify([recipeId, selectedServings]);
          const clientKey = pendingKeys.current.get(mutationKey) || crypto.randomUUID();
          pendingKeys.current.set(mutationKey, clientKey);
          const result = slot.entryId
            ? await request<MealPlan>(`/meal-plans/${current.id}/entries/${slot.entryId}`, {
                method: 'PATCH',
                body: { recipeId, servings: selectedServings, version: current.version },
              })
            : await request<MealPlan>(`/meal-plans/${current.id}/entries`, {
                method: 'POST',
                body: {
                  date: slot.date,
                  mealType: slot.type,
                  recipeId,
                  servings: selectedServings,
                  version: current.version,
                  clientKey,
                },
              });
          current = result.data;
          setPlanCache(result);
          // Retrying after a partial failure only saves dishes not saved yet.
          setSelectedRecipes((previous) => previous.filter((id) => id !== recipeId));
          pendingKeys.current.delete(mutationKey);
        }
      }
      setSlot(null);
      notice('Đã cập nhật món trong thực đơn.');
    });
  const removeEntry = (entry: MealEntry) =>
    run(async () => {
      if (!user)
        setLocalWeeks((previous) => ({
          ...previous,
          [week]: {
            ...previous[week],
            entries: previous[week].entries.filter((item) => item.id !== entry.id),
          },
        }));
      else {
        const current = qc.getQueryData<Envelope<MealPlan>>(planKey)?.data ?? planData;
        if (!current) return;
        setPlanCache(
          await request<MealPlan>(`/meal-plans/${current.id}/entries/${entry.id}`, {
            method: 'DELETE',
            body: { version: current.version },
          }),
        );
      }
      setRemovedDish({ entry, week, key: crypto.randomUUID() });
      setSlot(null);
    });
  const removeSlot = () => {
    const entry = entries.find((entry) => entry.id === slot?.entryId);
    if (entry) void removeEntry(entry);
  };
  const undoRemove = () =>
    run(async () => {
      if (!removedDish || removedDish.week !== week) return;
      const entry = removedDish.entry;
      if (
        !mealSlotEntries(entries, entry.date, entry.mealType).some(
          (item) => item.recipe.id === entry.recipe.id,
        )
      ) {
        if (!user)
          setLocalWeeks((previous) => ({
            ...previous,
            [week]: {
              ...previous[week],
              entries: [
                ...previous[week].entries,
                {
                  id: entry.id,
                  date: entry.date,
                  mealType: entry.mealType,
                  servings: entry.servings,
                  recipeId: entry.recipe.id,
                },
              ],
            },
          }));
        else {
          const current = qc.getQueryData<Envelope<MealPlan>>(planKey)?.data ?? planData;
          if (!current) return;
          setPlanCache(
            await request<MealPlan>(`/meal-plans/${current.id}/entries`, {
              method: 'POST',
              body: {
                date: entry.date,
                mealType: entry.mealType,
                recipeId: entry.recipe.id,
                servings: entry.servings,
                version: current.version,
                clientKey: removedDish.key,
              },
            }),
          );
        }
      }
      setRemovedDish(null);
      notice('Đã khôi phục món vào bữa ăn.');
    });
  const changeServings = (entry: MealEntry, servings: number) =>
    run(async () => {
      if (servings === entry.servings) return;
      if (!user)
        setLocalWeeks((previous) => ({
          ...previous,
          [week]: {
            ...previous[week],
            entries: previous[week].entries.map((item) =>
              item.id === entry.id ? { ...item, servings } : item,
            ),
          },
        }));
      else {
        const current = qc.getQueryData<Envelope<MealPlan>>(planKey)?.data ?? planData;
        if (!current) return;
        setPlanCache(
          await request<MealPlan>(`/meal-plans/${current.id}/entries/${entry.id}`, {
            method: 'PATCH',
            body: { recipeId: entry.recipe.id, servings, version: current.version },
          }),
        );
      }
      notice('Đã cập nhật số người ăn cho món.');
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
          [week]: {
            entries: fillEmptyMealSlots(previous[week]?.entries || [], proposals),
            checked: previous[week]?.checked || {},
          },
        }));
      else {
        let current: MealPlan =
          qc.getQueryData<Envelope<MealPlan>>(planKey)?.data ??
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
      notice('Đã xếp món vào các bữa còn trống. Các món đã chọn được giữ nguyên.');
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
  const slotMeals = slot ? mealSlotEntries(entries, slot.date, slot.type) : [];
  const filteredRecipes = recipeList.filter((recipe) => {
    const category = resolveCategory(recipe.title, recipe.category);
    return (
      recipe.title.toLocaleLowerCase('vi').includes(recipeSearch.toLocaleLowerCase('vi')) &&
      (recipeFilter === 'all' ||
        (recipeFilter === 'soup' ? /canh|súp/i.test(category) : category === 'Rau củ'))
    );
  });
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
                  selectDate(addDays(selectedDate, -7));
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
                  selectDate(addDays(selectedDate, 7));
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
          {removedDish?.week === week && (
            <div className="weekly-undo" role="status">
              <span>Đã bỏ {shortTitle(removedDish.entry.recipe.title)} khỏi bữa.</span>
              <button type="button" onClick={undoRemove} disabled={busy}>
                <Undo2 size={16} />
                Hoàn tác
              </button>
            </div>
          )}
          <WeeklyDayPlanner
            entries={entries}
            week={week}
            selectedDate={selectedDate}
            today={today}
            disabled={busy || recipes.isPending || (!!user && (plan.isPending || plan.isError))}
            loading={recipes.isPending || (!!user && plan.isPending)}
            onSelectDate={selectDate}
            onAdd={openSlot}
            onEdit={(entry) => openSlot(entry.date, entry.mealType, entry)}
            onRemove={removeEntry}
            onServingsChange={changeServings}
          />
          <footer className="weekly-calendar-footer">
            <span className="weekly-footer-icon">
              <Utensils size={29} strokeWidth={1.7} />
            </span>
            <div>
              <strong>
                {new Set(entries.map((entry) => `${entry.date}:${entry.mealType}`)).size} bữa ăn trong tuần
              </strong>
              <p>{entries.length} món · Chọn ngày để sắp xếp từng bữa.</p>
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
          <WeeklyBudgetCard
            entries={entries}
            week={week}
            userId={user?.id}
            budget={budget}
            onBudgetChange={setBudget}
            disabled={
              busy || recipes.isPending || recipes.isError || (!!user && (plan.isPending || plan.isError))
            }
          />
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
          className="weekly-picker"
          title={`${slot.entryId ? 'Chỉnh món' : 'Thêm món'} · ${rows.find((row) => row.type === slot.type)?.label} · ${dayLabel(slot.date)}`}
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
            {slot.entryId && (
              <button
                type="button"
                className="weekly-day-add"
                disabled={busy}
                onClick={() => openSlot(slot.date, slot.type)}
              >
                + Thêm món khác vào bữa
              </button>
            )}
            <p className="weekly-slot-hint">
              {slot.entryId
                ? 'Chỉnh riêng món này. Các món còn lại được giữ nguyên.'
                : 'Chọn một hoặc nhiều món để thêm vào bữa: món chính, canh, rau…'}
            </p>
            <div className="weekly-recipe-filters" aria-label="Lọc món ăn">
              {[
                ['all', 'Tất cả'],
                ['soup', 'Canh & súp'],
                ['vegetables', 'Rau củ'],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  disabled={busy}
                  aria-pressed={recipeFilter === value}
                  onClick={() => setRecipeFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
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
            {!slot.entryId && selectedRecipes.length > 0 && (
              <div className="weekly-selected-dishes" aria-label="Món đã chọn để thêm">
                <strong>Đã chọn {selectedRecipes.length} món</strong>
                {selectedRecipes.map((id) => (
                  <button
                    type="button"
                    key={id}
                    disabled={busy}
                    onClick={() => setSelectedRecipes((previous) => previous.filter((value) => value !== id))}
                    aria-label={`Bỏ chọn ${recipeMap.get(id)?.title}`}
                  >
                    {shortTitle(recipeMap.get(id)?.title || '')} ×
                  </button>
                ))}
              </div>
            )}
            <div className="weekly-recipe-options">
              {filteredRecipes.map((recipe) => (
                <button
                  type="button"
                  key={recipe.id}
                  aria-pressed={selectedRecipes.includes(recipe.id)}
                  disabled={
                    busy ||
                    slotMeals.some((entry) => entry.id !== slot.entryId && entry.recipe.id === recipe.id)
                  }
                  onClick={() =>
                    setSelectedRecipes((previous) =>
                      slot.entryId
                        ? [recipe.id]
                        : previous.includes(recipe.id)
                          ? previous.filter((id) => id !== recipe.id)
                          : [...previous, recipe.id],
                    )
                  }
                >
                  <MealImage recipe={recipe} />
                  <span>{shortTitle(recipe.title)}</span>
                  {slotMeals.some((entry) => entry.id !== slot.entryId && entry.recipe.id === recipe.id) && (
                    <small>Đã có</small>
                  )}
                  {selectedRecipes.includes(recipe.id) && <Check size={18} />}
                </button>
              ))}
              {!filteredRecipes.length && <p>Chưa tìm thấy món. Hãy thử tên khác.</p>}
            </div>
            <label className="weekly-slot-label">
              {slot.entryId ? 'Khẩu phần' : 'Khẩu phần mỗi món'}
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
                disabled={busy || !selectedRecipes.length}
              >
                {busy ? <LoaderCircle size={18} className="spin" /> : <Check size={18} />}
                {slot.entryId ? 'Lưu thay đổi' : 'Thêm ' + (selectedRecipes.length || '') + ' món vào bữa'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
