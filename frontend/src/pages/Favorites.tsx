import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Clock3,
  FolderHeart,
  Heart,
  Plus,
  Users,
} from 'lucide-react';
import type { Recipe } from '@cookora/contracts';
import { request } from '../api';
import { useNotice, Modal } from '../shared';

interface FavoriteDishItem {
  id: string;
  slug: string;
  title: string;
  image: string;
  time: number;
  servings: number;
  difficulty: string;
  tags: string[];
}

export function Favorites() {
  const notice = useNotice();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filterOptions = [
    { id: 'all', label: 'Tất cả món đã lưu 8' },
    { id: 'quick', label: 'Món nấu nhanh' },
    { id: 'vegetarian', label: 'Món chay' },
    { id: 'weekend', label: 'Muốn thử cuối tuần' },
  ];

  const topRowDishes: FavoriteDishItem[] = [
    {
      id: 'f1',
      slug: 'dau-hu-sot-ca-chua',
      title: 'Đậu hũ sốt cà chua',
      image: '/recipes/dau-hu-sot-ca-chua.webp',
      time: 25,
      servings: 2,
      difficulty: 'Dễ',
      tags: ['vegetarian', 'quick'],
    },
    {
      id: 'f2',
      slug: 'com-kimchi',
      title: 'Cơm kimchi',
      image: '/recipes/com-kimchi.webp',
      time: 20,
      servings: 2,
      difficulty: 'Dễ',
      tags: ['quick'],
    },
    {
      id: 'f3',
      slug: 'com-ga-trung',
      title: 'Cơm gà trứng',
      image: '/recipes/com-ga-trung.webp',
      time: 27,
      servings: 2,
      difficulty: 'Dễ',
      tags: ['quick'],
    },
  ];

  const bottomRowDishes: FavoriteDishItem[] = [
    {
      id: 'f4',
      slug: 'trung-xao-ca-chua',
      title: 'Trứng xào cà chua',
      image: '/recipes/trung-xao-ca-chua.webp',
      time: 18,
      servings: 2,
      difficulty: 'Dễ',
      tags: ['quick', 'vegetarian'],
    },
    {
      id: 'f5',
      slug: 'ga-ap-chao-sot-toi',
      title: 'Gà áp chảo sốt tỏi',
      image: '/recipes/ga-ap-chao-sot-toi.webp',
      time: 30,
      servings: 2,
      difficulty: 'Dễ',
      tags: ['weekend'],
    },
    {
      id: 'f6',
      slug: 'mi-y-toi-dau-o-liu',
      title: 'Mì Ý tỏi và dầu ô liu',
      image: '/recipes/mi-y-toi-dau-o-liu.webp',
      time: 23,
      servings: 2,
      difficulty: 'Dễ',
      tags: ['quick', 'vegetarian'],
    },
    {
      id: 'f7',
      slug: 'thit-nuong',
      title: 'Thịt nướng',
      image: '/recipes/thit-nuong.webp',
      time: 35,
      servings: 2,
      difficulty: 'Dễ',
      tags: ['weekend'],
    },
  ];

  const allDishes = [...topRowDishes, ...bottomRowDishes];

  const filterDishes = (list: FavoriteDishItem[]) => {
    if (activeFilter === 'all') return list;
    return list.filter((d) => d.tags.includes(activeFilter));
  };

  return (
    <main className="container max-w-7xl mx-auto px-4 py-8">
      {/* Top Header matching 06_favorites.png */}
      <div className="mb-6">
        <p className="text-xs uppercase font-bold tracking-widest text-[#47735B] mb-1.5">
          — BỘ SƯU TẬP CỦA BẠN
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mb-2">
          Công thức yêu thích
        </h1>
        <p className="text-stone-600 text-xs md:text-sm max-w-2xl">
          Lưu lại những món muốn thử và sắp xếp để lần sau tìm được ngay.
        </p>
      </div>

      {/* Filter Row & Create Collection Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveFilter(opt.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                activeFilter === opt.id
                  ? 'bg-[#47735B] text-white'
                  : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-full border border-stone-300 bg-white text-stone-800 font-semibold text-xs hover:bg-stone-50 transition self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={14} /> Tạo bộ sưu tập
        </button>
      </div>

      {/* Top Row: 3 Dishes + 1 Highlight Collection Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {filterDishes(topRowDishes).map((dish) => (
          <div
            key={dish.id}
            className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
              <img
                src={dish.image}
                alt={dish.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                onError={(e) => {
                  e.currentTarget.src = '/images/cookora-tofu-1200.webp';
                }}
              />
              <button
                onClick={() => notice(`Đã lưu ${dish.title}`)}
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-red-500 shadow-xs"
              >
                <Heart size={15} fill="currentColor" />
              </button>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <h3 className="font-bold text-stone-900 text-sm mb-3">{dish.title}</h3>
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="inline-flex items-center gap-1">
                  <Clock3 size={12} /> {dish.time} phút
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users size={12} /> {dish.servings} phần
                </span>
                <span className="px-2 py-0.5 rounded-md bg-stone-100 font-semibold text-stone-700 text-[10px]">
                  {dish.difficulty}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Collection Highlight Card */}
        <div className="bg-[#fffcf7] rounded-3xl border border-[#ebd8c5] p-5 flex flex-col justify-between shadow-xs">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#47735B] mb-1">
              — BỘ SƯU TẬP
            </p>
            <h3 className="text-lg font-bold text-stone-900 mb-1">Bữa tối 30 phút</h3>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              4 món dễ làm cho những ngày bận rộn.
            </p>

            <div className="border-t border-[#f0e3d5] pt-3 mb-4">
              <p className="text-[11px] font-bold text-stone-700 mb-2">Món vừa thêm</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                  <img
                    src="/recipes/trung-xao-ca-chua.webp"
                    alt="Trứng xào cà chua"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Trứng xào cà chua</p>
                  <p className="text-[11px] text-stone-500">18 phút • Dễ</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => notice('Đang mở bộ sưu tập: Bữa tối 30 phút')}
            className="w-full py-2.5 rounded-xl bg-[#47735B] text-white font-bold text-xs hover:bg-[#3B634F] transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            Xem bộ sưu tập →
          </button>
        </div>
      </div>

      {/* Bottom Row Section: Các món bạn đã lưu */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-stone-900">Các món bạn đã lưu</h2>
          <span className="text-xs text-stone-500 font-medium">Sắp xếp: Mới lưu gần đây</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filterDishes(bottomRowDishes).map((dish) => (
            <div
              key={dish.id}
              className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                <img
                  src={dish.image}
                  alt={dish.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/images/cookora-tofu-1200.webp';
                  }}
                />
                <button
                  onClick={() => notice(`Đã lưu ${dish.title}`)}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-red-500 shadow-xs"
                >
                  <Heart size={15} fill="currentColor" />
                </button>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-stone-900 text-sm mb-3">{dish.title}</h3>
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={12} /> {dish.time} phút
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={12} /> {dish.servings} phần
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 font-semibold text-stone-700 text-[10px]">
                    {dish.difficulty}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal create collection */}
      {isCreateModalOpen && (
        <Modal title="Tạo bộ sưu tập mới" onClose={() => setIsCreateModalOpen(false)}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Tên bộ sưu tập (ví dụ: Món ăn dặm, Món tiệc cuối tuần...)"
              className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-[#47735B]"
            />
            <button
              onClick={() => {
                notice('Đã tạo bộ sưu tập mới thành công!');
                setIsCreateModalOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-[#47735B] text-white font-bold text-sm"
            >
              Lưu bộ sưu tập
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
