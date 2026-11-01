import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, LoaderCircle, ShoppingBasket, AlertCircle } from 'lucide-react';
import type { MealPlan, ShoppingList } from '@cookora/contracts';
import { request } from '../api';
import { useNotice, useUser, errorText, Loading, ErrorState, Empty, PageHead, RequireLogin } from '../shared';

export function Shopping() {
  const { planId } = useParams(),
    user = useUser(),
    qc = useQueryClient(),
    notice = useNotice();
  const q = useQuery({
    queryKey: ['shopping', user?.id, planId],
    queryFn: () => request<ShoppingList | null>(`/meal-plans/${planId}/shopping`),
    enabled: !!user,
  });
  const [busyId, setBusy] = useState('');
  const [error, setError] = useState(''),
    [generating, setGenerating] = useState(false);
  const makeList = async () => {
    setGenerating(true);
    setError('');
    try {
      const plan = await request<MealPlan>(`/meal-plans/${planId}`);
      const list = await request<ShoppingList>(`/meal-plans/${planId}/shopping`, {
        method: 'POST',
        body: { version: plan.data.version },
      });
      qc.setQueryData(['shopping', user?.id, planId], list);
      notice('Đã tổng hợp nguyên liệu.');
    } catch (e) {
      setError(errorText(e));
    } finally {
      setGenerating(false);
    }
  };
  const tick = async (itemId: string, purchased: boolean) => {
    if (!q.data?.data) return;
    const previous = q.data;
    const previousList = q.data.data;
    qc.setQueryData(['shopping', user?.id, planId], {
      ...previous,
      data: {
        ...previousList,
        items: previousList.items.map((item) => (item.id === itemId ? { ...item, purchased } : item)),
      },
    });
    setBusy(itemId);
    try {
      const result = await request<ShoppingList>(`/shopping-items/${itemId}`, {
        method: 'PATCH',
        body: { purchased, version: q.data.data.version },
      });
      qc.setQueryData(['shopping', user?.id, planId], result);
    } catch (e) {
      qc.setQueryData(['shopping', user?.id, planId], previous);
      notice(errorText(e));
      q.refetch();
    } finally {
      setBusy('');
    }
  };
  if (!user) return <RequireLogin title="Danh sách đi chợ của bạn" />;
  const list = q.data?.data,
    groups = [...new Set(list?.items.map((i) => i.category) || [])],
    checked = list?.items.filter((i) => i.purchased).length || 0;
  return (
    <main className="container shopping-page">
      <Link to="/thuc-don" className="text-link">
        <ArrowLeft size={16} />
        Về thực đơn
      </Link>
      <PageHead
        eyebrow="ĐI CHỢ CÓ KẾ HOẠCH"
        title="Một danh sách, bớt quên đồ"
        description="Nguyên liệu được cộng theo công thức và số phần trong thực đơn. Có thể dùng chung nguyên liệu cho nhiều món."
        action={
          <button className="btn" disabled={generating || q.isPending} onClick={makeList}>
            {generating ? <LoaderCircle className="spin" size={16} /> : <ShoppingBasket size={17} />}
            {list ? 'Cập nhật từ thực đơn' : 'Tạo danh sách đi chợ'}
          </button>
        }
      />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <ErrorState error={q.error} />
      ) : list ? (
        <>
          {list.stale && (
            <div className="draft-note">
              <AlertCircle size={20} />
              <span>
                Thực đơn đã thay đổi. Cập nhật lại danh sách; các mục đã mua cần được kiểm tra trước khi tạo
                lại.
              </span>
            </div>
          )}
          <div className="shopping-summary">
            <div>
              <ShoppingBasket size={25} />
              <span>
                <strong>
                  {checked} / {list.items.length}
                </strong>{' '}
                nguyên liệu đã mua
              </span>
            </div>
            <button className="plain-btn" onClick={() => window.print()}>
              In danh sách
            </button>
          </div>
          {groups.map((category) => (
            <section className="shopping-group" key={category}>
              <h2>{category}</h2>
              {list.items
                .filter((i) => i.category === category)
                .map((i) => (
                  <label className={`shopping-row ${i.purchased ? 'purchased' : ''}`} key={i.id}>
                    <input
                      type="checkbox"
                      disabled={!!busyId}
                      checked={i.purchased}
                      onChange={(e) => tick(i.id, e.target.checked)}
                    />
                    <span>
                      <strong>{i.name}</strong>
                      <small>{i.sources.join(' · ')}</small>
                    </span>
                    <b>
                      {i.quantity ?? 'Cần kiểm tra'} {i.quantity ? i.unit : ''}
                    </b>
                  </label>
                ))}
            </section>
          ))}
          {!list.items.length && (
            <Empty icon={<ShoppingBasket />} title="Thực đơn chưa có món">
              <p>Thêm món vào tuần trước khi tổng hợp nguyên liệu.</p>
            </Empty>
          )}
          <p className="tiny muted">
            Đây là lượng cần dùng, chưa trừ đồ đang có và chưa làm tròn theo quy cách mua. Đánh dấu đã mua
            không tự thêm vào kho hoặc ghi là đã ăn.
          </p>
        </>
      ) : (
        <Empty icon={<ShoppingBasket size={40} />} title="Sẵn sàng chuẩn bị chuyến đi chợ">
          <p>Bấm “Tạo danh sách đi chợ” để gộp nguyên liệu từ thực đơn của bạn.</p>
        </Empty>
      )}
    </main>
  );
}
