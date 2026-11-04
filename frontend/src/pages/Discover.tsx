import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Clock,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  CookingPot,
  SlidersHorizontal,
  RotateCcw,
  LayoutGrid,
} from 'lucide-react';
import { cuisineCategoryCounts, discoveryRecipe, loadRecipeCatalog } from '../recipe-catalog';
import { ErrorState, Loading, FavoriteButton } from '../shared';
import { RECIPE_PLACEHOLDER } from '../recipe-media';
import { paginationSlots } from '../pagination';

const CUISINES = [
  { label: 'Tất cả', code: '', icon: '' },
  { label: 'Việt Nam', code: 'VN', icon: '🇻🇳' },
  { label: 'Hàn Quốc', code: 'KR', icon: '🇰🇷' },
  { label: 'Nhật Bản', code: 'JP', icon: '🇯🇵' },
  { label: 'Trung Quốc', code: 'CN', icon: '🇨🇳' },
  { label: 'Thái Lan', code: 'TH', icon: '🇹🇭' },
  { label: 'Âu & Mỹ', code: 'WE', icon: '🍴' },
];
const CATEGORIES = [
  { label: 'Thịt & hải sản', icon: '🥩' },
  { label: 'Rau củ', icon: '🥦' },
  { label: 'Canh, cà ri & lẩu', icon: '🍲' },
  { label: 'Cơm, mì & bún', icon: '🍜' },
  { label: 'Gỏi & món ăn nhẹ', icon: '🌿' },
  { label: 'Tráng miệng & món ngọt', icon: '🍰' },
];
const TIMES = [
  { id: 'under-15', label: 'Dưới 15 phút', check: (m: number) => m < 15 },
  { id: '15-30', label: '15 – 30 phút', check: (m: number) => m >= 15 && m <= 30 },
  { id: '30-60', label: '30 – 60 phút', check: (m: number) => m > 30 && m <= 60 },
  { id: 'over-60', label: 'Trên 60 phút', check: (m: number) => m > 60 },
];
const DIFFICULTIES = ['Dễ', 'Vừa', 'Nâng cao'];
const SERVINGS = [
  { id: '1', label: '1 phần', check: (s: number) => s === 1 },
  { id: '2', label: '2 phần', check: (s: number) => s === 2 },
  { id: '3-4', label: '3 – 4 phần', check: (s: number) => s >= 3 && s <= 4 },
  { id: 'over-4', label: 'Trên 4 phần', check: (s: number) => s > 4 },
];
const FEATURED_TITLES = [
  'Trứng đúc thịt bằm',
  'Ba chỉ cuộn nấm kim châm',
  'Cá nục sốt cà chua hành tây',
  'Nấm rơm kho tiêu xanh',
  'Tôm rim mặn ngọt',
  'Mực xào hành tây tỏi tây',
  'Rau muống xào tỏi',
  'Thịt chưng mắm tép',
];
const PAGE_SIZE = 8;
type Dish = ReturnType<typeof discoveryRecipe>;
function CountryFlag({ code }: { code: string }) {
  const clipId = `discover-round-flag-${code}`;
  const star = 'M0-1 .224-.309 .951-.309 .363.118 .588.809 0 .382-.588.809-.363.118-.951-.309-.224-.309Z';
  return (
    <svg className="discover-cuisine-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <defs><clipPath id={clipId}><circle cx="12" cy="12" r="12" /></clipPath></defs>
      <g clipPath={`url(#${clipId})`}>
        <path fill={code === 'JP' || code === 'KR' ? '#fff' : code === 'TH' ? '#a51931' : '#de2910'} d="M0 0h24v24H0z" />
        {code === 'VN' && <path d={star} fill="#ffde00" transform="translate(12 12) scale(8)" />}
        {code === 'CN' && <g fill="#ffde00">
          <path d={star} transform="translate(7.5 9) scale(4.5)" />
          <path d={star} transform="translate(13 4.5) rotate(25) scale(1.5)" />
          <path d={star} transform="translate(16.5 7.5) rotate(45) scale(1.5)" />
          <path d={star} transform="translate(16.5 12) rotate(15) scale(1.5)" />
          <path d={star} transform="translate(13 15.5) rotate(35) scale(1.5)" />
        </g>}
        {code === 'JP' && <circle cx="12" cy="12" r="6.5" fill="#bc002d" />}
        {code === 'TH' && <><path d="M0 4h24v16H0z" fill="#fff" /><path d="M0 8h24v8H0z" fill="#2d2a4a" /></>}
        {code === 'KR' && <>
          <g transform="rotate(-30 12 12)">
            <circle cx="12" cy="12" r="5" fill="#cd2e3a" />
            <path d="M7 12a5 5 0 0 0 10 0 2.5 2.5 0 0 0-5 0 2.5 2.5 0 0 1-5 0" fill="#0047a0" />
          </g>
          <g stroke="#171717" strokeWidth=".8" fill="none">
            <path d="M-2.4-1.3h4.8M-2.4 0h4.8M-2.4 1.3h4.8" transform="translate(5.5 5.5) rotate(-45)" />
            <path d="M-2.4-1.3h1.9m1 0h1.9M-2.4 0h1.9m1 0h1.9M-2.4 1.3h1.9m1 0h1.9" transform="translate(18.5 18.5) rotate(-45)" />
            <path d="M-2.4-1.3h1.9m1 0h1.9M-2.4 0h4.8M-2.4 1.3h1.9m1 0h1.9" transform="translate(18.5 5.5) rotate(45)" />
            <path d="M-2.4-1.3h4.8M-2.4 0h1.9m1 0h1.9M-2.4 1.3h4.8" transform="translate(5.5 18.5) rotate(45)" />
          </g>
        </>}
      </g>
    </svg>
  );
}
function Artwork({ viewBox, className }: { viewBox: string; className: string }) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <image href="/images/discover-reference-art.png" width="1536" height="1024" />
    </svg>
  );
}
function DishMeta({ dish }: { dish: Dish }) {
  return (
    <>
      <span title="Thời gian chuẩn bị và nấu">
        <Clock size={14} />
        {dish.time ?? '—'} phút
      </span>
      <span>
        <Users size={14} />
        {dish.servings} phần
      </span>
    </>
  );
}
export function Discover() {
  const [params, setParams] = useSearchParams();
  const currentSearch = params.get('q') || '',
    cuisine = params.get('cuisine') || '';
  const selectedTime = params.get('time') || '',
    selectedDiff = params.get('difficulty') || '';
  const selectedServing = params.get('servings') || '',
    categories = params.getAll('category');
  const sortBy = params.get('sort') || 'popular';
  const eatFitOnly = params.get('collection') === 'eat-fit';
  const [draft, setDraft] = useState(currentSearch);
  useEffect(() => setDraft(currentSearch), [currentSearch]);
  const recipesQuery = useQuery({
    queryKey: ['recipes', 'catalog', 'sql-v1'],
    queryFn: () => loadRecipeCatalog(),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
  const allRecipes = useMemo(() => {
    const ranked = new Map(FEATURED_TITLES.map((title, index) => [title, index]));
    return (recipesQuery.data || [])
      .filter((recipe) => !eatFitOnly || recipe.sourceName === 'Menu món.docx')
      .map(discoveryRecipe)
      .sort((a, b) => (ranked.get(a.title) ?? 100) - (ranked.get(b.title) ?? 100));
  }, [recipesQuery.data, eatFitOnly]);
  const sourceRecipes = useMemo(
    () => new Map((recipesQuery.data || []).map((recipe) => [recipe.id, recipe])),
    [recipesQuery.data],
  );
  const categoryCounts = useMemo(() => cuisineCategoryCounts(allRecipes, cuisine), [allRecipes, cuisine]);
  const availableCategories = CATEGORIES.filter((category) => (categoryCounts.get(category.label) || 0) > 0);

  useEffect(() => {
    if (recipesQuery.isSuccess && categories.length > 0) {
      const validCategories = categories.filter((cat) =>
        availableCategories.some((available) => available.label === cat),
      );
      if (validCategories.length !== categories.length) {
        const next = new URLSearchParams(params);
        next.delete('category');
        validCategories.forEach((cat) => next.append('category', cat));
        next.delete('page');
        setParams(next, { replace: true });
      }
    }
  }, [cuisine, categoryCounts, recipesQuery.isSuccess, params, setParams]);
  const recommendations = allRecipes.filter((dish) =>
    !cuisine || (cuisine === 'WE' ? ['WE', 'IT', 'FR'].includes(dish.cuisine) : dish.cuisine === cuisine),
  ).slice(0, 3);
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key === 'cuisine') next.delete('category');
    next.delete('page');
    setParams(next);
  };
  const toggleCategory = (category: string) => {
    if (!categoryCounts.get(category)) return;
    const next = new URLSearchParams(params);
    next.delete('category');
    (categories.includes(category)
      ? categories.filter((item) => item !== category)
      : [...categories, category]
    ).forEach((item) => next.append('category', item));
    next.delete('page');
    setParams(next);
  };
  const reset = () => {
    setDraft('');
    setParams({});
  };
  const filteredRecipes = allRecipes
    .filter((dish) => {
      if (currentSearch) {
        const normalize = (text: string) =>
          text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd');
        if (
          !normalize(`${dish.title} ${dish.summary} ${dish.category} ${dish.cuisineName}`).includes(
            normalize(currentSearch),
          )
        )
          return false;
      }
      if (
        cuisine &&
        !(cuisine === 'WE' ? ['WE', 'IT', 'FR'].includes(dish.cuisine) : dish.cuisine === cuisine)
      )
        return false;
      if (categories.length && !categories.includes(dish.category)) return false;
      const time = TIMES.find((item) => item.id === selectedTime);
      if (time && (dish.time === null || !time.check(dish.time))) return false;
      if (DIFFICULTIES.includes(selectedDiff) && dish.difficulty !== selectedDiff) return false;
      const serving = SERVINGS.find((item) => item.id === selectedServing);
      return !serving || serving.check(dish.servings);
    })
    .sort((a, b) =>
      sortBy === 'time'
        ? (a.time ?? Infinity) - (b.time ?? Infinity)
        : sortBy === 'servings'
          ? a.servings - b.servings
          : 0,
    );
  const totalPages = Math.ceil(filteredRecipes.length / PAGE_SIZE);
  const requestedPage = Number(params.get('page'));
  const page = Math.min(
    Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    Math.max(1, totalPages),
  );
  const displayedRecipes = filteredRecipes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageNumbers = paginationSlots(page, totalPages);
  const changePage = (value: number) => {
    const next = new URLSearchParams(params);
    value > 1 ? next.set('page', String(value)) : next.delete('page');
    setParams(next);
  };
  return (
    <main className="discover-reference">
      <div className="discover-decorations" aria-hidden="true">
        <Artwork className="discover-top-leaf" viewBox="0 22 105 156" />
        <Artwork className="discover-right-leaf" viewBox="1421 211 115 123" />
        <Artwork className="discover-bottom-art" viewBox="0 746 88 252" />
        <svg className="discover-bottom-wave" viewBox="0 0 1536 70" preserveAspectRatio="none">
          <path d="M0 20C65 15 123 80 190 39S285 12 360 49S460 59 530 70H0Z" fill="#e5e7bb" opacity=".6" />
        </svg>
      </div>
      <div className="discover-container">
        <section className="discover-hero" aria-labelledby="discover-title">
          <div className="discover-hero-copy">
            <p className="discover-eyebrow">— Thư viện bếp nhà —</p>
            <div className="discover-title-row">
              <h1 id="discover-title">Khám phá công thức</h1>
              <span className="discover-rays" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </div>
            <p className="discover-description">
              Tìm kiếm công thức nấu ăn theo món ăn, nguyên liệu, phong cách ẩm thực
              <br className="discover-desktop-break" /> hoặc thời gian chuẩn bị.
            </p>
            <form
              className="discover-search"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                setFilter('q', draft.trim());
              }}
            >
              <Search size={21} aria-hidden="true" />
              <input
                aria-label="Tìm công thức"
                placeholder="Tìm tên món, nguyên liệu hoặc phong cách nấu..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <button type="submit">
                Tìm công thức <ArrowRight size={16} />
              </button>
            </form>
          </div>
          <Artwork className="discover-hero-art" viewBox="902 55 634 230" />
        </section>
        <section className="discover-today" aria-labelledby="discover-today-title">
          <div className="discover-today-intro">
            <ChefHat size={52} strokeWidth={1.7} aria-hidden="true" />
            <div>
              <h2 id="discover-today-title">Gợi ý hôm nay</h2>
              <p>Thêm cảm hứng cho bữa ăn hôm nay.</p>
            </div>
          </div>
          <div className="discover-today-dishes">
            {recommendations.map((dish) => (
              <Link key={dish.id} to={`/cong-thuc/${dish.slug}`} className="discover-today-dish">
                <img src={dish.image || RECIPE_PLACEHOLDER} alt="" />
                <div>
                  <h3>{dish.title}</h3>
                  <div className="discover-dish-meta">
                    <DishMeta dish={dish} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <a href="#discover-results" className="discover-more">
            Xem thêm <ArrowRight size={16} />
          </a>
        </section>
        <div className="discover-filters">
          <div className="discover-cuisine-row">
            <div className="discover-cuisines" aria-label="Ẩm thực">
              {CUISINES.map((tab) => (
                <button
                  key={tab.code}
                  className={cuisine === tab.code ? 'is-active' : ''}
                  type="button"
                  aria-pressed={cuisine === tab.code}
                  onClick={() => setFilter('cuisine', tab.code)}
                >
                  {tab.code ? (
                    tab.code === 'WE'
                      ? <svg className="discover-cuisine-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M5 3v5a3 3 0 0 0 6 0V3M8 3v18M18 3c-2 2-3 5-3 9h3m0-9v18" /></svg>
                      : <CountryFlag code={tab.code} />
                  ) : (
                    <LayoutGrid size={19} />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>
            <select
              aria-label="Sắp xếp công thức"
              value={sortBy}
              onChange={(event) => setFilter('sort', event.target.value)}
            >
              <option value="popular">Sắp xếp: Phổ biến</option>
              <option value="time">Thời gian: Nhanh nhất</option>
              <option value="servings">Khẩu phần: Tăng dần</option>
            </select>
          </div>
          <div className="discover-categories" aria-label="Nhóm món ăn">
            {CATEGORIES.map((category) => (
              <button
                key={category.label}
                type="button"
                className={categories.includes(category.label) ? 'is-active' : ''}
                aria-pressed={categories.includes(category.label)}
                disabled={!categoryCounts.get(category.label)}
                title={!categoryCounts.get(category.label) ? 'Chưa có món trong nhóm này với ẩm thực đã chọn' : `${categoryCounts.get(category.label)} công thức`}
                onClick={() => toggleCategory(category.label)}
              >
                <span aria-hidden="true">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>
        <div className="discover-content">
          <aside className="discover-sidebar" aria-label="Bộ lọc công thức">
            <div className="discover-sidebar-heading">
              <h2>
                <SlidersHorizontal size={23} />
                Bộ lọc
              </h2>
              <button type="button" onClick={reset}>
                <RotateCcw size={13} />
                Đặt lại
              </button>
            </div>
            <fieldset>
              <legend>Thời gian nấu</legend>
              {TIMES.map((time) => (
                <label key={time.id}>
                  <input
                    type="radio"
                    name="time"
                    checked={selectedTime === time.id}
                    onChange={() => setFilter('time', time.id)}
                  />
                  {time.label}
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>Độ khó</legend>
              {['', ...DIFFICULTIES].map((difficulty) => (
                <label key={difficulty}>
                  <input
                    type="radio"
                    name="difficulty"
                    checked={selectedDiff === difficulty}
                    onChange={() => setFilter('difficulty', difficulty)}
                  />
                  {difficulty || 'Tất cả độ khó'}
                </label>
              ))}
            </fieldset>
            {availableCategories.length > 0 && (
              <fieldset>
                <legend>Loại món</legend>
                {availableCategories.map((category) => (
                  <label key={category.label}>
                    <input
                      type="checkbox"
                      checked={categories.includes(category.label)}
                      onChange={() => toggleCategory(category.label)}
                    />
                    {category.label}
                  </label>
                ))}
              </fieldset>
            )}
            <details className="discover-serving-filter">
              <summary>Khẩu phần{selectedServing && ' · Đang lọc'}</summary>
              <fieldset>
                <legend className="discover-sr-only">Chọn khẩu phần</legend>
                <label>
                  <input
                    type="radio"
                    name="servings"
                    checked={!selectedServing}
                    onChange={() => setFilter('servings', '')}
                  />
                  Tất cả khẩu phần
                </label>
                {SERVINGS.map((serving) => (
                  <label key={serving.id}>
                    <input
                      type="radio"
                      name="servings"
                      checked={selectedServing === serving.id}
                      onChange={() => setFilter('servings', serving.id)}
                    />
                    {serving.label}
                  </label>
                ))}
              </fieldset>
            </details>
          </aside>
          <section
            className="discover-results"
            id="discover-results"
            aria-labelledby="discover-results-title"
          >
            <h2 id="discover-results-title" aria-live="polite">
              {recipesQuery.isPending ? 'Đang tìm công thức…' : `${filteredRecipes.length} công thức`}
            </h2>
            {recipesQuery.isPending ? (
              <Loading />
            ) : recipesQuery.isError ? (
              <ErrorState error={recipesQuery.error} retry={() => void recipesQuery.refetch()} />
            ) : (
              <>
                <div className="discover-recipe-grid">
                  {displayedRecipes.map((dish) => (
                    <article className="discover-recipe-card" key={dish.id}>
                      <div className="discover-recipe-photo">
                        <Link to={`/cong-thuc/${dish.slug}`} tabIndex={-1}>
                          <div className="discover-photo-placeholder" aria-hidden={!!dish.image}>
                            <CookingPot size={32} />
                            <span>Chưa có ảnh món ăn</span>
                          </div>
                          <img
                            src={dish.image || RECIPE_PLACEHOLDER}
                            alt={dish.title}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                          />
                        </Link>
                        <span className="discover-cuisine-badge">{dish.cuisineName}</span>
                        {sourceRecipes.get(dish.id) && (
                          <FavoriteButton recipe={sourceRecipes.get(dish.id)!} overlay />
                        )}
                      </div>
                      <div className="discover-recipe-body">
                        <h3>
                          <Link to={`/cong-thuc/${dish.slug}`}>{dish.title}</Link>
                        </h3>
                        <div className="discover-recipe-bottom">
                          <div className="discover-dish-meta">
                            <DishMeta dish={dish} />
                          </div>
                          {dish.difficulty && !dish.difficulty.toLowerCase().startsWith('chưa') && (
                            <span
                              className={`discover-difficulty ${dish.difficulty === 'Dễ' ? 'is-easy' : ''}`}
                              title={
                                dish.difficultyBasis === 'ESTIMATED'
                                  ? 'Độ khó tham khảo theo kỹ thuật và công đoạn'
                                  : undefined
                              }
                            >
                              {dish.difficulty}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                  {Array.from({ length: PAGE_SIZE - displayedRecipes.length }, (_, index) => (
                    <div className="discover-recipe-card discover-recipe-space" key={`space-${index}`} aria-hidden="true">
                      <div className="discover-recipe-photo" />
                      <div className="discover-recipe-body" />
                    </div>
                  ))}
                </div>
                {!filteredRecipes.length && (
                  <div className="discover-empty">
                    <CookingPot size={40} />
                    <h3>Không tìm thấy công thức nào phù hợp.</h3>
                    <p>Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
                    <button type="button" onClick={reset}>
                      Đặt lại tất cả bộ lọc
                    </button>
                  </div>
                )}
                <div className="discover-pagination-slot">
                {totalPages > 1 && (
                  <nav className="discover-pagination" aria-label="Phân trang công thức">
                    <button
                      type="button"
                      aria-label="Trang trước"
                      disabled={page === 1}
                      onClick={() => changePage(page - 1)}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    {pageNumbers.map((number, index) => typeof number === 'number' ? (
                        <button
                          key={index}
                          type="button"
                          aria-label={`Trang ${number}`}
                          aria-current={page === number ? 'page' : undefined}
                          onClick={() => changePage(number)}
                        >
                          {number}
                        </button>
                    ) : <span key={index} className="discover-page-gap" aria-hidden="true">{number === 'gap' ? '…' : ''}</span>)}
                    <button
                      type="button"
                      aria-label="Trang sau"
                      disabled={page === totalPages}
                      onClick={() => changePage(page + 1)}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </nav>
                )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
