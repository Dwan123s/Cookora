import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, LayoutDashboard } from 'lucide-react';
import type { BacklogItem } from '@cookora/contracts';
import { request } from '../api';
import { cuisines, useUser, Loading, ErrorState, Empty, PageHead, RequireLogin } from '../shared';

export function Editor() {
  const user = useUser(),
    [params, setParams] = useSearchParams(),
    [search, setSearch] = useState(params.get('q') || '');
  const q = useQuery({
    queryKey: ['backlog', user?.id, params.toString()],
    queryFn: () => request<BacklogItem[]>(`/editor/backlog?${params}`),
    enabled: !!user && user.role !== 'USER',
  });
  const page = Number(params.get('page') || 1),
    pagination = q.data?.meta.pagination as { total: number; totalPages: number } | undefined,
    counts = q.data?.meta.counts as
      | { total: number; idea: number; draft: number; kitchen_tested: number }
      | undefined;
  const set = (key: string, value: string) => {
    const p = new URLSearchParams(params);
    value ? p.set(key, value) : p.delete(key);
    p.delete('page');
    setParams(p);
  };
  if (!user) return <RequireLogin title="Không gian biên tập" />;
  if (user.role === 'USER')
    return (
      <main className="container">
        <Empty icon={<LayoutDashboard size={32} />} title="Khu vực dành cho biên tập viên">
          <p>
            Tài khoản hiện tại chưa có quyền. Quyền biên tập local được cấp bằng lệnh quản trị trong README.
          </p>
        </Empty>
      </main>
    );
  return (
    <main className="container">
      <PageHead
        eyebrow="KHÔNG GIAN BIÊN TẬP"
        title="300 món ăn, từng món một"
        description="150 món Việt và 150 món nước ngoài để đọc và lọc. Chưa có workflow xuất bản hoặc kitchen test trong phiên bản này."
      />
      <div className="editor-stats">
        <div>
          <strong>{counts?.total ?? '…'}</strong>
          <span>Đề tài</span>
        </div>
        <div>
          <strong>{counts?.idea ?? '…'}</strong>
          <span>Ý tưởng</span>
        </div>
        <div>
          <strong>{counts?.draft ?? '…'}</strong>
          <span>Bản thảo</span>
        </div>
        <div>
          <strong>{counts?.kitchen_tested ?? '…'}</strong>
          <span>Đã nấu thử</span>
        </div>
      </div>
      <form
        className="search-bar"
        onSubmit={(e) => {
          e.preventDefault();
          set('q', search);
        }}
      >
        <Search size={20} />
        <input
          aria-label="Tìm backlog"
          placeholder="Tìm mã, tên món hoặc nguyên liệu…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn" type="submit">
          Tìm
        </button>
      </form>
      <div className="filter-row">
        <select
          aria-label="Nhóm ẩm thực backlog"
          value={params.get('cuisine') || ''}
          onChange={(e) => set('cuisine', e.target.value)}
        >
          <option value="">Mọi nền ẩm thực</option>
          {cuisines.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Trạng thái backlog"
          value={params.get('status') || ''}
          onChange={(e) => set('status', e.target.value)}
        >
          <option value="">Mọi trạng thái</option>
          <option value="IDEA">Ý tưởng</option>
          <option value="DRAFT">Bản thảo</option>
        </select>
        <span className="muted tiny">{pagination?.total ?? '…'} kết quả</span>
      </div>
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <ErrorState error={q.error} />
      ) : (
        <div className="backlog-table" role="region" aria-label="Danh sách đề tài công thức" tabIndex={0}>
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Đề tài</th>
                <th>Nhóm</th>
                <th>Ưu tiên / đợt</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {q.data.data.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>
                    <strong>{r.title_proposed}</strong>
                    <small>{r.core_ingredients_proposed.join(', ')}</small>
                  </td>
                  <td>{r.cuisine_label}</td>
                  <td>
                    {r.priority} · {r.milestone}
                  </td>
                  <td>
                    <span className={r.status === 'DRAFT' ? 'badge draft' : 'badge'}>
                      {r.status === 'DRAFT' ? 'Bản thảo' : 'Ý tưởng'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="pagination">
        <button
          disabled={page <= 1}
          onClick={() => {
            const p = new URLSearchParams(params);
            p.set('page', String(page - 1));
            setParams(p);
          }}
        >
          Trang trước
        </button>
        <span>
          {page} / {pagination?.totalPages || 1}
        </span>
        <button
          disabled={page >= (pagination?.totalPages || 1)}
          onClick={() => {
            const p = new URLSearchParams(params);
            p.set('page', String(page + 1));
            setParams(p);
          }}
        >
          Trang sau
        </button>
      </div>
    </main>
  );
}
