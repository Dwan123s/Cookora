const fs = require('fs');

const homeCode = `import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bookmark,
  Calendar,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Heart,
  Minus,
  Plus,
  Search,
  Sparkles,
  Utensils,
  Wallet,
  X,
  Activity,
  Send,
  Check,
} from 'lucide-react';
import { useNotice } from '../shared';

// 8 Quick Access Cards matching the design
const QUICK_NAV = [
  {
    title: 'Khám phá công thức',
    to: '/cong-thuc',
    icon: ChefHat,
    bg: 'bg-orange-50 text-orange-600 border-orange-100',
  },
  {
    title: 'Có gì nấu nấy',
    to: '/co-gi-nau-nay',
    icon: Utensils,
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    title: 'Thực đơn tuần',
    to: '/thuc-don',
    icon: Calendar,
    bg: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  {
    title: 'Eat Fit',
    to: '/eat-fit',
    icon: Dumbbell,
    bg: 'bg-purple-50 text-purple-600 border-purple-100',
  },
  {
    title: 'Ước tính chi phí',
    to: '/ngan-sach',
    icon: Wallet,
    bg: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  },
  {
    title: 'Dinh dưỡng & Calories',
    to: '/dinh-duong',
    icon: Activity,
    bg: 'bg-lime-50 text-lime-700 border-lime-100',
  },
  {
    title: 'Công thức yêu thích',
    to: '/yeu-thich',
    icon: Heart,
    bg: 'bg-rose-50 text-rose-600 border-rose-100',
  },
];

// 5 Featured dishes
const FEATURED_DISHES = [
  {
    id: 'd1',
    title: 'Đậu hũ sốt cà chua',
    slug: 'dau-hu-sot-ca-chua',
    image: '/recipes/dau-hu-sot-ca-chua.webp',
    time: 25,
    servings: 2,
  },
  {
    id: 'd2',
    title: 'Cơm kimchi',
    slug: 'com-kimchi',
    image: '/recipes/com-kimchi.webp',
    time: 20,
    servings: 2,
  },
  {
    id: 'd3',
    title: 'Trứng xào cà chua',
    slug: 'trung-xao-ca-chua',
    image: '/recipes/trung-xao-ca-chua.webp',
    time: 18,
    servings: 2,
  },
  {
    id: 'd4',
    title: 'Gà áp chảo sốt tỏi',
    slug: 'ga-ap-chao-sot-toi',
    image: '/recipes/ga-ap-chao-sot-toi.webp',
    time: 25,
    servings: 2,
  },
  {
    id: 'd5',
    title: 'Spaghetti tỏi & dầu ô liu',
    slug: 'mi-y-toi-dau-o-liu',
    image: '/recipes/mi-y-toi-dau-o-liu.webp',
    time: 23,
    servings: 2,
  },
];

// Cuisines
const CUISINES = [
  { name: 'Việt Nam', code: 'VIETNAMESE', img: '/recipes/dau-hu-sot-ca-chua.webp' },
  { name: 'Hàn Quốc', code: 'KOREAN', img: '/recipes/com-kimchi.webp' },
  { name: 'Nhật Bản', code: 'JAPANESE', img: '/recipes/com-ga-trung.webp' },
  { name: 'Trung Quốc', code: 'CHINESE', img: '/recipes/trung-xao-ca-chua.webp' },
  { name: 'Thái Lan', code: 'THAI', img: '/recipes/ga-ap-chao-sot-toi.webp' },
  { name: 'Ý', code: 'ITALIAN', img: '/recipes/mi-y-toi-dau-o-liu.webp' },
  { name: 'Âu & Mỹ', code: 'WESTERN', img: '/recipes/thit-nuong.webp' },
];

// Cooking tips articles
const ARTICLES = [
  {
    id: 'a1',
    title: '5 mẹo nấu trứng ngon và không bị khô',
    category: 'Mẹo nấu ăn',
    readTime: '5 phút đọc',
    image: '/recipes/trung-xao-ca-chua.webp',
  },
  {
    id: 'a2',
    title: 'Cách sơ chế rau củ nhanh gọn cho bữa cơm nhà',
    category: 'Mẹo vào bếp',
    readTime: '6 phút đọc',
    image: '/recipes/canh-rong-bien.webp',
  },
  {
    id: 'a3',
    title: 'Meal prep cho cả tuần: Tiết kiệm thời gian & chi phí',
    category: 'Lên thực đơn',
    readTime: '7 phút đọc',
    image: '/recipes/com-ga-trung.webp',
  },
  {
    id: 'a4',
    title: '10 gia vị cơ bản giúp món ăn đậm đà hơn',
    category: 'Kiến thức bếp',
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
  const [eatFitGoal, setEatFitGoal] = useState<'lose' | 'balance' | 'gain'>('gain');
  const [emailInput, setEmailInput] = useState('');

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = !prev[id];
      notice(next ? 'Đã lưu vào danh sách yêu thích!' : 'Đã bỏ lưu món.');
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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      notice('Cảm ơn bạn đã đăng ký nhận bản tin của Cookora!');
      setEmailInput('');
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-stone-800 pb-16">
      {/* 1. HERO SECTION */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-5">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C85233]">
              BẾP NHÀ CÙNG COOKORA
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-stone-900 tracking-tight leading-[1.12]">
              Nấu ngon hơn,
              <br />
              dễ hơn mỗi ngày.
            </h1>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-lg">
              Khám phá công thức, lên thực đơn, ước tính chi phí và ăn uống lành mạnh — tất cả trong một nơi.
            </p>
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/cong-thuc"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C85233] text-white font-bold text-sm hover:bg-[#b04529] transition shadow-xs"
              >
                <Search size={16} /> Khám phá công thức <ArrowRight size={15} />
              </Link>
              <Link
                to="/thuc-don"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-stone-300 bg-white/90 text-stone-800 font-bold text-sm hover:bg-stone-50 transition shadow-xs"
              >
                <Calendar size={16} className="text-stone-500" /> Lên thực đơn tuần
              </Link>
            </div>
          </div>

          {/* Right Hero Image with Pin Tags */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-[500px] aspect-square rounded-full p-3 shadow-sm bg-gradient-to-tr from-amber-100/40 via-orange-50/50 to-emerald-50/30">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md relative group">
                <img
                  src="/recipes/dau-hu-sot-ca-chua.webp"
                  alt="Đậu hũ sốt cà chua"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  onError={(e) => {
                    e.currentTarget.src = '/images/cookora-tofu-1200.webp';
                  }}
                />
              </div>

              {/* Pin Tag 1: Cà chua */}
              <div className="absolute top-14 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-stone-100 text-xs font-bold text-stone-800 flex items-center gap-1.5 animate-bounce [animation-duration:3s]">
                <span>🍅</span> Cà chua
              </div>

              {/* Pin Tag 2: Đậu hũ */}
              <div className="absolute top-8 right-6 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-stone-100 text-xs font-bold text-stone-800 flex items-center gap-1.5 animate-bounce [animation-duration:3.4s]">
                <span>🥟</span> Đậu hũ
              </div>

              {/* Pin Tag 3: Hành lá */}
              <div className="absolute bottom-16 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-stone-100 text-xs font-bold text-stone-800 flex items-center gap-1.5 animate-bounce [animation-duration:2.8s]">
                <span>🌿</span> Hành lá
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 8 QUICK ACCESS TILES */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 mb-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {QUICK_NAV.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.title}
                to={tile.to}
                className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 transition duration-200 flex flex-col items-center text-center group"
              >
                <div
                  className={\`w-11 h-11 rounded-xl flex items-center justify-center mb-2 border transition \${tile.bg} group-hover:scale-110\`}
                >
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <span className="text-xs font-bold text-stone-800 leading-tight">
                  {tile.title}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. SECTION: MÓN NGON GỢI Ý CHO BẠN */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 mb-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 text-stone-900 font-extrabold text-xl sm:text-2xl">
              <span className="w-1.5 h-6 bg-[#C85233] rounded-full inline-block" />
              <h2>Món ngon gợi ý cho bạn</h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Những công thức được cộng đồng Cookora yêu thích nhất tuần này.
            </p>
          </div>
          <Link
            to="/cong-thuc"
            className="text-xs sm:text-sm font-bold text-[#C85233] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Xem tất cả công thức →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {FEATURED_DISHES.map((dish) => (
            <Link
              key={dish.id}
              to={\`/cong-thuc/\${dish.slug}\`}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-2xs hover:shadow-md transition duration-200 group flex flex-col"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                <img
                  src={dish.image}
                  alt={dish.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    e.currentTarget.src = '/images/cookora-tofu-1200.webp';
                  }}
                />
                <button
                  onClick={(e) => toggleFav(dish.id, e)}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-700 hover:text-red-500 shadow-xs transition"
                >
                  <Heart
                    size={15}
                    className={favorites[dish.id] ? 'fill-red-500 text-red-500' : ''}
                  />
                </button>
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-stone-900 text-sm mb-2 group-hover:text-[#C85233] transition line-clamp-1">
                  {dish.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> ~{dish.time} phút
                  </span>
                  <span>👥 {dish.servings} phần</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. SECTION: KHÁM PHÁ ẨM THỰC THEO QUỐC GIA */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 mb-14">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-stone-900 font-extrabold text-xl sm:text-2xl">
              <span className="w-1.5 h-6 bg-[#C85233] rounded-full inline-block" />
              <h2>Khám phá ẩm thực theo quốc gia</h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Hàng nghìn công thức đặc trưng từ khắp nơi trên thế giới.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button className="w-8 h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
          {CUISINES.map((c) => (
            <Link
              key={c.code}
              to={\`/cong-thuc?cuisine=\${c.code}\`}
              className="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-2xs hover:shadow-sm hover:border-stone-400 transition flex flex-col items-center group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-stone-100 mb-2.5 border border-stone-100">
                <img
                  src={c.img}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/images/cookora-tofu-1200.webp';
                  }}
                />
              </div>
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-xs font-bold text-stone-900 group-hover:text-[#C85233] transition truncate">
                  {c.name}
                </span>
                <span className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-[10px] text-stone-600 group-hover:bg-[#C85233] group-hover:text-white transition shrink-0">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. SECTION: CÓ GÌ NẤU NẤY (DEEP GREEN CONTAINER) */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 mb-14">
        <div className="bg-[#233527] rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Inputs */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#C85233] rounded-full inline-block" />
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Có gì nấu nấy</h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-300">
                Nhập những nguyên liệu bạn đang có, Cookora sẽ gợi ý món phù hợp.
              </p>

              {/* Input */}
              <form onSubmit={addPantryItem} className="relative">
                <input
                  type="text"
                  placeholder="Nhập nguyên liệu: trứng, cà chua, hành lá..."
                  value={pantryInput}
                  onChange={(e) => setPantryInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-stone-800 text-xs sm:text-sm placeholder-stone-400 focus:outline-hidden"
                />
                <Search size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
              </form>

              {/* Selected Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {pantryItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-white border border-white/20"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removePantryItem(item)}
                      className="hover:text-red-300 transition"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => navigate('/co-gi-nau-nay')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/25 text-xs font-semibold text-white hover:bg-white/35 transition"
                >
                  <Plus size={12} /> Thêm nguyên liệu
                </button>
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <Link
                  to="/co-gi-nau-nay"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C85233] text-white font-bold text-xs sm:text-sm hover:bg-[#b04529] transition shadow-xs"
                >
                  Tìm món gợi ý <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Right Mini Dishes List */}
            <div className="lg:col-span-6 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-300">
                Gợi ý từ nguyên liệu của bạn
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    name: 'Trứng xào cà chua',
                    slug: 'trung-xao-ca-chua',
                    time: 18,
                    img: '/recipes/trung-xao-ca-chua.webp',
                  },
                  {
                    name: 'Đậu hũ sốt cà chua',
                    slug: 'dau-hu-sot-ca-chua',
                    time: 25,
                    img: '/recipes/dau-hu-sot-ca-chua.webp',
                  },
                  {
                    name: 'Canh cà chua trứng',
                    slug: 'canh-rong-bien',
                    time: 15,
                    img: '/recipes/canh-rong-bien.webp',
                  },
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={\`/cong-thuc/\${item.slug}\`}
                    className="bg-white rounded-2xl p-2.5 text-stone-800 shadow-xs hover:scale-102 transition group flex flex-col"
                  >
                    <div className="aspect-4/3 rounded-xl overflow-hidden bg-stone-100 mb-2">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        onError={(e) => {
                          e.currentTarget.src = '/images/cookora-tofu-1200.webp';
                        }}
                      />
                    </div>
                    <p className="font-bold text-xs text-stone-900 group-hover:text-[#C85233] transition line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-1">
                      <Clock size={11} /> ~{item.time} phút
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION: LÊN THỰC ĐƠN TUẦN */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 mb-14">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Description */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#C85233] rounded-full inline-block" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                  Lên thực đơn tuần
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Lập kế hoạch bữa ăn cân bằng, tiết kiệm và dễ thực hiện cho cả gia đình.
              </p>
              <Link
                to="/thuc-don"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C85233] text-white font-bold text-xs sm:text-sm hover:bg-[#b04529] transition shadow-xs"
              >
                Tạo thực đơn ngay <ArrowRight size={15} />
              </Link>
            </div>

            {/* Right Mini Schedule Display */}
            <div className="lg:col-span-7 bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-stone-200/60">
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-stone-700">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#C85233]" /> Thực đơn tuần mẫu
                </span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'].map((day, idx) => (
                  <div key={day} className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-stone-500 mb-1.5">{day}</span>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white shadow-2xs bg-stone-200">
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
          </div>
        </div>
      </section>

      {/* 7. SECTION: EAT FIT – THỰC ĐƠN THEO MỤC TIÊU */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 mb-14">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Goal Selector */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#C85233] rounded-full inline-block" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                  Eat Fit – Thực đơn theo mục tiêu
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-600">
                Ăn ngon, lành mạnh và đúng mục tiêu sức khỏe của bạn.
              </p>

              {/* 3 Pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEatFitGoal('lose')}
                  className={\`px-3.5 py-1.5 rounded-full text-xs font-bold transition \${
                    eatFitGoal === 'lose'
                      ? 'bg-purple-100 text-purple-800 border-2 border-purple-400'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }\`}
                >
                  🏷 Giảm cân
                </button>
                <button
                  type="button"
                  onClick={() => setEatFitGoal('balance')}
                  className={\`px-3.5 py-1.5 rounded-full text-xs font-bold transition \${
                    eatFitGoal === 'balance'
                      ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }\`}
                >
                  🌿 Ăn cân bằng
                </button>
                <button
                  type="button"
                  onClick={() => setEatFitGoal('gain')}
                  className={\`px-3.5 py-1.5 rounded-full text-xs font-bold transition \${
                    eatFitGoal === 'gain'
                      ? 'bg-amber-100 text-amber-800 border-2 border-amber-400'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }\`}
                >
                  ⚡ Tăng cơ
                </button>
              </div>

              <div>
                <Link
                  to="/eat-fit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#233527] text-white font-bold text-xs sm:text-sm hover:bg-[#2e4634] transition shadow-xs"
                >
                  Khám phá Eat Fit <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Center Bowl image */}
            <div className="lg:col-span-3 flex justify-center">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-md border-4 border-white">
                <img
                  src="/recipes/ga-ap-chao-sot-toi.webp"
                  alt="Eat Fit Bowl"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/gai-yang.webp';
                  }}
                />
              </div>
            </div>

            {/* Right Donut / Macro Stats Card */}
            <div className="lg:col-span-4 bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-stone-200/60">
              <p className="text-xs font-bold text-stone-700 mb-3">
                📋 Thực đơn gợi ý (2.000 kcal/ngày)
              </p>
              <div className="flex items-center gap-5">
                {/* Mini Circular Stat */}
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500 border-t-amber-400 border-r-purple-400 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-extrabold text-stone-900 leading-tight">2.000</span>
                  <span className="text-[9px] text-stone-500">kcal</span>
                </div>
                {/* Legend */}
                <div className="space-y-1 text-xs">
                  <p className="text-stone-700 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Carb: <strong className="text-stone-900">50% (250 g)</strong>
                  </p>
                  <p className="text-stone-700 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Protein: <strong className="text-stone-900">30% (150 g)</strong>
                  </p>
                  <p className="text-stone-700 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    Fat: <strong className="text-stone-900">20% (44 g)</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TWO CARDS: ƯỚC TÍNH CHI PHÍ & BẢO QUẢN THỰC PHẨM */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 mb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Ước tính chi phí */}
          <Link
            to="/ngan-sach"
            className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-2xs hover:shadow-md transition duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wallet size={20} className="text-[#C85233]" />
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#C85233] transition">
                    Ước tính chi phí
                  </h3>
                </div>
                <span className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-xs text-stone-600 group-hover:bg-[#C85233] group-hover:text-white transition">
                  →
                </span>
              </div>
              <p className="text-xs text-stone-500 mb-5">
                Tính nhanh chi phí nấu ăn, tối ưu ngân sách hàng tuần.
              </p>
            </div>

            <div className="bg-[#FAF8F5] rounded-2xl p-4 flex items-center justify-between border border-stone-200/60">
              <div>
                <p className="text-[11px] text-stone-500 font-medium">Chi phí gợi ý/tuần</p>
                <p className="text-xl font-extrabold text-[#C85233]">298.000 đ</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                ↓ -12% so với tuần trước
              </span>
            </div>
          </Link>

        </div>
      </section>

      {/* 9. SECTION: MẸO VÀO BẾP */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 mb-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 text-stone-900 font-extrabold text-xl sm:text-2xl">
              <span className="w-1.5 h-6 bg-[#C85233] rounded-full inline-block" />
              <h2>Mẹo vào bếp</h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Kinh nghiệm, bí quyết và cảm hứng nấu ăn từ Cookora.
            </p>
          </div>
          <button
            onClick={() => notice('Đang mở thư viện bài viết mẹo vào bếp!')}
            className="text-xs sm:text-sm font-bold text-[#C85233] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Xem tất cả bài viết →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ARTICLES.map((art) => (
            <div
              key={art.id}
              onClick={() => notice(\`Đang mở bài viết: \${art.title}\`)}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-2xs hover:shadow-md transition duration-200 cursor-pointer group flex flex-col"
            >
              <div className="aspect-16/10 overflow-hidden bg-stone-100">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    e.currentTarget.src = '/images/cookora-tofu-1200.webp';
                  }}
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-stone-900 text-sm mb-2 group-hover:text-[#C85233] transition line-clamp-2">
                  {art.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium">
                  <span>{art.category}</span>
                  <span>• {art.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. SECTION: NEWSLETTER CTA BAR (DEEP GREEN) */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6">
        <div className="bg-[#233527] rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                <Send size={20} className="text-[#C85233]" /> Cùng Cookora nấu ngon hơn
              </h2>
              <p className="text-xs sm:text-sm text-stone-300">
                Nhận công thức mới, mẹo bếp hay và thực đơn theo mùa gửi thẳng vào email của bạn.
              </p>
            </div>

            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto"
            >
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-white text-stone-800 text-xs sm:text-sm placeholder-stone-400 focus:outline-hidden min-w-[260px]"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-[#C85233] text-white font-bold text-xs sm:text-sm hover:bg-[#b04529] transition shadow-xs whitespace-nowrap"
              >
                Đăng ký ngay →
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
`;

fs.writeFileSync('frontend/src/pages/Home.tsx', homeCode);
console.log('Successfully updated Home.tsx matching the master mock-up image!');
