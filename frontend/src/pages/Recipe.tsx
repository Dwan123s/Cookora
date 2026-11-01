import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LoaderCircle,
  Plus,
  Sprout,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { MealPlan, Recipe, ScaledRecipe } from '@cookora/contracts';
import { request } from '../api';
import { dateKey, weekOf } from '../date';
import { recipeMedia } from '../recipe-media';
import {
  cuisineFor,
  useNotice,
  useUser,
  errorText,
  Loading,
  ErrorState,
  Modal,
  Portions,
  FavoriteButton,
} from '../shared';

export function AddToPlan({
  recipe,
  servings,
  close,
}: {
  recipe: Recipe;
  servings: number;
  close: () => void;
}) {
  const user = useUser(),
    navigate = useNavigate(),
    [date, setDate] = useState(dateKey(new Date())),
    [mealType, setMeal] = useState('DINNER'),
    [count, setCount] = useState(servings),
    [error, setError] = useState(''),
    notice = useNotice(),
    qc = useQueryClient();
  const save = useMutation({
    mutationFn: async () => {
      const p = await request<MealPlan>('/meal-plans', { method: 'POST', body: { weekStart: weekOf(date) } });
      return request<MealPlan>(`/meal-plans/${p.data.id}/entries`, {
        method: 'POST',
        body: {
          date,
          mealType,
          servings: count,
          recipeId: recipe.id,
          version: p.data.version,
          clientKey: crypto.randomUUID(),
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plan'] });
      notice('Đã thêm món vào thực đơn tuần.');
      close();
    },
    onError: (e) => setError(errorText(e)),
  });
  return (
    <Modal title="Thêm vào thực đơn" onClose={close}>
      {!user ? (
        <div className="modal-content">
          <p>Đăng nhập để lưu các bữa ăn và danh sách đi chợ riêng của bạn.</p>
          <button
            className="btn"
            onClick={() => navigate('/dang-nhap', { state: { from: `/cong-thuc/${recipe.slug}` } })}
          >
            Đăng nhập để lưu <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <form
          className="stack modal-content"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <p className="modal-recipe-title">{recipe.title}</p>
          <label>
            Ngày nấu
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            Bữa ăn
            <select value={mealType} onChange={(e) => setMeal(e.target.value)}>
              <option value="BREAKFAST">Bữa sáng</option>
              <option value="LUNCH">Bữa trưa</option>
              <option value="DINNER">Bữa tối</option>
            </select>
          </label>
          <div className="inline-label">
            Số phần nấu
            <Portions value={count} onChange={setCount} />
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn" disabled={save.isPending || !date}>
            {save.isPending ? <LoaderCircle className="spin" size={16} /> : <Plus size={16} />} Thêm món
          </button>
        </form>
      )}
    </Modal>
  );
}

export function Detail() {
  const { slug } = useParams(),
    q = useQuery({ queryKey: ['recipe', slug], queryFn: () => request<Recipe>(`/recipes/${slug}`) }),
    [servings, setServings] = useState<number | null>(null),
    [add, setAdd] = useState(false);
  const recipe = q.data?.data,
    count = servings ?? recipe?.baseServings ?? 2;
  const scaled = useQuery({
    queryKey: ['scaled', recipe?.id, count],
    queryFn: () =>
      request<ScaledRecipe>(`/recipes/${recipe!.id}/scale`, { method: 'POST', body: { servings: count } }),
    enabled: !!recipe,
  });
  if (q.isPending) return <Loading />;
  if (q.isError || !recipe) return <ErrorState error={q.error} />;
  const c = cuisineFor(recipe.cuisine);
  return (
    <main className="container recipe-detail">
      <div className="breadcrumbs">
        <Link to="/cong-thuc">Khám phá công thức</Link>
        <ChevronRight size={13} />
        <span>{c.name}</span>
      </div>
      <div className="detail-top">
        <div>
          <p className="eyebrow">
            {c.name.toUpperCase()} · {recipe.category.toUpperCase()}
          </p>
          <h1>{recipe.title}</h1>
          <p className="detail-summary">{recipe.summary}</p>
          <div className="detail-stats">
            <span>
              <Clock3 size={18} />~{recipe.totalMinutes} phút <small>chưa đo</small>
            </span>
            <span>
              <Users size={18} />
              {recipe.baseServings} phần gốc
            </span>
          </div>
          <div className="detail-actions">
            <Link className="btn" to={`/cong-thuc/${recipe.slug}/nau`}>
              <ChefHat size={18} />
              Bắt đầu nấu
            </Link>
            <button className="btn secondary" onClick={() => setAdd(true)}>
              <CalendarDays size={18} />
              Thêm thực đơn
            </button>
            <FavoriteButton recipe={recipe} />
          </div>
          <div className="draft-note">
            <BookOpen size={18} />
            <span>
              <strong>Bản thảo phát triển · chưa nấu thử</strong>Định lượng và thời gian là giả thuyết từ bộ
              nội dung, cần kiểm chứng trước khi xuất bản.
            </span>
          </div>
        </div>
        <figure className="detail-photo">
          <img
            src={recipeMedia(recipe).src}
            alt={`${recipeMedia(recipe).label}: ${recipe.title}`}
            width="900"
            height="900"
            style={{ viewTransitionName: `recipe-${recipe.id}` }}
          />
          <figcaption>{recipeMedia(recipe).credit}</figcaption>
        </figure>
      </div>
      <p className="preconditions">
        <Clock3 size={17} />
        <span>{recipe.preconditions}</span>
      </p>
      <div className="recipe-columns">
        <aside className="ingredient-panel">
          <div className="panel-heading">
            <h2>Nguyên liệu</h2>
            <Portions value={count} onChange={setServings} />
          </div>
          {scaled.isPending ? (
            <Loading />
          ) : scaled.isError ? (
            <ErrorState error={scaled.error} retry={() => scaled.refetch()} />
          ) : (
            <ul className="ingredient-list">
              {scaled.data?.data.lines.map((l) => (
                <li key={l.id}>
                  <span>
                    {l.name}
                    {l.note && <small>{l.note}</small>}
                  </span>
                  <strong>
                    {l.exactQuantity ?? 'Tùy khẩu vị'} {l.exactQuantity ? l.unit : ''}
                  </strong>
                </li>
              ))}
            </ul>
          )}
          <p className="tiny muted">
            Lượng luôn tính từ công thức gốc. Thời gian, nhiệt độ và dụng cụ không tự nhân theo số phần.
          </p>
        </aside>
        <section className="steps-panel">
          <h2>Cùng vào bếp</h2>
          {recipe.steps.map((s) => (
            <article className="recipe-step" key={s.id}>
              <span className="step-number">{String(s.order).padStart(2, '0')}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.instruction}</p>
              </div>
            </article>
          ))}
          <div className="source-note">
            <Sprout size={20} />
            <div>
              <strong>Nguồn nghiên cứu và giới hạn</strong>
              <p>
                Tham khảo nền món:{' '}
                <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">
                  {recipe.sourceName} <ArrowUpRight size={12} />
                </a>
                . Tỷ lệ Cookora chưa được nấu thử; chưa có giá, dinh dưỡng hay thời hạn bảo quản đã duyệt cho
                bản này.
              </p>
            </div>
          </div>
        </section>
      </div>
      {add && <AddToPlan recipe={recipe} servings={count} close={() => setAdd(false)} />}
    </main>
  );
}

export function Cooking() {
  const { slug } = useParams(),
    q = useQuery({ queryKey: ['recipe', slug], queryFn: () => request<Recipe>(`/recipes/${slug}`) }),
    [step, setStep] = useState(0),
    [speaking, setSpeaking] = useState(false),
    [voiceNote, setVoiceNote] = useState('');
  const recipe = q.data?.data;
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, [step]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  if (q.isPending) return <Loading />;
  if (!recipe || q.isError) return <ErrorState error={q.error} />;
  const s = recipe.steps[step];
  const speak = () => {
    if (!('speechSynthesis' in window)) {
      setVoiceNote('Trình duyệt này chưa hỗ trợ đọc. Bạn vẫn có thể làm theo phần chữ.');
      return;
    }
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith('vi'));
    if (!voice) {
      setVoiceNote('Thiết bị chưa có giọng tiếng Việt. Hãy đọc phần hướng dẫn trên màn hình.');
      return;
    }
    const u = new SpeechSynthesisUtterance(s.instruction);
    u.voice = voice;
    u.lang = 'vi-VN';
    u.onend = () => setSpeaking(false);
    u.onerror = () => {
      setSpeaking(false);
      setVoiceNote('Không phát được giọng đọc. Bạn có thể tiếp tục với phần chữ.');
    };
    speechSynthesis.speak(u);
    setSpeaking(true);
  };
  return (
    <main className="cooking-page">
      <Link className="text-link" to={`/cong-thuc/${slug}`}>
        <ArrowLeft size={16} />
        Về công thức
      </Link>
      <p className="eyebrow">CĂN BẾP CỦA BẠN</p>
      <h1>{recipe.title}</h1>
      <p className="data-notice">Bản thảo chưa nấu thử · giọng đọc trình duyệt, chưa tích hợp Azure TTS.</p>
      <div className="cook-progress">
        {recipe.steps.map((item, index) => (
          <button
            key={item.id}
            aria-label={`Đến bước ${index + 1}`}
            className={index <= step ? 'done' : ''}
            onClick={() => setStep(index)}
          />
        ))}
      </div>
      <article className="cook-card">
        <span className="eyebrow">
          BƯỚC {step + 1} / {recipe.steps.length}
        </span>
        <h2>{s.title}</h2>
        <p>{s.instruction}</p>
        <button className="btn secondary" onClick={speak}>
          {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
          {speaking ? 'Dừng đọc' : 'Đọc bước này'}
        </button>
        {voiceNote && (
          <p className="tiny muted" role="status">
            {voiceNote}
          </p>
        )}
      </article>
      <div className="cook-controls">
        <button className="btn secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>
          <ChevronLeft size={18} />
          Bước trước
        </button>
        {step < recipe.steps.length - 1 ? (
          <button className="btn" onClick={() => setStep(step + 1)}>
            Bước tiếp theo
            <ChevronRight size={18} />
          </button>
        ) : (
          <Link className="btn" to={`/cong-thuc/${slug}`}>
            <CheckCircle2 size={18} />
            Hoàn thành
          </Link>
        )}
      </div>
      <p className="tiny muted">Hoàn thành hướng dẫn không tự ghi nhận món đã ăn.</p>
    </main>
  );
}
