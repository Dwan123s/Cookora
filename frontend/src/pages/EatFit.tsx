import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Apple,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  Clock3,
  Droplet,
  Dumbbell,
  GlassWater,
  Heart,
  Layers3,
  Leaf,
  Lightbulb,
  Moon,
  Scale,
  Sun,
  TrendingDown,
  Users,
  Utensils,
  Wheat,
  X,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { loadRecipeCatalog } from '../recipe-catalog';
import { RECIPE_PLACEHOLDER } from '../recipe-media';
import { ErrorState, Loading, useUser } from '../shared';
import { syncEatFitDayToMealPlan } from '../weekly-plan';
import { calculateNutrition, mealBudgets, type Goal } from '../eatfit-calculations';
import { suggestEatFitRecipes } from '../eatfit-suggestions';
import { eatFitCookingGuide } from '../eatfit-cooking-guide';
import {
  loadEatFitDraft, loadEatFitDays, saveEatFitDraft, saveEatFitDays,
  localDateKey, validPlanDate, formatPlanDate, planWeek,
  type EatFitMeal, type EatFitProposal, type EatFitDay,
} from '../eatfit-storage';
import '../eatfit-reference.css';
const fmt = (n: number) => n.toLocaleString('vi-VN');
const goals = [
  { value: 'lose', title: 'Giảm mỡ', icon: TrendingDown },
  { value: 'maintain', title: 'Giữ cân', icon: Scale },
  { value: 'gain', title: 'Tăng cơ', icon: Dumbbell },
] as const;
const names = ['Sáng', 'Trưa', 'Tối', 'Bữa phụ'];
const icons = [Sun, Sun, Moon, Apple];
export function EatFit() {
  const user = useUser();
  const qc = useQueryClient();
  const [initial] = useState(loadEatFitDraft);
  const catalog = useQuery({
    queryKey: ['recipes', 'catalog', 'sql-v1'],
    queryFn: () => loadRecipeCatalog(),
    staleTime: 30000,
  });
  const collection = (catalog.data || [])
    .filter((r) => r.sourceName === 'Menu món.docx')
    .sort((a, b) => a.slug.localeCompare(b.slug));
  const toMeal = (recipe: (typeof collection)[number], reason = '') => ({
      number: Number(recipe.slug.match(/^doc-menu-(\d+)/)?.[1]),
      slug: recipe.slug,
      title: recipe.title,
      image: recipe.image || RECIPE_PLACEHOLDER,
      ingredients: recipe.ingredients.map((item) => item.note || item.name).join('; '),
      recipeContext: recipe.steps.map((step) => 'Bước ' + step.order + '. ' + step.instruction).join('\n\n'),
      reason,
    });
  const [gender, setGender] = useState<'female' | 'male'>(initial?.profile.gender || 'female');
  const [age, setAge] = useState(initial?.profile.age ?? '22'),
    [height, setHeight] = useState(initial?.profile.height ?? '160'),
    [weight, setWeight] = useState(initial?.profile.weight ?? '50');
  const [activity, setActivity] = useState(initial?.profile.activity ?? 1.375),
    [goal, setGoal] = useState<Goal>(initial?.profile.goal || 'lose');
  const [selected, setSelected] = useState<EatFitMeal | null>(null);
  const [proposal, setProposal] = useState<EatFitProposal | null>(initial?.proposal || null);
  const [savedDays, setSavedDays] = useState(loadEatFitDays);
  const [scheduleDate, setScheduleDate] = useState(initial?.scheduleDate || localDateKey());
  const [training, setTraining] = useState(initial?.training || false);
  const [mealSlot, setMealSlot] = useState(1);
  const [calendarNotice, setCalendarNotice] = useState('');
  const [calendarError, setCalendarError] = useState(false);
  const [draftError, setDraftError] = useState(false);
  const scrollToSuggestions = useRef(false);
  const suggestionsRef = useRef<HTMLElement>(null);
  useEffect(() => {
    try {
      saveEatFitDraft({ profile: { gender, age, height, weight, activity, goal }, proposal, scheduleDate, training });
      setDraftError(false);
    } catch { setDraftError(true); }
  }, [gender, age, height, weight, activity, goal, proposal, scheduleDate, training]);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const v: unknown = JSON.parse(localStorage.getItem('cookora.eatfit.document-saved.v2') || '[]');
      return Array.isArray(v)
        ? v.filter((n): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 50)
        : [];
    } catch {
      return [];
    }
  });
  const [saveError, setSaveError] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
  }, [selected]);
  function save(id: number) {
    const next = favorites.includes(id) ? favorites.filter((n) => n !== id) : [...favorites, id];
    try {
      localStorage.setItem('cookora.eatfit.document-saved.v2', JSON.stringify(next));
      setFavorites(next);
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }
  const result = calculateNutrition({
    gender,
    age: Number(age),
    height: Number(height),
    weight: Number(weight),
    activity,
    goal,
  });
  const budgets = result ? mealBudgets(result.target) : [];
  const grams = result ? [result.protein, result.carbs, result.fat] : [];
  const signature = JSON.stringify([gender, age, height, weight, activity, goal]);
  const needsRefresh = Boolean(proposal && proposal.signature !== signature);
  const meals = proposal?.meals || collection.slice(0, 6).map((recipe) => toMeal(recipe));
  const planBudgets = proposal ? mealBudgets(proposal.target) : [];
  const goalTitle = goals.find((item) => item.value === (proposal?.goal || goal))!.title;
  const currentRecipe = selected ? collection.find((recipe) => recipe.slug === selected.slug) : undefined;
  const openedMeal = selected && currentRecipe ? toMeal(currentRecipe, selected.reason) : selected;
  const cookingGuide = openedMeal ? eatFitCookingGuide(openedMeal.title, openedMeal.recipeContext) : null;
  const selectedDay = savedDays.find((day) => day.date === scheduleDate);
  const weekDates = planWeek(validPlanDate(scheduleDate) ? scheduleDate : localDateKey());
  function selectScheduleDate(value: string) {
    setScheduleDate(value);
    setTraining(savedDays.find((day) => day.date === value)?.training || false);
    setCalendarNotice('');
    setCalendarError(false);
  }
  function commitDays(next: EatFitDay[], notice: string) {
    try {
      const sorted = [...next].sort((a, b) => a.date.localeCompare(b.date));
      saveEatFitDays(sorted);
      setSavedDays(sorted);
      setCalendarError(false);
      setCalendarNotice(notice);
    } catch {
      setCalendarError(true);
      setCalendarNotice('Không lưu được lịch trên trình duyệt này. Vui lòng kiểm tra quyền lưu trữ.');
    }
  }
  function saveToCalendar(wholeDay: boolean) {
    if (!validPlanDate(scheduleDate)) {
      setCalendarError(true);
      setCalendarNotice('Chọn một ngày hợp lệ để lưu món.');
      return;
    }
    if (wholeDay && (!proposal || needsRefresh)) return;
    if (!wholeDay && !selected) return;
    const dayMeals = selectedDay ? [...selectedDay.meals] : [null, null, null, null];
    if (wholeDay && proposal) {
      for (let index = 0; index < 3; index++) dayMeals[index] = proposal.meals[index] || null;
    } else if (selected) dayMeals[mealSlot] = selected;
    const day: EatFitDay = {
      date: scheduleDate,
      training,
      target: selectedDay?.target ?? proposal?.target ?? result?.target ?? null,
      goal: selectedDay?.goal ?? proposal?.goal ?? goal,
      meals: dayMeals,
    };
    if (wholeDay && proposal) { day.target = proposal.target; day.goal = proposal.goal; }
    commitDays([...savedDays.filter((item) => item.date !== scheduleDate), day],
      `Đã lưu ${wholeDay ? '3 bữa chính' : `${selected!.title} vào bữa ${names[mealSlot].toLowerCase()}`} cho ${formatPlanDate(scheduleDate)}${training ? ' · Ngày tập' : ''} và đã đồng bộ sang Thực đơn tuần.`);
    void syncEatFitDayToMealPlan(scheduleDate, dayMeals, catalog.data || [], user).then(() => {
      void qc.invalidateQueries({ queryKey: ['weekly-reference'] });
      void qc.invalidateQueries({ queryKey: ['shopping'] });
    });
  }
  function proposeMeals() {
    if (!result || catalog.isPending || catalog.isError || !collection.length) return;
    const previous = proposal?.goal === goal ? proposal : null;
    const round = previous ? previous.round + 1 : 0;
    const history = previous?.seenSlugs || [];
    const seenSlugs = collection.every((recipe) => history.includes(recipe.slug)) ? [] : history;
    const suggestions = suggestEatFitRecipes(collection, goal, {
      round,
      seenSlugs,
      previousSlugs: previous?.meals.map((meal) => meal.slug) || [],
    });
    scrollToSuggestions.current = true;
    setProposal({
      meals: suggestions.map(({ recipe, reason }) => toMeal(recipe, reason)),
      target: result.target,
      goal,
      signature,
      round,
      seenSlugs: [...new Set([...seenSlugs, ...suggestions.map(({ recipe }) => recipe.slug)])],
    });
  }
  useEffect(() => {
    if (!proposal || !scrollToSuggestions.current) return;
    scrollToSuggestions.current = false;
    suggestionsRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [proposal]);
  return (
    <main className="eatfit-reference">
      <section className="ef-hero">
        <div className="ef-hero-art" aria-hidden="true" />
        <div className="ef-hero-copy">
          <p className="ef-eyebrow">EAT FIT · DINH DƯỠNG CÁ NHÂN HÓA</p>
          <h1>
            Thực đơn theo mục tiêu thể trạng
          </h1>
          <p>
            Hiểu cơ thể, chọn món phù hợp. Bắt đầu hành trình ăn ngon và cân bằng
            <br className="ef-desktop-break" /> với nhu cầu năng lượng ước tính dành cho bạn.
          </p>
        </div>
      </section>
      <section className="ef-dashboard" aria-label="Tính mục tiêu dinh dưỡng">
        <form className="ef-body-card ef-card" onSubmit={(event) => { event.preventDefault(); proposeMeals(); }}>
          <h2>
            <Users />
            Thông số cơ thể & Mục tiêu
          </h2>
          <fieldset>
            <legend>Giới tính</legend>
            <div className="ef-choice ef-sex">
              {(['female', 'male'] as const).map((v) => (
                <button key={v} type="button" aria-pressed={gender === v} onClick={() => setGender(v)}>
                  {v === 'female' ? '👩 Nữ giới' : '👨 Nam giới'}
                  <Check size={14} aria-hidden="true" style={{ visibility: gender === v ? 'visible' : 'hidden' }} />
                </button>
              ))}
            </div>
          </fieldset>
          <div className="ef-fields">
            {[
              { label: 'Tuổi', value: age, set: setAge, min: 18, max: 80 },
              { label: 'Chiều cao (cm)', value: height, set: setHeight, min: 120, max: 220 },
              { label: 'Cân nặng (kg)', value: weight, set: setWeight, min: 35, max: 200 },
            ].map((f) => (
              <label key={f.label}>
                {f.label}
                <input
                  type="number"
                  min={f.min}
                  max={f.max}
                  step={f.label === 'Tuổi' ? 1 : 0.1}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                />
              </label>
            ))}
          </div>
          <label className="ef-activity">
            Mức độ vận động
            <select value={activity} onChange={(e) => setActivity(Number(e.target.value))}>
              <option value={1.2}>Ít vận động · Ngồi nhiều, ít tập luyện</option>
              <option value={1.375}>Vận động nhẹ · Tập 1–3 ngày/tuần</option>
              <option value={1.55}>Vận động vừa · Tập 3–5 ngày/tuần</option>
              <option value={1.725}>Vận động nhiều · Tập 6–7 ngày/tuần</option>
            </select>
          </label>
          <fieldset>
            <legend>Mục tiêu cân nặng</legend>
            <div className="ef-choice ef-goals">
              {goals.map(({ value, title, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={goal === value}
                  onClick={() => setGoal(value)}
                >
                  <Icon size={17} />
                  {title}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="ef-form-note">
            <Leaf size={12} />
            Ước tính cho người trưởng thành từ 18–80 tuổi.
          </p>
          <button
            type="submit"
            className="ef-suggest-button"
            disabled={!result || catalog.isPending || catalog.isError || !collection.length}
            aria-describedby="ef-submit-note"
          >

            {catalog.isPending ? 'Đang tải danh sách món…' : proposal && !needsRefresh ? 'Đề xuất món khác' : 'Đề xuất món theo mục tiêu'}
            <ArrowRight size={18} />
          </button>
          <p className="ef-submit-note" id="ef-submit-note" role="status">
            {catalog.isError ? 'Chưa tải được công thức. Vui lòng thử lại ở phần món ăn bên dưới.'
              : !result ? 'Nhập đủ thông số hợp lệ để đề xuất món.'
              : catalog.isPending ? 'Đang lấy công thức từ dữ liệu Cookora.'
              : !collection.length ? 'Chưa có công thức Eat Fit để đề xuất.'
              : needsRefresh ? 'Thông tin đã thay đổi. Bấm nút để cập nhật gợi ý.'
              : 'Bấm nút để chọn món và tạo gợi ý cho các bữa trong ngày.'}
          </p>
        </form>
        <div className="ef-nutrition" aria-live="polite">
          <div className="ef-result-top">
            <div className="ef-result-copy">
              <span className="ef-mini-label">

                Mục tiêu dinh dưỡng mỗi ngày
              </span>
              <h2>
                {result ? fmt(result.target) : '—'} <span>kcal / ngày</span>
              </h2>
              {result ? (
                <p>
                  BMR ước tính <strong>{fmt(result.bmr)} kcal</strong> · TDEE{' '}
                  <strong>{fmt(result.tdee)} kcal</strong>.<br />
                  {goal === 'maintain'
                    ? 'Mục tiêu bằng mức năng lượng duy trì ước tính.'
                    : `Mức điều chỉnh minh họa: ${goal === 'lose' ? '−' : '+'}400 kcal so với TDEE.`}
                </p>
              ) : (
                <p>Nhập đủ thông số hợp lệ: tuổi 18–80, chiều cao 120–220 cm, cân nặng 35–200 kg.</p>
              )}
            </div>
            <div className="ef-chart">
              <div className="ef-donut" role="img" aria-label="Protein 30%, carbs 40%, chất béo 30%">
                <div>
                  <strong>{result ? fmt(result.target) : '—'}</strong>
                  <span>kcal</span>
                </div>
              </div>
              <ul>
                <li>
                  <i />
                  Protein · 30%
                </li>
                <li>
                  <i />
                  Carbs · 40%
                </li>
                <li>
                  <i />
                  Chất béo · 30%
                </li>
              </ul>
            </div>
          </div>
          <div className="ef-macros">
            {[
              { title: 'Protein', icon: Dumbbell, percent: 30 },
              { title: 'Carbs', icon: Wheat, percent: 40 },
              { title: 'Chất béo', icon: Droplet, percent: 30 },
            ].map(({ title, icon: Icon, percent }, i) => (
              <div key={title}>
                <Icon />
                <div>
                  <span>{title}</span>
                  <strong>{result ? grams[i] : '—'} g</strong>
                  <small>{percent}% tổng năng lượng</small>
                </div>
              </div>
            ))}
          </div>
          <div className="ef-budget-strip">
            <strong>
              <Utensils size={17} />
              Phân bổ calo
            </strong>
            {names.map((title, i) => {
              const Icon = icons[i];
              return (
                <div key={title}>
                  <Icon size={20} />
                  <span>
                    {title}
                    <b>
                      {result ? fmt(budgets[i]) : '—'} kcal <small>({[25, 40, 25, 10][i]}%)</small>
                    </b>
                  </span>
                </div>
              );
            })}
          </div>
          <p className="ef-estimate-note">
            Kết quả tham khảo · Phân bổ macro minh họa, có thể điều chỉnh theo nhu cầu cá nhân.
          </p>
        </div>
      </section>
      <div className="ef-benefits">
        {[
          { icon: CalendarDays, title: 'Kế hoạch 7 ngày', text: 'Thực đơn đa dạng, không nhàm chán' },
          { icon: Layers3, title: 'Cân bằng macro', text: 'Đủ đạm · tinh bột · chất béo' },
          { icon: Clock3, title: 'Tiết kiệm thời gian', text: 'Gợi ý món, chủ động chuẩn bị' },
          { icon: ChartNoAxesCombined, title: 'Hiểu mục tiêu', text: 'Nhu cầu thay đổi theo thể trạng' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title}>
            <Icon />
            <span>
              <b>{title}</b>
              <small>{text}</small>
            </span>
          </div>
        ))}
      </div>
      <section className="ef-recipes" ref={suggestionsRef} aria-label="Món ăn Eat Fit">
        <div className="ef-section-heading">
          <div>
            <h2>Món ăn gợi ý cho mục tiêu của bạn</h2>
            <p aria-live="polite">
              {proposal
                ? `${goalTitle} · Mục tiêu ${fmt(proposal.target)} kcal/ngày · ${meals.length} món được phối hợp đa dạng loại món và nguồn đạm.`
                : 'Bộ sưu tập Eat Fit · Nhập thông tin và bấm “Đề xuất món theo mục tiêu” để chọn món.'}
            </p>
          </div>
          <Link to="/cong-thuc">
            Xem tất cả công thức <ArrowRight size={15} />
          </Link>
        </div>
        {needsRefresh && <p className="ef-refresh-note" role="status">Bạn đã đổi thông số. Các món và khung bữa ăn bên dưới vẫn theo lần đề xuất trước; bấm nút để cập nhật.</p>}
        <div className="ef-recipe-grid">
          {catalog.isPending && <Loading />}
          {catalog.isError && <ErrorState error={catalog.error} retry={() => void catalog.refetch()} />}
          {meals.map((m, i) => (
            <article className="ef-recipe" key={m.number}>
              <div className="ef-recipe-photo">
                <button
                  className="ef-photo-button"
                  onClick={() => setSelected(m)}
                  aria-label={`Xem công thức ${m.title}`}
                >
                  <img src={m.image} alt={m.title} loading="lazy" />
                </button>
                <span className="ef-recipe-tag">
                  <Leaf size={11} />
                  {proposal ? 'Gợi ý tham khảo' : ['Tươi ngon', 'Nhiều rau', 'Cân bằng', 'Đa dạng', 'Đủ vị', 'Ấm bụng'][i]}
                </span>
                <button
                  className="ef-heart"
                  aria-label={`${favorites.includes(m.number) ? 'Bỏ lưu' : 'Lưu'} ${m.title}`}
                  aria-pressed={favorites.includes(m.number)}
                  onClick={() => save(m.number)}
                >
                  <Heart size={16} fill={favorites.includes(m.number) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <button className="ef-recipe-title" onClick={() => setSelected(m)}>
                {m.title}
              </button>
              {m.reason && <p className="ef-recipe-reason">{m.reason}</p>}
              <div className="ef-recipe-meta">
                <Leaf size={12} />
                <span>Eat Fit</span>
                <button onClick={() => setSelected(m)}>
                  Xem cách làm <ArrowRight size={12} />
                </button>
              </div>
            </article>
          ))}
        </div>
        {!catalog.isPending && !catalog.isError && !collection.length && <p className="ef-refresh-note">Bộ sưu tập Eat Fit chưa có món. Bạn có thể xem các công thức khác qua liên kết phía trên.</p>}
        <p className="ef-catalog-note">
          Chọn từ bộ sưu tập Eat Fit theo nguyên liệu và mục tiêu, phối hợp nhiều loại món và nguồn đạm; ưu tiên món chưa xem trong phiên này.
          Chưa đối chiếu kcal hoặc macro thực tế của từng công thức.
          Khung calo từng bữa là mục tiêu tham khảo, không phải calo của món hiển thị. Món đã lưu được giữ trên thiết bị này.
          {saveError && (
            <span role="alert"> Không thể lưu trên thiết bị. Kiểm tra quyền lưu trữ của trình duyệt.</span>
          )}
        </p>
      </section>
      <section className="ef-day">
        <div className="ef-section-heading">
          <div>
            <h2>
              <CalendarDays size={21} />
              Lộ trình Eat Fit trong ngày
            </h2>
            <p>{proposal ? 'Lộ trình gần nhất được tự lưu · Chọn ngày bên dưới để xếp vào lịch ăn của bạn.' : 'Tạo gợi ý hoặc mở một món để thêm vào lịch ăn bên dưới.'}</p>
          </div>
          <span className="ef-total">Mục tiêu: {proposal ? fmt(proposal.target) : '—'} kcal</span>
        </div>
        <div className="ef-day-grid">
          {names.map((title, i) => {
            const Icon = icons[i];
            return (
              <button className="ef-day-meal" key={title} type="button" disabled={!proposal || i === 3 || !meals[i]} onClick={() => meals[i] && setSelected(meals[i])}>
                {i < 3 ? (
                  <img src={proposal ? meals[i]?.image || RECIPE_PLACEHOLDER : RECIPE_PLACEHOLDER} alt="" />
                ) : (
                  <div className="ef-fruit">
                    <Apple size={35} />
                  </div>
                )}
                <div>
                  <b>
                    <Icon size={14} />
                    {title}
                  </b>
                  <strong>
                    Mục tiêu {proposal ? fmt(planBudgets[i]) : '—'} kcal <small>({[25, 40, 25, 10][i]}%)</small>
                  </strong>
                  <p>
                    {i < 3 ? proposal ? meals[i]?.title || 'Chưa có món phù hợp' : 'Chưa tạo gợi ý' : 'Bữa phụ theo nhu cầu'}
                  </p>
                </div>
                {i < 3 && <ArrowRight className="ef-day-arrow" size={17} />}
              </button>
            );
          })}
        </div>
        <div className="ef-calendar-save">
          <div className="ef-calendar-intro">
            <CalendarDays size={22} />
            <div><h3>Lên lịch cho ngày bạn muốn ăn</h3><p>Ví dụ: chọn thứ Năm, đánh dấu ngày tập và lưu thực đơn bạn thích.</p></div>
          </div>
          <div className="ef-calendar-controls">
            <label>Ngày ăn<input type="date" value={scheduleDate} onChange={(event) => selectScheduleDate(event.target.value)} /></label>
            <label className="ef-training-choice"><input type="checkbox" checked={training} onChange={(event) => setTraining(event.target.checked)} /><Dumbbell size={17} /> Ngày tập luyện</label>
            <button type="button" className="ef-calendar-primary" disabled={!proposal || needsRefresh || !validPlanDate(scheduleDate)} onClick={() => saveToCalendar(true)}>
              <CalendarDays size={16} />{selectedDay ? 'Cập nhật 3 bữa chính' : 'Lưu 3 bữa vào ngày này'}
            </button>
          </div>
          <p className="ef-calendar-date-label">{validPlanDate(scheduleDate) ? formatPlanDate(scheduleDate) : 'Chọn ngày muốn lưu'}{needsRefresh ? ' · Cập nhật đề xuất trước khi lưu cả ngày.' : ''}</p>
          <div className="ef-week-strip" aria-label="Chọn ngày trong tuần">
            {weekDates.map((date, index) => {
              const saved = savedDays.find((day) => day.date === date);
              return <button key={date} type="button" aria-pressed={scheduleDate === date} onClick={() => selectScheduleDate(date)}>
                <span>{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index]}</span>
                <strong>{date.slice(8)}/{date.slice(5, 7)}</strong>
                <small>{saved ? saved.training ? 'Ngày tập' : 'Đã lưu' : 'Chưa xếp'}</small>
              </button>;
            })}
          </div>
          {calendarNotice && <p className="ef-calendar-notice" role={calendarError ? 'alert' : 'status'}>{calendarNotice}</p>}
          <p className="ef-calendar-footnote">Lưu riêng trên trình duyệt này, giữ lại khi chuyển trang hoặc tải lại. Đánh dấu ngày tập để sắp lịch; không tự tăng calo.</p>
          {draftError && <p className="ef-calendar-notice" role="alert">Chưa tự lưu được lộ trình hiện tại. Kiểm tra quyền lưu trữ của trình duyệt trước khi rời trang.</p>}
        </div>
        <div className="ef-saved-heading"><h3>Thực đơn đã xếp lịch</h3><span>{savedDays.length} ngày đã lưu</span></div>
        {savedDays.length ? <div className="ef-saved-days">
          {savedDays.map((day) => <article className="ef-saved-day" key={day.date} data-selected={scheduleDate === day.date}>
            <div className="ef-saved-day-heading">
              <div><h4>{formatPlanDate(day.date)}</h4><p>{day.training ? 'Ngày tập luyện' : 'Ngày thường'} · {goals.find((item) => item.value === day.goal)?.title}{day.target ? ` · Mục tiêu ${fmt(day.target)} kcal` : ''}</p></div>
              <button type="button" aria-label={`Xóa lịch ${formatPlanDate(day.date)}`} onClick={() => commitDays(savedDays.filter((item) => item.date !== day.date), `Đã xóa lịch ${formatPlanDate(day.date)}.`)}><X size={16} /></button>
            </div>
            <div className="ef-saved-meals">{day.meals.map((meal, index) => <button key={index} type="button" disabled={!meal} onClick={() => { selectScheduleDate(day.date); setMealSlot(index); if (meal) setSelected(meal); }}>
              {meal ? <img src={meal.image || RECIPE_PLACEHOLDER} alt="" loading="lazy" /> : <span className="ef-saved-empty"><Utensils size={22} /></span>}
              <span className="ef-saved-meal-label">{names[index]}</span><strong>{meal?.title || 'Chưa chọn món'}</strong>
            </button>)}</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="ef-calendar-edit" type="button" onClick={() => selectScheduleDate(day.date)}>Chọn ngày này để thêm / đổi món <ArrowRight size={14} /></button>
              <Link to="/thuc-don" className="ef-calendar-edit" style={{ textDecoration: 'underline' }}>Xem trong Thực đơn tuần <ArrowRight size={14} /></Link>
            </div>
          </article>)}
        </div> : <div className="ef-calendar-empty"><CalendarDays size={28} /><p>Chưa có ngày nào được xếp lịch. Lưu cả lộ trình phía trên hoặc mở món yêu thích và chọn “Thêm vào lịch ăn”.</p></div>}
      </section>
      <section className="ef-bottom">
        <div className="ef-tips ef-card">
          <h2>
            <Lightbulb size={20} />
            Thói quen nhỏ, bữa ăn tốt hơn
          </h2>
          <div>
            {[
              { icon: Apple, title: 'Đa dạng thực phẩm', text: 'Kết hợp rau củ, ngũ cốc và nguồn đạm.' },
              { icon: Droplet, title: 'Lắng nghe cơ thể', text: 'Điều chỉnh khẩu phần theo nhu cầu.' },
              { icon: GlassWater, title: 'Nhớ uống nước', text: 'Giữ nước bên cạnh khi làm việc.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <Icon />
                <span>
                  <b>{title}</b>
                  <small>{text}</small>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="ef-progress ef-card">
          <h2>
            <Activity size={19} />
            Theo dõi tiến độ
          </h2>
          <p>Chưa có lịch sử năng lượng nạp vào.</p>
          <div className="ef-empty-progress">
            <span>Tuần này</span>
            <i />
            <b>Chưa ghi nhận</b>
          </div>
          <Link to="/thuc-don">
            Bắt đầu từ thực đơn tuần <ArrowRight size={14} />
          </Link>
        </div>
      </section>
      <dialog
        ref={dialog}
        className="ef-modal"
        aria-label={selected?.title || 'Công thức Eat Fit'}
        onClose={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        {selected && (
          <>
            <button
              className="ef-modal-close"
              aria-label="Đóng công thức"
              onClick={() => dialog.current?.close()}
            >
              <X />
            </button>
            <img src={selected.image} alt={selected.title} />
            <div>
              <span className="ef-eyebrow">BỘ SƯU TẬP EAT FIT</span>
              <h2>{selected.title}</h2>
              {selected.reason && <p>{selected.reason}. Gợi ý theo nguyên liệu; chưa xác thực dinh dưỡng theo khẩu phần.</p>}
              <h3>Nguyên liệu</h3>
              <p>{openedMeal?.ingredients}</p>
              <h3>Cách làm</h3>
              {cookingGuide?.expanded && <p className="ef-cooking-note">Hướng dẫn được diễn giải chi tiết từ công thức để dễ thực hiện. Không thêm thời gian nấu cố định khi nguồn chưa ghi rõ.</p>}
              <ol className="ef-cooking-steps">
                {cookingGuide?.steps.map((step, index) => <li key={index}><strong>Bước {index + 1}</strong><p>{step}</p></li>)}
              </ol>
              <div className="ef-modal-schedule">
                <h3><CalendarDays size={18} />Thêm vào lịch ăn</h3>
                <div className="ef-calendar-controls">
                  <label>Ngày ăn<input type="date" value={scheduleDate} onChange={(event) => selectScheduleDate(event.target.value)} /></label>
                  <label>Bữa ăn<select value={mealSlot} onChange={(event) => { setMealSlot(Number(event.target.value)); setCalendarNotice(''); }}>{names.map((name, index) => <option key={name} value={index}>{name}{selectedDay?.meals[index] ? ' · Đã có món' : ''}</option>)}</select></label>
                  <label className="ef-training-choice"><input type="checkbox" checked={training} onChange={(event) => setTraining(event.target.checked)} /><Dumbbell size={17} /> Ngày tập luyện</label>
                </div>
                {validPlanDate(scheduleDate) && <p className="ef-calendar-date-label">{formatPlanDate(scheduleDate)}</p>}
                {selectedDay?.meals[mealSlot] && <p className="ef-calendar-footnote">Sẽ thay “{selectedDay.meals[mealSlot]!.title}” ở bữa này. Các bữa khác được giữ nguyên.</p>}
                <button type="button" className="ef-calendar-primary" disabled={!validPlanDate(scheduleDate)} onClick={() => saveToCalendar(false)}><Check size={16} />{selectedDay?.meals[mealSlot] ? 'Thay món ở bữa này' : 'Thêm món vào ngày đã chọn'}</button>
                {calendarNotice && <p className="ef-calendar-notice" role={calendarError ? 'alert' : 'status'}>{calendarNotice}</p>}
              </div>
            </div>
          </>
        )}
      </dialog>
    </main>
  );
}
