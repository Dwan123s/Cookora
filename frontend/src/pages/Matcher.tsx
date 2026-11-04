import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowRight,
  ChefHat,
  Clock3,
  CookingPot,
  Info,
  Leaf,
  LoaderCircle,
  Salad,
  Utensils,
  Users,
  Zap,
  Heart,
  History,
  RotateCcw,
  Check,
  Search,
} from 'lucide-react';
import type { AiChefSuggestionResponse, AiSuggestedDish, Recipe } from '@cookora/contracts';
import { ApiError, request } from '../api';
import { errorText, useUser } from '../shared';
import { AiDishDialog } from '../components/AiDishDialog';
import { matcherMedia } from '../matcher-media';
import { addMatcherResult, newMatcherDraft, restoreMatcherEntry } from '../matcher-history';
import { useMatcherHistory } from '../use-matcher-history';
import { AiSuggestionLoading } from '../components/LoadingStates';
import { RecipeImage } from '../components/RecipeImage';
import '../matcher-reference.css';

type SuggestionInput = { prompt: string; servings: number };

// Reuse the artwork in the supplied reference, keeping the page controls as live UI.
function ReferenceArt({ viewBox, className }: { viewBox: string; className: string }) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <image href="/images/matcher-reference-art.png" width="1672" height="941" />
    </svg>
  );
}

function DishPhoto({ recipe }: { recipe?: Recipe }) {
  return (
    <div className="pantry-dish-photo">
      <CookingPot size={34} aria-hidden="true" />
      {recipe && (
        <RecipeImage
          src={matcherMedia(recipe).src}
          alt={recipe.title}
          title={matcherMedia(recipe).credit}
        />
      )}
    </div>
  );
}
export function Matcher() {
  const user = useUser();
  return <MatcherWorkspace key={user?.id || 'guest'} accountId={user?.id || null} />;
}
function MatcherWorkspace({ accountId }: { accountId: string | null }) {
  const { state, saved, update } = useMatcherHistory(accountId);
  const { prompt, servings } = state.draft;
  const selected = state.history.find((entry) => entry.id === state.selectedId);
  const result = selected?.response;
  const changed = Boolean(selected && (selected.prompt !== prompt.trim() || selected.servings !== servings));
  const [detail, setDetail] = useState<AiSuggestedDish | null>(null);
  const ai = useMutation({
    mutationFn: (input: SuggestionInput) =>
      request<AiChefSuggestionResponse>('/ai/suggest-recipes', {
        method: 'POST',
        body: input,
      }),
    onSuccess: (response) => {
      update((previous) => addMatcherResult(previous, response.data, crypto.randomUUID()));
    },
  });
  const busy = ai.isPending;
  const resetFeedback = () => {
    ai.reset();
    setDetail(null);
  };
  const promptText = prompt.trim();
  const submit = () => {
    if (busy || promptText.length < 2) return;
    ai.reset();
    setDetail(null);
    ai.mutate({ prompt: promptText, servings });
  };
  const catalogDishes = result?.catalogDishes || [];
  const aiResults = result?.dishes.slice(0, 3);
  const aiError =
    ai.error instanceof ApiError && ai.error.code === 'AI_NOT_CONFIGURED'
      ? 'Trợ lý AI chưa sẵn sàng. Vui lòng thử lại sau.'
      : errorText(ai.error);
  return (
    <main className="pantry-reference pantry-with-floating-assistant pantry-photo-match">
      <div className="pantry-page-decoration" aria-hidden="true">
        <ReferenceArt className="pantry-corner-cloth" viewBox="0 62 132 190" />
        <ReferenceArt className="pantry-corner-leaves" viewBox="1535 62 137 125" />
        <ReferenceArt className="pantry-bottom-leaves" viewBox="0 650 98 160" />
        <span className="pantry-bottom-cloth" />
      </div>
      <section className="pantry-hero" aria-labelledby="pantry-title">
        <div className="pantry-hero-copy">
          <div className="pantry-title-row">
            <ChefHat className="pantry-title-hat" strokeWidth={1.5} aria-hidden="true" />
            <h1 id="pantry-title">Có gì nấu nấy</h1>
            <span className="pantry-rays" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
          <p>
            Nhập nguyên liệu bạn đang có. Cookora sẽ gợi ý món ngon,
            <br className="pantry-wide-break" /> đơn giản và phù hợp nhất cho bạn.
          </p>
        </div>
        <ReferenceArt className="pantry-board" viewBox="785 65 395 184" />
        <aside className="pantry-note">
          <p>
            Biến nguyên liệu sẵn có
            <br /> thành bữa ăn ngon,
            <br /> đơn giản và phù hợp.
          </p>
        </aside>
      </section>
      <div className="pantry-workspace">
        <section className="pantry-input-card pantry-surface" aria-labelledby="pantry-input-title">
          <h2 id="pantry-input-title">
            <Leaf aria-hidden="true" />
            Bạn đang có nguyên liệu gì?
            <ReferenceArt className="pantry-input-garnish" viewBox="684 265 121 47" />
          </h2>
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
              value={prompt}
              disabled={busy}
              onChange={(event) => {
                const value = event.target.value;
                update((previous) => ({ ...previous, draft: { ...previous.draft, prompt: value } }));
                resetFeedback();
              }}
              maxLength={1000}
              minLength={2}
              required
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
                  <Search />
                  <span>
                    <strong>2. AI phân tích</strong>
                    <small>
                      Ưu tiên công thức đơn giản,
                      <br />
                      phù hợp nguyên liệu
                    </small>
                  </span>
                </div>
                <ArrowRight className="pantry-step-arrow" />
                <div>
                  <CookingPot />
                  <span>
                    <strong>3. Chọn món phù hợp</strong>
                    <small>
                      Xem công thức từ AI đề
                      <br />
                      xuất ngay!
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
                disabled={busy}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  update((previous) => ({ ...previous, draft: { ...previous.draft, servings: value } }));
                  resetFeedback();
                }}
              >
                {Array.from({ length: 20 }, (_, index) => (
                  <option key={index} value={index + 1}>
                    {index + 1} người
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="pantry-primary" disabled={busy || promptText.length < 2}>
              {busy ? <LoaderCircle className="spin" size={21} /> : null}
              <span>{busy ? 'AI đang chuẩn bị gợi ý…' : 'Đề xuất món với AI'}</span>
              <ArrowRight size={22} />
            </button>
            <p className="pantry-input-hint">
              <Info size={15} />
              Bạn có thể viết tự nhiên tên nguyên liệu, số lượng và mong muốn về món ăn.
            </p>
            <div className="pantry-save-status" role="status">
              <span>
                {saved ? <Check size={15} /> : <Info size={15} />}
                {saved
                  ? 'Tự lưu trên trình duyệt này · tối đa 10 lần gợi ý'
                  : 'Trình duyệt chưa lưu được. Hãy giữ trang này để không mất kết quả.'}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  resetFeedback();
                  update(newMatcherDraft);
                }}
              >
                <RotateCcw size={14} />
                Bắt đầu mới
              </button>
            </div>
            {state.history.length > 0 && (
              <details className="pantry-history">
                <summary>
                  <History size={17} />
                  Gợi ý đã lưu ({state.history.length})
                </summary>
                <p>
                  Chọn một lần để mở lại nguyên liệu và toàn bộ cách nấu. Lịch sử được lưu riêng theo tài
                  khoản trên trình duyệt này.
                </p>
                <ul>
                  {state.history.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        disabled={busy}
                        aria-pressed={entry.id === state.selectedId}
                        onClick={() => {
                          resetFeedback();
                          update((previous) => restoreMatcherEntry(previous, entry.id));
                        }}
                      >
                        <strong>{entry.prompt}</strong>
                        <span>
                          {entry.servings} người ·{' '}
                          {new Date(entry.savedAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            )}
            {ai.isError && (
              <div className="pantry-feedback is-error" role="alert">
                <p>{aiError}</p>
                <button type="button" onClick={submit} disabled={busy || promptText.length < 2}>
                  Thử lại <ArrowRight size={15} />
                </button>
              </div>
            )}
          </form>
        </section>
        <section className="pantry-results" aria-labelledby="pantry-results-title" aria-busy={busy}>
          <div className="pantry-results-heading">
            <h2 id="pantry-results-title">
              <Utensils />
              Gợi ý món cho bạn
            </h2>
            <span>
               AI gợi ý
            </span>
          </div>
          {selected && (
            <p className="pantry-results-note pantry-saved-context">
              {changed
                ? 'Bạn đã đổi nguyên liệu hoặc khẩu phần. Kết quả bên dưới vẫn là lần gợi ý trước: '
                : 'Kết quả đã lưu cho: '}
              <strong>{selected.prompt}</strong> · {selected.servings} người.
              {changed && ' Nhấn “Đề xuất món với AI” để cập nhật.'}
            </p>
          )}
          {busy ? (
            <AiSuggestionLoading />
          ) : ai.isError && !result ? (
            <div className="pantry-result-status" role="alert">
              <p>Chưa lấy được gợi ý. Hãy thử lại ở phần nhập nguyên liệu.</p>
            </div>
          ) : result ? (
            <>
              <div className="pantry-suggestion-group">
                <h3>Ưu tiên món trong kho Cookora</h3>
                {catalogDishes.length ? (
                  catalogDishes.map(({ recipe, reason }) => (
                    <Link className="pantry-dish-card" key={recipe.id} to={`/cong-thuc/${recipe.slug}`}>
                      <DishPhoto recipe={recipe} />
                      <div className="pantry-dish-content">
                        <h3>{recipe.title}</h3>
                        <div className="pantry-badges">
                          <span>Trong kho Cookora</span>
                        </div>
                        <p className="pantry-catalog-note">{reason}</p>
                        <p className="pantry-dish-meta">
                          <span>
                            <Clock3 size={15} />
                            {recipe.totalMinutes ?? '—'} phút
                          </span>
                          <span>
                            <Users size={15} />
                            {recipe.baseServings} người (gốc)
                          </span>
                        </p>
                        {recipe.contentStatus === 'DRAFT' && (
                          <p className="pantry-catalog-note">Công thức mẫu chưa nấu thử.</p>
                        )}
                      </div>
                      <span className="pantry-dish-arrow">
                        <ArrowRight size={17} />
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="pantry-results-note">
                    AI chưa chọn được món phù hợp trong kho với yêu cầu này. Bạn có thể xem các gợi ý mới bên
                    dưới.
                  </p>
                )}
              </div>
              <div className="pantry-suggestion-group">
                <h3>Gợi ý thêm ngoài kho</h3>
                <p className="pantry-results-note">
                  Món mới do AI tạo, chưa được Cookora biên tập hoặc nấu thử.
                </p>
                {aiResults?.length ? (
                  aiResults.map((dish) => (
                    <button
                      className="pantry-dish-card pantry-ai-dish"
                      key={dish.id}
                      type="button"
                      onClick={() => setDetail(dish)}
                    >
                      <DishPhoto />
                      <div className="pantry-dish-content">
                        <h3>{dish.title}</h3>
                        <div className="pantry-badges">
                          <span>

                            Ngoài kho · AI
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
                  <p className="pantry-results-note">
                    Chưa có gợi ý mới ngoài kho. Bạn có thể bổ sung nguyên liệu và thử lại.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="pantry-result-status pantry-empty-state">
              <ReferenceArt className="pantry-empty-pot" viewBox="1040 370 330 177" />
              <div className="pantry-empty-copy">
                <h3>Chưa có gợi ý món ăn</h3>
                <span className="pantry-rays" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <p>
                  Hãy nhập nguyên liệu bạn đang có ở bên trái,
                  <br className="pantry-wide-break" /> Cookora sẽ gợi ý món ngon phù hợp cho bạn nhé!
                </p>
                <ReferenceArt className="pantry-empty-arrow" viewBox="951 603 86 36" />
              </div>
            </div>
          )}
        </section>
      </div>
      {result && (
        <section className="pantry-ai-overview pantry-surface" aria-live="polite">
          <h2>
            Ý tưởng bữa ăn của bạn
          </h2>
          <p>{result.menuOverview}</p>
          <div className="pantry-ai-detail-list">
            {result.dishes.map((dish) => (
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
      {detail && <AiDishDialog dish={detail} onClose={() => setDetail(null)} />}
    </main>
  );
}
