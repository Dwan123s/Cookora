import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Clock,
  Users,
  Heart,
  ArrowRight,
  ChevronDown,
  ChefHat,
  CookingPot,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { discoveryRecipe, loadRecipeCatalog } from '../recipe-catalog';
import { ErrorState, Loading } from '../shared';
import { RECIPE_PLACEHOLDER } from '../recipe-media';

const CUISINE_TABS = [
  { label: 'Tất cả', code: '' },
  { label: 'Việt Nam', code: 'VN' },
  { label: 'Hàn Quốc', code: 'KR' },
  { label: 'Nhật Bản', code: 'JP' },
  { label: 'Trung Quốc', code: 'CN' },
  { label: 'Thái Lan', code: 'TH' },
  { label: 'Ý', code: 'IT' },
  { label: 'Âu & Mỹ', code: 'WE' },
];

const CATEGORY_TABS = [
  { label: 'Thịt & hải sản', icon: '🥩' },
  { label: 'Canh, cà ri & lẩu', icon: '🍲' },
  { label: 'Cơm, mì & bún', icon: '🍜' },
  { label: 'Gỏi & món ăn nhẹ', icon: '🥗' },
  { label: 'Tráng miệng & món ngọt', icon: '🥭' },
];

const TIME_FILTERS = [
  { id: 'under-15', label: 'Dưới 15 phút', check: (m: number) => m < 15 },
  { id: '15-30', label: '15 – 30 phút', check: (m: number) => m >= 15 && m <= 30 },
  { id: '30-60', label: '30 – 60 phút', check: (m: number) => m > 30 && m <= 60 },
  { id: 'over-60', label: 'Trên 60 phút', check: (m: number) => m > 60 },
];

const DIFFICULTY_FILTERS = ['Dễ', 'Vừa', 'Nâng cao'];

const SERVINGS_FILTERS = [
  { id: '1', label: '1 phần', check: (s: number) => s === 1 },
  { id: '2', label: '2 phần', check: (s: number) => s === 2 },
  { id: '3-4', label: '3 – 4 phần', check: (s: number) => s >= 3 && s <= 4 },
  { id: 'over-4', label: 'Trên 4 phần', check: (s: number) => s > 4 },
];

export function Discover() {
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState(params.get('q') || '');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const requestedDifficulty = params.get('difficulty') || '';
  const selectedDiff = DIFFICULTY_FILTERS.includes(requestedDifficulty) ? requestedDifficulty : '';
  const [selectedServing, setSelectedServing] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    params.get('category') ? [params.get('category')!] : [],
  );
  const [sortBy, setSortBy] = useState<'popular' | 'time' | 'servings'>('popular');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount =
    Number(!!selectedTime) + Number(!!selectedDiff) + Number(!!selectedServing) + selectedCategories.length;

  // SQL/API is the only catalog source; never substitute a static list while loading or on errors.
  const recipesQuery = useQuery({
    queryKey: ['recipes', 'catalog', 'sql-v1'],
    queryFn: () => loadRecipeCatalog(),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const allRecipes = useMemo(() => (recipesQuery.data || []).map(discoveryRecipe), [recipesQuery.data]);
  const recommendation = allRecipes.find((recipe) => recipe.image) || allRecipes[0];

  const currentCuisine = params.get('cuisine') || '';
  const currentSearch = params.get('q') || '';
  useEffect(() => {
    setVisibleCount(24);
  }, [currentCuisine, currentSearch, selectedCategories, selectedTime, selectedDiff, selectedServing]);

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams(params);
    draft.trim() ? p.set('q', draft.trim()) : p.delete('q');
    setParams(p);
  };

  const setCuisine = (code: string) => {
    const p = new URLSearchParams(params);
    code ? p.set('cuisine', code) : p.delete('cuisine');
    setParams(p);
  };

  const setDifficulty = (difficulty: string) => {
    const next = new URLSearchParams(params);
    if (difficulty) next.set('difficulty', difficulty);
    else next.delete('difficulty');
    setParams(next);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat];
      const p = new URLSearchParams(params);
      if (next.length === 1) {
        p.set('category', next[0]);
      } else {
        p.delete('category');
      }
      setParams(p);
      return next;
    });
  };

  const resetFilters = () => {
    setSelectedTime('');
    setSelectedServing('');
    setSelectedCategories([]);
    setParams({});
    setDraft('');
    setVisibleCount(24);
  };

  // Filter & Sort Recipes
  const filteredRecipes = useMemo(() => {
    return allRecipes
      .filter((recipe) => {
        // 1. Search Query
        if (currentSearch) {
          const q = currentSearch.toLowerCase();
          const matchTitle = recipe.title.toLowerCase().includes(q);
          const matchSummary = recipe.summary.toLowerCase().includes(q);
          const matchCat = recipe.category.toLowerCase().includes(q);
          const matchCuisine = recipe.cuisineName.toLowerCase().includes(q);
          if (!matchTitle && !matchSummary && !matchCat && !matchCuisine) return false;
        }

        // 2. Cuisine Filter
        if (currentCuisine && recipe.cuisine !== currentCuisine) {
          return false;
        }

        // 3. Category Filter
        if (selectedCategories.length > 0 && !selectedCategories.includes(recipe.category)) {
          return false;
        }

        // 4. Time Filter
        if (selectedTime) {
          const timeRule = TIME_FILTERS.find((t) => t.id === selectedTime);
          if (timeRule && (recipe.time === null || !timeRule.check(recipe.time))) return false;
        }

        // 5. Difficulty Filter
        if (selectedDiff && recipe.difficulty !== selectedDiff) {
          return false;
        }

        // 6. Servings Filter
        if (selectedServing) {
          const servRule = SERVINGS_FILTERS.find((s) => s.id === selectedServing);
          if (servRule && !servRule.check(recipe.servings)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'time') return (a.time ?? Infinity) - (b.time ?? Infinity);
        if (sortBy === 'servings') return a.servings - b.servings;
        return 0; // Default: popular/order
      });
  }, [
    allRecipes,
    currentSearch,
    currentCuisine,
    selectedCategories,
    selectedTime,
    selectedDiff,
    selectedServing,
    sortBy,
  ]);

  const displayedRecipes = filteredRecipes.slice(0, visibleCount);
  if (recipesQuery.isPending)
    return (
      <main className="container">
        <Loading />
      </main>
    );
  if (recipesQuery.isError)
    return (
      <main className="container">
        <ErrorState error={recipesQuery.error} retry={() => void recipesQuery.refetch()} />
      </main>
    );

  return (
    <main className="discover-page min-h-screen bg-[#FAF9F6] text-[#273D32] pb-24 font-sans relative overflow-x-hidden">
      {/* Decorative Corner Foliage */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-36 sm:w-48 z-0 opacity-85 select-none hidden sm:block">
        <img src="/images/discover-bottom-leaves.png" alt="" className="w-full h-auto object-contain" />
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6 sm:space-y-8 relative z-10">
        {/* 1. HERO HEADER WITH FLOATING ARTWORK */}
        <section className="relative overflow-hidden pt-2 sm:pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Header Text & Search Bar */}
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold text-[#47735B] tracking-[0.2em] uppercase block">
                — THƯ VIỆN BẾP NHÀ
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-[#273D32] tracking-tight leading-[1.18]">
                Khám phá công thức
              </h1>
              <p className="text-sm sm:text-[15px] text-[#5C7065] leading-relaxed max-w-xl">
                Tìm kiếm công thức nấu ăn theo món ăn, nguyên liệu, phong cách ẩm thực hoặc thời gian chuẩn
                bị.
              </p>

              {/* Rounded-full Pill Search Bar matching Image */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white rounded-2xl sm:rounded-full border border-[#DFE5DD] p-2 sm:p-1.5 sm:pl-5 shadow-2xs hover:shadow-xs focus-within:border-[#47735B] transition flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 max-w-xl"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 px-2 sm:px-0">
                  <Search size={18} className="text-[#5C7065] shrink-0" />
                  <input
                    type="text"
                    aria-label="Tìm công thức theo món ăn hoặc nguyên liệu"
                    placeholder="Tìm tên món, nguyên liệu hoặc phong cách nấu..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="w-full min-w-0 min-h-11 text-base sm:text-sm text-[#273D32] placeholder-[#5C7065] focus:outline-hidden bg-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#47735B] hover:bg-[#3B634F] text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  Tìm công thức <ArrowRight size={14} />
                </button>
              </form>
            </div>

            {/* Right Header Artwork (Plate of shrimp pasta with leafy branch) */}
            <div className="lg:col-span-4 hidden lg:flex justify-end relative">
              <div className="w-[320px] xl:w-[350px] aspect-square rounded-full overflow-hidden shadow-xl border-4 border-white/80 bg-stone-100 relative group">
                <img
                  src={allRecipes.find((r) => r.image)?.image || RECIPE_PLACEHOLDER}
                  alt={recommendation?.title || 'Danh mục công thức'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. DAILY RECOMMENDATION HIGHLIGHT BANNER (Gợi ý hôm nay) */}
        <section className="bg-[#F8F5EE] border border-[#EADBCC] rounded-3xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Badge & Description */}
          <div className="flex items-center gap-3.5 sm:gap-4 w-full md:w-auto">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#E8F1E9] text-[#47735B] flex items-center justify-center shrink-0 shadow-2xs">
              <ChefHat size={22} strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-bold text-[#273D32] text-base sm:text-lg leading-tight">Gợi ý hôm nay</h3>
              <p className="text-xs sm:text-sm text-[#5C7065] mt-0.5">Thêm cảm hứng cho bữa ăn hôm nay.</p>
            </div>
          </div>

          {/* Center: Food Preview */}
          <div className="flex items-center gap-3.5 w-full md:w-auto bg-white/70 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-[#EADBCC]/80">
            <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden shrink-0 border border-[#DFE5DD]">
              <img
                src={recommendation?.image || RECIPE_PLACEHOLDER}
                alt={recommendation?.title || 'Chưa có ảnh'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-bold text-[#273D32] text-xs sm:text-sm leading-tight">
                {recommendation?.title || 'Chưa có công thức'}
              </h4>
              <div className="flex items-center gap-2.5 text-[11px] text-[#5C7065] mt-1">
                <span className="flex items-center gap-1 font-medium">
                  <Clock size={12} />{' '}
                  {recommendation?.time ? `~${recommendation.time} phút` : 'Chưa rõ thời gian'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <Users size={12} /> {recommendation?.servings || '—'} phần
                </span>
                {recommendation?.isDraft && (
                  <span className="bg-[#E8F1E9] text-[#47735B] px-2 py-0.5 rounded-md font-semibold text-[10px]">
                    Bản thảo
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: CTA Button */}
          <Link
            to={recommendation ? `/cong-thuc/${recommendation.slug}` : '/cong-thuc'}
            className="w-full md:w-auto justify-center bg-[#E8F1E9] hover:bg-[#D8E6DA] text-[#273D32] px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shadow-2xs shrink-0"
          >
            Xem công thức <ArrowRight size={14} />
          </Link>
        </section>

        {/* 3. FILTER TABS (Cuisines & Sort Row, and Category Pills) */}
        <div className="space-y-3 pt-1">
          {/* Row 1: Country / Cuisine Filter + Dropdown Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {CUISINE_TABS.map((tab) => {
                const isActive = currentCuisine === tab.code;
                return (
                  <button
                    key={tab.code}
                    type="button"
                    onClick={() => setCuisine(tab.code)}
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                      isActive ? 'filter-pill-active' : 'filter-pill-inactive'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Dropdown Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border border-[#DFE5DD] rounded-full px-4 py-1.5 pr-8 text-xs font-semibold text-[#273D32] shadow-2xs focus:outline-hidden cursor-pointer"
              >
                <option value="popular">Sắp xếp: Phổ biến</option>
                <option value="time">Thời gian nấu: Nhanh nhất</option>
                <option value="servings">Khẩu phần: Tăng dần</option>
              </select>
              <ChevronDown
                size={14}
                className="text-[#5C7065] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
          </div>

          {/* Row 2: 5 Category Pills with Icons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
            {CATEGORY_TABS.map((cat) => {
              const isSelected = selectedCategories.includes(cat.label);
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => toggleCategory(cat.label)}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-[12.5px] font-medium transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected ? 'filter-pill-active' : 'filter-pill-inactive'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. MAIN TWO-COLUMN CONTENT: SIDEBAR FILTERS + 4-COLUMN RECIPE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start pt-2">
          <button
            type="button"
            className="lg:hidden flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-[#DFE5DD] bg-white px-4 py-3 text-sm font-semibold text-[#273D32]"
            aria-expanded={filtersOpen}
            aria-controls="discovery-filters"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal size={18} />
              Bộ lọc{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </span>
            <ChevronDown size={18} className={filtersOpen ? 'rotate-180' : ''} />
          </button>
          {/* Left Column: Sidebar Filters */}
          <aside
            id="discovery-filters"
            className={`${filtersOpen ? 'block' : 'hidden'} lg:block lg:col-span-3 bg-white rounded-3xl border border-[#DFE5DD] p-5 sm:p-6 shadow-2xs space-y-6`}
          >
            {/* Header with Reset */}
            <div className="flex items-center justify-between border-b border-[#DFE5DD]/70 pb-3.5">
              <h3 className="font-bold text-[#273D32] text-sm sm:text-base flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#47735B]" /> Bộ lọc
              </h3>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-[#5C7065] hover:text-[#47735B] flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw size={12} /> Đặt lại
              </button>
            </div>

            {/* Filter 1: Thời gian nấu */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-[#273D32] uppercase tracking-wider">Thời gian nấu</h4>
              <div className="space-y-2 text-xs sm:text-[13px] text-[#5C7065]">
                {TIME_FILTERS.map((t) => (
                  <label key={t.id} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="time"
                      checked={selectedTime === t.id}
                      onChange={() => setSelectedTime(selectedTime === t.id ? '' : t.id)}
                      className="accent-[#47735B] cursor-pointer"
                    />
                    <span className="group-hover:text-[#273D32] transition">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 2: Độ khó */}
            <div className="space-y-2.5 border-t border-[#DFE5DD]/70 pt-4">
              <h4 className="text-xs font-bold text-[#273D32] uppercase tracking-wider">Độ khó</h4>
              <p className="text-[11px] text-[#5C7065]">Tham khảo theo kỹ thuật và công đoạn.</p>
              <div className="space-y-2 text-xs sm:text-[13px] text-[#5C7065]">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="difficulty"
                    checked={!selectedDiff}
                    onChange={() => setDifficulty('')}
                    className="accent-[#47735B] cursor-pointer"
                  />
                  <span>Tất cả độ khó</span>
                </label>
                {DIFFICULTY_FILTERS.map((d) => (
                  <label key={d} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="difficulty"
                      checked={selectedDiff === d}
                      onChange={() => setDifficulty(d)}
                      className="accent-[#47735B] cursor-pointer"
                    />
                    <span className="group-hover:text-[#273D32] transition">{d}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 3: Loại món (Checkboxes) */}
            <div className="space-y-2.5 border-t border-[#DFE5DD]/70 pt-4">
              <h4 className="text-xs font-bold text-[#273D32] uppercase tracking-wider">Loại món</h4>
              <div className="space-y-2 text-xs sm:text-[13px] text-[#5C7065]">
                {CATEGORY_TABS.map((cat) => (
                  <label key={cat.label} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.label)}
                      onChange={() => toggleCategory(cat.label)}
                      className="accent-[#47735B] cursor-pointer rounded-xs"
                    />
                    <span className="group-hover:text-[#273D32] transition">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 4: Khẩu phần */}
            <div className="space-y-2.5 border-t border-[#DFE5DD]/70 pt-4">
              <h4 className="text-xs font-bold text-[#273D32] uppercase tracking-wider">Khẩu phần</h4>
              <div className="space-y-2 text-xs sm:text-[13px] text-[#5C7065]">
                {SERVINGS_FILTERS.map((s) => (
                  <label key={s.id} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="servings"
                      checked={selectedServing === s.id}
                      onChange={() => setSelectedServing(selectedServing === s.id ? '' : s.id)}
                      className="accent-[#47735B] cursor-pointer"
                    />
                    <span className="group-hover:text-[#273D32] transition">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Column: 4-Column Recipe Grid matching Mockup */}
          <section className="lg:col-span-9 space-y-6">
            {/* Results Counter Header */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-[#5C7065] font-medium pb-1">
              <span className="text-base sm:text-lg font-bold text-[#273D32]">
                {filteredRecipes.length} công thức
              </span>
              <span>
                Hiển thị {Math.min(visibleCount, filteredRecipes.length)} / {filteredRecipes.length} món
              </span>
            </div>

            {/* 4-Column Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {displayedRecipes.map((dish) => {
                const isFav = !!favorites[dish.id];
                return (
                  <article
                    key={dish.id}
                    className="bg-white rounded-2xl border border-[#DFE5DD] overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-1 transition duration-300 flex flex-col group"
                  >
                    {/* Food Photo Container */}
                    <Link
                      to={`/cong-thuc/${dish.slug}`}
                      className="block relative aspect-4/3 overflow-hidden bg-stone-100"
                    >
                      <div
                        aria-hidden={!!dish.image}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#8a9b80]"
                      >
                        <CookingPot size={34} aria-hidden="true" />
                        <span className="text-xs">Chưa có ảnh món ăn</span>
                      </div>
                      {
                        <img
                          src={dish.image || RECIPE_PLACEHOLDER}
                          alt={dish.title}
                          className="relative w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      }

                      {/* Top-left Cuisine Badge */}
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-[#273D32] shadow-2xs">
                        {dish.cuisineName}
                      </span>

                      {/* Top-right Favorite Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleFav(dish.id, e)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#5C7065] hover:text-[#B25D65] shadow-2xs transition hover:scale-105 cursor-pointer"
                        title="Lưu món"
                      >
                        <Heart size={15} className={isFav ? 'fill-[#B25D65] text-[#B25D65]' : ''} />
                      </button>
                    </Link>

                    {/* Card Content */}
                    <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
                      <h3 className="font-bold text-[#273D32] text-sm sm:text-[14.5px] leading-snug line-clamp-1 mb-3 group-hover:text-[#47735B] transition">
                        <Link to={`/cong-thuc/${dish.slug}`}>{dish.title}</Link>
                      </h3>

                      {/* Bottom Meta Row */}
                      <div className="flex items-center justify-between text-xs text-[#5C7065] font-medium pt-1 border-t border-[#DFE5DD]/50">
                        <div className="flex items-center gap-2 text-[11.5px]">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-[#5C7065]" /> {dish.time ?? '—'} phút
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users size={12} className="text-[#5C7065]" /> {dish.servings} phần
                          </span>
                        </div>

                        {/* Difficulty Badge */}
                        {dish.difficulty && !dish.difficulty.toLowerCase().startsWith('chưa') && (
                          <span
                            className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md ${
                              dish.difficulty === 'Dễ'
                                ? 'bg-[#E8F1E9] text-[#47735B]'
                                : 'bg-[#F8F4EC] text-[#8C6D3B]'
                            }`}
                          >
                            <span
                              title={
                                dish.difficultyBasis === 'ESTIMATED'
                                  ? 'Độ khó tham khảo theo kỹ thuật và công đoạn'
                                  : undefined
                              }
                            >
                              {dish.difficulty}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* If No Results */}
            {filteredRecipes.length === 0 && (
              <div className="bg-white rounded-3xl border border-[#DFE5DD] p-12 text-center space-y-3">
                <p className="text-base font-semibold text-[#273D32]">
                  Không tìm thấy công thức nào phù hợp.
                </p>
                <p className="text-xs sm:text-sm text-[#5C7065]">
                  Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="bg-[#47735B] text-white px-6 py-2 rounded-full text-xs font-semibold shadow-xs hover:bg-[#3B634F] transition mt-2 cursor-pointer"
                >
                  Đặt lại tất cả bộ lọc
                </button>
              </div>
            )}

            {/* Load More Button matching Image */}
            {visibleCount < filteredRecipes.length && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 24)}
                  className="border border-[#DFE5DD] bg-white hover:bg-[#E8F1E9] text-[#273D32] px-8 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-2xs hover:shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
                >
                  Xem thêm công thức <ChevronDown size={15} />
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
