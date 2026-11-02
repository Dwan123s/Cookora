import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react';

interface ReelItem {
  id: string;
  slug: string;
  title: string;
  time: string;
  category: string;
  image: string;
}

const REEL_RECIPES: ReelItem[] = [
  {
    id: 'r1',
    slug: 'dau-hu-sot-ca-chua',
    title: 'Đậu hũ sốt cà chua',
    time: '25 phút',
    category: 'Món Việt',
    image: '/images/hero/tofu.jpg',
  },
  {
    id: 'r2',
    slug: 'com-kimchi',
    title: 'Cơm chiên kimchi',
    time: '20 phút',
    category: 'Hàn Quốc',
    image: '/images/hero/kimchi.jpg',
  },
  {
    id: 'r3',
    slug: 'trung-xao-ca-chua',
    title: 'Trứng xào cà chua mềm',
    time: '18 phút',
    category: 'Bữa cơm nhà',
    image: '/images/hero/tomatoegg.jpg',
  },
  {
    id: 'r4',
    slug: 'ga-ap-chao-sot-toi',
    title: 'Gà áp chảo sốt tỏi',
    time: '25 phút',
    category: 'Món đậm vị',
    image: '/images/hero/grilledchicken.jpg',
  },
  {
    id: 'r5',
    slug: 'mi-y-toi-dau-o-liu',
    title: 'Spaghetti tỏi & ô liu',
    time: '23 phút',
    category: 'Món Ý',
    image: '/images/hero/pasta.jpg',
  },
  {
    id: 'r6',
    slug: 'com-ga-trung',
    title: 'Cơm gà trứng Oyakodon',
    time: '27 phút',
    category: 'Nhật Bản',
    image: '/images/hero/oyakodon.jpg',
  },
  {
    id: 'r7',
    slug: 'canh-rong-bien',
    title: 'Canh rong biển đậu hũ',
    time: '15 phút',
    category: 'Thanh mát',
    image: '/images/hero/hero.jpg',
  },
  {
    id: 'r8',
    slug: 'thit-nuong',
    title: 'Thịt xiên nướng thơm',
    time: '35 phút',
    category: 'Món nướng',
    image: '/images/hero/grilledchicken.jpg',
  },
];

export function CurvedReelsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const singleSetWidthRef = useRef(0);

  // 4 sets of cards for completely seamless infinite looping
  const items = [
    ...REEL_RECIPES,
    ...REEL_RECIPES,
    ...REEL_RECIPES,
    ...REEL_RECIPES,
  ];

  // Function to apply the inverted arch: Ở GIỮA NHỎ, Ở 2 BÊN TO RA
  const updateTransforms = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const cards = el.querySelectorAll<HTMLElement>('.reel-card-3d');
    const viewportCenterX = el.getBoundingClientRect().left + el.clientWidth / 2;
    const radius = el.clientWidth * 0.52;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const diff = (cardCenter - viewportCenterX) / radius;
      const clampedDiff = Math.max(-1.4, Math.min(1.4, diff));
      const distFromCenter = Math.min(1, Math.abs(clampedDiff));

      // HIỆU ỨNG: Ở GIỮA NHỎ (scale 0.82), Ở 2 BÊN TO RA (scale 1.15)
      const scale = 0.82 + Math.pow(distFromCenter, 1.4) * 0.33;

      // Độ sâu Z: ở giữa lùi sâu vào trong (-65px), 2 bên nhô gần về phía người xem (10px)
      const translateZ = -65 * (1 - distFromCenter);

      // Góc xoay 3D nghiêng theo lòng vòm cong chuẩn như ảnh mẫu
      const rotateY = clampedDiff * 15;

      // Vị trí trục Y: ở giữa nâng nhẹ tạo thành vòm cong võng
      const translateY = (1 - distFromCenter) * 8;

      card.style.transform = `perspective(1200px) rotateY(${rotateY}deg) translateZ(${translateZ}px) translateY(${translateY}px) scale(${scale})`;
    });
  }, []);

  // Infinite auto-scroll loop
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    // Estimate width of a single 8-card set
    const cardEl = el.querySelector<HTMLElement>('.reel-card-3d');
    const cardWidth = cardEl ? cardEl.offsetWidth + 18 : 220;
    const singleSetWidth = cardWidth * REEL_RECIPES.length;
    singleSetWidthRef.current = singleSetWidth;

    // Start in the second set for seamless bidirectional scroll
    el.scrollLeft = singleSetWidth;
    updateTransforms();

    let animId: number;
    const speed = 0.9; // Smooth continuous glide, never freezes on mouse hover

    const loop = () => {
      if (el && !isDown.current) {
        // Continuous smooth auto-glide
        el.scrollLeft += speed;

        // Infinite loop seamless wrap
        if (el.scrollLeft >= singleSetWidth * 2) {
          el.scrollLeft -= singleSetWidth;
        } else if (el.scrollLeft <= 5) {
          el.scrollLeft += singleSetWidth;
        }

        updateTransforms();
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [updateTransforms]);

  // Click arrow navigation
  const slide = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const distance = 300;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  // Wheel horizontal scroll
  const handleWheel = (e: React.WheelEvent) => {
    if (!trackRef.current) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    trackRef.current.scrollLeft += e.deltaY * 0.9;
    updateTransforms();
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    isDown.current = true;
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeft.current = trackRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    trackRef.current.scrollLeft = scrollLeft.current - walk;

    const setW = singleSetWidthRef.current;
    if (setW > 0) {
      if (trackRef.current.scrollLeft >= setW * 2) {
        trackRef.current.scrollLeft -= setW;
        scrollLeft.current -= setW;
      } else if (trackRef.current.scrollLeft <= 0) {
        trackRef.current.scrollLeft += setW;
        scrollLeft.current += setW;
      }
    }
    updateTransforms();
  };

  const handleMouseUpOrLeave = () => {
    isDown.current = false;
  };

  // Touch handlers for mobile / tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!trackRef.current) return;
    isDown.current = true;
    startX.current = e.touches[0].pageX - trackRef.current.offsetLeft;
    scrollLeft.current = trackRef.current.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDown.current || !trackRef.current) return;
    const x = e.touches[0].pageX - trackRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    trackRef.current.scrollLeft = scrollLeft.current - walk;

    const setW = singleSetWidthRef.current;
    if (setW > 0) {
      if (trackRef.current.scrollLeft >= setW * 2) {
        trackRef.current.scrollLeft -= setW;
        scrollLeft.current -= setW;
      } else if (trackRef.current.scrollLeft <= 0) {
        trackRef.current.scrollLeft += setW;
        scrollLeft.current += setW;
      }
    }
    updateTransforms();
  };

  const handleTouchEnd = () => {
    isDown.current = false;
  };

  return (
    <div
      className="relative w-full py-4 select-none overflow-hidden"
      onMouseLeave={() => {
        isDown.current = false;
      }}
    >
      {/* Floating Left Arrow */}
      <button
        type="button"
        onClick={() => slide('left')}
        aria-label="Lướt sang trái"
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-[#DFE5DD] flex items-center justify-center text-[#273D32] hover:bg-[#E8F1E9] hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <ChevronLeft size={22} strokeWidth={2.2} />
      </button>

      {/* Floating Right Arrow */}
      <button
        type="button"
        onClick={() => slide('right')}
        aria-label="Lướt sang phải"
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-[#DFE5DD] flex items-center justify-center text-[#273D32] hover:bg-[#E8F1E9] hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <ChevronRight size={22} strokeWidth={2.2} />
      </button>

      {/* 3D Curved Concave Track (Ở giữa nhỏ, 2 bên to ra) */}
      <div
        ref={trackRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full overflow-x-hidden overflow-y-hidden cursor-grab active:cursor-grabbing py-10 flex items-center gap-4 sm:gap-5 [perspective:1400px] [transform-style:preserve-3d]"
      >
        {items.map((recipe, index) => (
          <div
            key={`${recipe.id}-${index}`}
            className="reel-card-3d relative w-[170px] sm:w-[195px] md:w-[215px] aspect-[9/13] rounded-2xl overflow-hidden shrink-0 border border-[#DFE5DD] bg-white shadow-sm hover:shadow-2xl transition-shadow duration-300 group"
            style={{
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            }}
          >
            {/* Dish Photo */}
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
              onError={(e) => {
                e.currentTarget.src = '/images/cookora-tofu-1200.webp';
              }}
              draggable={false}
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Translucent glass Play Button */}
            <div className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-white/45 backdrop-blur-md border border-white/60 flex items-center justify-center text-white shadow-xs group-hover:bg-[#47735B] group-hover:scale-110 transition duration-300">
              <Play size={13} fill="currentColor" className="translate-x-0.5" />
            </div>

            {/* Title & Metadata */}
            <div className="absolute bottom-3 left-13 right-3 text-white pointer-events-none">
              <p className="text-[10px] font-medium text-stone-200 uppercase tracking-wider line-clamp-1">
                {recipe.category} · {recipe.time}
              </p>
              <h4 className="text-xs font-semibold leading-tight line-clamp-1 group-hover:text-[#E8F1E9] transition">
                {recipe.title}
              </h4>
            </div>

            {/* Click Link Overlay */}
            <Link
              to={`/cong-thuc/${recipe.slug}`}
              className="absolute inset-0 z-10"
              aria-label={`Xem công thức ${recipe.title}`}
              draggable={false}
              onClick={(e) => {
                // Ignore navigation if user dragged
                if (Math.abs(scrollLeft.current - (trackRef.current?.scrollLeft || 0)) > 6) {
                  e.preventDefault();
                }
              }}
            />
          </div>
        ))}
      </div>

      {/* Bottom CTA bar matching the uploaded image */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-1">
        {/* Playful doodle arrow & label */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#47735B] italic">
          <span className="text-base font-bold">↳</span>
          <span>Tự động trượt vòng lặp vô tận</span>
        </div>

        {/* Dashed outline pill button */}
        <div className="p-0.5 rounded-full border border-dashed border-[#E26A38]/60 hover:border-[#E26A38] transition">
          <Link
            to="/cong-thuc"
            className="btn-cta-primary inline-flex items-center gap-2 h-10 px-6 rounded-full text-xs sm:text-sm shadow-xs"
          >
            <Sparkles size={14} /> Khám phá tất cả công thức
          </Link>
        </div>
      </div>
    </div>
  );
}
