import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock3, Heart, Minus, Plus } from 'lucide-react';
import type { Recipe } from '@cookora/contracts';
import { request } from '../api';
import { recipeMedia, RECIPE_PLACEHOLDER } from '../recipe-media';
import { useNotice, Loading, ErrorState } from '../shared';

interface IngredientRow {
  name: string;
  baseQty: number | null;
  unit: string;
}

export function PortionAdjust() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const notice = useNotice();

  const recipeSlug = slug;

  const q = useQuery({
    queryKey: ['recipe', recipeSlug],
    enabled: !!recipeSlug,
    queryFn: () => request<Recipe>(`/recipes/${recipeSlug}`),
  });

  const recipe = q.data?.data;
  const baseServings = recipe?.baseServings || 2;
  const [servings, setServings] = useState(4);

  const ratio = servings / baseServings;

  const ingredientList: IngredientRow[] =
    recipe?.ingredients && recipe.ingredients.length > 0
      ? recipe.ingredients.map((l) => ({
          name: l.name,
          baseQty: l.quantity ? parseFloat(l.quantity) || null : null,
          unit: l.unit,
        }))
      : [];

  const media = recipe ? recipeMedia(recipe) : { src: RECIPE_PLACEHOLDER, label: 'Chưa có ảnh' };

  if (!recipeSlug)
    return (
      <main className="container">
        <h1>Điều chỉnh khẩu phần</h1>
        <p>Chọn một công thức để điều chỉnh nguyên liệu.</p>
        <Link className="btn" to="/cong-thuc">
          Chọn công thức
        </Link>
      </main>
    );
  if (q.isPending) return <Loading />;
  if (q.isError || !recipe) return <ErrorState error={q.error} retry={() => void q.refetch()} />;
  return (
    <main className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header section matching 04_portion.png */}
      <div className="mb-8">
        <p className="text-xs uppercase font-bold tracking-widest text-[#47735B] mb-1.5">
          — TỪ MỘT NGƯỜI ĐẾN CẢ GIA ĐÌNH
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mb-2">
          Điều chỉnh khẩu phần
        </h1>
        <p className="text-stone-600 text-xs md:text-sm max-w-2xl">
          Tăng hoặc giảm số người ăn; định lượng nguyên liệu tự động tính lại cho món đã chọn.
        </p>
      </div>

      {/* 2-Column Portion Adjustment Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column Card: Dish info & Portion Stepper */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
          {/* Dish Photo */}
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 mb-5 border border-stone-100">
            <img src={media.src} alt={recipe.title} className="w-full h-full object-cover" />
            <button
              onClick={() => notice('Đã lưu vào danh sách yêu thích!')}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-700 hover:text-red-500 shadow-xs"
            >
              <Heart size={16} />
            </button>
          </div>

          <h2 className="text-xl font-bold text-stone-900 mb-1">{recipe.title}</h2>
          <p className="text-xs text-stone-500 mb-5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <Clock3 size={13} />{' '}
              {recipe.totalMinutes === null ? 'Chưa rõ thời gian' : '~' + recipe.totalMinutes + ' phút'}
            </span>
            {recipe.difficulty && !recipe.difficulty.toLowerCase().startsWith('chưa') && (
              <>
                <span>•</span>
                <span>{recipe.difficulty}</span>
              </>
            )}
          </p>

          {/* Stepper control */}
          <div className="flex items-center justify-between py-4 border-t border-stone-100 mb-5">
            <div>
              <p className="text-xs text-stone-500 font-medium">Số người ăn</p>
              <p className="text-base font-bold text-stone-900">{servings} người</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 hover:bg-stone-200 transition"
              >
                <Minus size={15} />
              </button>
              <span className="text-sm font-bold text-stone-900 min-w-[70px] text-center px-2 py-1 bg-stone-50 rounded-lg border border-stone-200">
                {servings} phần
              </span>
              <button
                type="button"
                onClick={() => setServings((s) => s + 1)}
                className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 hover:bg-stone-200 transition"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Conversion Ratio Box */}
          <div className="bg-[#E8F1E9] rounded-2xl p-4 border border-[#DFE5DD]">
            <p className="text-xs font-bold text-[#47735B] uppercase tracking-wider mb-1">— TỶ LỆ QUY ĐỔI</p>
            <p className="text-2xl font-extrabold text-stone-900 mb-1">
              × {ratio % 1 === 0 ? ratio : ratio.toFixed(1)}
            </p>
            <p className="text-xs text-stone-600">
              {ratio === 1
                ? `Giữ nguyên so với công thức gốc ${baseServings} phần.`
                : ratio > 1
                  ? `Tăng gấp ${ratio % 1 === 0 ? ratio : ratio.toFixed(1)} so với công thức gốc ${baseServings} phần.`
                  : `Giảm còn ${(ratio * 100).toFixed(0)}% so với công thức gốc ${baseServings} phần.`}
            </p>
          </div>
        </div>

        {/* Right Column Card: Comparison Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-bold text-stone-900">Bảng định lượng nguyên liệu</h2>
            <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
              {baseServings} phần gốc → {servings} phần
            </span>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 font-bold tracking-wider text-[11px]">
                  <th className="py-2.5 uppercase">Nguyên liệu</th>
                  <th className="py-2.5 uppercase text-stone-500">Gốc</th>
                  <th className="py-2.5 uppercase text-right text-stone-700">Điều chỉnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {ingredientList.map((item, idx) => {
                  let adjustedText = 'Chưa rõ lượng';
                  let baseText = 'Chưa rõ lượng';

                  if (item.baseQty !== null && item.baseQty !== undefined) {
                    const scaled = item.baseQty * ratio;
                    adjustedText = `${scaled % 1 === 0 ? scaled : scaled.toFixed(1)} ${item.unit}`;
                    baseText = `${item.baseQty} ${item.unit}`;
                  }

                  return (
                    <tr key={idx} className="hover:bg-stone-50/60 transition">
                      <td className="py-3.5 font-bold text-stone-900">{item.name}</td>
                      <td className="py-3.5 text-stone-500 font-medium">{baseText}</td>
                      <td className="py-3.5 text-right font-extrabold text-[#47735B]">{adjustedText}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Callout Box */}
          <div className="bg-[#E8F1E9] rounded-2xl p-5 border border-[#DFE5DD] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-stone-900 mb-0.5">Chuẩn bị vừa đủ, hạn chế dư thừa.</p>
              <p className="text-xs text-stone-600">
                Gia vị nêm nếm nên điều chỉnh theo khẩu vị, không luôn tăng tuyến tính.
              </p>
            </div>
            <button
              onClick={() => navigate(`/cong-thuc/${recipeSlug}/nau`)}
              className="px-5 py-2.5 rounded-xl bg-[#47735B] text-white font-bold text-xs sm:text-sm hover:bg-[#3B634F] transition flex items-center justify-center gap-2 shrink-0 shadow-xs"
            >
              Bắt đầu nấu <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
