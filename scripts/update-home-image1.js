const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/Home.tsx', 'utf8');

// 1. Add Apple, Coins, Soup to imports
if (!content.includes('Apple,')) {
  content = content.replace(
    'import {',
    'import {\n  Apple,\n  Coins,\n  Soup,'
  );
}

// 2. Update QUICK_NAV
const oldQuickNavRegex = /const QUICK_NAV = \[[\s\S]*?\n\];/;
const newQuickNav = `const QUICK_NAV = [
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
    title: 'Bảo quản thực phẩm',
    to: '/bao-quan',
    icon: Package,
    color: 'text-[#3E6B65]',
    bgColor: 'bg-[#EDF5F4]',
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
];`;
content = content.replace(oldQuickNavRegex, newQuickNav);

// 3. Update HERO_SLIDES
const oldHeroSlidesRegex = /const HERO_SLIDES = \[[\s\S]*?\n\];/;
const newHeroSlides = `const HERO_SLIDES = [
  {
    image: '/images/hero/hero.jpg',
    tag: 'GỢI Ý HÔM NAY',
    title: 'Cơm gà rau củ & trứng',
    time: '25 phút',
    servings: '2 người',
    badge: 'Eat Fit',
  },
  {
    image: '/images/hero/grilledchicken.jpg',
    tag: 'MÓN NƯỚNG THƠM GIÒN',
    title: 'Gà áp chảo sốt tỏi',
    time: '25 phút',
    servings: '2 người',
    badge: 'Âu - Á',
  },
  {
    image: '/images/hero/tofu.jpg',
    tag: 'BỮA CƠM THANH ĐẠM',
    title: 'Đậu hũ sốt cà chua',
    time: '20 phút',
    servings: '2 người',
    badge: 'Món Việt',
  },
];`;
content = content.replace(oldHeroSlidesRegex, newHeroSlides);

// 4. In Home component, add prev/next handlers
const handlerPlaceholder = `  const [heroSlide, setHeroSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);`;

const newHandlers = `  const [heroSlide, setHeroSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  const handlePrevSlide = () => {
    setHeroSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNextSlide = () => {
    setHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };`;

if (!content.includes('handlePrevSlide')) {
  content = content.replace(handlerPlaceholder, newHandlers);
}

// 5. Replace Hero and following sections up to Featured dishes
const heroAndNavTargetRegex = /\{\/\* 1\. HERO SECTION[\s\S]*?\{\/\* 3\. SECTION: MÓN NGON GỢI Ý CHO BẠN \*\/\}/;

const newHeroAndNav = `{/* 1. HERO SECTION (Sage Green & Warm Cream - Modern Food Editorial matching Image 1) */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
        {/* Decorative Botanical & Culinary Elements */}
        <div className="pointer-events-none absolute -top-4 -left-4 w-44 sm:w-60 lg:w-72 z-0 opacity-80 select-none">
          <img src="/images/hero/leaf-top-left.png" alt="" className="w-full h-auto object-contain" />
        </div>
        <div className="pointer-events-none absolute -top-4 -right-4 w-44 sm:w-60 lg:w-72 z-0 opacity-80 select-none">
          <img src="/images/hero/leaf-top-right.png" alt="" className="w-full h-auto object-contain" />
        </div>
        <div className="pointer-events-none absolute left-3 sm:left-6 lg:left-12 top-[44%] -translate-y-1/2 w-16 sm:w-24 lg:w-28 z-10 hidden sm:block select-none drop-shadow-md">
          <img src="/images/hero/tomato-transparent.png" alt="Cà chua tươi" className="w-full h-auto object-contain" />
        </div>
        <div className="pointer-events-none absolute right-3 sm:right-6 lg:right-12 bottom-6 sm:bottom-10 w-24 sm:w-32 lg:w-40 z-10 hidden sm:block select-none drop-shadow-md">
          <img src="/images/hero/rosemary-transparent.png" alt="Hương thảo" className="w-full h-auto object-contain" />
        </div>

        {/* Ambient Warm Editorial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#E8F1E9]/35 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-center">
            {/* Left Column: Eyebrow, Title, Description, Buttons, Meta */}
            <div className="lg:col-span-6 space-y-6 lg:pr-2">
              {/* Eyebrow */}
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-[2px] bg-[#47735B]" />
                <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#47735B]">
                  Bếp nhà cùng Cookora
                </span>
              </div>

              {/* Title with editorial italic accent */}
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold text-[#273D32] tracking-tight leading-[1.18]">
                Nấu ngon hơn,
                <br />
                <span className="text-[#47735B] font-serif italic font-normal inline-flex items-center gap-2">
                  sống lành mạnh hơn.
                  <span className="inline-block text-xl not-italic">🍃</span>
                </span>
              </h1>

              {/* Description */}
              <p className="text-[#5C7065] text-base sm:text-[16.5px] leading-[1.8] max-w-lg">
                Khám phá công thức dễ làm, lên thực đơn thông minh và chăm sóc từng bữa ăn – tất cả trong một không gian bếp nhỏ thư thái của riêng bạn.
              </p>

              {/* CTAs matching Image 1 */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  to="/cong-thuc"
                  className="bg-[#3E6B52] hover:bg-[#325742] text-white px-7 py-3 rounded-full font-semibold text-[14.5px] shadow-sm hover:shadow-md hover:-translate-y-0.5 inline-flex items-center gap-2 transition duration-200"
                >
                  <Search size={16} strokeWidth={2.2} /> Khám phá công thức <ArrowRight size={16} strokeWidth={2.2} />
                </Link>
                <Link
                  to="/thuc-don"
                  className="border border-[#DFE5DD] bg-white text-[#273D32] hover:bg-[#E8F1E9] px-6 py-3 rounded-full font-semibold text-[14.5px] shadow-2xs hover:-translate-y-0.5 inline-flex items-center gap-2 transition duration-200"
                >
                  <Calendar size={16} className="text-[#47735B]" strokeWidth={2.2} /> Lên thực đơn tuần
                </Link>
              </div>

              {/* 3 Value Pillars */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-5 border-t border-[#DFE5DD]/70 text-xs sm:text-[13px] text-[#5C7065]">
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
              className="lg:col-span-6 flex flex-col items-center lg:items-end relative"
              onMouseEnter={() => setIsHeroHovered(true)}
              onMouseLeave={() => setIsHeroHovered(false)}
            >
              <div className="relative w-full max-w-[540px]">
                {/* Food photo container with overlay */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-[28px] sm:rounded-[36px] overflow-hidden bg-stone-100 border-2 border-white shadow-[0_20px_50px_-10px_rgba(39,61,50,0.12)]">
                  {HERO_SLIDES.map((slide, idx) => (
                    <img
                      key={slide.image}
                      src={slide.image}
                      alt={slide.title}
                      className={\`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out \${
                        idx === heroSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                      }\`}
                      onError={(e) => {
                        e.currentTarget.src = '/images/hero/hero.jpg';
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
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none" />

                  {/* Inside Food Caption Bottom-Left */}
                  <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 text-white pointer-events-none z-10">
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
                <div className="animate-note-float absolute -bottom-5 -right-2 sm:-right-5 z-30 bg-white/95 backdrop-blur-xs border border-[#E9D9C7] rounded-2xl p-4 sm:p-5 shadow-[0_14px_35px_rgba(39,61,50,0.12)] w-48 sm:w-56 text-xs">
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#E9D9C7]/80">
                    <span className="font-semibold text-[#273D32] text-xs sm:text-[13px]">Hôm nay ăn gì?</span>
                    <span className="text-[#8C6D3B] text-sm font-serif">♡</span>
                  </div>
                  <div className="space-y-2 text-[11px] sm:text-xs text-[#5C7065] font-medium">
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#E8F1E9] text-[#47735B] flex items-center justify-center text-[10px] font-bold">✓</span>
                      Ngon miệng
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#E8F1E9] text-[#47735B] flex items-center justify-center text-[10px] font-bold">✓</span>
                      Ít tốn kém
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#E8F1E9] text-[#47735B] flex items-center justify-center text-[10px] font-bold">✓</span>
                      Phù hợp với bạn
                    </p>
                  </div>
                </div>
              </div>

              {/* Carousel Pagination Dots */}
              <div className="flex items-center justify-center gap-2 mt-5 sm:mt-6">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setHeroSlide(idx)}
                    aria-label={\`Xem slide \${idx + 1}\`}
                    className={\`h-2 rounded-full transition-all duration-300 \${
                      idx === heroSlide ? 'w-6 bg-[#47735B]' : 'w-2 bg-[#DFE5DD] hover:bg-[#8CAA93]'
                    }\`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EIGHT QUICK ACCESS BAR - UNIFIED FLOATING ROW CONTAINER MATCHING IMAGE 1 */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 -mt-4 sm:-mt-6 mb-20 relative z-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-[28px] p-3 sm:p-4 border border-[#DFE5DD] shadow-[0_12px_36px_rgba(39,61,50,0.06)] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5">
          {QUICK_NAV.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.title}
                to={tile.to}
                className="rounded-2xl p-3 hover:bg-[#FAF9F6] border border-transparent hover:border-[#DFE5DD] transition duration-200 flex flex-col items-center text-center group"
              >
                <div
                  className={\`w-11 h-11 rounded-2xl flex items-center justify-center mb-2 transition-transform duration-200 \${tile.bgColor} \${tile.color} group-hover:scale-110 shadow-2xs\`}
                >
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <span className="text-[12.5px] font-semibold text-[#273D32] leading-tight group-hover:text-[#47735B] transition">
                  {tile.title}
                </span>
                {tile.subtitle && (
                  <span className="text-[10px] text-[#5C7065] mt-0.5 leading-none">
                    {tile.subtitle}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. SECTION: GỢI Ý MÓN NGON CHO BẠN (EDITORIAL CENTERED HEADING MATCHING IMAGE 1) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-20">
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
            Những công thức được cộng đồng Cookora yêu thích nhất tuần này.
          </p>
        </div>`;

content = content.replace(heroAndNavTargetRegex, newHeroAndNav);

// 6. Now make sure CurvedReelsCarousel is placed cleanly after Featured Dishes
// Let's check if CurvedReelsCarousel is already in the file
if (!content.includes('<CurvedReelsCarousel />')) {
  const featuredDishesCloseRegex = /(<\/section>[\s\n]*\{\/\* 4\. SECTION: KHÁM PHÁ ẨM THỰC)/;
  const reelsSection = `</section>

      {/* 4. PROMINENT 3D CURVED REELS CAROUSEL */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-8 mb-24">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <p className="text-xs uppercase font-bold tracking-[0.2em] text-[#47735B]">
            Thước phim bữa cơm nhà
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-[#273D32] tracking-tight mt-2">
            Gợi ý món ngon lướt là thích
          </h2>
          <p className="text-sm sm:text-base text-[#5C7065] mt-2 leading-relaxed">
            Lướt qua các công thức nổi bật với video hướng dẫn từng bước trực quan.
          </p>
        </div>
        <CurvedReelsCarousel />
      </section>

      {/* 5. SECTION: KHÁM PHÁ ẨM THỰC`;

  content = content.replace(featuredDishesCloseRegex, reelsSection);
}

fs.writeFileSync('frontend/src/pages/Home.tsx', content, 'utf8');
console.log('Home.tsx updated successfully matching Image 1!');
