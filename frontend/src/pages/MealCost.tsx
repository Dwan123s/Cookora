import { useMemo, useState, type CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calculator,
  CalendarDays,
  Check,
  CircleHelp,
  Clock3,
  Coins,
  Leaf,
  Lightbulb,
  LoaderCircle,
  PiggyBank,
  ShoppingBag,
  Sun,
  Users,
  Wallet,
} from 'lucide-react';
import { FavoriteButton, Loading, ErrorState, useUser } from '../shared';
import { matcherMedia } from '../matcher-media';
import { recipeSummary } from '../recipe-media';
import { money, toolRecipes, useToolStorage } from '../tool-data';
import { budgetResult, isPriceBook, recipeCost, type PriceBook } from '../meal-cost';
import { RecipePriceEditor } from '../components/RecipePriceEditor';
import { BudgetAssistant } from '../components/BudgetAssistant';
import { useBudgetHistory } from '../use-budget-history';
import type { BudgetDraft } from '../budget-history';
import type { Recipe } from '@cookora/contracts';
import '../tools-reference.css';
const emptyPrices: PriceBook = [];
export function MealCost() {
  const user = useUser();
  return <MealCostWorkspace key={user?.id || 'guest'} accountId={user?.id || null} />;
}
function MealCostWorkspace({ accountId }: { accountId: string | null }) {
  const history = useBudgetHistory(accountId);
  const { mode, amounts, days, people, mealsPerDay: meals } = history.state.draft;
  const setDraft = (patch: Partial<BudgetDraft>) =>
    history.update((previous) => ({
      ...previous,
      draft: { ...previous.draft, ...patch },
    }));
  const setMode = (mode: BudgetDraft['mode']) => setDraft({ mode });
  const setDays = (days: number) => setDraft({ days });
  const setPeople = (people: number) => setDraft({ people });
  const setMeals = (mealsPerDay: number) => setDraft({ mealsPerDay });
  const [onlyPriced, setOnlyPriced] = useState(false),
    [more, setMore] = useState(false),
    [editing, setEditing] = useState<Recipe | null>(null);
  const prices = useToolStorage('ingredient-prices', emptyPrices, isPriceBook);
  const query = useQuery({ queryKey: ['recipes', 'tools'], queryFn: toolRecipes });
  const result = budgetResult(Number(amounts[mode]), mode, days, people, meals);
  const min = mode === 'week' ? 150000 : 30000,
    max = mode === 'week' ? 1000000 : 200000;
  const setAmount = (value: string) =>
    history.update((previous) => ({
      ...previous,
      draft: { ...previous.draft, amounts: { ...previous.draft.amounts, [mode]: value } },
    }));
  const all = useMemo(
    () => (query.data || []).map((recipe) => ({ recipe, cost: recipeCost(recipe, people, prices.value) })),
    [query.data, people, prices.value],
  );
  const suitable = all.filter(
    (r) => result && r.cost.perPerson !== null && r.cost.perPerson <= result.perMeal,
  );
  const unknown = all.filter((r) => !r.cost.complete);
  const orderedUnknown = [...unknown].sort((a, b) => a.recipe.title.localeCompare(b.recipe.title, 'vi'));
  const visible = [...suitable, ...(onlyPriced ? [] : orderedUnknown)].slice(0, more ? 12 : 4);
  const validBudget = !!result && Number(amounts[mode]) >= 1000;
  return (
    <main className="tools-reference budget-reference">
      <section className="tools-hero budget-hero">
        <div>
          <p className="tools-eyebrow">COOKORA AI · QUẢN LÝ TÚI TIỀN</p>
          <h1>Ngân sách của bạn, thực đơn AI lo</h1>
          <p>Chọn mức chi tiêu, AI đề xuất món và danh sách đi chợ cho từng bữa.</p>
        </div>
        <img src="/images/budget-hero.webp" alt="Giỏ rau củ, máy tính và đồng xu" />
      </section>
      <BudgetAssistant
        history={history}
        input={{ amount: Number(amounts[mode]), mode, days, people, mealsPerDay: meals }}
        valid={validBudget}
        renderSettings={(pending) => (
          <section className="budget-dashboard">
            <div className="tools-card budget-settings">
              <h2>
                <span className="tools-icon">
                  <Calculator />
                </span>
                Thiết lập ngân sách ăn uống
              </h2>
              <fieldset>
                <legend>Loại ngân sách</legend>
                <div className="tools-segment">
                  {(
                    [
                      { value: 'week', label: 'Gói tuần', icon: CalendarDays },
                      { value: 'day', label: 'Gói theo ngày', icon: Sun },
                    ] as const
                  ).map(({ value, label, icon: Icon }) => (
                    <button
                      type="button"
                      key={value}
                      aria-pressed={mode === value}
                      onClick={() => {
                        setMode(value);
                        setDays(value === 'week' ? 7 : 1);
                      }}
                    >
                      <Icon size={18} />
                      {label}
                      <Check
                        size={14}
                        aria-hidden="true"
                        style={{ visibility: mode === value ? 'visible' : 'hidden' }}
                      />
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="budget-amount">
                <label htmlFor="budget-amount">
                  {mode === 'week' ? `Tổng ngân sách cho ${days} ngày` : 'Ngân sách mỗi ngày'} (VNĐ)
                </label>
                <div>
                  <input
                    id="budget-amount"
                    type="text"
                    inputMode="numeric"
                    maxLength={15}
                    value={amounts[mode] ? Number(amounts[mode]).toLocaleString('vi-VN') : ''}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[.\s]/g, '');
                      if (/^\d*$/.test(digits)) setAmount(digits);
                    }}
                  />
                  <span>đ</span>
                </div>
              </div>
              <input
                className="budget-slider"
                type="range"
                aria-label="Điều chỉnh ngân sách"
                min={min}
                max={max}
                step="1000"
                value={Math.max(min, Math.min(max, Number(amounts[mode]) || min))}
                style={
                  {
                    '--range-progress': `${Math.max(0, Math.min(100, ((Number(amounts[mode]) - min) / (max - min)) * 100))}%`,
                  } as CSSProperties
                }
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="budget-presets">
                {[min, mode === 'week' ? 300000 : 50000, max].map((n, i) => (
                  <button type="button" key={n} onClick={() => setAmount(String(n))}>
                    {money(n)}
                    <small>{['Tiết kiệm', 'Tiêu chuẩn', 'Thoải mái'][i]}</small>
                  </button>
                ))}
              </div>
              <div className="budget-selects">
                <label>
                  Số người ăn
                  <select value={people} onChange={(e) => setPeople(Number(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option value={n} key={n}>
                        {n} người
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Số ngày dự kiến
                  <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <option value={n} key={n}>
                        {n} ngày{n === 7 ? ' (Cả tuần)' : ''}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Số bữa mỗi ngày
                  <select value={meals} onChange={(e) => setMeals(Number(e.target.value))}>
                    {[1, 2, 3, 4].map((n) => (
                      <option value={n} key={n}>
                        {n} bữa
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="budget-tip">
                <Lightbulb size={20} />
                <p>
                  <b>Mẹo chi tiêu:</b>{' '}
                  {result ? (
                    <>
                      Bạn có khoảng <strong>{money(result.perMeal)} / bữa / người</strong>.{' '}
                      {result.perMeal < 20000
                        ? 'Ưu tiên nguyên liệu theo mùa; kiểm tra giá trước khi chọn món.'
                        : result.perMeal < 40000
                          ? 'Mua theo danh sách, tận dụng nguyên liệu dùng chung giữa các bữa.'
                          : 'Đa dạng bữa ăn, chia khẩu phần trước khi mua để hạn chế dư thừa.'}
                    </>
                  ) : (
                    'Nhập ngân sách lớn hơn 0 và không quá 100 triệu đồng để xem phân bổ.'
                  )}
                </p>
              </div>
              <div className="budget-generate-action">
                <button className="tools-primary" type="submit" disabled={!validBudget || pending}>
                  {pending ? <LoaderCircle className="spin" size={18} /> : <Coins size={18} />}
                  {pending ? 'AI đang chọn món theo ngân sách…' : 'Gợi ý món theo ngân sách'}
                </button>
                <p>
                  {result
                    ? `AI chọn món cho ${people} người, ${days} ngày, ${meals} bữa/ngày trong tổng ${money(result.total)}.`
                    : 'Nhập ngân sách hợp lệ từ 1.000 đ đến 100 triệu đồng.'}
                </p>
              </div>
            </div>
            <div className="budget-results">
              <div className="budget-summary" aria-live="polite">
                <span className="budget-pill">
                  <PiggyBank size={14} />
                  Ngân sách AI dùng để chọn món
                </span>
                <h2>
                  {result ? Math.round(result.perMeal).toLocaleString('vi-VN') : '—'}{' '}
                  <span>đ / bữa / người</span>
                </h2>
                <p>
                  Tổng số bữa nấu dự kiến: <b>{result?.meals || '—'} bữa</b> ({days} ngày, {meals} bữa mỗi
                  ngày).
                </p>
                <div className="budget-stats">
                  {[
                    { icon: Coins, label: 'Tổng ngân sách', value: result ? money(result.total) : '—' },
                    { icon: Clock3, label: 'Bình quân mỗi ngày', value: result ? money(result.daily) : '—' },
                    { icon: Users, label: 'Khẩu phần', value: `${people} người` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label}>
                      <Icon />
                      <span>
                        {label}
                        <b>{value}</b>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="budget-split">
                  <span>Phân bổ đều {meals} bữa mỗi ngày</span>
                  <div>
                    {Array.from({ length: meals }, (_, i) => (
                      <i key={i} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="tools-card budget-plan">
                <span className="tools-icon">
                  <ShoppingBag />
                </span>
                <div>
                  <h3>Nhận món ăn phù hợp với túi tiền</h3>
                  <p>
                    Bấm “Gợi ý món theo ngân sách”. AI sẽ chọn món cho từng bữa, ước tính chi phí và gộp
                    nguyên liệu cần mua.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      />
      <details className="budget-manual">
        <summary>Tùy chọn: tự nhập giá để tính chi phí chi tiết</summary>
        <section className="budget-recipes">
          <div className="tools-section-head">
            <div>
              <h2>
                <span className="tools-icon">
                  <Leaf />
                </span>
                Món ngon vừa túi tiền
              </h2>
              <p>
                Hạn mức hiện tại: <b>{result ? money(result.perMeal) : '—'} / bữa / người</b>.
              </p>
            </div>
            <Link to="/cong-thuc">
              Xem tất cả công thức <ArrowRight size={15} />
            </Link>
          </div>
          {query.isPending ? (
            <Loading />
          ) : query.isError ? (
            <ErrorState error={query.error} retry={() => void query.refetch()} />
          ) : (
            <>
              <div className="budget-price-notice">
                <CircleHelp size={19} />
                <div>
                  <b>
                    {suitable.length
                      ? `${suitable.length} món có đủ giá và nằm trong hạn mức`
                      : 'Chưa thể gợi ý theo giá'}
                  </b>
                  <p>
                    {unknown.length
                      ? `${unknown.length} công thức chưa đủ giá hoặc định lượng. Các món bên dưới để bạn khám phá; chưa xác nhận phù hợp ngân sách.`
                      : 'Giá được tính từ định lượng công thức và bảng giá bạn nhập, không phải giá thị trường trực tiếp.'}
                  </p>
                </div>
                <label>
                  <input
                    type="checkbox"
                    checked={onlyPriced}
                    onChange={(e) => setOnlyPriced(e.target.checked)}
                  />
                  Chỉ món đủ giá
                </label>
              </div>
              {visible.length ? (
                <div className="budget-recipe-grid">
                  {visible.map(({ recipe: r, cost }) => {
                    const media = matcherMedia(r);
                    return (
                      <article className="budget-recipe tools-card" key={r.id}>
                        <div className="budget-recipe-photo">
                          <Link to={`/cong-thuc/${r.slug}`}>
                            <img src={media.src} alt={r.title} loading="lazy" />
                          </Link>
                          <span className="budget-recipe-badge">
                            <Leaf size={12} />
                            {cost.complete ? 'Trong hạn mức' : 'Khám phá món'}
                          </span>
                          <FavoriteButton recipe={r} overlay />
                        </div>
                        <div className="budget-recipe-body">
                          <Link to={`/cong-thuc/${r.slug}`}>
                            <h3>{r.title}</h3>
                          </Link>
                          {recipeSummary(r) && <p>{recipeSummary(r)}</p>}
                          <div className="budget-recipe-meta">
                            <span>
                              <Clock3 size={13} />
                              {r.totalMinutes === null
                                ? 'Chưa rõ thời gian'
                                : `${r.timingStatus === 'ESTIMATED' ? '~ ' : ''}${r.totalMinutes} phút`}
                            </span>
                            <span>
                              <Coins size={13} />
                              {cost.perPerson === null
                                ? 'Chưa có giá tham khảo'
                                : `~ ${money(cost.perPerson)} / người`}
                            </span>
                          </div>
                          <div className="budget-recipe-price">
                            <span>
                              {cost.known}/{cost.lines.length} nguyên liệu có giá
                            </span>
                            <button onClick={() => setEditing(r)}>
                              Cập nhật giá <ArrowRight size={13} />
                            </button>
                          </div>
                          {cost.complete && (
                            <p className="budget-purchase">
                              Dùng thực tế: {money(cost.usedTotal)} · Mua tròn gói:{' '}
                              {money(cost.purchaseTotal)} / {people} người
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="tools-empty">
                  <ShoppingBag />
                  <h3>Chưa có món đủ dữ liệu trong hạn mức</h3>
                  <p>Tắt bộ lọc để nhập giá nguyên liệu, hoặc tiếp tục khám phá công thức.</p>
                  <Link to="/cong-thuc" className="tools-primary">
                    Khám phá công thức <ArrowRight size={15} />
                  </Link>
                </div>
              )}
              {(!onlyPriced ? suitable.length + unknown.length : suitable.length) > 4 && (
                <button className="tools-more" onClick={() => setMore((v) => !v)}>
                  {more ? 'Thu gọn' : 'Xem thêm món'}
                </button>
              )}
            </>
          )}
          <p className="tools-footnote">
            Giá tham khảo do bạn nhập · Không tính nguyên liệu tùy chọn. {prices.scope}
          </p>
        </section>
      </details>
      {editing && (
        <RecipePriceEditor
          key={editing.id}
          recipe={editing}
          people={people}
          prices={prices.value}
          save={prices.save}
          onClose={() => setEditing(null)}
        />
      )}
    </main>
  );
}
