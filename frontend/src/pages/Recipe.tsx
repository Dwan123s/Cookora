import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  LoaderCircle,
  Play,
  Pause,
  Plus,
  Share2,
  Sparkles,
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
          <div className="field">
            <span className="label">Khẩu phần</span>
            <Portions value={count} onChange={setCount} />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn" type="submit" disabled={save.isPending}>
            {save.isPending ? <LoaderCircle className="spin" size={17} /> : 'Lưu vào thực đơn'}
          </button>
        </form>
      )}
    </Modal>
  );
}

export function Detail() {
  const { slug } = useParams<{ slug: string }>();
  const [count, setServings] = useState(2);
  const [showAdd, setAdd] = useState(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'ingredients' | 'nutrition' | 'cost'>('steps');
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [activeTimerStep, setActiveTimerStep] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const notice = useNotice();

  const q = useQuery({
    queryKey: ['recipe', slug],
    queryFn: () => request<Recipe>(`/recipes/${slug}`),
  });
  const recipe = q.data?.data;

  useEffect(() => {
    if (recipe?.baseServings) setServings(recipe.baseServings);
  }, [recipe?.baseServings]);

  const scaled = useQuery({
    queryKey: ['recipe-scaled', recipe?.id, count],
    queryFn: () => request<ScaledRecipe>(`/recipes/${recipe!.id}/scale?servings=${count}`),
    enabled: !!recipe,
  });

  // Timer countdown effect
  useEffect(() => {
    if (activeTimerStep === null || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          notice(`Hết giờ cho Bước ${activeTimerStep + 1}!`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimerStep, timerSeconds, notice]);

  const startTimer = (stepIdx: number, minutes: number) => {
    if (activeTimerStep === stepIdx && timerSeconds > 0) {
      setActiveTimerStep(null);
      setTimerSeconds(0);
    } else {
      setActiveTimerStep(stepIdx);
      setTimerSeconds(minutes * 60);
      notice(`Bắt đầu hẹn giờ: ${minutes} phút`);
    }
  };

  // TTS voice guide
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      notice('Trình duyệt không hỗ trợ đọc giọng nói.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!recipe?.steps?.length) return;
    const step = recipe.steps[currentStepIndex] || recipe.steps[0];
    const text = `Bước ${currentStepIndex + 1}: ${step.title}. ${step.instruction}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.onend = () => {
      if (currentStepIndex < recipe.steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        setIsSpeaking(false);
      }
    };
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const toggleCheck = (name: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const copyShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      notice('Đã sao chép liên kết công thức!');
    }
  };

  if (q.isPending) return <Loading />;
  if (q.isError || !recipe) return <ErrorState error={q.error} />;

  const c = cuisineFor(recipe.cuisine);
  const media = recipeMedia(recipe);
  const steps = recipe.steps && recipe.steps.length > 0 ? recipe.steps : [
    { id: '1', order: 1, title: 'Sơ chế nguyên liệu', instruction: 'Rửa sạch rau củ, thái miếng vừa ăn và để ráo.' },
    { id: '2', order: 2, title: 'Làm nóng chảo và xào thơm', instruction: 'Phi thơm tỏi ớt, cho nguyên liệu chính vào xào săn.' },
    { id: '3', order: 3, title: 'Nấu sốt và hoàn thiện', instruction: 'Nêm nếm gia vị vừa miệng, đun nhỏ lửa đến khi sánh lại.' },
  ];

  const ingredientLines = scaled.data?.data?.lines || [
    { id: '1', name: 'Nguyên liệu chính', exactQuantity: 300, unit: 'g', note: 'sơ chế sạch' },
    { id: '2', name: 'Gia vị cơ bản', exactQuantity: null, unit: '', note: 'vừa đủ' },
  ];

  return (
    <main className="container max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs md:text-sm text-stone-500 mb-6 font-medium">
        <Link to="/cong-thuc" className="hover:text-stone-900 transition">
          Khám phá công thức
        </Link>
        <span>/</span>
        <Link to="/cong-thuc" className="hover:text-stone-900 transition">
          {c.name}
        </Link>
        <span>/</span>
        <span className="text-stone-800 font-semibold truncate">{recipe.title}</span>
      </nav>

      {/* Top Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-10">
        {/* Left: Recipe Hero Photo */}
        <div className="md:col-span-5 relative group">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-sm border border-stone-200/80 bg-stone-100">
            <img
              src={media.src}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
            />
            {/* Pill badge */}
            <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-[11px] font-medium text-stone-700 px-3 py-1 rounded-full shadow-xs">
              Ảnh AI minh họa
            </span>
            {/* Heart button */}
            <button
              onClick={() => notice('Đã thêm vào công thức yêu thích!')}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-700 hover:text-red-500 hover:bg-white shadow-xs transition"
              title="Lưu món yêu thích"
            >
              <Heart size={18} />
            </button>
          </div>
        </div>

        {/* Right: Recipe Meta & CTA */}
        <div className="md:col-span-7 flex flex-col justify-center">
          <p className="text-xs uppercase font-bold tracking-widest text-[#47735B] mb-2">
            — {c.name.toUpperCase()} • BỮA CƠM NHÀ
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mb-3">
            {recipe.title}
          </h1>
          <p className="text-stone-600 text-sm md:text-base leading-relaxed mb-6">
            {recipe.summary || 'Món ngon đậm đà hương vị gia đình, dễ nấu và cân bằng dinh dưỡng cho bữa cơm ấm cúng.'}
          </p>

          {/* Meta Pills */}
          <div className="flex flex-wrap gap-2.5 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 rounded-full text-xs font-semibold text-stone-700">
              <Clock3 size={14} className="text-stone-500" /> {recipe.totalMinutes || 25} phút
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 rounded-full text-xs font-semibold text-stone-700">
              <Users size={14} className="text-stone-500" /> {count} phần
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 rounded-full text-xs font-semibold text-stone-700">
              Mức độ: {recipe.difficulty === 'EASY' ? 'Dễ' : recipe.difficulty === 'HARD' ? 'Khó' : 'Trung bình'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/khau-phan/${recipe.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#47735B] text-white font-semibold text-xs md:text-sm hover:bg-[#3B634F] transition shadow-xs"
            >
              Thay đổi khẩu phần <ArrowUpRight size={15} />
            </Link>
            <button
              onClick={() => setAdd(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-stone-300 bg-white text-stone-800 font-semibold text-xs md:text-sm hover:bg-stone-50 transition"
            >
              <Heart size={15} className="text-stone-500" /> Lưu món
            </button>
            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-stone-300 bg-white text-stone-800 font-semibold text-xs md:text-sm hover:bg-stone-50 transition"
            >
              <Share2 size={15} className="text-stone-500" /> Chia sẻ
            </button>
          </div>

          <p className="text-[11px] text-stone-400 mt-4 italic">
            Ảnh và nội dung công thức chỉ để minh họa giao diện.
          </p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex gap-8 border-b border-stone-200 mb-8 text-sm md:text-base font-semibold">
        <button
          onClick={() => setActiveTab('steps')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'steps'
              ? 'border-[#47735B] text-[#47735B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Hướng dẫn nấu
        </button>
        <button
          onClick={() => setActiveTab('ingredients')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'ingredients'
              ? 'border-[#47735B] text-[#47735B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Nguyên liệu
        </button>
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'nutrition'
              ? 'border-[#47735B] text-[#47735B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Dinh dưỡng
        </button>
        <button
          onClick={() => setActiveTab('cost')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'cost'
              ? 'border-[#47735B] text-[#47735B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Chi phí ước tính
        </button>
      </div>

      {/* Main 2-Column Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Nguyên liệu Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-stone-900">Nguyên liệu</h2>
            <Link
              to={`/khau-phan/${recipe.slug}`}
              className="text-xs font-semibold px-2.5 py-1 bg-stone-100 rounded-full text-stone-700 hover:bg-stone-200 transition"
            >
              {count} người ăn ↗
            </Link>
          </div>

          <div className="space-y-3 mb-6">
            {ingredientLines.map((line) => {
              const checked = !!checkedIngredients[line.name];
              return (
                <div
                  key={line.id}
                  onClick={() => toggleCheck(line.name)}
                  className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0 cursor-pointer group select-none"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                        checked
                          ? 'bg-[#47735B] border-[#47735B] text-white'
                          : 'border-stone-300 group-hover:border-stone-400 bg-white'
                      }`}
                    >
                      {checked && <Check size={13} strokeWidth={3} />}
                    </div>
                    <span
                      className={`text-sm font-medium transition ${
                        checked ? 'line-through text-stone-400' : 'text-stone-800'
                      }`}
                    >
                      {line.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-stone-600">
                    {line.exactQuantity ? `${line.exactQuantity} ${line.unit}` : line.unit || 'Vừa đủ'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bg-[#E8F1E9] rounded-2xl p-3.5 text-xs text-[#47735B] leading-relaxed">
            Bạn có thể tick nguyên liệu đã chuẩn bị để theo dõi tiến độ.
          </div>
        </div>

        {/* Right Column: Nấu từng bước & Giọng hướng dẫn AI */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-1">
                Nấu từng bước, không bỏ sót
              </h2>
              <p className="text-xs md:text-sm text-stone-500">
                Bật hướng dẫn bằng giọng đọc khi đang nấu.
              </p>
            </div>
            <button
              onClick={toggleSpeech}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition shadow-xs ${
                isSpeaking
                  ? 'bg-[#47735B] text-white hover:bg-[#3B634F]'
                  : 'bg-[#47735B] text-white hover:bg-[#3B634F]'
              }`}
            >
              {isSpeaking ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
              {isSpeaking ? 'Dừng hướng dẫn' : 'Nghe hướng dẫn AI'}
            </button>
          </div>

          {/* Audio Player Card */}
          <div className="bg-[#E8F1E9] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSpeech}
                className="w-12 h-12 rounded-full bg-[#47735B] text-white flex items-center justify-center hover:scale-105 transition shadow-xs shrink-0"
              >
                {isSpeaking ? <Pause size={20} /> : <Play size={20} className="translate-x-0.5" fill="currentColor" />}
              </button>
              <div>
                <p className="text-sm font-bold text-stone-900">
                  Giọng hướng dẫn • Bước {currentStepIndex + 1}
                </p>
                <p className="text-xs text-stone-500">
                  {isSpeaking ? 'Đang phát...' : '00:32 / 02:40'} • Tốc độ 1x
                </p>
              </div>
            </div>

            {/* Equalizer bars animation */}
            <div className="hidden sm:flex items-center gap-1">
              {[40, 75, 55, 90, 60, 35, 80, 50].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 bg-[#47735B] rounded-full transition-all duration-300 ${
                    isSpeaking ? 'animate-pulse' : 'opacity-40'
                  }`}
                  style={{ height: `${h * 0.25}px` }}
                />
              ))}
            </div>
          </div>

          {/* Step Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-semibold text-stone-600 mb-2">
              <span>Tiến trình công thức</span>
              <span>{currentStepIndex + 1} / {steps.length} bước</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#47735B] h-full transition-all duration-500"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const minutes = idx === 0 ? 2 : idx === 1 ? 5 : 8;
              const isRunning = activeTimerStep === idx && timerSeconds > 0;
              const isDone = currentStepIndex > idx;

              return (
                <div
                  key={step.id || idx}
                  className={`p-4 sm:p-5 rounded-2xl border transition ${
                    currentStepIndex === idx
                      ? 'border-[#47735B]/40 bg-[#fafbfa]'
                      : 'border-stone-100 bg-white hover:border-stone-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isDone
                          ? 'bg-[#47735B] text-white'
                          : currentStepIndex === idx
                          ? 'bg-[#47735B] text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {step.order || idx + 1}
                    </span>

                    <div className="grow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                        <h3 className="text-base font-bold text-stone-900">{step.title}</h3>
                        <button
                          onClick={() => startTimer(idx, minutes)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition self-start sm:self-auto ${
                            isRunning
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          <Clock3 size={13} />
                          {isRunning
                            ? `${Math.floor(timerSeconds / 60)}:${String(timerSeconds % 60).padStart(2, '0')}`
                            : `▷ ${minutes} phút`}
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                        {step.instruction}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showAdd && <AddToPlan recipe={recipe} servings={count} close={() => setAdd(false)} />}
    </main>
  );
}

export function Cooking() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const q = useQuery({ queryKey: ['recipe', slug], queryFn: () => request<Recipe>(`/recipes/${slug}`) });
  const [step, setStep] = useState(0);

  if (q.isPending) return <Loading />;
  if (q.isError || !q.data?.data) return <ErrorState error={q.error} />;
  const recipe = q.data.data;
  const current = recipe.steps[step];

  return (
    <main className="container max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <Link to={`/cong-thuc/${slug}`} className="text-sm font-semibold text-stone-500 hover:text-stone-900">
            ← Quay lại công thức
          </Link>
          <span className="text-xs font-bold bg-stone-100 px-3 py-1 rounded-full text-stone-700">
            Bước {step + 1} / {recipe.steps.length}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">{recipe.title}</h1>
        <h2 className="text-xl font-semibold text-[#47735B] mb-4">{current?.title}</h2>
        <p className="text-stone-700 text-base leading-relaxed mb-8">{current?.instruction}</p>
        <div className="flex justify-between items-center pt-4 border-t border-stone-100">
          <button
            className="btn secondary"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Bước trước
          </button>
          {step < recipe.steps.length - 1 ? (
            <button className="btn" onClick={() => setStep((s) => s + 1)}>
              Bước tiếp theo
            </button>
          ) : (
            <button className="btn" onClick={() => navigate(`/cong-thuc/${slug}`)}>
              Hoàn thành nấu
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
