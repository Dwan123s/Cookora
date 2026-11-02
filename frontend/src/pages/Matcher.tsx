import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowLeftRight,
  Bot,
  Check,
  ChefHat,
  CheckCircle2,
  Clock3,
  CookingPot,
  Info,
  Leaf,
  LoaderCircle,
  PackageOpen,
  Plus,
  Salad,
  Search,
  Sparkles,
  Utensils,
  Users,
  X,
  Zap,
  Heart,
} from 'lucide-react';
import type {
  AiChefSuggestionResponse,
  AiSuggestedDish,
  Ingredient,
  MatchResult,
  Recipe,
} from '@cookora/contracts';
import { ApiError, request } from '../api';
import { errorText, Modal } from '../shared';
import { matcherMedia } from '../matcher-media';
import '../matcher-reference.css';
import { PantryCatalog } from '../components/PantryCatalog';

const popular = [
  { name: 'Trứng', icon: '🥚' },
  { name: 'Cà chua', icon: '🍅' },
  { name: 'Đậu hũ', icon: '🧈' },
  { name: 'Thịt gà', icon: '🍗' },
];
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
function matchIngredient(label: string, ingredients: Ingredient[]) {
  const name = normalize(label);
  return (
    ingredients.find((i) => [i.name, ...i.aliases].some((v) => normalize(v) === name)) ||
    ingredients.find((i) => normalize(i.name).startsWith(name + ' '))
  );
}
function thumbnail(recipe: Recipe) {
  return matcherMedia(recipe).src;
}
function DishPhoto({ src, title }: { src?: string; title: string }) {
  return (
    <div className="pantry-dish-photo">
      <CookingPot size={34} aria-hidden="true" />
      {src && (
        <img
          src={src}
          alt={title}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      )}
    </div>
  );
}
export function Matcher() {
  const [mode, setMode] = useState<'pantry' | 'ai'>('pantry');
  const [selected, setSelected] = useState<string[]>(popular.map((i) => i.name));
  const [pantrySelected, setPantrySelected] = useState<string[]>(['Cà chua', 'Trứng', 'Thịt heo', 'Xà lách']);
  const activeSelected = mode === 'pantry' ? pantrySelected : selected;
  const [chatMessage, setChatMessage] = useState('');
  const [prompt, setPrompt] = useState('');
  const [appliedText, setAppliedText] = useState('');
  const [servings, setServings] = useState(2);
  const [addOpen, setAddOpen] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [detail, setDetail] = useState<AiSuggestedDish | null>(null);
  const [pantryFeedback, setPantryFeedback] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const ingredients = useQuery({
    queryKey: ['ingredients'],
    queryFn: () => request<Ingredient[]>('/ingredients'),
  });
  const items = ingredients.data?.data || [];
  const matchedIds = useMemo(() => {
    const ids = activeSelected
      .map((name) => matchIngredient(name, items)?.id)
      .filter((id): id is string => !!id);
    if (appliedText) {
      const text = ' ' + normalize(appliedText) + ' ';
      items.forEach((i) => {
        if (
          [i.name, ...i.aliases].some(
            (alias) => normalize(alias).length > 2 && text.includes(' ' + normalize(alias) + ' '),
          )
        )
          ids.push(i.id);
      });
    }
    return [...new Set(ids)].slice(0, 50);
  }, [activeSelected, items, appliedText]);
  const matches = useQuery({
    queryKey: ['pantry-reference-matches', matchedIds, servings],
    queryFn: () =>
      request<MatchResult[]>('/recipes/match', {
        method: 'POST',
        body: { mode: 'identity', servings, items: matchedIds.map((ingredientId) => ({ ingredientId })) },
      }),
    enabled: matchedIds.length > 0,
  });
  const ai = useMutation({
    mutationFn: (text: string) =>
      request<AiChefSuggestionResponse>('/ai/suggest-recipes', {
        method: 'POST',
        body: { prompt: text, servings },
      }),
  });
  const toggle = (name: string) => {
    const updateSelected = mode === 'pantry' ? setPantrySelected : setSelected;
    updateSelected((previous) =>
      previous.includes(name)
        ? previous.filter((i) => i !== name)
        : previous.length < 50
          ? [...previous, name]
          : previous,
    );
    ai.reset();
    setPantryFeedback('');
  };
  const ingredientContext =
    mode === 'pantry' ? pantrySelected.join(', ') : prompt.trim() || selected.join(', ');
  const submit = () => {
    setPantryFeedback('');
    if (mode === 'ai') ai.mutate(ingredientContext);
    else {
      setAppliedText(prompt.trim());
      ai.reset();
      if (!matchedIds.length && !prompt.trim())
        setPantryFeedback('Hãy chọn ít nhất một nguyên liệu để tìm món.');
      else if (!prompt.trim()) void matches.refetch();
    }
  };
  const ask = (question: string) => {
    const text =
      `Nguyên liệu đang có: ${ingredientContext || 'trứng, cà chua, đậu hũ'}. Yêu cầu: ${question}`.slice(
        0,
        1000,
      );
    setMode('ai');
    setPrompt(text);
    ai.mutate(text);
  };
  const catalogResults = matches.data?.data.slice(0, 3) || [];
  const aiResults = ai.data?.data.dishes.slice(0, 3);
  const searchResults = items
    .filter((i) => normalize(i.name).includes(normalize(ingredientSearch)))
    .slice(0, 16);
  const aiError =
    ai.error instanceof ApiError && ai.error.code === 'AI_NOT_CONFIGURED'
      ? 'Trợ lý AI chưa sẵn sàng. Bạn vẫn có thể tìm món từ kho nguyên liệu.'
      : errorText(ai.error);
  return (
    <main className={`pantry-reference${mode === 'pantry' ? ' is-pantry-mode' : ''}`}>
      <section className="pantry-hero" aria-labelledby="pantry-title">
        <div className="pantry-hero-copy">
          <p className="pantry-eyebrow">— CÓ GÌ NẤU NẤY</p>
          <div className="pantry-title-row">
            <h1 id="pantry-title">Có gì nấu nấy</h1>
            <span className="pantry-rays" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
          {mode === 'pantry' ? (
            <p>
              Nhập các nguyên liệu bạn đang có, Cookora sẽ gợi ý món ngon phù hợp,
              <br className="pantry-wide-break" /> tận dụng tối đa và hạn chế lãng phí thực phẩm.
            </p>
          ) : (
            <p>
              Nhập nguyên liệu bạn đang có. Cookora sẽ đối chiếu công thức và gợi ý món phù hợp
              <br className="pantry-wide-break" /> hoặc đề xuất cách biến tấu với Trợ lý AI Groq.
            </p>
          )}
          <div className="pantry-tabs" aria-label="Cách tìm món">
            <button
              type="button"
              aria-pressed={mode === 'pantry'}
              disabled={ai.isPending}
              onClick={() => {
                setMode('pantry');
                ai.reset();
              }}
            >
              <PackageOpen size={23} />
              Kho nguyên liệu
            </button>
            <button
              type="button"
              disabled={ai.isPending}
              aria-pressed={mode === 'ai'}
              onClick={() => setMode('ai')}
            >
              <Zap size={24} />
              Trợ lý AI (Groq)
            </button>
          </div>
        </div>
        <img
          className="pantry-board"
          src="/images/matcher-ingredients-board.webp"
          alt="Thớt nguyên liệu với cá hồi, trứng và rau củ tươi"
        />
        <aside className="pantry-note">
          <ChefHat size={32} aria-hidden="true" />
          <p>
            Biến nguyên liệu sẵn có
            <br /> thành bữa ăn ngon,
            <br /> đơn giản và phù hợp.
          </p>
        </aside>
        <Leaf className="pantry-hero-leaf" aria-hidden="true" />
      </section>
      <div className="pantry-workspace">
        {mode === 'pantry' ? (
          <PantryCatalog
            ingredients={items}
            selected={pantrySelected}
            onToggle={toggle}
            matches={matches.data?.data || []}
            loading={ingredients.isPending || (matchedIds.length > 0 && matches.isPending)}
            error={ingredients.error || matches.error}
            onRetry={() => {
              void ingredients.refetch();
              void matches.refetch();
            }}
            servings={servings}
            onServings={setServings}
          />
        ) : (
          <>
            <section className="pantry-input-card pantry-surface" aria-labelledby="pantry-input-title">
              <h2 id="pantry-input-title">
                <Zap aria-hidden="true" />
                {mode === 'ai' ? 'Nhập nguyên liệu để AI gợi ý món' : 'Kho nguyên liệu của bạn'}
              </h2>
              <p className="pantry-input-description">
                Gõ các nguyên liệu bạn đang có trong tủ lạnh, ví dụ: 2 quả trứng, 1 cà chua, đậu hũ, hành lá.{' '}
                {mode === 'ai'
                  ? 'AI sẽ gợi ý món phù hợp, nguyên liệu còn thiếu và cách nấu ngắn gọn.'
                  : 'Chọn nguyên liệu để đối chiếu với các công thức có trong Cookora.'}
              </p>
              <div className="pantry-chips" aria-label="Nguyên liệu đang có">
                {popular.map((item) => (
                  <button
                    type="button"
                    key={item.name}
                    aria-pressed={selected.includes(item.name)}
                    onClick={() => toggle(item.name)}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    {item.name}
                  </button>
                ))}
                {selected
                  .filter((name) => !popular.some((i) => i.name === name))
                  .map((name) => (
                    <button type="button" key={name} aria-pressed="true" onClick={() => toggle(name)}>
                      {name}
                      <X size={13} />
                      <span className="pantry-sr-only">Bỏ nguyên liệu</span>
                    </button>
                  ))}
                <button type="button" className="pantry-add" onClick={() => setAddOpen(true)}>
                  <Plus size={16} />
                  Thêm nguyên liệu
                </button>
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submit();
                }}
              >
                <label className="pantry-sr-only" htmlFor="pantry-prompt">
                  Nguyên liệu và yêu cầu nấu ăn
                </label>
                <textarea
                  id="pantry-prompt"
                  ref={inputRef}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="Ví dụ: 2 quả trứng, 1 cà chua, 200g đậu hũ, hành lá, 1 ít thịt băm..."
                />
                <div className="pantry-how">
                  <h3>3 bước đơn giản, nhận gợi ý ngay</h3>
                  <div className="pantry-steps">
                    <div>
                      <Salad />
                      <span>
                        <strong>1. Nhập nguyên liệu</strong>
                        <small>Gõ những gì bạn đang có</small>
                      </span>
                    </div>
                    <ArrowRight className="pantry-step-arrow" />
                    <div>
                      <Sparkles />
                      <span>
                        <strong>2. {mode === 'ai' ? 'AI phân tích' : 'Đối chiếu công thức'}</strong>
                        <small>
                          Đối chiếu công thức
                          <br />
                          và đề xuất phù hợp
                        </small>
                      </span>
                    </div>
                    <ArrowRight className="pantry-step-arrow" />
                    <div>
                      <CookingPot />
                      <span>
                        <strong>3. Nhận gợi ý món</strong>
                        <small>
                          Xem món gợi ý, nguyên liệu
                          <br />
                          còn thiếu và cách nấu
                        </small>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pantry-controls">
                  <label htmlFor="pantry-servings">
                    <Users size={15} />
                    Khẩu phần
                  </label>
                  <select
                    id="pantry-servings"
                    value={servings}
                    onChange={(event) => setServings(Number(event.target.value))}
                  >
                    {Array.from({ length: 20 }, (_, index) => (
                      <option key={index} value={index + 1}>
                        {index + 1} người
                      </option>
                    ))}
                  </select>
                  <span>{selected.length} nguyên liệu đã chọn</span>
                </div>
                <button
                  type="submit"
                  className="pantry-primary"
                  disabled={ai.isPending || ingredients.isPending || !ingredientContext.trim()}
                >
                  {ai.isPending ? <LoaderCircle className="spin" size={21} /> : <Sparkles size={22} />}
                  <span>
                    {ai.isPending
                      ? 'Đang chuẩn bị gợi ý…'
                      : mode === 'ai'
                        ? 'Đề xuất món với AI'
                        : 'Tìm món từ nguyên liệu'}
                  </span>
                  <ArrowRight size={22} />
                </button>
                <p className="pantry-input-hint">
                  <Info size={15} />
                  Bạn có thể nhập nguyên liệu tự do theo câu văn, không cần đúng định dạng.
                </p>
                {pantryFeedback && (
                  <p className="pantry-feedback" role="status">
                    {pantryFeedback}
                  </p>
                )}
                {ai.isError && (
                  <div className="pantry-feedback is-error" role="alert">
                    <p>{aiError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('pantry');
                        ai.reset();
                        setAppliedText(prompt);
                      }}
                    >
                      Tìm trong kho công thức <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </form>
            </section>
            <section
              className="pantry-results"
              aria-labelledby="pantry-results-title"
              aria-busy={ai.isPending || matches.isFetching}
            >
              <div className="pantry-results-heading">
                <h2 id="pantry-results-title">
                  <Utensils />
                  Gợi ý món cho bạn
                </h2>
                <span>{aiResults ? 'Từ trợ lý AI' : 'Từ kho công thức'}</span>
              </div>
              {ai.isPending ? (
                <div className="pantry-result-status" role="status">
                  <LoaderCircle className="spin" />
                  <p>Trợ lý đang lên ý tưởng bữa ăn cho bạn…</p>
                </div>
              ) : aiResults ? (
                aiResults.length ? (
                  aiResults.map((dish) => (
                    <button
                      className="pantry-dish-card pantry-ai-dish"
                      key={dish.id}
                      type="button"
                      onClick={() => setDetail(dish)}
                    >
                      <DishPhoto title={dish.title} />
                      <div className="pantry-dish-content">
                        <h3>{dish.title}</h3>
                        <div className="pantry-badges">
                          <span>
                            <Sparkles size={13} />
                            Gợi ý AI
                          </span>
                          <span className="pantry-missing">
                            {dish.pantryIngredientsNeeded.length} gia vị cần thêm
                          </span>
                        </div>
                        <p className="pantry-dish-meta">
                          <span>
                            <Clock3 size={15} />
                            {dish.totalMinutes} phút
                          </span>
                          <span>
                            <Users size={15} />
                            {dish.servings} người
                          </span>
                        </p>
                      </div>
                      <span className="pantry-dish-arrow">
                        <ArrowRight size={17} />
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="pantry-result-status">
                    Chưa có món phù hợp. Hãy thêm nguyên liệu và thử lại.
                  </div>
                )
              ) : matches.isPending && matchedIds.length ? (
                <div className="pantry-result-status">
                  <LoaderCircle className="spin" />
                  <p>Đang tìm món từ nguyên liệu của bạn…</p>
                </div>
              ) : matches.isError || ingredients.isError ? (
                <div className="pantry-result-status" role="alert">
                  <p>{errorText(matches.error || ingredients.error)}</p>
                  <button
                    type="button"
                    onClick={() => {
                      void ingredients.refetch();
                      void matches.refetch();
                    }}
                  >
                    Thử lại
                  </button>
                </div>
              ) : catalogResults.length ? (
                catalogResults.map((result) => (
                  <Link
                    className="pantry-dish-card"
                    key={result.recipe.id}
                    to={`/cong-thuc/${result.recipe.slug}`}
                  >
                    <DishPhoto src={thumbnail(result.recipe)} title={result.recipe.title} />
                    <div className="pantry-dish-content">
                      <h3>{result.recipe.title}</h3>
                      <div className="pantry-badges">
                        <span>
                          <CheckCircle2 size={13} />
                          Phù hợp {Math.round(result.score)}%
                        </span>
                        <span className={result.missing.length ? 'pantry-missing' : ''}>
                          {result.missing.length
                            ? `Thiếu ${result.missing.length} nguyên liệu`
                            : 'Đủ loại nguyên liệu'}
                        </span>
                      </div>
                      <p className="pantry-dish-meta">
                        <span>
                          <Clock3 size={15} />
                          {result.recipe.totalMinutes ?? '—'} phút
                        </span>
                        <span>
                          <Users size={15} />
                          {result.recipe.baseServings} người
                        </span>
                      </p>
                    </div>
                    <span className="pantry-dish-arrow">
                      <ArrowRight size={17} />
                    </span>
                  </Link>
                ))
              ) : (
                <div className="pantry-result-status">
                  <CookingPot />
                  <p>Chọn nguyên liệu để tìm món phù hợp.</p>
                </div>
              )}
              {catalogResults.length > 0 && !aiResults && !ai.isPending && (
                <p className="pantry-results-note">
                  Đối chiếu theo tên nguyên liệu. Mở công thức để kiểm tra định lượng và gia vị còn thiếu.
                </p>
              )}
            </section>
          </>
        )}
        <aside className="pantry-assistant pantry-surface" aria-labelledby="pantry-assistant-title">
          <div className="pantry-assistant-top">
            <h2 id="pantry-assistant-title">
              <Bot />
              {mode === 'pantry' ? 'Trợ lý nấu ăn AI' : 'Trợ lý AI (Groq)'}
            </h2>
            <img src="/images/matcher-bear-chef.webp" alt="Gấu đầu bếp Cookora" />
            <div className="pantry-greeting">
              {mode === 'pantry' ? (
                <>Bạn cần mình gợi ý, thay thế nguyên liệu hay biến tấu món ăn không? Cứ hỏi mình nhé!</>
              ) : (
                <>
                  Tôi là Trợ lý bếp AI Groq.
                  <br />
                  Bạn có thể hỏi nhanh hoặc nhập nguyên liệu để nhận gợi ý món ngay nhé!
                </>
              )}
            </div>
          </div>
          <h3 className="pantry-quick-heading">
            <Sparkles />
            Gợi ý câu hỏi nhanh
          </h3>
          <div className="pantry-quick-questions">
            <button
              type="button"
              disabled={ai.isPending}
              onClick={() => ask('Tôi có thể nấu gì với những nguyên liệu này?')}
            >
              <Leaf />
              <span>Tôi có thể nấu gì với nguyên liệu này?</span>
              <ArrowRight />
            </button>
            <button
              type="button"
              disabled={ai.isPending}
              onClick={() => ask('Hãy gợi ý món thay thịt heo bằng gà và điều chỉnh cách nấu.')}
            >
              <ArrowLeftRight />
              <span>Thay thịt heo bằng gà được không?</span>
              <ArrowRight />
            </button>
            <button
              type="button"
              disabled={ai.isPending}
              onClick={() =>
                ask(
                  'Gợi ý món Eat Fit nhẹ nhàng, mục tiêu dưới 400 kcal mỗi phần; nếu chưa có dữ liệu năng lượng thì nói rõ đây chỉ là ước tính.',
                )
              }
            >
              <Utensils />
              <span>Gợi ý món Eat Fit dưới 400 kcal</span>
              <ArrowRight />
            </button>
          </div>
          {mode === 'pantry' && (
            <form
              className="pantry-chat-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (chatMessage.trim()) ask(chatMessage.trim());
              }}
            >
              <label className="pantry-sr-only" htmlFor="pantry-chat">
                Hỏi thêm về món ăn
              </label>
              <input
                id="pantry-chat"
                value={chatMessage}
                onChange={(event) => setChatMessage(event.target.value)}
                placeholder="Hỏi thêm về món ăn..."
                maxLength={500}
              />
              <button aria-label="Gửi câu hỏi" type="submit" disabled={!chatMessage.trim() || ai.isPending}>
                <ArrowRight size={19} />
              </button>
            </form>
          )}
        </aside>
      </div>
      {ai.data?.data && (
        <section className="pantry-ai-overview pantry-surface" aria-live="polite">
          <h2>
            <Sparkles />Ý tưởng bữa ăn của bạn
          </h2>
          <p>{ai.data.data.menuOverview}</p>
          <div className="pantry-ai-detail-list">
            {ai.data.data.dishes.map((dish) => (
              <button type="button" key={dish.id} onClick={() => setDetail(dish)}>
                {dish.title}
                <ArrowRight size={17} />
              </button>
            ))}
          </div>
        </section>
      )}
      <section className="pantry-values" aria-label="Nấu ăn dễ dàng cùng Cookora">
        {[
          { Icon: Leaf, title: 'Tận dụng nguyên liệu sẵn có', text: 'Hạn chế lãng phí thực phẩm' },
          { Icon: Zap, title: 'Gợi ý nhanh với AI', text: 'Đa dạng, phù hợp khẩu vị' },
          { Icon: CookingPot, title: 'Công thức dễ làm', text: 'Chi tiết, rõ ràng từng bước' },
          { Icon: Heart, title: 'Linh hoạt theo nhu cầu', text: 'Ăn ngon, tiết kiệm, lành mạnh' },
        ].map(({ Icon, title, text }) => (
          <div key={title}>
            <Icon strokeWidth={1.3} />
            <span>
              <strong>{title}</strong>
              <small>{text}</small>
            </span>
          </div>
        ))}
      </section>
      {addOpen && (
        <Modal title="Thêm nguyên liệu" onClose={() => setAddOpen(false)}>
          <label className="pantry-modal-search">
            <Search size={18} />
            <input
              autoFocus
              placeholder="Tìm nguyên liệu..."
              aria-label="Tìm nguyên liệu"
              value={ingredientSearch}
              onChange={(event) => setIngredientSearch(event.target.value)}
            />
          </label>
          <div className="pantry-ingredient-options">
            {searchResults.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => toggle(item.name)}
                aria-pressed={selected.includes(item.name)}
              >
                {item.name}
                {selected.includes(item.name) ? <Check size={17} /> : <Plus size={17} />}
              </button>
            ))}
            {!searchResults.length && (
              <p>Không tìm thấy nguyên liệu. Bạn có thể nhập trực tiếp ở ô gợi ý AI.</p>
            )}
          </div>
          <button className="pantry-primary" type="button" onClick={() => setAddOpen(false)}>
            Xong <Check size={17} />
          </button>
        </Modal>
      )}
      {detail && (
        <Modal title={detail.title} onClose={() => setDetail(null)}>
          <div className="pantry-recipe-detail">
            <p>{detail.summary}</p>
            <p className="pantry-dish-meta">
              <span>
                <Clock3 size={16} />
                {detail.totalMinutes} phút
              </span>
              <span>
                <Users size={16} />
                {detail.servings} người
              </span>
            </p>
            <h3>Nguyên liệu đã có</h3>
            <ul>
              {detail.usedIngredients.map((item, index) => (
                <li key={index}>
                  {item.name} · {[item.quantity, item.unit].filter(Boolean).join(' ')}
                  {item.note ? ` (${item.note})` : ''}
                </li>
              ))}
            </ul>
            <h3>Gia vị cần thêm</h3>
            <ul>
              {detail.pantryIngredientsNeeded.map((item, index) => (
                <li key={index}>
                  {item.name} · {[item.quantity, item.unit].filter(Boolean).join(' ')}
                </li>
              ))}
            </ul>
            <h3>Cách làm</h3>
            <ol>
              {detail.steps.map((step) => (
                <li key={step.order}>
                  <strong>{step.title}</strong>
                  <p>{step.instruction}</p>
                </li>
              ))}
            </ol>
          </div>
        </Modal>
      )}
    </main>
  );
}
