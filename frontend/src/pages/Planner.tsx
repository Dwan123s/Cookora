import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, LoaderCircle, Plus, ShoppingBasket, Trash2, X } from 'lucide-react';
import type { MealPlan, Recipe } from '@cookora/contracts';
import { request } from '../api';
import { addDays, dateKey, dayLabel, weekOf } from '../date';
import { recipeMedia } from '../recipe-media';
import {
  cuisineFor,
  useNotice,
  useUser,
  errorText,
  Loading,
  ErrorState,
  Modal,
  PageHead,
  Portions,
  RequireLogin,
} from '../shared';

export function Planner() {
  const user = useUser(),
    [params, setParams] = useSearchParams(),
    [chooserDate, setChooserDate] = useState<string | null>(null),
    [selected, setSelected] = useState<Recipe | null>(null),
    qc = useQueryClient(),
    notice = useNotice();
  const requestedWeek = params.get('week') || '';
  const validWeek = /^\d{4}-\d{2}-\d{2}$/.test(requestedWeek) && !Number.isNaN(Date.parse(requestedWeek));
  const week = weekOf(validWeek ? requestedWeek : undefined);
  const plan = useQuery({
    queryKey: ['plan', user?.id, week],
    queryFn: () => request<MealPlan | null>(`/meal-plans?week=${week}`),
    enabled: !!user,
  });
  const recipes = useQuery({
    queryKey: ['recipes', 'chooser'],
    queryFn: () => request<Recipe[]>('/recipes?pageSize=50'),
    enabled: !!chooserDate,
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      request(`/meal-plans/${plan.data!.data!.id}/entries/${id}`, {
        method: 'DELETE',
        body: { version: plan.data!.data!.version },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plan'] });
      notice('Đã xóa món khỏi thực đơn.');
    },
    onError: (e) => {
      qc.invalidateQueries({ queryKey: ['plan'] });
      notice(errorText(e));
    },
  });
  if (!user) return <RequireLogin title="Một tuần ăn ngon, bắt đầu từ đây" />;
  const entries = plan.data?.data?.entries || [];
  return (
    <main className="container">
      <PageHead
        eyebrow="SẮP XẾP BỮA ĂN, NHẸ ĐẦU CẢ TUẦN"
        title="Thực đơn của bạn"
        description="Chọn món cho từng ngày. Danh sách đi chợ sẽ tổng hợp nguyên liệu theo số phần đã chọn."
        action={
          plan.data?.data && (
            <Link to={`/di-cho/${plan.data.data.id}`} className="btn">
              <ShoppingBasket size={17} />
              Danh sách đi chợ
            </Link>
          )
        }
      />
      <div className="planner-toolbar">
        <div className="week-switch">
          <button
            className="icon-btn"
            aria-label="Tuần trước"
            onClick={() => setParams({ week: addDays(week, -7) })}
          >
            <ChevronLeft size={19} />
          </button>
          <strong>
            {dayLabel(week)} — {dayLabel(addDays(week, 6))}
          </strong>
          <button
            className="icon-btn"
            aria-label="Tuần sau"
            onClick={() => setParams({ week: addDays(week, 7) })}
          >
            <ChevronRight size={19} />
          </button>
        </div>
        <button className="btn secondary small" onClick={() => setParams({})}>
          Tuần này
        </button>
        <span className="muted tiny">{entries.length} món đã lên kế hoạch</span>
      </div>
      <p className="data-notice">
        Thực đơn dự kiến chưa phải nhật ký đã ăn. Danh sách mua sắm hiện chưa trừ kho, tính giá hoặc quản lý
        thời hạn bảo quản.
      </p>
      {plan.isPending ? (
        <Loading />
      ) : plan.isError ? (
        <ErrorState error={plan.error} retry={() => plan.refetch()} />
      ) : (
        <div className="week-grid">
          {Array.from({ length: 7 }, (_, i) => {
            const date = addDays(week, i),
              dayEntries = entries.filter((e) => e.date === date);
            return (
              <section className={`day-column ${date === dateKey(new Date()) ? 'today' : ''}`} key={date}>
                <div className="day-header">
                  <strong>{i === 6 ? 'Chủ nhật' : `Thứ ${i + 2}`}</strong>
                  <span>{dayLabel(date)}</span>
                  {date === dateKey(new Date()) && <small>Hôm nay</small>}
                </div>
                <div className="day-content">
                  {dayEntries.map((e) => (
                    <article className="meal-card" key={e.id}>
                      <img src={recipeMedia(e.recipe).src} alt="Ảnh minh họa" loading="lazy" />
                      <small>
                        {{ BREAKFAST: 'Bữa sáng', LUNCH: 'Bữa trưa', DINNER: 'Bữa tối' }[e.mealType]}
                      </small>
                      <Link to={`/cong-thuc/${e.recipe.slug}`}>{e.recipe.title}</Link>
                      <div>
                        <span>{e.servings} phần</span>
                        <button
                          aria-label={`Xóa ${e.recipe.title}`}
                          className="icon-btn"
                          disabled={remove.isPending}
                          onClick={() => remove.mutate(e.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
                  <button className="add-meal" onClick={() => setChooserDate(date)}>
                    <Plus size={18} />
                    <span>Thêm món</span>
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}
      {chooserDate && !selected && (
        <Modal title={`Chọn món cho ${dayLabel(chooserDate)}`} onClose={() => setChooserDate(null)}>
          <div className="chooser modal-content">
            {recipes.isPending ? (
              <Loading />
            ) : recipes.isError ? (
              <ErrorState error={recipes.error} />
            ) : (
              recipes.data?.data.map((r) => (
                <button key={r.id} onClick={() => setSelected(r)}>
                  <img src={recipeMedia(r).src} alt="Ảnh minh họa" loading="lazy" />
                  <span>
                    <strong>{r.title}</strong>
                    <small>{cuisineFor(r.cuisine).name} · bản thảo</small>
                  </span>
                  <Plus size={18} />
                </button>
              ))
            )}
          </div>
        </Modal>
      )}
      {selected && (
        <PlannerAdd
          recipe={selected}
          date={chooserDate!}
          close={() => {
            setSelected(null);
            setChooserDate(null);
          }}
        />
      )}
    </main>
  );
}

export function PlannerAdd({ recipe, date, close }: { recipe: Recipe; date: string; close: () => void }) {
  return <DateAddBridge recipe={recipe} initialDate={date} close={close} />;
}

export function DateAddBridge({
  recipe,
  initialDate,
  close,
}: {
  recipe: Recipe;
  initialDate: string;
  close: () => void;
}) {
  const [servings, setServings] = useState(recipe.baseServings),
    [meal, setMeal] = useState('DINNER'),
    notice = useNotice(),
    qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const plan = await request<MealPlan>('/meal-plans', {
        method: 'POST',
        body: { weekStart: weekOf(initialDate) },
      });
      return request(`/meal-plans/${plan.data.id}/entries`, {
        method: 'POST',
        body: {
          date: initialDate,
          recipeId: recipe.id,
          servings,
          mealType: meal,
          version: plan.data.version,
          clientKey: crypto.randomUUID(),
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plan'] });
      notice('Đã thêm món vào thực đơn.');
      close();
    },
  });
  return (
    <Modal title={`Thêm món · ${dayLabel(initialDate)}`} onClose={close}>
      <div className="stack modal-content">
        <h3>{recipe.title}</h3>
        <label>
          Bữa ăn
          <select value={meal} onChange={(e) => setMeal(e.target.value)}>
            <option value="BREAKFAST">Bữa sáng</option>
            <option value="LUNCH">Bữa trưa</option>
            <option value="DINNER">Bữa tối</option>
          </select>
        </label>
        <div className="inline-label">
          Số phần
          <Portions value={servings} onChange={setServings} />
        </div>
        {mutation.isError && (
          <p className="form-error" role="alert">
            {errorText(mutation.error)}
          </p>
        )}
        <button className="btn" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          {mutation.isPending ? <LoaderCircle className="spin" size={16} /> : <Plus size={16} />}Thêm vào bữa
          ăn
        </button>
      </div>
    </Modal>
  );
}
