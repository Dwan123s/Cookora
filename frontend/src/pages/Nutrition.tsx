import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, PieChart, Search, Plus, Trash2, ArrowRight, Utensils, Award } from 'lucide-react';
import { PageHead } from '../shared';

interface FoodNutrient {
  name: string;
  category: string;
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const COMMON_FOODS: FoodNutrient[] = [
  {
    name: 'Ức gà không da',
    category: 'Thịt & Hải sản',
    per100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  },
  {
    name: 'Thịt đùi gà',
    category: 'Thịt & Hải sản',
    per100g: { calories: 209, protein: 26, carbs: 0, fat: 10.9 },
  },
  {
    name: 'Thịt bò nạc',
    category: 'Thịt & Hải sản',
    per100g: { calories: 250, protein: 26, carbs: 0, fat: 15 },
  },
  {
    name: 'Thịt nạc vai heo',
    category: 'Thịt & Hải sản',
    per100g: { calories: 242, protein: 27, carbs: 0, fat: 14 },
  },
  {
    name: 'Tôm tươi',
    category: 'Thịt & Hải sản',
    per100g: { calories: 99, protein: 24, carbs: 0.2, fat: 0.3 },
  },
  {
    name: 'Trứng gà (1 quả ~50g)',
    category: 'Đậu & Trứng',
    per100g: { calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5 },
  },
  {
    name: 'Đậu hũ trắng',
    category: 'Đậu & Trứng',
    per100g: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  },
  {
    name: 'Cơm trắng chín',
    category: 'Tinh bột',
    per100g: { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3 },
  },
  {
    name: 'Bánh phở / Hủ tiếu tươi',
    category: 'Tinh bột',
    per100g: { calories: 109, protein: 2.3, carbs: 24, fat: 0.2 },
  },
  { name: 'Rau muống', category: 'Rau củ', per100g: { calories: 19, protein: 3, carbs: 3.1, fat: 0.2 } },
  { name: 'Cà chua', category: 'Rau củ', per100g: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 } },
  { name: 'Đu đủ xanh', category: 'Rau củ', per100g: { calories: 43, protein: 0.5, carbs: 10.8, fat: 0.3 } },
];

interface LoggedMeal {
  id: string;
  name: string;
  weightGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function Nutrition() {
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodNutrient>(COMMON_FOODS[0]);
  const [inputWeight, setInputWeight] = useState<number>(150);
  const [dailyLog, setDailyLog] = useState<LoggedMeal[]>([]);

  // Calculations for current selected food
  const calcCalo = Math.round((selectedFood.per100g.calories * inputWeight) / 100);
  const calcProtein = Math.round(((selectedFood.per100g.protein * inputWeight) / 100) * 10) / 10;
  const calcCarbs = Math.round(((selectedFood.per100g.carbs * inputWeight) / 100) * 10) / 10;
  const calcFat = Math.round(((selectedFood.per100g.fat * inputWeight) / 100) * 10) / 10;

  const addToLog = () => {
    setDailyLog([
      ...dailyLog,
      {
        id: Date.now().toString(),
        name: selectedFood.name,
        weightGrams: inputWeight,
        calories: calcCalo,
        protein: calcProtein,
        carbs: calcCarbs,
        fat: calcFat,
      },
    ]);
  };

  const removeLog = (id: string) => {
    setDailyLog(dailyLog.filter((m) => m.id !== id));
  };

  const totalLogCalo = dailyLog.reduce((s, m) => s + m.calories, 0);
  const totalLogProtein = Math.round(dailyLog.reduce((s, m) => s + m.protein, 0));
  const totalLogCarbs = Math.round(dailyLog.reduce((s, m) => s + m.carbs, 0));
  const totalLogFat = Math.round(dailyLog.reduce((s, m) => s + m.fat, 0));

  const filteredFoods = COMMON_FOODS.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="container py-8">
      <PageHead
        eyebrow="CALORIE & NUTRITION FINDER"
        title="Tra cứu Calories & Giá trị dinh dưỡng"
        description="Kiểm soát lượng calories, đạm, tinh bột và chất béo nạp vào cơ thể theo từng bữa ăn."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8">
        {/* Máy tính Calo theo khối lượng */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <Search className="text-rose-600" size={22} />
              Tra cứu theo món ăn / nguyên liệu
            </h2>

            <input
              type="text"
              placeholder="Nhập tên thực phẩm (thịt gà, cơm, rau muống, tôm...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredFoods.map((food, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedFood(food)}
                  className={`p-3 rounded-2xl border text-left transition ${
                    selectedFood.name === food.name
                      ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50/50'
                  }`}
                >
                  <span className="font-bold text-xs block truncate">{food.name}</span>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    {food.per100g.calories} kcal / 100g
                  </span>
                </button>
              ))}
            </div>

            {/* Chi tiết thực phẩm đã chọn & Tính toán theo gam */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{selectedFood.name}</h3>
                  <span className="text-xs text-stone-500">{selectedFood.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-stone-600">Khối lượng:</label>
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-stone-300">
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      step="10"
                      value={inputWeight}
                      onChange={(e) => setInputWeight(Number(e.target.value) || 100)}
                      className="w-16 text-center font-bold text-sm text-stone-800 focus:outline-none"
                    />
                    <span className="text-xs text-stone-400 font-bold">gam</span>
                  </div>
                </div>
              </div>

              {/* Macro card */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                <div className="bg-white p-3 rounded-xl border border-stone-200/60">
                  <span className="text-xs text-stone-400 block font-medium">Năng lượng</span>
                  <span className="text-base font-black text-rose-600">{calcCalo}</span>
                  <span className="text-[10px] text-stone-400 block">kcal</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200/60">
                  <span className="text-xs text-stone-400 block font-medium">Protein</span>
                  <span className="text-base font-black text-emerald-600">{calcProtein}g</span>
                  <span className="text-[10px] text-stone-400 block">Đạm</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200/60">
                  <span className="text-xs text-stone-400 block font-medium">Carbs</span>
                  <span className="text-base font-black text-amber-600">{calcCarbs}g</span>
                  <span className="text-[10px] text-stone-400 block">Tinh bột</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200/60">
                  <span className="text-xs text-stone-400 block font-medium">Fat</span>
                  <span className="text-base font-black text-blue-600">{calcFat}g</span>
                  <span className="text-[10px] text-stone-400 block">Chất béo</span>
                </div>
              </div>

              <button
                type="button"
                onClick={addToLog}
                className="w-full btn py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Plus size={16} /> Thêm vào nhật ký ăn uống hôm nay
              </button>
            </div>
          </div>
        </div>

        {/* Nhật ký ăn uống hôm nay */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-800 text-lg flex items-center gap-2">
                <Utensils size={18} className="text-rose-600" />
                Nhật ký hôm nay
              </h3>
              <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full">
                {dailyLog.length} món
              </span>
            </div>

            {/* Tổng calo */}
            <div className="p-4 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl text-white text-center">
              <span className="text-xs text-rose-100 font-medium block">Tổng Calo đã nạp</span>
              <span className="text-3xl font-black">{totalLogCalo} kcal</span>
              <div className="flex justify-center gap-4 text-xs text-rose-100 pt-2 border-t border-white/20 mt-2">
                <span>P: {totalLogProtein}g</span>
                <span>C: {totalLogCarbs}g</span>
                <span>F: {totalLogFat}g</span>
              </div>
            </div>

            {/* Danh sách món trong ngày */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {dailyLog.map((meal) => (
                <div
                  key={meal.id}
                  className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs text-stone-800 block">{meal.name}</span>
                    <span className="text-[11px] text-stone-500 block">
                      {meal.weightGrams}g · {meal.calories} kcal (P:{meal.protein}g C:{meal.carbs}g F:
                      {meal.fat}g)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLog(meal.id)}
                    className="text-stone-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-100">
              <Link
                to="/eat-fit"
                className="w-full btn secondary py-2 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <PieChart size={14} /> So sánh với mục tiêu Eat Fit <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
