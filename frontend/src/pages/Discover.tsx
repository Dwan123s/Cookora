import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { Recipe } from '@cookora/contracts';
import { request } from '../api';
import { cuisines, Loading, ErrorState, Empty, PageHead, RecipeGrid } from '../shared';

export function Discover() {
  const [params, setParams] = useSearchParams(),
    [draft, setDraft] = useState(params.get('q') || '');
  const query = params.toString();
  const q = useQuery({
    queryKey: ['recipes', query],
    queryFn: ({ signal }) => request<Recipe[]>(`/recipes?${query}`, { signal }),
  });
  useEffect(() => setDraft(params.get('q') || ''), [params]);
  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params);
    v ? p.set(k, v) : p.delete(k);
    p.delete('page');
    setParams(p);
  };
  const pagination = q.data?.meta.pagination as
    | { page: number; total: number; totalPages: number }
    | undefined;
  return (
    <main className="container">
      <PageHead
        eyebrow="THƯ VIỆN BẾP NHÀ"
        title="Tìm món hợp với hôm nay"
        description="Một món quen, một hương vị mới. Chọn theo cách bạn muốn nấu."
      />
      <form
        className="search-bar"
        onSubmit={(e) => {
          e.preventDefault();
          set('q', draft);
        }}
      >
        <Search size={21} />
        <input
          aria-label="Tìm công thức"
          placeholder="Tìm tên món hoặc nguyên liệu…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="btn" type="submit">
          Tìm món
        </button>
      </form>
      <div className="filter-row">
        <div className="cuisine-filters">
          <button
            className={!params.get('cuisine') ? 'chip selected' : 'chip'}
            onClick={() => set('cuisine', '')}
          >
            Tất cả
          </button>
          {cuisines.map((c) => (
            <button
              key={c.code}
              className={params.get('cuisine') === c.code ? 'chip selected' : 'chip'}
              onClick={() => set('cuisine', c.code)}
            >
              {c.name}
            </button>
          ))}
        </div>
        <label className="select-label">
          <SlidersHorizontal size={16} />
          <select
            aria-label="Thời gian đã kiểm chứng"
            value={params.get('maxMinutes') || ''}
            onChange={(e) => set('maxMinutes', e.target.value)}
          >
            <option value="">Mọi thời gian</option>
            <option value="30">≤ 30 phút đã kiểm chứng</option>
            <option value="60">≤ 60 phút đã kiểm chứng</option>
          </select>
        </label>
      </div>
      <div className="results-meta">
        <span>{pagination?.total ?? '…'} công thức trong bản phát triển</span>
        {params.size > 0 && (
          <button className="plain-btn" onClick={() => setParams({})}>
            Xóa bộ lọc <X size={13} />
          </button>
        )}
      </div>
      <p className="data-notice">
        Công thức mẫu có nhãn bản thảo; thời gian ước tính không được tính vào bộ lọc thời gian đã kiểm chứng.
      </p>
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <ErrorState error={q.error} retry={() => q.refetch()} />
      ) : q.data.data.length ? (
        <RecipeGrid recipes={q.data.data} />
      ) : (
        <Empty icon={<Search size={32} />} title="Chưa có món phù hợp">
          <p>Thử bỏ một bộ lọc. Các món chưa nấu thử không được coi là có thời gian đã kiểm chứng.</p>
          <button className="btn secondary" onClick={() => setParams({})}>
            Xem tất cả công thức
          </button>
        </Empty>
      )}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.page === 1}
            onClick={() => {
              const p = new URLSearchParams(params);
              p.set('page', String(pagination.page - 1));
              setParams(p);
            }}
          >
            Trang trước
          </button>
          <span>
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => {
              const p = new URLSearchParams(params);
              p.set('page', String(pagination.page + 1));
              setParams(p);
            }}
          >
            Trang sau
          </button>
        </div>
      )}
    </main>
  );
}
