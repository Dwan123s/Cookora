import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Heart } from 'lucide-react';
import type { Recipe } from '@cookora/contracts';
import { request } from '../api';
import { useUser, Loading, ErrorState, Empty, PageHead, RecipeGrid, RequireLogin } from '../shared';

export function Favorites() {
  const user = useUser(),
    q = useQuery({
      queryKey: ['favorites', user?.id],
      queryFn: () => request<Recipe[]>('/favorites'),
      enabled: !!user,
    });
  if (!user) return <RequireLogin title="Giữ lại những món bạn muốn nấu" />;
  return (
    <main className="container">
      <PageHead
        eyebrow="BỘ SƯU TẬP CỦA BẠN"
        title="Những món đã lưu"
        description="Một góc nhỏ cho các công thức bạn muốn quay lại."
      />
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <ErrorState error={q.error} />
      ) : q.data.data.length ? (
        <RecipeGrid recipes={q.data.data} />
      ) : (
        <Empty icon={<Heart size={38} />} title="Bếp yêu thích đang chờ món đầu tiên">
          <p>Bấm trái tim trên một công thức để lưu lại.</p>
          <Link className="btn" to="/cong-thuc">
            Khám phá món ăn <ArrowRight size={16} />
          </Link>
        </Empty>
      )}
    </main>
  );
}
