import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LoaderCircle,
  MessageSquareText,
  Plus,
  Refrigerator,
  Search,
  Sprout,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type {
  AiChefSuggestionResponse,
  AiSuggestedDish,
  Ingredient,
  MatchItem,
  MatchResult,
} from '@cookora/contracts';
import { request } from '../api';
import { recipeMedia } from '../recipe-media';
import { cuisineFor, Loading, ErrorState, Empty, PageHead, Portions, Modal } from '../shared';

const SAMPLE_PROMPTS = [
  '2 lạng thịt bò, 3 lạng thịt heo, 2 bó rau muống',
  '3 quả trứng gà, 2 bìa đậu phụ, 3 quả cà chua',
  '500g sườn non, 1 củ cải trắng, hành lá',
];

export function Matcher() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'ai' ? 'ai' : 'manual';
  const setTab = (value: 'ai' | 'manual') =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set('tab', value);
        return next;
      },
      { replace: true },
    );
  const initialServings = Number(params.get('servings') || 2);
  const [servings, setServings] = useState(
    Number.isInteger(initialServings) && initialServings >= 1 && initialServings <= 20 ? initialServings : 2,
  );

  // AI Assistant states
  const [aiPrompt, setAiPrompt] = useState('2 lạng thịt bò, 3 lạng thịt heo, 2 bó rau muống');
  const [cookingDish, setCookingDish] = useState<AiSuggestedDish | null>(null);
  const [cookStep, setCookStep] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  const aiMutation = useMutation({
    mutationFn: () =>
      request<AiChefSuggestionResponse>('/ai/suggest-recipes', {
        method: 'POST',
        body: {
          prompt: aiPrompt.trim(),
          servings,
        },
      }),
  });

  // Manual matching states
  const q = useQuery({ queryKey: ['ingredients'], queryFn: () => request<Ingredient[]>('/ingredients') });
  const [term, setTerm] = useState('');
  const [items, setItems] = useState<MatchItem[]>([]);
  const [imported, setImported] = useState(false);
  const [mode, setMode] = useState<'identity' | 'quantity'>('identity');

  const manualResult = useMutation({
    mutationFn: () =>
      request<MatchResult[]>('/recipes/match', {
        method: 'POST',
        body: {
          mode,
          servings,
          items: items.map((i) => (mode === 'identity' ? { ingredientId: i.ingredientId } : i)),
        },
      }),
  });

  const ingredients = q.data?.data || [];
  useEffect(() => {
    if (!q.data || imported) return;
    const requested = new Set((params.get('ingredients') || '').split(',').slice(0, 50));
    setItems(q.data.data.filter((i) => requested.has(i.id)).map((i) => ({ ingredientId: i.id })));
    setImported(true);
  }, [q.data, imported, params]);
  const norm = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .toLowerCase();

  const available = ingredients.filter(
    (i) =>
      !items.some((x) => x.ingredientId === i.id) &&
      norm(`${i.name} ${i.aliases.join(' ')}`).includes(norm(term)),
  );

  const invalidateManual = () => manualResult.reset();

  // Voice synthesis effect for interactive cooking modal
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, [cookStep, cookingDish]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const speakCurrentStep = (instruction: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('vi'));
    const utterance = new SpeechSynthesisUtterance(instruction);
    if (voice) utterance.voice = voice;
    utterance.lang = 'vi-VN';
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <main className="container">
      <PageHead
        eyebrow="BẮT ĐẦU TỪ NHỮNG GÌ BẠN CÓ"
        title="Có gì nấu nấy"
        description="Mô tả nguyên liệu tự nhiên để nhận công thức gợi ý, hoặc tra cứu theo danh mục trong tủ lạnh."
      />

      <div className="matcher-tabs" role="group" aria-label="Cách tìm công thức">
        <button
          aria-pressed={tab === 'ai'}
          className={`matcher-tab ${tab === 'ai' ? 'active' : ''}`}
          onClick={() => setTab('ai')}
        >
          <ChefHat size={18} />
          Trợ lý đề xuất công thức
        </button>
        <button
          aria-pressed={tab === 'manual'}
          className={`matcher-tab ${tab === 'manual' ? 'active' : ''}`}
          onClick={() => setTab('manual')}
        >
          <Refrigerator size={18} />
          Khớp theo danh mục
        </button>
      </div>

      {tab === 'ai' ? (
        <div className="matcher-layout">
          {/* Left panel: Prompt input */}
          <section className="pantry-panel">
            <div className="panel-heading">
              <h2>
                <MessageSquareText size={20} />
                Mô tả nguyên liệu
              </h2>
            </div>

            <textarea
              className="ai-prompt-textarea"
              aria-label="Danh sách nguyên liệu hiện có"
              placeholder="Ví dụ: 2 lạng thịt bò, 3 lạng thịt heo, 2 bó rau muống..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={4}
            />

            <div className="ai-examples">
              <span className="ai-examples-label">Mẫu tham khảo:</span>
              {SAMPLE_PROMPTS.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  className="ai-example-btn"
                  onClick={() => setAiPrompt(sample)}
                >
                  {sample}
                </button>
              ))}
            </div>

            <div className="inline-label" style={{ marginTop: '16px' }}>
              Nấu cho
              <Portions value={servings} onChange={(n) => setServings(n)} />
            </div>

            <button
              className="btn full"
              disabled={!aiPrompt.trim() || aiMutation.isPending}
              onClick={() => aiMutation.mutate()}
              style={{ marginTop: '16px' }}
            >
              {aiMutation.isPending ? <LoaderCircle className="spin" size={17} /> : <ChefHat size={17} />}
              {aiMutation.isPending ? 'Đang phân tích...' : 'Đề xuất thực đơn và công thức'}
            </button>

            <p className="tiny muted" style={{ marginTop: '12px' }}>
              Gợi ý do AI tạo, chưa được nấu thử. Kiểm tra lại định lượng và gia vị trước khi nấu; “bó”, “quả”
              có thể khác nhau về kích thước.
            </p>
          </section>

          {/* Right panel: Results */}
          <section className="match-results">
            {aiMutation.isPending ? (
              <Loading />
            ) : aiMutation.isError ? (
              <ErrorState error={aiMutation.error} retry={() => aiMutation.mutate()} />
            ) : aiMutation.data ? (
              <div>
                {/* Menu overview */}
                <div className="ai-results-overview">
                  <h3>Thực đơn đề xuất cho {aiMutation.data.data.servings} người</h3>
                  <p>{aiMutation.data.data.menuOverview}</p>

                  <div className="ai-examples-label" style={{ marginTop: '8px' }}>
                    Nguyên liệu đã quy đổi:
                  </div>
                  <div className="parsed-pills">
                    {aiMutation.data.data.parsedIngredients.map((ing, i) => (
                      <span className="parsed-pill" key={i}>
                        <strong>{ing.name}:</strong>
                        {ing.quantity ? `${ing.quantity}${ing.unit ? ` ${ing.unit}` : ''}` : ing.original}
                        {ing.original && ing.original !== ing.name && ing.quantity && (
                          <small style={{ marginLeft: '4px', opacity: 0.7 }}>({ing.original})</small>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* List of recommended dishes */}
                {aiMutation.data.data.dishes.map((dish) => (
                  <article key={dish.id} className="ai-dish-card">
                    <div className="ai-dish-header">
                      <div className="ai-dish-meta">
                        <span>{dish.category}</span>
                        <span>·</span>
                        <span>Ẩm thực Việt Nam</span>
                        <span>·</span>
                        <span>Độ khó: {dish.difficulty}</span>
                      </div>
                      <h3 className="ai-dish-title">{dish.title}</h3>
                      {dish.summary && <p className="ai-dish-summary">{dish.summary}</p>}
                      <div className="ai-dish-stats">
                        <span>
                          <Clock3 size={15} />
                          Tổng {dish.totalMinutes} phút (chuẩn bị {dish.prepMinutes}p, nấu {dish.cookMinutes}
                          p)
                        </span>
                        <span>
                          <Users size={15} />
                          {dish.servings} phần
                        </span>
                      </div>
                    </div>

                    <div className="ai-ingredients-grid">
                      <div className="ai-ingredient-col">
                        <h4>Nguyên liệu đã dùng</h4>
                        <ul className="ai-ingredient-list">
                          {dish.usedIngredients.map((ing, idx) => (
                            <li key={idx}>
                              <span>
                                {ing.name}
                                {ing.note && <small>{ing.note}</small>}
                              </span>
                              <strong>
                                {ing.quantity} {ing.unit}
                              </strong>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="ai-ingredient-col">
                        <h4>Gia vị bếp cần thêm</h4>
                        <ul className="ai-ingredient-list">
                          {dish.pantryIngredientsNeeded.map((ing, idx) => (
                            <li key={idx}>
                              <span>
                                {ing.name}
                                {ing.note && <small>{ing.note}</small>}
                              </span>
                              <strong>
                                {ing.quantity} {ing.unit}
                              </strong>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="ai-steps-section">
                      <h4>Hướng dẫn thực hiện</h4>
                      {dish.steps.map((st) => (
                        <div key={st.order} className="ai-step-item">
                          <span className="ai-step-num">{String(st.order).padStart(2, '0')}</span>
                          <div className="ai-step-body">
                            <h5>{st.title}</h5>
                            <p>{st.instruction}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="ai-dish-actions">
                      <button
                        className="btn"
                        onClick={() => {
                          setCookingDish(dish);
                          setCookStep(0);
                        }}
                      >
                        <ChefHat size={16} />
                        Bắt đầu nấu từng bước
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="match-welcome">
                <div className="welcome-icon">
                  <ChefHat size={45} strokeWidth={1.2} />
                </div>
                <h2>
                  Biến nguyên liệu có sẵn
                  <br />
                  thành bữa cơm hoàn chỉnh.
                </h2>
                <p>
                  Nhập danh sách nguyên liệu theo thói quen nói hàng ngày (ví dụ: 2 lạng thịt bò, 3 lạng thịt
                  heo, 2 bó rau muống). Trợ lý sẽ phân chia lượng nguyên liệu hợp lý và hướng dẫn công thức
                  chi tiết.
                </p>
                <span className="tiny">
                  Gợi ý bằng AI · Kiểm tra nguyên liệu và cách nấu trước khi sử dụng.
                </span>
              </div>
            )}
          </section>
        </div>
      ) : (
        /* Manual catalog matching layout (retaining original implementation) */
        <div className="matcher-layout">
          <section className="pantry-panel">
            <div className="panel-heading">
              <h2>
                <Refrigerator size={21} />
                Tủ lạnh của bạn
              </h2>
              <span>{items.length}/50</span>
            </div>
            <div className="search-input">
              <Search size={17} />
              <input
                aria-label="Tìm nguyên liệu để thêm"
                placeholder="Ví dụ: trứng, đậu hũ, cà chua…"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </div>
            {q.isError ? (
              <ErrorState error={q.error} />
            ) : q.isPending ? (
              <Loading />
            ) : (
              <div className="ingredient-options">
                {available.slice(0, 12).map((i) => (
                  <button
                    key={i.id}
                    disabled={items.length >= 50}
                    onClick={() => {
                      setItems([...items, { ingredientId: i.id }]);
                      setTerm('');
                      invalidateManual();
                    }}
                  >
                    <Plus size={14} />
                    {i.name}
                  </button>
                ))}
                {!available.length && (
                  <p className="muted tiny">Không có nguyên liệu phù hợp trong danh mục.</p>
                )}
              </div>
            )}
            <div className="selected-ingredients">
              {items.map((i, index) => {
                const ingredient = ingredients.find((x) => x.id === i.ingredientId);
                return (
                  <div className="pantry-row" key={i.ingredientId}>
                    <div>
                      <strong>{ingredient?.name}</strong>
                      {mode === 'quantity' && (
                        <div className="quantity-inputs">
                          <input
                            aria-label={`Lượng ${ingredient?.name}`}
                            type="number"
                            min="0.000001"
                            max="99999999"
                            step="any"
                            placeholder="Chưa rõ lượng"
                            value={i.quantity || ''}
                            onChange={(e) => {
                              setItems(
                                items.map((x, n) =>
                                  n === index
                                    ? {
                                        ...x,
                                        quantity: e.target.value || undefined,
                                        unit: x.unit || ingredient?.unit,
                                      }
                                    : x,
                                ),
                              );
                              invalidateManual();
                            }}
                          />
                          <select
                            aria-label={`Đơn vị ${ingredient?.name}`}
                            value={i.unit || ingredient?.unit}
                            onChange={(e) => {
                              setItems(
                                items.map((x, n) => (n === index ? { ...x, unit: e.target.value } : x)),
                              );
                              invalidateManual();
                            }}
                          >
                            {(ingredient?.unit === 'ml'
                              ? ['ml', 'l']
                              : ingredient?.unit === 'piece'
                                ? ['piece']
                                : ['g', 'kg']
                            ).map((u) => (
                              <option key={u}>{u}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    <button
                      className="icon-btn"
                      aria-label={`Bỏ ${ingredient?.name}`}
                      onClick={() => {
                        setItems(items.filter((_, n) => n !== index));
                        invalidateManual();
                      }}
                    >
                      <X size={17} />
                    </button>
                  </div>
                );
              })}
              {!items.length && <p className="pantry-empty">Thêm một vài nguyên liệu để bắt đầu nhé.</p>}
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                checked={mode === 'quantity'}
                onChange={(e) => {
                  setMode(e.target.checked ? 'quantity' : 'identity');
                  invalidateManual();
                }}
              />
              Kiểm tra cả định lượng
            </label>
            <div className="inline-label">
              Nấu cho
              <Portions
                value={servings}
                onChange={(n) => {
                  setServings(n);
                  invalidateManual();
                }}
              />
            </div>
            <button
              className="btn full"
              disabled={!items.length || manualResult.isPending}
              onClick={() => manualResult.mutate()}
            >
              {manualResult.isPending ? <LoaderCircle className="spin" size={17} /> : <Search size={17} />}
              Tìm món trong danh mục
            </button>
            <p className="tiny muted">
              Không mặc định bạn có gia vị. Hãy thêm dầu, muối hoặc các loại sốt bạn đang có.
            </p>
          </section>
          <section className="match-results">
            {manualResult.isError ? (
              <ErrorState error={manualResult.error} />
            ) : manualResult.isPending ? (
              <Loading />
            ) : manualResult.data ? (
              <>
                <div className="results-meta">
                  <strong>{manualResult.data.data.length} gợi ý từ nguyên liệu của bạn</strong>
                </div>
                {!manualResult.data.data.length && (
                  <Empty icon={<Search />} title="Chưa có công thức phù hợp">
                    <p>Thử thêm nguyên liệu khác trong danh mục.</p>
                  </Empty>
                )}
                {manualResult.data.data.map((m) => (
                  <article key={m.recipe.id} className="match-card">
                    <img src={recipeMedia(m.recipe).src} alt={recipeMedia(m.recipe).label} loading="lazy" />
                    <div>
                      <div className="match-kicker">
                        <span>{cuisineFor(m.recipe.cuisine).name}</span>
                        <b>
                          {m.score}% {m.mode === 'identity' ? 'khớp nguyên liệu' : 'đã xác nhận đáp ứng'}
                        </b>
                      </div>
                      <h3>
                        <Link to={`/cong-thuc/${m.recipe.slug}`}>{m.recipe.title}</Link>
                      </h3>
                      <div className="match-meter">
                        <span style={{ width: `${m.score}%` }} />
                      </div>
                      <p className="tiny">
                        {m.canCookConfirmed
                          ? 'Đã đủ lượng nguyên liệu bắt buộc.'
                          : m.mode === 'identity'
                            ? 'Chưa xác nhận đủ lượng để nấu.'
                            : 'Xem lượng còn thiếu và các mục chưa rõ bên dưới.'}
                      </p>
                      {m.missing.length > 0 && (
                        <p className="missing">
                          <strong>Còn thiếu: </strong>
                          {m.missing
                            .map(
                              (i) =>
                                `${i.name}${i.quantity ? ` (${i.quantity}${i.unit})` : ' (cần kiểm tra lượng)'}`,
                            )
                            .join(', ')}
                        </p>
                      )}
                      {m.unknown.length > 0 && (
                        <p className="tiny muted">Chưa rõ lượng: {m.unknown.join(', ')}</p>
                      )}
                      <Link className="text-link" to={`/cong-thuc/${m.recipe.slug}`}>
                        Xem công thức <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                ))}
              </>
            ) : (
              <div className="match-welcome">
                <div className="welcome-icon">
                  <Sprout size={45} strokeWidth={1.2} />
                </div>
                <h2>
                  Một chút nguyên liệu,
                  <br />
                  nhiều cách để bắt đầu.
                </h2>
                <p>
                  Thêm nguyên liệu ở bên trái, chọn số phần và tìm món. Bạn sẽ thấy rõ phần đang có, còn thiếu
                  và chưa xác nhận.
                </p>
                <span className="tiny">
                  Gợi ý dựa trên dữ liệu công thức · không dùng AI để đoán định lượng.
                </span>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Interactive Cooking Modal for AI Suggested Dishes */}
      {cookingDish && (
        <Modal title={cookingDish.title} onClose={() => setCookingDish(null)}>
          <div className="modal-content stack" style={{ maxWidth: '580px' }}>
            <div className="cook-progress">
              {cookingDish.steps.map((item, index) => (
                <button
                  key={item.order}
                  aria-label={`Đến bước ${index + 1}`}
                  className={index <= cookStep ? 'done' : ''}
                  onClick={() => setCookStep(index)}
                />
              ))}
            </div>

            <article className="cook-card">
              <span className="eyebrow">
                BƯỚC {cookStep + 1} / {cookingDish.steps.length}
              </span>
              <h2>{cookingDish.steps[cookStep]?.title}</h2>
              <p>{cookingDish.steps[cookStep]?.instruction}</p>

              <button
                type="button"
                className="btn secondary"
                onClick={() => speakCurrentStep(cookingDish.steps[cookStep]?.instruction || '')}
              >
                {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                {speaking ? 'Dừng đọc' : 'Đọc bước này'}
              </button>
            </article>

            <div className="cook-controls">
              <button
                type="button"
                className="btn secondary"
                disabled={cookStep === 0}
                onClick={() => setCookStep(cookStep - 1)}
              >
                <ChevronLeft size={18} />
                Bước trước
              </button>
              {cookStep < cookingDish.steps.length - 1 ? (
                <button type="button" className="btn" onClick={() => setCookStep(cookStep + 1)}>
                  Bước tiếp theo
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button type="button" className="btn" onClick={() => setCookingDish(null)}>
                  Hoàn thành
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
