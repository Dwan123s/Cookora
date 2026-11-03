import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FolderHeart } from 'lucide-react';
import type { Recipe } from '@cookora/contracts';
import { request } from '../api';
import { useUser, Loading, ErrorState, RecipeCard } from '../shared';

export function Favorites() {
  const user = useUser();
  const [quickOnly, setQuickOnly] = useState(false);
  const query = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => request<Recipe[]>('/favorites'),
    enabled: !!user,
  });
  const recipes = query.data?.data || [];
  const visible = quickOnly
    ? recipes.filter((recipe) => recipe.totalMinutes !== null && recipe.totalMinutes <= 30)
    : recipes;
  return (
    <main className="container max-w-7xl mx-auto px-4 py-8">
      <p className="text-xs uppercase font-bold tracking-widest text-[#47735B] mb-2">Bộ sưu tập của bạn</p>
      <h1 className="text-3xl font-bold text-[#273D32] mb-3">Công thức yêu thích</h1>
      <p className="text-stone-600 mb-6">Những công thức bạn đã lưu từ danh mục món ăn hiện tại.</p>
      {!user ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center">
          <FolderHeart className="mx-auto mb-3 text-[#47735B]" size={36} />
          <p className="mb-4">Đăng nhập để xem và lưu công thức yêu thích của bạn.</p>
          <Link className="btn" to="/dang-nhap" state={{ from: '/yeu-thich' }}>
            Đăng nhập <ArrowRight size={16} />
          </Link>
        </div>
      ) : query.isPending ? (
        <Loading />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              className="btn secondary"
              aria-pressed={!quickOnly}
              onClick={() => setQuickOnly(false)}
            >
              Tất cả món đã lưu ({recipes.length})
            </button>
            <button
              type="button"
              className="btn secondary"
              aria-pressed={quickOnly}
              onClick={() => setQuickOnly(true)}
            >
              Tối đa 30 phút
            </button>
          </div>
          {visible.length ? (
            <div className="recipe-grid">
              {visible.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center">
              <FolderHeart className="mx-auto mb-3 text-[#47735B]" size={36} />
              <p className="mb-4">
                {quickOnly
                  ? 'Chưa có món phù hợp với bộ lọc này.'
                  : 'Bạn chưa lưu công thức nào trong danh mục mới.'}
              </p>
              <Link className="btn" to="/cong-thuc">
                Khám phá công thức <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </>
      )}
    </main>
  );
}
