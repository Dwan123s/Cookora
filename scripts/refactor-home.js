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
  Activity,
  Send,
  Users,
} from 'lucide-react';
import { useNotice } from '../shared';

// 8 Quick Access Tiles with unified Warm Natural Palette
const QUICK_NAV = [
  {
    title: 'Khám phá công thức',
    to: '/cong-thuc',
    icon: ChefHat,
    color: 'text-[#D17A50]',
    bgColor: 'bg-[#F9EEE6]',
  },
  {
    title: 'Có gì nấu nấy',
    to: '/co-gi-nau-nay',
    icon: Utensils,
    color: 'text-[#274734]',
    bgColor: 'bg-[#EAF1E9]',
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
    title: 'Dinh dưỡng & Calories',
    to: '/dinh-duong',
    icon: Activity,
    color: 'text-[#4D7048]',
    bgColor: 'bg-[#EEF5ED]',
  },
  {
    title: 'Công thức yêu thích',
    to: '/yeu-thich',
    icon: Heart,
    color: 'text-[#B25D65]',
    bgColor: 'bg-[#FCEEF0]',
  },
];

// 4 Featured dishes per row on desktop (Food Magazine style)
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
    title: 'Cơm chiên kimchi',
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
    cuisine: 'Thái Lan',
  },
];

// Cuisines with generous card presentation
const CUISINES = [
  { name: 'Việt Nam', code: 'VIETNAMESE', img: '/recipes/dau-hu-sot-ca-chua.webp', count: '120+ món' },
  { name: 'Hàn Quốc', code: 'KOREAN', img: '/recipes/com-kimchi.webp', count: '45+ món' },
  { name: 'Nhật Bản', code: 'JAPANESE', img: '/recipes/com-ga-trung.webp', count: '38+ món' },
  { name: 'Trung Quốc', code: 'CHINESE', img: '/recipes/trung-xao-ca-chua.webp', count: '52+ món' },
  { name: 'Thái Lan', code: 'THAI', img: '/recipes/ga-ap-chao-sot-toi.webp', count: '30+ món' },
  { name: 'Ý & Âu', code: 'ITALIAN', img: '/recipes/mi-y-toi-dau-o-liu.webp', count: '40+ món' },
];

// Cooking tips editorial articles
const ARTICLES = [
  {
    id: 'a1',
    title: '5 mẹo nấu trứng mềm xốp, mọng nước và không bị khô',
    category: 'Mẹo vào bếp',
    readTime: '5 phút đọc',
    image: '/recipes/trung-xao-ca-chua.webp',
  },
  {
    id: 'a2',
    title: 'Bí quyết bảo quản rau thơm và củ quả tươi trọn cả tuần',
    category: 'Mẹo vào bếp',
    readTime: '6 phút đọc',
    image: '/recipes/canh-rong-bien.webp',
  },
  {
    id: 'a3',
    title: 'Kế hoạch Meal Prep 3 ngày: Tối ưu thời gian và chi phí đi chợ',
    category: 'Lên thực đơn',
    readTime: '7 phút đọc',
    image: '/recipes/com-ga-trung.webp',
  },
  {
    id: 'a4',
    title: '10 loại gia vị nền tảng tạo chiều sâu cho món cơm nhà',
    category: 'Gia vị & Hương vị',
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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      notice('Cảm ơn bạn đã đăng ký nhận bản tin từ Bếp Nhà Cookora.');
      setEmailInput('');
    }
  };

  return (
    <div className="bg-[#FAF8F5] text-[#202721] min-h-screen">
      {/* 1. HERO SECTION (Editorial 2-Column Balance) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-block text-xs font-semibold tracking-wider uppercase text-[#D17A50]">
              Bếp nhà cùng Cookora
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-semibold text-[#202721] tracking-tight leading-[1.2]">
              Nấu ngon hơn,
              <br />
              dễ hơn mỗi ngày.
            </h1>
            <p className="text-[#66746B] text-[15px] sm:text-base leading-[1.65] max-w-lg">
              Khám phá công thức nấu ăn tinh gọn, lên thực đơn tuần cân bằng, ước tính chi phí và tận dụng trọn vẹn những gì đang có trong bếp nhà.
            </p>
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/cong-thuc"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-[#274734] text-white font-medium text-[14.5px] hover:bg-[#365B43] transition shadow-xs"
              >
                <Search size={16} /> Khám phá công thức <ArrowRight size={15} />
              </Link>
              <Link
                to="/thuc-don"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-[#E8E8E1] bg-white text-[#202721] font-medium text-[14.5px] hover:bg-stone-50 transition shadow-2xs"
              >
                <Calendar size={16} className="text-[#66746B]" /> Lên thực đơn tuần
              </Link>
            </div>
          </div>

          {/* Right Column: Authentic Food Image */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[460px] aspect-4/3 rounded-2xl overflow-hidden shadow-sm border border-[#E8E8E1] bg-white p-2">
              <div className="w-full h-full rounded-xl overflow-hidden bg-stone-100 relative group">
                <img
                  src="/recipes/dau-hu-sot-ca-chua.webp"
                  alt="Đậu hũ sốt cà chua"
                  className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  onError={(e) => {
                    e.currentTarget.src = '/images/cookora-tofu-1200.webp';
                  }}
                />
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium text-[#202721] shadow-xs">
                  Đậu hũ sốt cà chua · 25 phút
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EIGHT QUICK ACCESS TILES */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-3.5">
          {QUICK_NAV.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.title}
                to={tile.to}
                className="bg-white rounded-2xl p-4 border border-[#E8E8E1] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition duration-200 flex flex-col items-center text-center group"
              >
                <div
                  className={\`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition \${tile.bgColor} \${tile.color} group-hover:scale-105\`}
                >
                  <Icon size={19} strokeWidth={2} />
                </div>
                <span className="text-[13px] font-medium text-[#202721] leading-tight group-hover:text-[#274734] transition">
                  {tile.title}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. SECTION: MÓN NGON GỢI Ý CHO BẠN (Magazine Editorial 4-Card Grid) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="flex items-center gap-2.5 text-[#202721] font-semibold text-2xl sm:text-[28px]">
              <span className="w-1 h-6 bg-[#D17A50] rounded-full inline-block" />
              <h2>Món ngon gợi ý cho bạn</h2>
            </div>
            <p className="text-sm text-[#66746B] mt-1.5">
              Những công thức mộc mạc, dễ làm được nhiều gia đình nấu nhất tuần qua.
            </p>
          </div>
          <Link
            to="/cong-thuc"
            className="text-sm font-medium text-[#274734] hover:text-[#365B43] flex items-center gap-1 transition self-start sm:self-auto"
          >
            Xem tất cả công thức →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_DISHES.map((dish) => (
            <Link
              key={dish.id}
              to={\`/cong-thuc/\${dish.slug}\`}
              className="bg-white rounded-2xl overflow-hidden border border-[#E8E8E1] shadow-2xs hover:shadow-md hover:-translate-y-1 transition duration-300 group flex flex-col"
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
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#66746B] hover:text-[#B25D65] shadow-xs transition"
                  title="Lưu món"
                >
                  <Heart
                    size={15}
                    className={favorites[dish.id] ? 'fill-[#B25D65] text-[#B25D65]' : ''}
                  />
                </button>
                <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/50 backdrop-blur-xs text-[11px] font-medium text-white">
                  {dish.cuisine}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="font-semibold text-[#202721] text-[17px] mb-2 group-hover:text-[#274734] transition line-clamp-1">
                  {dish.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-[#66746B]">
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-stone-400" /> {dish.time} phút
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={13} className="text-stone-400" /> {dish.servings} người
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. SECTION: KHÁM PHÁ ẨM THỰC THEO QUỐC GIA */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-24">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 text-[#202721] font-semibold text-2xl sm:text-[28px]">
              <span className="w-1 h-6 bg-[#D17A50] rounded-full inline-block" />
              <h2>Khám phá ẩm thực theo quốc gia</h2>
            </div>
            <p className="text-sm text-[#66746B] mt-1.5">
              Từ mâm cơm Việt Nam thuần vị đến những hương vị đặc trưng khắp năm châu.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button className="w-9 h-9 rounded-full border border-[#E8E8E1] bg-white flex items-center justify-center text-[#66746B] hover:text-[#202721] hover:bg-stone-50 transition">
              <ChevronLeft size={16} />
            </button>
            <button className="w-9 h-9 rounded-full border border-[#E8E8E1] bg-white flex items-center justify-center text-[#66746B] hover:text-[#202721] hover:bg-stone-50 transition">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CUISINES.map((c) => (
            <Link
              key={c.code}
              to={\`/cong-thuc?cuisine=\${c.code}\`}
              className="bg-white rounded-2xl p-3.5 border border-[#E8E8E1] shadow-2xs hover:shadow-xs hover:border-[#66746B]/40 transition duration-200 flex flex-col items-center group text-center"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden bg-stone-100 mb-3 border border-[#E8E8E1]">
                <img
                  src={c.img}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/images/cookora-tofu-1200.webp';
                  }}
                />
              </div>
              <h3 className="text-sm font-semibold text-[#202721] group-hover:text-[#274734] transition">
                {c.name}
              </h3>
              <span className="text-xs text-[#66746B] mt-0.5">
                {c.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. SECTION: CÓ GÌ NẤU NẤY (Refined Forest Green Utility Banner) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-24">
        <div className="bg-[#274734] rounded-2xl p-8 sm:p-10 lg:p-12 text-white shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Inputs */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="w-1 h-6 bg-[#D17A50] rounded-full inline-block" />
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  Có gì nấu nấy
                </h2>
              </div>
              <p className="text-sm text-stone-200 leading-relaxed max-w-md">
                Chỉ cần chọn hoặc nhập các nguyên liệu sẵn có trong tủ lạnh. Cookora sẽ đề xuất món ăn phù hợp nhất và chỉ rõ nguyên liệu cần mua thêm (nếu có).
              </p>

              {/* Input */}
              <form onSubmit={addPantryItem} className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Nhập nguyên liệu: trứng, cà chua, thịt bò..."
                  value={pantryInput}
                  onChange={(e) => setPantryInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-[#202721] text-sm placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#D17A50]"
                />
                <Search size={17} className="absolute left-3.5 top-3.5 text-stone-400" />
              </form>

              {/* Selected Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {pantryItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium text-white border border-white/15"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removePantryItem(item)}
                      className="hover:text-[#D17A50] transition"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => navigate('/co-gi-nau-nay')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/20 text-xs font-medium text-white hover:bg-white/30 transition"
                >
                  <Plus size={13} /> Thêm nguyên liệu
                </button>
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <Link
                  to="/co-gi-nau-nay"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#D17A50] text-white font-medium text-sm hover:bg-[#c26d44] transition shadow-xs"
                >
                  Tìm món phù hợp <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Right Mini Dishes List */}
            <div className="lg:col-span-6 space-y-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                Gợi ý nhanh từ nguyên liệu của bạn
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    name: 'Trứng xào cà chua',
                    slug: 'trung-xao-ca-chua',
                    time: 18,
                    match: 'Khớp 100%',
                    img: '/recipes/trung-xao-ca-chua.webp',
                  },
                  {
                    name: 'Đậu hũ sốt cà chua',
                    slug: 'dau-hu-sot-ca-chua',
                    time: 25,
                    match: 'Khớp 90%',
                    img: '/recipes/dau-hu-sot-ca-chua.webp',
                  },
                  {
                    name: 'Canh trứng cà chua',
                    slug: 'canh-rong-bien',
                    time: 15,
                    match: 'Khớp 85%',
                    img: '/recipes/canh-rong-bien.webp',
                  },
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={\`/cong-thuc/\${item.slug}\`}
                    className="bg-white rounded-xl p-3 text-[#202721] shadow-2xs hover:shadow-xs transition group flex flex-col"
                  >
                    <div className="aspect-4/3 rounded-lg overflow-hidden bg-stone-100 mb-2.5">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition"
                        onError={(e) => {
                          e.currentTarget.src = '/images/cookora-tofu-1200.webp';
                        }}
                      />
                    </div>
                    <p className="font-semibold text-xs text-[#202721] group-hover:text-[#274734] transition line-clamp-1">
                      {item.name}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[#66746B] mt-1.5">
                      <span>~{item.time} phút</span>
                      <span className="text-[#274734] font-medium">{item.match}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION: LÊN THỰC ĐƠN TUẦN */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-24">
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-[#E8E8E1] shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Description */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1 h-6 bg-[#D17A50] rounded-full inline-block" />
                <h2 className="text-2xl sm:text-[28px] font-semibold text-[#202721]">
                  Lên thực đơn tuần
                </h2>
              </div>
              <p className="text-sm text-[#66746B] leading-[1.65]">
                Sắp xếp bữa ăn từ Thứ 2 đến Chủ nhật một cách nhẹ nhàng. Danh sách đi chợ sẽ tự động tổng hợp nguyên liệu theo khẩu phần thực tế.
              </p>
              <Link
                to="/thuc-don"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#274734] text-white font-medium text-sm hover:bg-[#365B43] transition shadow-xs"
              >
                Tạo thực đơn tuần <ArrowRight size={15} />
              </Link>
            </div>

            {/* Right Mini Schedule Display */}
            <div className="lg:col-span-7 bg-[#FAF8F5] rounded-xl p-5 border border-[#E8E8E1]">
              <div className="flex items-center justify-between mb-4 text-xs font-semibold text-[#202721]">
                <span className="flex items-center gap-1.5">
                  <Calendar size={15} className="text-[#D17A50]" /> Xem trước lịch ăn tuần
                </span>
                <span className="text-[#66746B]">2 người ăn</span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => (
                  <div key={day} className="flex flex-col items-center">
                    <span className="text-[11px] font-medium text-[#66746B] mb-1.5">{day}</span>
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden border border-[#E8E8E1] shadow-2xs bg-stone-100">
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
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-24">
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-[#E8E8E1] shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Goal Selector */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-1 h-6 bg-[#D17A50] rounded-full inline-block" />
                <h2 className="text-2xl sm:text-[28px] font-semibold text-[#202721]">
                  Eat Fit – Thực đơn theo mục tiêu
                </h2>
              </div>
              <p className="text-sm text-[#66746B] leading-[1.65]">
                Tính toán nhu cầu năng lượng và khẩu phần vĩ mô (Carbs, Protein, Fat) chuẩn mực cho từng mục tiêu thể chất.
              </p>

              {/* 3 Pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEatFitGoal('lose')}
                  className={\`px-4 py-2 rounded-xl text-xs font-medium transition \${
                    eatFitGoal === 'lose'
                      ? 'bg-[#274734] text-white'
                      : 'bg-[#FAF8F5] text-[#66746B] border border-[#E8E8E1] hover:bg-stone-100'
                  }\`}
                >
                  Giảm mỡ
                </button>
                <button
                  type="button"
                  onClick={() => setEatFitGoal('balance')}
                  className={\`px-4 py-2 rounded-xl text-xs font-medium transition \${
                    eatFitGoal === 'balance'
                      ? 'bg-[#274734] text-white'
                      : 'bg-[#FAF8F5] text-[#66746B] border border-[#E8E8E1] hover:bg-stone-100'
                  }\`}
                >
                  Ăn cân bằng
                </button>
                <button
                  type="button"
                  onClick={() => setEatFitGoal('gain')}
                  className={\`px-4 py-2 rounded-xl text-xs font-medium transition \${
                    eatFitGoal === 'gain'
                      ? 'bg-[#274734] text-white'
                      : 'bg-[#FAF8F5] text-[#66746B] border border-[#E8E8E1] hover:bg-stone-100'
                  }\`}
                >
                  Tăng cơ
                </button>
              </div>

              <div>
                <Link
                  to="/eat-fit"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#274734] text-white font-medium text-sm hover:bg-[#365B43] transition shadow-xs"
                >
                  Khám phá Eat Fit <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Center Plate image */}
            <div className="lg:col-span-3 flex justify-center">
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-xs border-2 border-[#E8E8E1]">
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
            <div className="lg:col-span-4 bg-[#FAF8F5] rounded-xl p-5 border border-[#E8E8E1]">
              <p className="text-xs font-semibold text-[#202721] mb-3">
                Mục tiêu: 2.000 kcal / ngày
              </p>
              <div className="flex items-center gap-5">
                <div className="w-18 h-18 rounded-full border-4 border-[#274734] border-t-[#D17A50] border-r-[#8C6D3B] flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#202721]">2.000</span>
                  <span className="text-[10px] text-[#66746B]">kcal</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <p className="text-[#66746B] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D17A50]" />
                    Carbohydrate: <strong className="text-[#202721]">50% (250g)</strong>
                  </p>
                  <p className="text-[#66746B] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#274734]" />
                    Protein: <strong className="text-[#202721]">30% (150g)</strong>
                  </p>
                  <p className="text-[#66746B] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8C6D3B]" />
                    Chất béo: <strong className="text-[#202721]">20% (44g)</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ƯỚC TÍNH CHI PHÍ */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Ước tính chi phí */}
          <Link
            to="/ngan-sach"
            className="bg-white rounded-2xl p-7 border border-[#E8E8E1] shadow-2xs hover:shadow-sm hover:border-[#66746B]/40 transition duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FBF6E9] text-[#846A36] flex items-center justify-center">
                    <Wallet size={18} strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#202721] group-hover:text-[#274734] transition">
                    Ước tính chi phí
                  </h3>
                </div>
                <span className="text-xs font-medium text-[#274734] group-hover:translate-x-0.5 transition">
                  →
                </span>
              </div>
              <p className="text-sm text-[#66746B] mb-6">
                Tính toán tổng chi phí nguyên liệu cho tuần ăn, cân đối ngân sách gia đình hợp lý.
              </p>
            </div>

            <div className="bg-[#FAF8F5] rounded-xl p-4 flex items-center justify-between border border-[#E8E8E1]">
              <div>
                <p className="text-xs text-[#66746B]">Ngân sách gợi ý tuần này</p>
                <p className="text-xl font-semibold text-[#274734] mt-0.5">298.000 đ</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#EAF1E9] text-[#274734]">
                Tiết kiệm 12%
              </span>
            </div>
          </Link>

        </div>
      </section>

      {/* 9. SECTION: MẸO VÀO BẾP */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="flex items-center gap-2.5 text-[#202721] font-semibold text-2xl sm:text-[28px]">
              <span className="w-1 h-6 bg-[#D17A50] rounded-full inline-block" />
              <h2>Mẹo vào bếp</h2>
            </div>
            <p className="text-sm text-[#66746B] mt-1.5">
              Kinh nghiệm thực tế và cảm hứng hữu ích cho gian bếp gia đình.
            </p>
          </div>
          <button
            onClick={() => notice('Đang mở thư viện bài viết mẹo vào bếp.')}
            className="text-sm font-medium text-[#274734] hover:text-[#365B43] flex items-center gap-1 transition self-start sm:self-auto"
          >
            Xem tất cả bài viết →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ARTICLES.map((art) => (
            <div
              key={art.id}
              onClick={() => notice(\`Đang mở bài viết: \${art.title}\`)}
              className="bg-white rounded-2xl overflow-hidden border border-[#E8E8E1] shadow-2xs hover:shadow-xs hover:-translate-y-1 transition duration-300 cursor-pointer group flex flex-col"
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
                <h3 className="font-semibold text-[#202721] text-[15px] mb-2 group-hover:text-[#274734] transition line-clamp-2 leading-snug">
                  {art.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-[#66746B] pt-2">
                  <span>{art.category}</span>
                  <span>{art.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. SECTION: NEWSLETTER CTA BAR (Deep Forest Green #274734) */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="bg-[#274734] rounded-2xl p-8 sm:p-10 lg:p-12 text-white shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2 max-w-lg">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white flex items-center gap-2.5">
                <Send size={22} className="text-[#D17A50]" /> Cùng Cookora nấu ngon hơn
              </h2>
              <p className="text-sm text-stone-200 leading-relaxed">
                Nhận công thức mới, mẹo bảo quản hay và thực đơn theo mùa gửi thẳng vào hộp thư của bạn.
              </p>
            </div>

            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto"
            >
              <input
                type="email"
                placeholder="Nhập địa chỉ email của bạn..."
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white text-[#202721] text-sm placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#D17A50] min-w-[280px]"
              />
              <button
                type="submit"
                className="h-11 px-6 rounded-xl bg-[#D17A50] text-white font-medium text-sm hover:bg-[#c26d44] transition shadow-xs whitespace-nowrap"
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

fs.writeFileSync(path.join(__dirname, '..', 'frontend', 'src', 'pages', 'Home.tsx'), homeCode);
console.log('4. Refactored Home.tsx with Senior UI/UX specifications!');
