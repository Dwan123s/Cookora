const fs = require('fs');

const matcherCode = `import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Check,
  ChefHat,
  Clock3,
  Heart,
  Minus,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import type {
  AiChefSuggestionResponse,
  AiSuggestedDish,
  Ingredient,
  Recipe,
} from '@cookora/contracts';
import { request } from '../api';
import { Loading, ErrorState, useNotice } from '../shared';

const POPULAR_INGREDIENTS = [
  'Đậu hũ',
  'Cơm nguội',
  'Thịt gà',
  'Khoai tây',
  'Cải xanh',
  'Tỏi',
  'Thịt bò',
  'Thịt heo',
  'Nấm hương',
];

interface MatchedDishDisplay {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  matchScore: number;
  matchTag: string;
  matchDesc: string;
  cookMinutes: number;
  missingNote: string;
}

export function Matcher() {
  const navigate = useNavigate();
  const notice = useNotice();

  const [activeTab, setActiveTab] = useState<'pantry' | 'ai'>('pantry');
  const [selectedItems, setSelectedItems] = useState<string[]>(['Trứng', 'Cà chua', 'Hành lá']);
  const [inputValue, setInputValue] = useState('');
  const [servings, setServings] = useState(2);
  const [onlyFullMatch, setOnlyFullMatch] = useState(false);

  // AI prompt state
  const [aiPrompt, setAiPrompt] = useState('2 lạng thịt bò, 3 lạng thịt heo, 2 bó rau muống');

  // Query all database recipes
  const recipesQuery = useQuery({
    queryKey: ['recipes', 'matcher'],
    queryFn: () => request<Recipe[]>('/recipes?pageSize=50'),
  });

  // AI mutation
  const aiMutation = useMutation({
    mutationFn: () =>
      request<AiChefSuggestionResponse>('/ai/suggest-recipes', {
        method: 'POST',
        body: {
          prompt: aiPrompt.trim(),
          servings,
        },
      }),
  });

  const handleAddItem = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    if (!selectedItems.includes(trimmed)) {
      setSelectedItems((prev) => [...prev, trimmed]);
    }
    setInputValue('');
  };

  const handleRemoveItem = (item: string) => {
    setSelectedItems((prev) => prev.filter((i) => i !== item));
  };

  const dbRecipes = recipesQuery.data?.data || [];

  // Static list of representative dishes with images matching 03_pantry.png
  const mockMatches: MatchedDishDisplay[] = [
    {
      id: 'm1',
      slug: 'trung-xao-ca-chua',
      title: 'Trứng xào cà chua',
      imageUrl: '/recipes/trung-xao-ca-chua.webp',
      matchScore: 96,
      matchTag: 'Rất phù hợp',
      matchDesc: 'Có đủ ba nguyên liệu chính bạn đã chọn.',
      cookMinutes: 18,
      missingNote: 'Cần kiểm tra dầu, gia vị',
    },
    {
      id: 'm2',
      slug: 'dau-hu-sot-ca-chua',
      title: 'Đậu hũ sốt cà chua',
      imageUrl: '/recipes/dau-hu-sot-ca-chua.webp',
      matchScore: 81,
      matchTag: 'Thiếu 1 món',
      matchDesc: 'Còn thiếu đậu hũ; có thể thêm vào danh sách mua.',
      cookMinutes: 25,
      missingNote: 'Thiếu: đậu hũ',
    },
    {
      id: 'm3',
      slug: 'com-kimchi',
      title: 'Cơm kimchi',
      imageUrl: '/recipes/com-kimchi.webp',
      matchScore: 77,
      matchTag: 'Thiếu 1 món',
      matchDesc: 'Bạn cần thêm kimchi hoặc rau củ muối phù hợp.',
      cookMinutes: 20,
      missingNote: 'Thiếu: kimchi',
    },
    {
      id: 'm4',
      slug: 'canh-trung-ca-chua',
      title: 'Canh trứng cà chua',
      imageUrl: '/recipes/canh-rong-bien.webp',
      matchScore: 92,
      matchTag: 'Rất phù hợp',
      matchDesc: 'Canh thanh mát, dễ nấu với trứng và cà chua.',
      cookMinutes: 15,
      missingNote: 'Cần kiểm tra hành lá',
    },
    {
      id: 'm5',
      slug: 'ga-ap-chao-sot-toi',
      title: 'Gà áp chảo sốt tỏi',
      imageUrl: '/recipes/ga-ap-chao-sot-toi.webp',
      matchScore: 70,
      matchTag: 'Thiếu 2 món',
      matchDesc: 'Cần bổ sung thịt gà và tỏi tươi.',
      cookMinutes: 30,
      missingNote: 'Thiếu: thịt gà, tỏi',
    },
    {
      id: 'm6',
      slug: 'com-ga-trung',
      title: 'Cơm gà trứng Oyakodon',
      imageUrl: '/recipes/com-ga-trung.webp',
      matchScore: 68,
      matchTag: 'Thiếu 2 món',
      matchDesc: 'Món cơm giàu đạm kiểu Nhật Bản.',
      cookMinutes: 27,
      missingNote: 'Thiếu: thịt gà, hành tây',
    },
  ];

  const filteredMatches = onlyFullMatch
    ? mockMatches.filter((m) => m.matchScore >= 90)
    : mockMatches;

  return (
    <main className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header section matching 03_pantry.png */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase font-bold tracking-widest text-[#c85233] mb-1.5">
            — TẬN DỤNG NGUYÊN LIỆU
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mb-2">
            Có gì nấu nấy
          </h1>
          <p className="text-stone-600 text-xs md:text-sm max-w-2xl">
            Nhập những gì bạn đang có. Cookora sẽ đối chiếu công thức và chỉ rõ nguyên liệu còn thiếu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pantry')}
            className={\`px-3 py-1.5 rounded-full text-xs font-semibold transition \${
              activeTab === 'pantry' ? 'bg-[#233527] text-white' : 'bg-stone-100 text-stone-700'
            }\`}
          >
            Kho nguyên liệu
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={\`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 \${
              activeTab === 'ai' ? 'bg-[#c85233] text-white' : 'bg-stone-100 text-stone-700'
            }\`}
          >
            <Sparkles size={13} /> Trợ lý AI (Groq)
          </button>
          <span className="hidden md:inline-block px-3 py-1 bg-stone-100 rounded-full text-[11px] font-medium text-stone-600">
            Bản demo minh họa
          </span>
        </div>
      </div>

      {activeTab === 'pantry' ? (
        /* 2-Column Pantry Matcher layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Tủ lạnh của bạn */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-stone-900 mb-3">
              Tủ lạnh của bạn ({selectedItems.length} nguyên liệu)
            </h2>

            {/* Input to type and add */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddItem(inputValue);
              }}
              className="relative mb-3"
            >
              <input
                type="text"
                placeholder="Nhập thêm nguyên liệu và nhấn Enter..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-[#233527] transition"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 p-1 text-stone-500 hover:text-stone-900"
              >
                <Plus size={18} />
              </button>
            </form>

            {/* Selected Tags list */}
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0f4f0] text-xs font-semibold text-[#233527]"
                >
                  {item}
                  <button
                    onClick={() => handleRemoveItem(item)}
                    className="hover:text-red-500 transition"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>

            {/* Popular Ingredients Section */}
            <div className="border-t border-stone-100 pt-5 mb-6">
              <p className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                Nguyên liệu phổ biến
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_INGREDIENTS.map((pop) => {
                  const isSelected = selectedItems.includes(pop);
                  return (
                    <button
                      key={pop}
                      type="button"
                      disabled={isSelected}
                      onClick={() => handleAddItem(pop)}
                      className={\`px-3 py-1.5 rounded-full text-xs font-medium border transition \${
                        isSelected
                          ? 'border-transparent bg-stone-100 text-stone-400 cursor-default'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                      }\`}
                    >
                      + {pop}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Khẩu phần stepper */}
            <div className="flex items-center justify-between py-4 border-t border-stone-100 mb-4">
              <span className="text-xs sm:text-sm font-semibold text-stone-700">Khẩu phần</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 hover:bg-stone-200 transition"
                >
                  <Minus size={14} />
                </button>
                <span className="text-xs sm:text-sm font-bold text-stone-900 min-w-[60px] text-center">
                  {servings} người
                </span>
                <button
                  type="button"
                  onClick={() => setServings((s) => s + 1)}
                  className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 hover:bg-stone-200 transition"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Filter checkbox */}
            <label className="flex items-center gap-2.5 text-xs text-stone-600 mb-6 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyFullMatch}
                onChange={(e) => setOnlyFullMatch(e.target.checked)}
                className="w-4 h-4 rounded text-[#233527] focus:ring-0 cursor-pointer"
              />
              <span>Ưu tiên món không cần mua thêm</span>
            </label>

            {/* CTA Find Button */}
            <button
              type="button"
              onClick={() => notice(\`Đã tìm thấy \${filteredMatches.length} món phù hợp với nguyên liệu của bạn!\`)}
              className="w-full py-3 px-4 rounded-2xl bg-[#233527] text-white font-bold text-sm hover:bg-[#2e4634] transition flex items-center justify-center gap-2 shadow-xs mb-4"
            >
              Tìm món phù hợp <ArrowRight size={16} />
            </button>

            {/* Note box */}
            <div className="p-3 bg-stone-50 rounded-2xl text-[11px] text-stone-500 leading-relaxed border border-stone-100">
              Mức độ phù hợp phản ánh việc trùng nguyên liệu; không thay thế kiểm tra định lượng thực tế.
            </div>
          </div>

          {/* Right Column: Gợi ý phù hợp với bạn */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Gợi ý phù hợp với bạn</h2>
                  <p className="text-xs text-stone-500">Sắp xếp theo nguyên liệu bạn đang có.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#233527] text-white text-xs font-semibold">
                  {filteredMatches.length} món gợi ý
                </span>
              </div>

              {/* Dish cards list */}
              <div className="divide-y divide-stone-100">
                {filteredMatches.map((dish) => (
                  <div
                    key={dish.id}
                    className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100 relative">
                        <img
                          src={dish.imageUrl}
                          alt={dish.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <button
                          onClick={() => notice(\`Đã lưu \${dish.title}\`)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-stone-700 hover:text-red-500"
                        >
                          <Heart size={12} />
                        </button>
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm sm:text-base font-bold text-stone-900">
                            {dish.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f0f4f0] text-[#233527]">
                            {dish.matchTag}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mb-1.5 leading-snug">
                          {dish.matchDesc}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={12} /> {dish.cookMinutes} phút
                          </span>
                          <span>•</span>
                          <span>{dish.missingNote}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score & View button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <span className="text-sm font-extrabold text-[#233527] bg-[#f0f4f0] px-2.5 py-1 rounded-lg">
                        {dish.matchScore}%
                      </span>
                      <Link
                        to={\`/cong-thuc/\${dish.slug}\`}
                        className="text-xs font-bold text-[#c85233] hover:underline flex items-center gap-1"
                      >
                        Xem món →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Danh sách cần mua box */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900 mb-0.5">Danh sách cần mua</h3>
                <p className="text-xs text-stone-500">
                  Gộp các nguyên liệu còn thiếu sau khi chọn món.
                </p>
              </div>
              <Link
                to="/thuc-don"
                className="px-4 py-2 rounded-xl bg-[#f0f4f0] text-[#233527] font-bold text-xs hover:bg-[#e4ece4] transition shrink-0 text-center"
              >
                Xem danh sách →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* AI Assistant Tab */
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-xs max-w-4xl mx-auto">
          <div className="max-w-2xl mb-6">
            <h2 className="text-xl font-bold text-stone-900 mb-1">
              Trợ lý bếp trưởng AI (Groq Speed)
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Nhập tự nhiên danh sách nguyên liệu bạn có trong tủ lạnh (kể cả số lạng, mớ, quả). Trợ lý sẽ tự động phân tích và tạo công thức chi tiết.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ví dụ: 2 lạng thịt bò, 3 lạng thịt heo, 2 bó rau muống..."
              className="w-full p-4 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-hidden focus:border-[#233527] leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-stone-700">Khẩu phần:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setServings((s) => Math.max(1, s - 1))}
                    className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold">{servings} phần</span>
                  <button
                    onClick={() => setServings((s) => s + 1)}
                    className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                disabled={aiMutation.isPending || !aiPrompt.trim()}
                onClick={() => aiMutation.mutate()}
                className="px-6 py-2.5 rounded-full bg-[#c85233] text-white font-bold text-xs md:text-sm hover:bg-[#b04529] transition flex items-center gap-2 disabled:opacity-50 shadow-xs"
              >
                {aiMutation.isPending ? 'Đang hỏi Bếp trưởng AI...' : 'Đề xuất thực đơn và công thức'}
              </button>
            </div>
          </div>

          {/* AI Result presentation */}
          {aiMutation.isPending && (
            <div className="py-12 text-center text-stone-500">
              <div className="inline-block animate-spin mb-2">✦</div>
              <p className="text-xs font-medium">Bếp trưởng đang suy nghĩ thực đơn hoàn hảo cho bạn...</p>
            </div>
          )}

          {aiMutation.isError && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-200">
              Không thể tải gợi ý: {String(aiMutation.error)}
            </div>
          )}

          {aiMutation.data?.data && (
            <div className="space-y-6 pt-6 border-t border-stone-100">
              <div className="bg-[#f0f4f0] p-4 rounded-2xl">
                <p className="text-xs font-bold text-[#233527] uppercase tracking-wider mb-1">
                  Ý tưởng bữa ăn:
                </p>
                <p className="text-sm text-stone-800">
                  {aiMutation.data.data.menuOverview}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiMutation.data.data.dishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-base font-bold text-stone-900">{dish.title}</h4>
                      <span className="text-xs bg-stone-200 px-2 py-0.5 rounded-full font-semibold">
                        {dish.category}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600">{dish.summary}</p>
                    <div className="text-[11px] text-stone-500 flex gap-3">
                      <span>⏱ {dish.totalMinutes} phút</span>
                      <span>👥 {dish.servings} người ăn</span>
                      <span>Mức độ: {dish.difficulty}</span>
                    </div>
                    <div className="pt-2 border-t border-stone-200/60">
                      <p className="text-[11px] font-bold text-stone-700 mb-1">Các bước chính:</p>
                      <ul className="text-xs text-stone-600 space-y-1 list-disc pl-4">
                        {dish.steps.slice(0, 3).map((st) => (
                          <li key={st.order}>
                            <strong>{st.title}:</strong> {st.instruction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
`;

fs.writeFileSync('frontend/src/pages/Matcher.tsx', matcherCode);
console.log('Successfully updated Matcher.tsx matching 03_pantry.png!');
