const fs = require('fs');
const path = require('path');

const homeCode = `import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Heart,
  Plus,
  Search,
  Utensils,
  Wallet,
  X,
  Package,
  Activity,
  Play,
  Users,
  Check,
  CheckSquare,
} from 'lucide-react';
import { useNotice } from '../shared';

// 8 Quick Access Tiles matching uploaded image
const QUICK_NAV = [
  {
    title: 'Khám phá công thức',
    to: '/cong-thuc',
    icon: Utensils,
    color: 'text-[#47735B]',
    bgColor: 'bg-[#E8F1E9]',
  },
  {
    title: 'Có gì nấu nấy',
    to: '/co-gi-nau-nay',
    icon: ChefHat,
    color: 'text-[#47735B]',
    bgColor: 'bg-[#E8F1E9]',
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
    subtitle: '(Thực đơn theo mục tiêu)',
    to: '/eat-fit',
    icon: Dumbbell,
    color: 'text-[#6C5B7B]',
    bgColor: 'bg-[#F3EFF5]',
  },
  {
    title: 'Ước tính chi phí',
    to: '/ngan-sach',
    icon: Wallet,
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
    icon: Activity,
    color: 'text-[#8C6D3B]',
    bgColor: 'bg-[#F8F4EC]',
  },
  {
    title: 'Công thức yêu thích',
    to: '/yeu-thich',
    icon: Heart,
    color: 'text-[#B25D65]',
    bgColor: 'bg-[#FCEEF0]',
  },
];

// 4 Featured dishes per row
const FEATURED_DISHES = [
  {
    id: 'd1',
    title: 'Đậu hũ sốt cà chua',
    slug: 'dau-hu-sot-ca-chua',
    image: '/recipes/dau-hu-sot-ca-chua.webp',
    time: 25,
    servings: 2,
    cuisine: 'Món Việt',
  },
  {
    id: 'd2',
    title: 'Cơm kimchi',
    slug: 'com-kimchi',
    image: '/recipes/com-kimchi.webp',
    time: 20,
    servings: 2,
    cuisine: 'Hàn Quốc',
  },
  {
    id: 'd3',
    title: 'Trứng xào cà chua',
    slug: 'trung-xao-ca-chua',
    image: '/recipes/trung-xao-ca-chua.webp',
    time: 18,
    servings: 2,
    cuisine: 'Món Á',
  },
  {
    id: 'd4',
    title: 'Gà áp chảo sốt tỏi',
    slug: 'ga-ap-chao-sot-toi',
    image: '/recipes/ga-ap-chao-sot-toi.webp',
    time: 25,
    servings: 2,
    cuisine: 'Âu - Á',
  },
];

// 6 Cuisines matching the card styles in the image
const CUISINES = [
  {
    name: 'Việt Nam',
    code: 'VIETNAMESE',
    tag: '🇻🇳',
    desc: 'Đậm đà, gần gũi',
    img: '/recipes/dau-hu-sot-ca-chua.webp',
  },
  {
    name: 'Hàn Quốc',
    code: 'KOREAN',
    tag: '🇰🇷',
    desc: 'Hiện đại, hấp dẫn',
    img: '/recipes/com-kimchi.webp',
  },
  {
    name: 'Nhật Bản',
    code: 'JAPANESE',
    tag: '🇯🇵',
    desc: 'Thanh nhẹ, tinh tế',
    img: '/recipes/com-ga-trung.webp',
  },
  {
    name: 'Thái Lan',
    code: 'THAI',
    tag: '🇹🇭',
    desc: 'Cay nồng, đậm vị',
    img: '/recipes/ga-ap-chao-sot-toi.webp',
  },
  {
    name: 'Ý',
    code: 'ITALIAN',
    tag: '🇮🇹',
    desc: 'Tinh hoa ẩm thực Âu',
    img: '/recipes/mi-y-toi-dau-o-liu.webp',
  },
  {
    name: 'Âu & Mỹ',
    code: 'WESTERN',
    tag: '🇺🇸',
    desc: 'Đa dạng, sáng tạo',
    img: '/recipes/thit-nuong.webp',
  },
];

// Cooking tips editorial articles
const ARTICLES = [
  {
    id: 'a1',
    title: '5 mẹo nấu ăn nhanh cho người bận rộn',
    category: 'Mẹo vào bếp',
    readTime: '5 phút đọc',
    image: '/recipes/trung-xao-ca-chua.webp',
  },
  {
    id: 'a2',
    title: 'Kế hoạch Meal Prep 3 ngày tiết kiệm thời gian',
    category: 'Lên thực đơn',
    readTime: '7 phút đọc',
    image: '/recipes/com-ga-trung.webp',
  },
  {
    id: 'a3',
    title: 'Cách bảo quản rau củ tươi lâu trong tủ lạnh',
    category: 'Bảo quản',
    readTime: '6 phút đọc',
    image: '/recipes/canh-rong-bien.webp',
  },
  {
    id: 'a4',
    title: 'Tính calorie món ăn đơn giản tại nhà',
    category: 'Dinh dưỡng',
    readTime: '5 phút đọc',
    image: '/recipes/ga-ap-chao-sot-toi.webp',
  },
];

export function Home() {
  const navigate = useNavigate();
  const notice = useNotice();

  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [pantryItems, setPantryItems] = useState(['Trứng', 'Cà chua', 'Đậu hũ']);
  const [pantryInput, setPantryInput] = useState('');

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

  return (
    <div className="bg-[#FAF9F6] text-[#273D32] min-h-screen">
      {/* 1. HERO SECTION (Sage Green & Warm Cream Balance) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-10 pb-16 lg:pt-14 lg:pb-18">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Title & CTAs */}
          <div className="lg:col-span-6 space-y-5">
            <span className="inline-block text-xs font-semibold tracking-wider text-[#47735B]">
              Bếp nhà cùng Cookora
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-semibold text-[#273D32] tracking-tight leading-[1.2]">
              Nấu ngon hơn,
              <br />
              <span className="text-[#47735B]">sống lành mạnh hơn</span>
            </h1>
            <p className="text-[#5C7065] text-[15px] sm:text-base leading-[1.65] max-w-lg">
              Khám phá hàng ngàn công thức, lên thực đơn, ước tính chi phí và quản lý thực phẩm – tất cả trong một nơi.
            </p>
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/cong-thuc"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#47735B] text-white font-medium text-[14.5px] hover:bg-[#3B634F] transition shadow-xs"
              >
                <Search size={15} /> Khám phá công thức
              </Link>
              <button
                type="button"
                onClick={() => notice('Cookora giúp bạn lên thực đơn, tính toán khẩu phần và tận dụng nguyên liệu dễ dàng!')}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-[#DFE5DD] bg-white text-[#273D32] font-medium text-[14.5px] hover:bg-[#E8F1E9] transition shadow-2xs"
              >
                <Play size={13} className="text-[#47735B] fill-[#47735B]" /> Xem cách hoạt động
              </button>
            </div>
          </div>

          {/* Right Column: Plate on Cutting Board + Sticky Note */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end items-center relative">
            <div className="relative flex items-center justify-center">
              {/* Wooden cutting board & Food bowl */}
              <div className="w-[310px] sm:w-[380px] aspect-square rounded-full p-2 bg-[#FAF9F6] border-4 border-white shadow-sm flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden bg-stone-100 shadow-inner">
                  <img
                    src="/recipes/ga-ap-chao-sot-toi.webp"
                    alt="Bữa ăn lành mạnh"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/gai-yang.webp';
                    }}
                  />
                </div>
              </div>

              {/* Sticky note card (Matching uploaded image) */}
              <div className="absolute -bottom-4 right-0 sm:right-2 bg-[#FFFDF5] border border-[#E9D9C7] rounded-xl p-4 shadow-sm w-44 sm:w-48 text-xs rotate-1">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#E9D9C7]/70">
                  <span className="font-semibold text-[#273D32]">Hôm nay ăn gì?</span>
                  <span className="text-[#8C6D3B]">♡</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-[#5C7065] font-medium">
                  <p className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-sm bg-[#E8F1E9] text-[#47735B] flex items-center justify-center text-[10px]">✓</span>
                    Ngon miệng
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-sm bg-[#E8F1E9] text-[#47735B] flex items-center justify-center text-[10px]">✓</span>
                    Đủ dinh dưỡng
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-sm bg-[#E8F1E9] text-[#47735B] flex items-center justify-center text-[10px]">✓</span>
                    Tiết kiệm chi phí
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-sm bg-[#E8F1E9] text-[#47735B] flex items-center justify-center text-[10px]">✓</span>
                    Dễ nấu
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EIGHT QUICK ACCESS TILES */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-18">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
          {QUICK_NAV.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.title}
                to={tile.to}
                className="bg-white rounded-2xl p-4 border border-[#DFE5DD] shadow-2xs hover:shadow-xs hover:border-[#47735B]/40 hover:-translate-y-0.5 transition duration-200 flex flex-col items-center text-center group"
              >
                <div
                  className={\`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition \${tile.bgColor} \${tile.color} group-hover:scale-105\`}
                >
                  <Icon size={19} strokeWidth={1.8} />
                </div>
                <span className="text-[12.5px] font-medium text-[#273D32] leading-tight group-hover:text-[#47735B] transition">
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

      {/* 3. SECTION: MÓN NGON GỢI Ý CHO BẠN */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2.5 text-[#273D32] font-semibold text-2xl">
              <span className="w-1 h-5 bg-[#47735B] rounded-full inline-block" />
              <h2>Món ngon gợi ý cho bạn</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5C7065] mt-1">
              Những công thức được cộng đồng Cookora yêu thích nhất tuần này.
            </p>
          </div>
          <Link
            to="/cong-thuc"
            className="text-xs sm:text-sm font-medium text-[#47735B] hover:text-[#3B634F] flex items-center gap-1 transition self-start sm:self-auto"
          >
            Xem tất cả công thức →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_DISHES.map((dish) => (
            <Link
              key={dish.id}
              to={\`/cong-thuc/\${dish.slug}\`}
              className="bg-white rounded-2xl overflow-hidden border border-[#DFE5DD] shadow-2xs hover:shadow-sm hover:-translate-y-1 transition duration-300 group flex flex-col"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                <img
                  src={dish.image}
                  alt={dish.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                  onError={(e) => {
                    e.currentTarget.src = '/images/cookora-tofu-1200.webp';
                  }}
                />
                <button
                  onClick={(e) => toggleFav(dish.id, e)}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#5C7065] hover:text-[#B25D65] shadow-xs transition"
                  title="Lưu món"
                >
                  <Heart
                    size={15}
                    className={favorites[dish.id] ? 'fill-[#B25D65] text-[#B25D65]' : ''}
                  />
                </button>
                <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#273D32]/80 backdrop-blur-xs text-[11px] font-medium text-white">
                  {dish.cuisine}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="font-semibold text-[#273D32] text-base mb-2 group-hover:text-[#47735B] transition line-clamp-1">
                  {dish.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-[#5C7065]">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-[#5C7065]" /> {dish.time} phút
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

      {/* 4. SECTION: KHÁM PHÁ ẨM THỰC THEO QUỐC GIA */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-20">
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
              to={\`/cong-thuc?cuisine=\${c.code}\`}
              className="bg-white rounded-2xl overflow-hidden border border-[#DFE5DD] shadow-2xs hover:shadow-xs hover:border-[#47735B]/40 transition duration-200 group flex flex-col"
            >
              <div className="aspect-16/10 overflow-hidden bg-stone-100 relative">
                <img
                  src={c.img}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/images/cookora-tofu-1200.webp';
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
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Card: Có gì nấu nấy (White card with clean border) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-7 border border-[#DFE5DD] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1 h-5 bg-[#47735B] rounded-full inline-block" />
                <h3 className="text-xl font-semibold text-[#273D32]">Có gì nấu nấy</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#5C7065] leading-relaxed mb-5">
                Nhập nguyên liệu bạn đang có, Cookora sẽ gợi ý món phù hợp, giảm lãng phí và tiết kiệm thời gian.
              </p>

              {/* Search input */}
              <form onSubmit={addPantryItem} className="relative mb-3">
                <input
                  type="text"
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
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#47735B] text-white font-medium text-xs sm:text-sm hover:bg-[#3B634F] transition shadow-xs"
              >
                Tìm món phù hợp <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right Card: Lên thực đơn tuần */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-7 border border-[#DFE5DD] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1 h-5 bg-[#47735B] rounded-full inline-block" />
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
                          e.currentTarget.src = '/images/cookora-tofu-1200.webp';
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
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#47735B] text-white font-medium text-xs sm:text-sm hover:bg-[#3B634F] transition shadow-xs"
              >
                Tạo thực đơn ngay <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. THREE FEATURE CARDS ROW (Eat Fit, Chi Phí, Bảo Quản) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          {/* Card 3: Bảo quản thực phẩm */}
          <Link
            to="/bao-quan"
            className="bg-white rounded-2xl p-5 border border-[#DFE5DD] shadow-2xs hover:shadow-xs hover:border-[#47735B]/40 transition duration-200 group flex items-center justify-between"
          >
            <div className="space-y-1 pr-3">
              <div className="flex items-center gap-2 text-[#3E6B65]">
                <Package size={18} strokeWidth={2} />
                <h3 className="font-semibold text-sm sm:text-base text-[#273D32] group-hover:text-[#47735B] transition">
                  Bảo quản thực phẩm
                </h3>
              </div>
              <p className="text-xs text-[#5C7065] leading-relaxed">
                Hướng dẫn bảo quản, tận dụng thực phẩm an toàn, hiệu quả.
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#E8F1E9] flex items-center justify-center text-[#47735B] group-hover:bg-[#47735B] group-hover:text-white transition shrink-0">
              →
            </div>
          </Link>
        </div>
      </section>

      {/* 7. SECTION: MẸO VÀO BẾP */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2.5 text-[#273D32] font-semibold text-2xl">
              <span className="w-1 h-5 bg-[#47735B] rounded-full inline-block" />
              <h2>Mẹo vào bếp</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5C7065] mt-1">
              Kinh nghiệm nấu ăn, bảo quản và tối ưu thời gian cho bữa ăn gia đình.
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
              onClick={() => notice(\`Đang mở bài viết: \${art.title}\`)}
              className="bg-white rounded-2xl overflow-hidden border border-[#DFE5DD] shadow-2xs hover:shadow-xs hover:-translate-y-1 transition duration-300 cursor-pointer group flex flex-col"
            >
              <div className="aspect-16/10 overflow-hidden bg-stone-100">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                  onError={(e) => {
                    e.currentTarget.src = '/images/cookora-tofu-1200.webp';
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

      {/* 8. BOTTOM CALLOUT BANNER (Sage Green Banner matching image) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="bg-[#273D32] rounded-2xl p-7 sm:p-9 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Hôm nay bạn muốn nấu món gì?
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
              Khám phá thêm hàng ngàn công thức phù hợp với sở thích và thói quen ăn uống của bạn.
            </p>
          </div>

          <Link
            to="/cong-thuc"
            className="h-11 px-6 rounded-xl bg-white text-[#273D32] font-medium text-xs sm:text-sm hover:bg-[#E8F1E9] transition shadow-xs whitespace-nowrap flex items-center gap-1.5 shrink-0"
          >
            Khám phá ngay →
          </Link>
        </div>
      </section>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'frontend', 'src', 'pages', 'Home.tsx'), homeCode);
console.log('3. Refactored Home.tsx with Sage Green & Warm Cream palette matching image.');
