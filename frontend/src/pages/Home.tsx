import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loadRecipeCatalog } from '../recipe-catalog';
import { RECIPE_PLACEHOLDER } from '../recipe-media';
import { Link, useNavigate } from 'react-router-dom';
import {
  Apple,
  ArrowRight,
  Calendar,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Dumbbell,
  Heart,
  Plus,
  Search,
  Soup,
  Utensils,
  Wallet,
  X,
  Activity,
  Play,
  Users,
  Check,
  CheckSquare,
  Leaf,
  } from 'lucide-react';
import { useNotice, cuisineFor, ErrorState, Loading } from '../shared';
import { CurvedReelsCarousel } from '../components/CurvedReelsCarousel';

// Quick access to available features
const QUICK_NAV = [
  {
    title: 'Khám phá công thức',
    to: '/cong-thuc',
    icon: Soup,
    color: 'text-[#47735B]',
    bgColor: 'bg-[#E8F1E9]',
  },
  {
    title: 'Có gì nấu nấy',
    to: '/co-gi-nau-nay',
    icon: ChefHat,
    color: 'text-[#47735B]',
    bgColor: 'bg-[#EFF6EE]',
  },
  {
    title: 'Thực đơn tuần',
    to: '/thuc-don',
    icon: Calendar,
    color: 'text-[#8C6D3B]',
    bgColor: 'bg-[#F8F4EC]',
  },
  {
    title: 'Eat Fit',
    subtitle: '(Theo mục tiêu)',
    to: '/eat-fit',
    icon: Dumbbell,
    color: 'text-[#6C5B7B]',
    bgColor: 'bg-[#F3EFF5]',
  },
  {
    title: 'Ước tính chi phí',
    to: '/ngan-sach',
    icon: Coins,
    color: 'text-[#846A36]',
    bgColor: 'bg-[#FBF6E9]',
  },
  {
    title: 'Dinh dưỡng & Calories',
    to: '/dinh-duong',
    icon: Apple,
    color: 'text-[#B25D65]',
    bgColor: 'bg-[#FDF2F0]',
  },
  {
    title: 'Công thức yêu thích',
    to: '/yeu-thich',
    icon: Heart,
    color: 'text-[#B25D65]',
    bgColor: 'bg-[#FCEEF0]',
  },
];

const CUISINE_OPTIONS = [
  { name: 'Việt Nam', code: 'VN', tag: '🇻🇳' },
  { name: 'Hàn Quốc', code: 'KR', tag: '🇰🇷' },
  { name: 'Nhật Bản', code: 'JP', tag: '🇯🇵' },
  { name: 'Trung Quốc', code: 'CN', tag: '🇨🇳' },
  { name: 'Thái Lan', code: 'TH', tag: '🇹🇭' },
  { name: 'Ý', code: 'IT', tag: '🇮🇹' },
  { name: 'Âu & Mỹ', code: 'WE', tag: '🇺🇸' },
];

// Cooking tips editorial articles
const ARTICLE_TOPICS = [
  {
    id: 'a1',
    title: '5 mẹo nấu ăn nhanh cho người bận rộn',
    category: 'Mẹo vào bếp',
    readTime: '5 phút đọc',
  },
  {
    id: 'a2',
    title: 'Kế hoạch Meal Prep 3 ngày tiết kiệm thời gian',
    category: 'Lên thực đơn',
    readTime: '7 phút đọc',
  },
  {
    id: 'a3',
    title: 'Cách sơ chế rau củ nhanh gọn cho bữa cơm nhà',
    category: 'Mẹo vào bếp',
    readTime: '6 phút đọc',
  },
  {
    id: 'a4',
    title: 'Tính calorie món ăn đơn giản tại nhà',
    category: 'Dinh dưỡng',
    readTime: '5 phút đọc',
  },
];

export function Home() {
  const navigate = useNavigate();
  const notice = useNotice();
  const catalog = useQuery({
    queryKey: ['recipes', 'catalog', 'sql-v1'],
    queryFn: () => loadRecipeCatalog(),
    staleTime: 30000,
  });
  const recipes = catalog.data || [];
  const featured = CUISINE_OPTIONS.map((c) => recipes.find((r) => r.cuisine === c.code && r.image))
    .filter((r): r is NonNullable<typeof r> => !!r)
    .slice(0, 4);
  const FEATURED_DISHES = featured.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    image: r.image || RECIPE_PLACEHOLDER,
    time: r.totalMinutes === null ? 'Chưa rõ thời gian' : '~' + r.totalMinutes + ' phút',
    servings: r.baseServings,
    cuisine: cuisineFor(r.cuisine).name,
  }));
  const HERO_SLIDES = FEATURED_DISHES.slice(0, 3).map((r) => ({
    ...r,
    tag: 'GỢI Ý HÔM NAY',
    servings: r.servings + ' người',
    badge: r.cuisine,
  }));
  const CUISINES = CUISINE_OPTIONS.map((c) => {
    const items = recipes.filter((r) => r.cuisine === c.code);
    return {
      ...c,
      img: items.find((r) => r.image)?.image || RECIPE_PLACEHOLDER,
      desc: items.length + ' công thức',
    };
  }).filter((c) => recipes.some((r) => r.cuisine === c.code));
  const ARTICLES = ARTICLE_TOPICS.map((topic, i) => ({
    ...topic,
    image: FEATURED_DISHES[i]?.image || RECIPE_PLACEHOLDER,
  }));

  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [pantryItems, setPantryItems] = useState(['Trứng', 'Cà chua', 'Đậu hũ']);
  const [pantryInput, setPantryInput] = useState('');
  const [heroSlide, setHeroSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  const handlePrevSlide = () => {
    setHeroSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNextSlide = () => {
    setHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  useEffect(() => {
    if (isHeroHovered || !HERO_SLIDES.length) return;
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isHeroHovered, HERO_SLIDES.length]);

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = !prev[id];
      notice(next ? 'Đã lưu công thức vào mục yêu thích.' : 'Đã bỏ lưu món.');
      return { ...prev, [id]: next };
    });
  };

  const addPantryItem = (e: React.FormEvent) => {
    e.preventDefault();
    const val = pantryInput.trim();
    if (val && !pantryItems.includes(val)) {
      setPantryItems([...pantryItems, val]);
      setPantryInput('');
    }
  };

  const removePantryItem = (item: string) => {
    setPantryItems(pantryItems.filter((i) => i !== item));
  };

  if (catalog.isPending) return <Loading />;
  if (catalog.isError) return <ErrorState error={catalog.error} retry={() => void catalog.refetch()} />;
  if (!FEATURED_DISHES.length) return <p className="container">Chưa có công thức trong danh mục.</p>;
  return (
    <div className="home-aligned bg-[#FAF9F6] text-[#273D32] min-h-screen">
      {/* 1. HERO SECTION (Sage Green & Warm Cream - Modern Food Editorial matching Image 1) */}
      <section className="home-hero relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
        {/* Decorative Botanical & Culinary Elements */}
        <div className="home-hero-decoration pointer-events-none absolute -top-4 -left-4 w-44 sm:w-60 lg:w-72 z-0 opacity-80 select-none">
          <img src="/images/hero/leaf-top-left.png" alt="" className="w-full h-auto object-contain" />
        </div>
        <div className="home-hero-decoration home-hero-leaf pointer-events-none absolute -top-4 -right-4 w-44 sm:w-60 lg:w-72 z-0 opacity-80 select-none">
          <img src="/images/hero/leaf-top-right.png" alt="" className="w-full h-auto object-contain" />
        </div>
        <div className="home-hero-decoration pointer-events-none absolute left-3 sm:left-6 lg:left-12 top-[44%] -translate-y-1/2 w-16 sm:w-24 lg:w-28 z-10 hidden sm:block select-none drop-shadow-md">
          <img
            src="/images/hero/tomato-transparent.png"
            alt="Cà chua tươi"
            className="w-full h-auto object-contain"
          />
        </div>
        <div className="home-hero-decoration pointer-events-none absolute right-3 sm:right-6 lg:right-12 bottom-6 sm:bottom-10 w-24 sm:w-32 lg:w-40 z-10 hidden sm:block select-none drop-shadow-md">
          <img
            src="/images/hero/rosemary-transparent.png"
            alt="Hương thảo"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Ambient Warm Editorial Glow */}
        <div className="home-hero-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#E8F1E9]/35 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="home-container max-w-[1280px] mx-auto px-4 sm:px-8 relative z-10">
          <div className="home-hero-grid grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-center">
            {/* Left Column: Eyebrow, Title, Description, Buttons, Meta */}
            <div className="home-hero-copy lg:col-span-6 space-y-6 lg:pr-2">
              {/* Eyebrow */}
              <div className="home-eyebrow flex items-center gap-2.5">
                <span className="w-6 h-[2px] bg-[#47735B]" />
                <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#47735B]">
                  Bếp nhà cùng Cookora
                </span>
              </div>

              {/* Both lines use the same Vietnamese typeface. */}
              <h1 className="home-hero-heading text-[#273D32]">
                Nấu ngon hơn,
                <span className="home-hero-heading-accent">
                  sống lành mạnh hơn.
                  <Leaf
                    className="ml-2 inline-block h-[0.45em] w-[0.45em] align-baseline"
                    aria-hidden="true"
                  />
                </span>
              </h1>
              <span className="home-title-rays" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>

              {/* Description */}
              <p className="home-hero-description text-[#5C7065] text-base sm:text-[16.5px] leading-[1.8] max-w-lg">
                Khám phá công thức dễ làm, lên thực đơn thông minh và chăm sóc từng bữa ăn – tất cả trong một
                không gian bếp nhỏ thư thái của riêng bạn.
              </p>

              {/* CTAs matching Image 1 */}
              <div className="home-hero-actions flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  to="/cong-thuc"
                  className="bg-[#3E6B52] hover:bg-[#325742] text-white px-7 py-3 rounded-full font-semibold text-[14.5px] shadow-sm hover:shadow-md hover:-translate-y-0.5 inline-flex items-center gap-2 transition duration-200"
                >
                  <Search size={16} strokeWidth={2.2} /> Khám phá công thức{' '}
                  <ArrowRight size={16} strokeWidth={2.2} />
                </Link>
                <Link
                  to="/thuc-don"
                  className="border border-[#DFE5DD] bg-white text-[#273D32] hover:bg-[#E8F1E9] px-6 py-3 rounded-full font-semibold text-[14.5px] shadow-2xs hover:-translate-y-0.5 inline-flex items-center gap-2 transition duration-200"
                >
                  <Calendar size={16} className="text-[#47735B]" strokeWidth={2.2} /> Lên thực đơn tuần
                </Link>
              </div>

              {/* 3 Value Pillars */}
              <div className="home-hero-values flex flex-wrap items-center gap-4 sm:gap-6 pt-5 border-t border-[#DFE5DD]/70 text-xs sm:text-[13px] text-[#5C7065]">
                <span className="flex items-center gap-2 font-medium">
                  <Leaf size={15} className="text-[#47735B]" /> Dễ nấu mỗi ngày
                </span>
                <span className="hidden sm:inline text-[#DFE5DD]">|</span>
                <span className="flex items-center gap-2 font-medium">
                  <Clock size={15} className="text-[#47735B]" /> Tiết kiệm thời gian
                </span>
                <span className="hidden sm:inline text-[#DFE5DD]">|</span>
                <span className="flex items-center gap-2 font-medium">
                  <Heart size={15} className="text-[#47735B]" /> Cân bằng dinh dưỡng
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Food Card Showcase with Carousel Arrows */}
            <div
              className="home-hero-carousel lg:col-span-6 flex flex-col items-center lg:items-end relative"
              onMouseEnter={() => setIsHeroHovered(true)}
              onMouseLeave={() => setIsHeroHovered(false)}
            >
              <div className="home-carousel-frame relative w-full max-w-[540px]">
                {/* Food photo container with overlay */}
                <div className="home-carousel-photo relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-[28px] sm:rounded-[36px] overflow-hidden bg-stone-100 border-2 border-white shadow-[0_20px_50px_-10px_rgba(39,61,50,0.12)]">
                  {HERO_SLIDES.map((slide, idx) => (
                    <img
                      key={slide.image}
                      src={slide.image}
                      alt={slide.title}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                        idx === heroSlide
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-105 pointer-events-none'
                      }`}
                      onError={(e) => {
                        e.currentTarget.src = RECIPE_PLACEHOLDER;
                      }}
                    />
                  ))}

                  {/* Left Carousel Arrow Button */}
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    aria-label="Món trước"
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 text-[#273D32] shadow-md flex items-center justify-center hover:bg-white hover:scale-105 transition-all z-20"
                  >
                    <ChevronLeft size={20} strokeWidth={2.4} />
                  </button>

                  {/* Right Carousel Arrow Button */}
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    aria-label="Món tiếp theo"
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 text-[#273D32] shadow-md flex items-center justify-center hover:bg-white hover:scale-105 transition-all z-20"
                  >
                    <ChevronRight size={20} strokeWidth={2.4} />
                  </button>

                  {/* Bottom gradient caption */}
                  <div className="home-carousel-shade absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none" />

                  {/* Inside Food Caption Bottom-Left */}
                  <div className="home-carousel-caption absolute bottom-5 left-5 sm:bottom-6 sm:left-6 text-white pointer-events-none z-10">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#E8F1E9] drop-shadow-xs mb-1">
                      {HERO_SLIDES[heroSlide].tag}
                    </p>
                    <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm mb-2">
                      {HERO_SLIDES[heroSlide].title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-white/90">
                      <span className="flex items-center gap-1 font-medium drop-shadow-xs">
                        <Clock size={13} /> {HERO_SLIDES[heroSlide].time}
                      </span>
                      <span className="text-white/60">•</span>
                      <span className="flex items-center gap-1 font-medium drop-shadow-xs">
                        <Users size={13} /> {HERO_SLIDES[heroSlide].servings}
                      </span>
                      <span className="text-white/60">•</span>
                      <span className="bg-[#47735B]/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full drop-shadow-xs">
                        {HERO_SLIDES[heroSlide].badge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Overlapping Checklist Note: Hôm nay ăn gì? matching Image 1 */}
                <div className="home-carousel-note animate-note-float absolute -bottom-5 -right-2 sm:-right-5 z-30 bg-white/95 backdrop-blur-xs border border-[#E9D9C7] rounded-2xl p-4 sm:p-5 shadow-[0_14px_35px_rgba(39,61,50,0.12)] w-48 sm:w-56 text-xs">
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#E9D9C7]/80">
                    <span className="font-semibold text-[#273D32] text-xs sm:text-[13px]">
                      Hôm nay ăn gì?
                    </span>
                    <span className="text-[#8C6D3B] text-sm font-serif">♡</span>
                  </div>
                  <div className="space-y-2 text-[11px] sm:text-xs text-[#5C7065] font-medium">
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#E8F1E9] text-[#47735B] flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                      Ngon miệng
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#E8F1E9] text-[#47735B] flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                      Ít tốn kém
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#E8F1E9] text-[#47735B] flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                      Phù hợp với bạn
                    </p>
                  </div>
                </div>
              </div>

              {/* Carousel Pagination Dots */}
              <div className="home-carousel-dots flex items-center justify-center gap-2 mt-5 sm:mt-6">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setHeroSlide(idx)}
                    aria-label={`Xem slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === heroSlide ? 'w-6 bg-[#47735B]' : 'w-2 bg-[#DFE5DD] hover:bg-[#8CAA93]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EIGHT QUICK ACCESS BAR - UNIFIED FLOATING ROW CONTAINER MATCHING IMAGE 1 */}
      <section className="home-container home-quick max-w-[1280px] mx-auto px-4 sm:px-6 -mt-4 sm:-mt-6 mb-20 relative z-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-[28px] p-3 sm:p-4 border border-[#DFE5DD] shadow-[0_12px_36px_rgba(39,61,50,0.06)] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5">
          {QUICK_NAV.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.title}
                to={tile.to}
                className="rounded-2xl p-3 hover:bg-[#FAF9F6] border border-transparent hover:border-[#DFE5DD] transition duration-200 flex flex-col items-center text-center group"
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2 transition-transform duration-200 ${tile.bgColor} ${tile.color} group-hover:scale-110 shadow-2xs`}
                >
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <span className="text-[12.5px] font-semibold text-[#273D32] leading-tight group-hover:text-[#47735B] transition">
                  {tile.title}
                </span>
                {tile.subtitle && (
                  <span className="text-[10px] text-[#5C7065] mt-0.5 leading-none">{tile.subtitle}</span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. SECTION: GỢI Ý MÓN NGON CHO BẠN (EDITORIAL CENTERED HEADING MATCHING IMAGE 1) */}
      <section className="home-container home-recommendations max-w-[1280px] mx-auto px-4 sm:px-6 mb-20">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="w-8 h-[1px] bg-[#47735B]/40" />
            <p className="text-xs uppercase font-bold tracking-[0.2em] text-[#47735B]">
              Thực đơn gợi ý từ Cookora
            </p>
            <span className="w-8 h-[1px] bg-[#47735B]/40" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#273D32] tracking-tight flex items-center justify-center gap-2">
            Gợi ý món ngon cho bạn <Leaf size={22} className="text-[#47735B] inline" />
          </h2>
          <p className="text-xs sm:text-sm text-[#5C7065] mt-1.5 leading-relaxed">
            Khám phá món ngon và chọn công thức cho bữa ăn hôm nay.
          </p>
          <div className="home-recommendations-link mt-3">
            <Link
              to="/cong-thuc"
              className="text-xs sm:text-sm font-semibold text-[#47735B] hover:text-[#3B634F] inline-flex items-center gap-1 transition"
            >
              Xem tất cả công thức →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_DISHES.map((dish) => (
            <Link
              key={dish.id}
              to={`/cong-thuc/${dish.slug}`}
              className="discover-recipe-card home-recipe-card group flex flex-col"
            >
              <div className="discover-recipe-photo relative overflow-hidden">
                <img
                  src={dish.image}
                  alt={dish.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                  onError={(e) => {
                    e.currentTarget.src = RECIPE_PLACEHOLDER;
                  }}
                />
                <button
                  onClick={(e) => toggleFav(dish.id, e)}
                  className="home-recipe-favorite absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#5C7065] hover:text-[#B25D65] shadow-xs transition"
                  title="Lưu món"
                  aria-label={`Lưu ${dish.title}`}
                  aria-pressed={!!favorites[dish.id]}
                >
                  <Heart size={15} className={favorites[dish.id] ? 'fill-[#B25D65] text-[#B25D65]' : ''} />
                </button>
                <span className="discover-cuisine-badge">{dish.cuisine}</span>
              </div>
              <div className="discover-recipe-body flex-1 flex flex-col justify-between">
                <h3 className="font-semibold text-[#273D32] text-base mb-2 group-hover:text-[#47735B] transition line-clamp-1">
                  {dish.title}
                </h3>
                <div className="discover-dish-meta flex items-center text-xs">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-[#5C7065]" /> {dish.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} className="text-[#5C7065]" /> {dish.servings} phần
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. PROMINENT 3D CURVED REELS CAROUSEL */}
      <section className="home-container home-reels max-w-[1360px] mx-auto px-4 sm:px-8 mb-24">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <p className="text-xs uppercase font-bold tracking-[0.2em] text-[#47735B]">
            Thước phim bữa cơm nhà
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-[#273D32] tracking-tight mt-2">
            Gợi ý món ngon lướt là thích
          </h2>
          <p className="text-sm sm:text-base text-[#5C7065] mt-2 leading-relaxed">
            Lướt qua hình ảnh món ăn và mở công thức để xem cách làm chi tiết.
          </p>
        </div>
        <CurvedReelsCarousel recipes={recipes.filter((r) => r.image).slice(0, 8)} />
      </section>

      {/* 5. SECTION: KHÁM PHÁ ẨM THỰC THEO QUỐC GIA */}
      <section className="home-container home-cuisines max-w-[1280px] mx-auto px-4 sm:px-6 mb-20">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5 text-[#273D32] font-semibold text-2xl">
              <span className="w-1 h-5 bg-[#47735B] rounded-full inline-block" />
              <h2>Khám phá ẩm thực theo quốc gia</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5C7065] mt-1">
              Từ món cơm Việt Nam thân thuộc đến những hương vị đặc trưng khắp năm châu.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button className="w-8 h-8 rounded-full border border-[#DFE5DD] bg-white flex items-center justify-center text-[#5C7065] hover:text-[#273D32] hover:bg-[#E8F1E9] transition">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 rounded-full border border-[#DFE5DD] bg-white flex items-center justify-center text-[#5C7065] hover:text-[#273D32] hover:bg-[#E8F1E9] transition">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CUISINES.map((c) => (
            <Link
              key={c.code}
              to={`/cong-thuc?cuisine=${c.code}`}
              className="bg-white rounded-2xl overflow-hidden border border-[#DFE5DD] shadow-2xs hover:shadow-xs hover:border-[#47735B]/40 transition duration-200 group flex flex-col"
            >
              <div className="aspect-16/10 overflow-hidden bg-stone-100 relative">
                <img
                  src={c.img}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    e.currentTarget.src = RECIPE_PLACEHOLDER;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-2.5 text-white">
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    <span>{c.tag}</span>
                    <span>{c.name}</span>
                  </div>
                  <span className="text-[10px] text-stone-200 font-normal">{c.desc}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. TWO-COLUMN UTILITY SECTION: CÓ GÌ NẤU NẤY & LÊN THỰC ĐƠN TUẦN */}
      <section className="home-container home-utilities max-w-[1280px] mx-auto px-4 sm:px-6 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Card: Có gì nấu nấy (White card with clean border) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-7 border border-[#DFE5DD] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="home-utility-icon">
                  <ChefHat size={25} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <h3 className="text-xl font-semibold text-[#273D32]">Có gì nấu nấy</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#5C7065] leading-relaxed mb-5">
                Nhập nguyên liệu bạn đang có, Cookora sẽ gợi ý món phù hợp, giảm lãng phí và tiết kiệm thời
                gian.
              </p>

              {/* Search input */}
              <form onSubmit={addPantryItem} className="relative mb-3">
                <input
                  type="text"
                  aria-label="Nguyên liệu đang có"
                  placeholder="Nhập nguyên liệu (ví dụ: trứng, cà chua, hành lá...)"
                  value={pantryInput}
                  onChange={(e) => setPantryInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#DFE5DD] text-xs sm:text-sm text-[#273D32] placeholder-[#5C7065] focus:outline-hidden focus:bg-white focus:border-[#47735B] transition"
                />
                <Search size={15} className="absolute left-3 top-3 text-[#5C7065]" />
              </form>

              {/* Selected chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {pantryItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#E8F1E9] text-xs font-medium text-[#273D32]"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removePantryItem(item)}
                      aria-label={`Bỏ ${item}`}
                      className="hover:text-red-500 transition ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => navigate('/co-gi-nau-nay')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-[#DFE5DD] text-xs font-medium text-[#5C7065] hover:text-[#47735B] hover:border-[#47735B] transition"
                >
                  <Plus size={12} /> Thêm nguyên liệu
                </button>
              </div>
            </div>

            <div>
              <Link
                to="/co-gi-nau-nay"
                className="btn-cta-primary inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm shadow-xs"
              >
                Tìm món phù hợp <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right Card: Lên thực đơn tuần */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-7 border border-[#DFE5DD] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="home-utility-icon">
                  <Calendar size={25} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <h3 className="text-xl font-semibold text-[#273D32]">Lên thực đơn tuần</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#5C7065] leading-relaxed mb-5">
                Lập kế hoạch bữa ăn cân bằng, tiết kiệm và dễ thực hiện.
              </p>

              {/* 7-Day Mini Plan */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-6 text-center">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => (
                  <div key={day} className="flex flex-col items-center">
                    <span className="text-[10px] font-semibold text-[#5C7065] mb-1">{day}</span>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-[#DFE5DD] bg-[#FAF9F6]">
                      <img
                        src={FEATURED_DISHES[idx % FEATURED_DISHES.length].image}
                        alt={day}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = RECIPE_PLACEHOLDER;
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Link
                to="/thuc-don"
                className="btn-cta-primary inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm shadow-xs"
              >
                Tạo thực đơn ngay <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURE CARDS (Eat Fit, Chi Phí) */}
      <section className="home-container home-features max-w-[1280px] mx-auto px-4 sm:px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Eat Fit */}
          <Link
            to="/eat-fit"
            className="bg-white rounded-2xl p-5 border border-[#DFE5DD] shadow-2xs hover:shadow-xs hover:border-[#47735B]/40 transition duration-200 group flex items-center justify-between"
          >
            <div className="space-y-1 pr-3">
              <div className="flex items-center gap-2 text-[#47735B]">
                <Dumbbell size={18} strokeWidth={2} />
                <h3 className="font-semibold text-sm sm:text-base text-[#273D32] group-hover:text-[#47735B] transition">
                  Eat Fit – Thực đơn mục tiêu
                </h3>
              </div>
              <p className="text-xs text-[#5C7065] leading-relaxed">
                Ăn ngon, lành mạnh theo mục tiêu thể trạng của bạn.
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#E8F1E9] flex items-center justify-center text-[#47735B] group-hover:bg-[#47735B] group-hover:text-white transition shrink-0">
              →
            </div>
          </Link>

          {/* Card 2: Ước tính chi phí */}
          <Link
            to="/ngan-sach"
            className="bg-white rounded-2xl p-5 border border-[#DFE5DD] shadow-2xs hover:shadow-xs hover:border-[#47735B]/40 transition duration-200 group flex items-center justify-between"
          >
            <div className="space-y-1 pr-3">
              <div className="flex items-center gap-2 text-[#846A36]">
                <Wallet size={18} strokeWidth={2} />
                <h3 className="font-semibold text-sm sm:text-base text-[#273D32] group-hover:text-[#47735B] transition">
                  Ước tính chi phí
                </h3>
              </div>
              <p className="text-xs text-[#5C7065] leading-relaxed">
                Tính nhanh chi phí món ăn và quản lý ngân sách hàng tuần.
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#E8F1E9] flex items-center justify-center text-[#47735B] group-hover:bg-[#47735B] group-hover:text-white transition shrink-0">
              →
            </div>
          </Link>
        </div>
      </section>

      {/* 7. SECTION: MẸO VÀO BẾP */}
      <section className="home-container home-tips max-w-[1280px] mx-auto px-4 sm:px-6 mb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2.5 text-[#273D32] font-semibold text-2xl">
              <span className="w-1 h-5 bg-[#47735B] rounded-full inline-block" />
              <h2>Mẹo vào bếp</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5C7065] mt-1">
              Kinh nghiệm nấu ăn và tối ưu thời gian cho bữa ăn gia đình.
            </p>
          </div>
          <button
            onClick={() => notice('Đang mở thư viện bài viết mẹo vào bếp.')}
            className="text-xs sm:text-sm font-medium text-[#47735B] hover:text-[#3B634F] flex items-center gap-1 transition self-start sm:self-auto"
          >
            Xem tất cả bài viết →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ARTICLES.map((art) => (
            <div
              key={art.id}
              onClick={() => notice(`Đang mở bài viết: ${art.title}`)}
              className="bg-white rounded-2xl overflow-hidden border border-[#DFE5DD] shadow-2xs hover:shadow-xs hover:-translate-y-1 transition duration-300 cursor-pointer group flex flex-col"
            >
              <div className="aspect-16/10 overflow-hidden bg-stone-100">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                  onError={(e) => {
                    e.currentTarget.src = RECIPE_PLACEHOLDER;
                  }}
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="font-semibold text-[#273D32] text-sm mb-2 group-hover:text-[#47735B] transition line-clamp-2 leading-snug">
                  {art.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-[#5C7065] pt-2">
                  <span>{art.category}</span>
                  <span>• {art.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. BOTTOM CALLOUT BANNER (High contrast, clearly visible) */}
      <section className="home-container home-closing max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="bg-[#1C3225] rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 border border-[#274734]">
          <div className="space-y-2 text-center md:text-left">
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
              style={{ color: '#FFFFFF' }}
            >
              Hôm nay bạn muốn nấu món gì?
            </h2>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#E4ECE7' }}>
              Khám phá thêm hàng ngàn công thức phù hợp với sở thích và thói quen ăn uống của bạn.
            </p>
          </div>

          <Link
            to="/cong-thuc"
            className="btn-cta-primary h-12 px-7 rounded-xl text-sm sm:text-base shadow-md whitespace-nowrap flex items-center gap-2 shrink-0"
          >
            Khám phá ngay <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
