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
  Sparkles,
  Sun,
  TrendingDown,
  Users,
  Utensils,
  Wheat,
  X,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { loadRecipeCatalog } from '../recipe-catalog';
import { RECIPE_PLACEHOLDER } from '../recipe-media';
import { ErrorState, Loading } from '../shared';
import { calculateNutrition, mealBudgets, type Goal } from '../eatfit-calculations';
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
  const catalog = useQuery({
    queryKey: ['recipes', 'catalog', 'sql-v1'],
    queryFn: () => loadRecipeCatalog(),
    staleTime: 30000,
  });
  const meals = (catalog.data || [])
    .filter((r) => r.sourceName === 'Menu món.docx')
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .slice(0, 6)
    .map((recipe) => ({
      number: Number(recipe.slug.match(/^doc-menu-(\d+)/)?.[1]),
      slug: recipe.slug,
      title: recipe.title,
      image: recipe.image || RECIPE_PLACEHOLDER,
      ingredients: recipe.ingredients.map((item) => item.note || item.name).join('; '),
      recipeContext: recipe.steps.map((step) => 'Bước ' + step.order + '. ' + step.instruction).join('\n\n'),
    }));
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [age, setAge] = useState('22'),
    [height, setHeight] = useState('160'),
    [weight, setWeight] = useState('50');
  const [activity, setActivity] = useState(1.375),
    [goal, setGoal] = useState<Goal>('lose');
  const [selected, setSelected] = useState<(typeof meals)[number] | null>(null);
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
  return (
    <main className="eatfit-reference">
      <section className="ef-hero">
        <div className="ef-hero-art" aria-hidden="true" />
        <div className="ef-hero-copy">
          <p className="ef-eyebrow">EAT FIT · DINH DƯỠNG CÁ NHÂN HÓA</p>
          <h1>
            Thực đơn theo mục tiêu thể trạng <span>✧</span>
          </h1>
          <p>
            Hiểu cơ thể, chọn món phù hợp. Bắt đầu hành trình ăn ngon và cân bằng
            <br className="ef-desktop-break" /> với nhu cầu năng lượng ước tính dành cho bạn.
          </p>
        </div>
      </section>
      <section className="ef-dashboard" aria-label="Tính mục tiêu dinh dưỡng">
        <div className="ef-body-card ef-card">
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
                  {gender === v && <Check size={14} />}
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
        </div>
        <div className="ef-nutrition" aria-live="polite">
          <div className="ef-result-top">
            <div className="ef-result-copy">
              <span className="ef-mini-label">
                <Sparkles size={13} />
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
      <section className="ef-recipes">
        <div className="ef-section-heading">
          <div>
            <h2>Món ăn gợi ý cho mục tiêu của bạn</h2>
            <p>Một chút cảm hứng cho bữa ăn cân bằng · Bộ sưu tập Eat Fit.</p>
          </div>
          <Link to="/cong-thuc">
            Xem tất cả công thức <ArrowRight size={15} />
          </Link>
        </div>
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
                  {['Tươi ngon', 'Nhiều rau', 'Cân bằng', 'Đa dạng', 'Đủ vị', 'Ấm bụng'][i]}
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
        <p className="ef-catalog-note">
          Chưa có dữ liệu dinh dưỡng xác thực cho từng công thức. Món đã lưu được giữ trên thiết bị này.
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
            <p>Khung calo cho 4 bữa · Món gợi ý để tham khảo và thay đổi.</p>
          </div>
          <span className="ef-total">Tổng: {result ? fmt(result.target) : '—'} kcal</span>
        </div>
        <div className="ef-day-grid">
          {names.map((title, i) => {
            const Icon = icons[i];
            return (
              <div className="ef-day-meal" key={title}>
                {i < 3 ? (
                  <img src={meals[[5, 4, 2][i]]?.image || RECIPE_PLACEHOLDER} alt="" />
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
                    {result ? fmt(budgets[i]) : '—'} kcal <small>({[25, 40, 25, 10][i]}%)</small>
                  </strong>
                  <p>
                    {i < 3 ? meals[[5, 4, 2][i]]?.title || 'Chọn món từ danh mục' : 'Bữa phụ theo nhu cầu'}
                  </p>
                </div>
                {i < 3 && <ArrowRight className="ef-day-arrow" size={17} />}
              </div>
            );
          })}
        </div>
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
              <h3>Nguyên liệu</h3>
              <p>{selected.ingredients}</p>
              <h3>Cách làm</h3>
              <p className="ef-instructions">
                {selected.recipeContext.split('Công thức:')[1]?.trim() || selected.recipeContext}
              </p>
            </div>
          </>
        )}
      </dialog>
    </main>
  );
}
