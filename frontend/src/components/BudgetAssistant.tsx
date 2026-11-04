import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, Coins, LoaderCircle, RefreshCw, ShoppingBasket } from 'lucide-react';
import type { BudgetSuggestionInput, BudgetSuggestionResponse } from '@cookora/contracts';
import { request } from '../api';
import { errorText } from '../shared';
import { money } from '../tool-data';
import { recipeMedia } from '../recipe-media';
import '../budget-assistant.css';

export function BudgetAssistant({
  input,
  valid,
  renderSettings,
}: {
  input: Omit<BudgetSuggestionInput, 'preferences' | 'region'>;
  valid: boolean;
  renderSettings: (pending: boolean) => ReactNode;
}) {
  const [region, setRegion] = useState('Việt Nam');
  const [preferences, setPreferences] = useState('');
  const current = { ...input, region: region.trim(), preferences: preferences.trim() };
  const signature = JSON.stringify(current);
  const ai = useMutation({
    mutationFn: (body: BudgetSuggestionInput) =>
      request<BudgetSuggestionResponse>('/ai/suggest-budget', { method: 'POST', body }),
  });
  const response = ai.data?.data;
  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!response) return;
    resultsRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    });
  }, [response]);
  const stale = !!response && JSON.stringify(response.input) !== signature;
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (valid && !ai.isPending) ai.mutate(current);
  }
  return (
    <section className="budget-ai budget-ai-workflow" aria-label="Gợi ý món theo ngân sách">
      <form className="budget-ai-form" onSubmit={submit} aria-busy={ai.isPending}>
        {renderSettings(ai.isPending)}
        <details className="budget-ai-preferences tools-card">
          <summary>Thêm sở thích và nơi mua thực phẩm (tùy chọn)</summary>
          <div className="budget-ai-heading">
            <div>
              <p className="tools-eyebrow">COOKORA AI</p>
              <h2 id="budget-ai-heading">Điều chỉnh món AI gợi ý</h2>
              <p>Ngân sách ở trên là căn cứ chọn món. Thêm sở thích hoặc nơi mua để AI gợi ý phù hợp hơn.</p>
            </div>
          </div>
          <div className="budget-ai-inputs">
            <label htmlFor="budget-region">
              Bạn thường mua thực phẩm ở đâu?
              <input
                id="budget-region"
                value={region}
                maxLength={120}
                placeholder="Ví dụ: TP.HCM, chợ dân sinh"
                onChange={(e) => setRegion(e.target.value)}
              />
            </label>
            <label htmlFor="budget-preferences">
              Sở thích hoặc nguyên liệu đang có <span>(tùy chọn)</span>
              <textarea
                id="budget-preferences"
                rows={2}
                maxLength={1200}
                value={preferences}
                placeholder="Ví dụ: thích món Việt, ít cay, đã có gạo và trứng, tránh thịt bò…"
                onChange={(e) => setPreferences(e.target.value)}
              />
            </label>
          </div>
        </details>
        <div className="budget-ai-actions">
          <p>
            {valid
              ? `${money(input.mode === 'day' ? input.amount * input.days : input.amount)} · ${input.people} người · ${input.days} ngày · ${input.mealsPerDay} bữa/ngày`
              : 'Nhập ngân sách hợp lệ từ 1.000 đ để tạo đề xuất.'}
          </p>
          <button className="tools-primary" type="submit" disabled={!valid || ai.isPending}>
            {ai.isPending ? (
              <LoaderCircle className="spin" size={18} />
            ) : response ? (
              <RefreshCw size={17} />
            ) : null}
            {ai.isPending
              ? 'AI đang chọn món…'
              : response
                ? 'Gợi ý lại theo ngân sách'
                : 'Gợi ý món theo ngân sách'}
          </button>
        </div>
        {ai.isPending && (
          <p className="budget-ai-status" role="status">
            AI đang cân đối các bữa và nguyên liệu dùng chung. Thường mất khoảng 30–90 giây.
          </p>
        )}
        {ai.isError && (
          <p className="budget-ai-error" role="alert">
            {errorText(ai.error)} Bạn có thể bấm đề xuất lại.
          </p>
        )}
      </form>

      <div ref={resultsRef} className="budget-ai-result-anchor">
        {response && (
          <BudgetPlanResult
            key={response.generatedAt}
            response={response}
            stale={stale}
            busy={ai.isPending}
          />
        )}
      </div>
    </section>
  );
}

export function BudgetPlanResult({
  response,
  stale = false,
  busy = false,
}: {
  response: BudgetSuggestionResponse;
  stale?: boolean;
  busy?: boolean;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const days = Array.from({ length: response.input.days }, (_, i) => i + 1);
  return (
    <div className="budget-ai-results" aria-live="polite" aria-busy={busy}>
      {stale && (
        <p className="budget-ai-stale" role="status">
          Bạn đã đổi thiết lập. Kết quả bên dưới dành cho {response.input.people} người, {response.input.days}{' '}
          ngày, {response.input.mealsPerDay} bữa/ngày với ngân sách {money(response.budget)}. Bấm “Gợi ý lại
          theo ngân sách” để cập nhật.
        </p>
      )}
      <div className="budget-ai-overview tools-card">
        <div className="tools-section-head">
          <h2>Thực đơn AI đề xuất</h2>
          <span>
            {response.input.days} ngày · {response.meals.length} bữa · {response.input.people} người
          </span>
        </div>
        <p>{response.overview}</p>
        <div className="budget-ai-totals">
          <div>
            <span>Ngân sách đã dùng để lập</span>
            <strong>{money(response.budget)}</strong>
          </div>
          <div>
            <span>Tổng chi phí AI ước tính</span>
            <strong>~ {money(response.estimatedTotal)}</strong>
          </div>
          <div className={response.withinBudget ? 'is-within' : 'is-over'}>
            <span>{response.withinBudget ? 'Dự phòng ước tính' : 'Vượt ngân sách ước tính'}</span>
            <strong>{money(Math.abs(response.remaining))}</strong>
          </div>
        </div>
        {!response.withinBudget && (
          <p className="budget-ai-error">
            Ước tính đang vượt hạn mức. Thử tăng ngân sách, giảm số bữa hoặc yêu cầu món đơn giản hơn.
          </p>
        )}
        <p className="budget-ai-price-note">
          <Coins size={16} />
          {response.priceNote}
        </p>
      </div>
      <div className="budget-ai-days">
        {days.map((day) => (
          <section className="budget-ai-day tools-card" key={day}>
            <h3>
              Ngày {day}
              <span>
                ~{' '}
                {money(
                  response.meals.filter((m) => m.day === day).reduce((sum, m) => sum + m.estimatedCost, 0),
                )}
              </span>
            </h3>
            {response.meals
              .filter((meal) => meal.day === day)
              .map((meal) => (
                <div className="budget-ai-meal" key={meal.meal}>
                  <div className="budget-ai-meal-heading">
                    <b>Bữa {meal.meal}</b>
                    <span>
                      ~ {money(meal.estimatedCost)} / {response.input.people} người
                    </span>
                  </div>
                  {meal.dishes.map(({ recipe, estimatedCost, reason }) => (
                    <article className="budget-ai-dish" key={recipe.id}>
                      <Link to={`/cong-thuc/${recipe.slug}`} tabIndex={-1}>
                        <img src={recipeMedia(recipe).src} alt={recipe.title} loading="lazy" />
                      </Link>
                      <div>
                        <Link to={`/cong-thuc/${recipe.slug}`}>
                          <h4>{recipe.title}</h4>
                        </Link>
                        <p>{reason}</p>
                        <span>
                          ~ {money(estimatedCost)}{' '}
                          <Link to={`/khau-phan/${recipe.slug}`}>
                            Xem định lượng <ArrowRight size={12} />
                          </Link>
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ))}
          </section>
        ))}
      </div>
      <details className="budget-ai-shopping tools-card" open>
        <summary>
          <ShoppingBasket size={20} /> Danh sách đi chợ{' '}
          <span>{response.shoppingList.length} nguyên liệu</span>
          <ChevronDown size={17} />
        </summary>
        <p>
          Lượng đã cộng cho toàn bộ thực đơn và {response.input.people} người. Đánh dấu những thứ bạn đã có;
          các lượng chưa rõ cần kiểm tra trong công thức.
        </p>
        <div className="budget-ai-shopping-grid">
          {response.shoppingList.map((item) => {
            const key = `${item.ingredientId}:${item.unit}`;
            return (
              <label key={key} className={checked[key] ? 'is-checked' : ''}>
                <input
                  type="checkbox"
                  checked={!!checked[key]}
                  onChange={(e) => setChecked((old) => ({ ...old, [key]: e.target.checked }))}
                />
                <span>
                  {item.name}
                  {item.note && <small>{item.note}</small>}
                </span>
                <strong>
                  {item.quantity === null
                    ? 'Chưa rõ lượng'
                    : `${item.quantity} ${item.unit === 'piece' ? 'đơn vị' : item.unit}`}
                </strong>
              </label>
            );
          })}
        </div>
      </details>
      {!!response.tips.length && (
        <div className="budget-ai-tips tools-card">
          <h3>
            <Check size={18} /> Mua sắm tiết kiệm hơn
          </h3>
          <ul>
            {response.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
