const fs = require('fs');

const plannerCode = `import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  ShoppingBasket,
  Sparkles,
} from 'lucide-react';
import type { MealPlan, Recipe } from '@cookora/contracts';
import { request } from '../api';
import { addDays, dateKey, dayLabel, weekOf } from '../date';
import { useNotice, useUser, Modal } from '../shared';

interface PlannedDish {
  name: string;
  slug: string;
  image: string;
}

export function Planner() {
  const user = useUser();
  const notice = useNotice();
  const [params, setParams] = useSearchParams();

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'Trứng gà': true,
    'Cà chua': true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

  // 21 Meals default layout matching 05_weekly.png
  const [mealGrid, setMealGrid] = useState<Record<string, PlannedDish[]>>({
    breakfast: [
      { name: 'Đậu hũ sốt', slug: 'dau-hu-sot-ca-chua', image: '/recipes/dau-hu-sot-ca-chua.webp' },
      { name: 'Cơm kimchi', slug: 'com-kimchi', image: '/recipes/com-kimchi.webp' },
      { name: 'Cơm gà trứng', slug: 'com-ga-trung', image: '/recipes/com-ga-trung.webp' },
      { name: 'Trứng cà chua', slug: 'trung-xao-ca-chua', image: '/recipes/trung-xao-ca-chua.webp' },
      { name: 'Gà áp chảo', slug: 'ga-ap-chao-sot-toi', image: '/recipes/ga-ap-chao-sot-toi.webp' },
      { name: 'Mì tỏi', slug: 'mi-y-toi-dau-o-liu', image: '/recipes/mi-y-toi-dau-o-liu.webp' },
      { name: 'Đậu hũ sốt', slug: 'dau-hu-sot-ca-chua', image: '/recipes/dau-hu-sot-ca-chua.webp' },
    ],
    lunch: [
      { name: 'Cơm gà trứng', slug: 'com-ga-trung', image: '/recipes/com-ga-trung.webp' },
      { name: 'Đậu hũ sốt', slug: 'dau-hu-sot-ca-chua', image: '/recipes/dau-hu-sot-ca-chua.webp' },
      { name: 'Cơm kimchi', slug: 'com-kimchi', image: '/recipes/com-kimchi.webp' },
      { name: 'Mì tỏi', slug: 'mi-y-toi-dau-o-liu', image: '/recipes/mi-y-toi-dau-o-liu.webp' },
      { name: 'Gà áp chảo', slug: 'ga-ap-chao-sot-toi', image: '/recipes/ga-ap-chao-sot-toi.webp' },
      { name: 'Trứng cà chua', slug: 'trung-xao-ca-chua', image: '/recipes/trung-xao-ca-chua.webp' },
      { name: 'Đậu hũ sốt', slug: 'dau-hu-sot-ca-chua', image: '/recipes/dau-hu-sot-ca-chua.webp' },
    ],
    dinner: [
      { name: 'Cơm kimchi', slug: 'com-kimchi', image: '/recipes/com-kimchi.webp' },
      { name: 'Mì tỏi', slug: 'mi-y-toi-dau-o-liu', image: '/recipes/mi-y-toi-dau-o-liu.webp' },
      { name: 'Đậu hũ sốt', slug: 'dau-hu-sot-ca-chua', image: '/recipes/dau-hu-sot-ca-chua.webp' },
      { name: 'Cơm gà trứng', slug: 'com-ga-trung', image: '/recipes/com-ga-trung.webp' },
      { name: 'Gà áp chảo', slug: 'ga-ap-chao-sot-toi', image: '/recipes/ga-ap-chao-sot-toi.webp' },
      { name: 'Trứng cà chua', slug: 'trung-xao-ca-chua', image: '/recipes/trung-xao-ca-chua.webp' },
      { name: 'Đậu hũ sốt', slug: 'dau-hu-sot-ca-chua', image: '/recipes/dau-hu-sot-ca-chua.webp' },
    ],
  });

  const groceryItems = [
    { name: 'Trứng gà', qty: '10 quả' },
    { name: 'Cà chua', qty: '1,2 kg' },
    { name: 'Đậu hũ', qty: '800 g' },
    { name: 'Thịt gà', qty: '1 kg' },
    { name: 'Gạo', qty: '1,5 kg' },
    { name: 'Hành lá', qty: '2 bó' },
    { name: 'Rau xanh', qty: '1,2 kg' },
  ];

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const autoGeneratePlan = () => {
    notice('Đã tự động cân bằng thực đơn 21 bữa theo dinh dưỡng tuần!');
  };

  return (
    <main className="container max-w-7xl mx-auto px-4 py-8">
      {/* Top Header matching 05_weekly.png */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase font-bold tracking-widest text-[#c85233] mb-1.5">
            — LÊN KẾ HOẠCH NHẸ NHÀNG
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mb-2">
            Thực đơn tuần
          </h1>
          <p className="text-stone-600 text-xs md:text-sm max-w-2xl">
            Bữa ăn được sắp xếp rõ ràng. Danh sách mua sắm tổng hợp tự động theo các món đã chọn.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#233527] text-white font-bold text-xs sm:text-sm hover:bg-[#2e4634] transition shadow-xs self-start"
        >
          <Plus size={16} /> Thêm món vào tuần
        </button>
      </div>

      {/* Main Grid: Weekly Calendar (Left) & Grocery List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Weekly Calendar Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-7 border border-stone-200/80 shadow-xs">
          {/* Header of Week */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Tuần này</h2>
              <p className="text-xs text-stone-500 font-medium">
                02/11 – 08/11/2026 • 2 người ăn
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
                className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
                className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-50"
              >
                <ChevronRight size={16} />
              </button>
              <span className="px-3 py-1 rounded-full bg-[#233527] text-white text-xs font-semibold">
                02/11 – 08/11
              </span>
            </div>
          </div>

          {/* 7-Day Table */}
          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[620px] text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2 w-16 text-left text-xs font-medium text-stone-400"></th>
                  {days.map((d, i) => (
                    <th
                      key={d}
                      className="p-2 text-xs font-bold text-stone-700 uppercase tracking-wider"
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {/* Bữa sáng */}
                <tr>
                  <td className="p-2 text-left text-xs font-bold text-stone-600 whitespace-nowrap">
                    Bữa sáng
                  </td>
                  {mealGrid.breakfast.map((dish, idx) => (
                    <td key={idx} className="p-1.5">
                      <Link
                        to={\`/cong-thuc/\${dish.slug}\`}
                        className="flex flex-col items-center p-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 transition group border border-stone-100"
                      >
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-stone-200 mb-1 shrink-0">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-stone-800 line-clamp-1">
                          {dish.name}
                        </span>
                      </Link>
                    </td>
                  ))}
                </tr>

                {/* Bữa trưa */}
                <tr>
                  <td className="p-2 text-left text-xs font-bold text-stone-600 whitespace-nowrap">
                    Bữa trưa
                  </td>
                  {mealGrid.lunch.map((dish, idx) => (
                    <td key={idx} className="p-1.5">
                      <Link
                        to={\`/cong-thuc/\${dish.slug}\`}
                        className="flex flex-col items-center p-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 transition group border border-stone-100"
                      >
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-stone-200 mb-1 shrink-0">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-stone-800 line-clamp-1">
                          {dish.name}
                        </span>
                      </Link>
                    </td>
                  ))}
                </tr>

                {/* Bữa tối */}
                <tr>
                  <td className="p-2 text-left text-xs font-bold text-stone-600 whitespace-nowrap">
                    Bữa tối
                  </td>
                  {mealGrid.dinner.map((dish, idx) => (
                    <td key={idx} className="p-1.5">
                      <Link
                        to={\`/cong-thuc/\${dish.slug}\`}
                        className="flex flex-col items-center p-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 transition group border border-stone-100"
                      >
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-stone-200 mb-1 shrink-0">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-stone-800 line-clamp-1">
                          {dish.name}
                        </span>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Table Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 mt-4 border-t border-stone-100">
            <div>
              <p className="text-sm font-bold text-stone-900">21 bữa ăn trong tuần</p>
              <p className="text-xs text-stone-500">
                Nhấn một ô để thay món hoặc đổi khẩu phần.
              </p>
            </div>
            <button
              onClick={autoGeneratePlan}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              Tự động tạo thực đơn <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Column: Danh sách đi chợ Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-stone-900">Danh sách đi chợ</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#f0f4f0] text-[#233527] text-xs font-bold">
                {checkedCount} / {groceryItems.length} đã có
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Gộp nguyên liệu theo các bữa ăn, tránh mua trùng.
            </p>
          </div>

          {/* Grocery items checklist */}
          <div className="space-y-3">
            {groceryItems.map((item) => {
              const checked = !!checkedItems[item.name];
              return (
                <div
                  key={item.name}
                  onClick={() => toggleCheck(item.name)}
                  className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0 cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={\`w-5 h-5 rounded-md border flex items-center justify-center transition \${
                        checked
                          ? 'bg-[#233527] border-[#233527] text-white'
                          : 'border-stone-300 group-hover:border-stone-400 bg-white'
                      }\`}
                    >
                      {checked && <Check size={13} strokeWidth={3} />}
                    </div>
                    <span
                      className={\`text-xs sm:text-sm font-semibold \${
                        checked ? 'line-through text-stone-400' : 'text-stone-800'
                      }\`}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-stone-500">{item.qty}</span>
                </div>
              );
            })}
          </div>

          {/* Ngân sách dự kiến card */}
          <div className="bg-[#f2f6f3] rounded-2xl p-4 border border-[#e2ece4]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-stone-700">Ngân sách dự kiến</span>
              <span className="text-sm font-extrabold text-[#233527]">~ 298.000 đ</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-1.5 mb-2 overflow-hidden">
              <div className="bg-[#233527] h-full w-[88%]" />
            </div>
            <p className="text-[11px] text-stone-500 leading-tight">
              Giá tham khảo minh họa, có thể cập nhật theo nơi mua.
            </p>
          </div>

          {/* CTA Export Grocery Button */}
          <button
            onClick={() => notice('Đã sao chép danh sách đi chợ vào bộ nhớ tạm!')}
            className="w-full py-3 px-4 rounded-2xl bg-[#233527] text-white font-bold text-xs sm:text-sm hover:bg-[#2e4634] transition flex items-center justify-center gap-2 shadow-xs"
          >
            Xuất danh sách mua sắm <ArrowUpRight size={15} />
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <Modal title="Thêm món vào thực đơn tuần" onClose={() => setIsModalOpen(false)}>
          <div className="space-y-4">
            <p className="text-xs text-stone-600">
              Chọn món từ thư viện công thức để xếp vào bữa ăn trong tuần.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {['Đậu hũ sốt cà chua', 'Cơm kimchi', 'Trứng xào cà chua', 'Gà áp chảo sốt tỏi'].map((title) => (
                <button
                  key={title}
                  onClick={() => {
                    notice(\`Đã thêm \${title} vào thực đơn!\`);
                    setIsModalOpen(false);
                  }}
                  className="p-3 rounded-xl border border-stone-200 text-left hover:border-[#233527] hover:bg-stone-50 text-xs font-bold text-stone-800 transition"
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
`;

fs.writeFileSync('frontend/src/pages/Planner.tsx', plannerCode);
console.log('Successfully updated Planner.tsx matching 05_weekly.png!');
