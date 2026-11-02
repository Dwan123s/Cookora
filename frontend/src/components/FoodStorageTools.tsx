import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { Ingredient, MatchResult } from '@cookora/contracts';
import {
  ArrowRight,
  Clock3,
  CookingPot,
  Pencil,
  Plus,
  Refrigerator,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { request } from '../api';
import { ErrorState, Loading, useNotice } from '../shared';
import { matcherMedia } from '../matcher-media';
import { leftoverStatus, localDateTime, storageDate, type Leftover } from '../food-storage';
const groups = {
  poultry: 'Thịt / gia cầm đã nấu',
  soup: 'Canh, súp đã nấu',
  rice: 'Cơm đã nấu',
  other: 'Món khác / chưa rõ nhóm',
};
const emptyForm = () => ({
  name: '',
  quantity: '200',
  unit: 'g' as Leftover['unit'],
  group: 'other' as Leftover['group'],
  cookedAt: localDateTime(),
  storedAt: localDateTime(),
  environment: 'fridge' as Leftover['environment'],
  condition: 'unknown' as Leftover['condition'],
  heat: 'unknown' as Leftover['heat'],
  riceNotReheated: false,
});
const inputDate = (iso: string) =>
  new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .format(new Date(iso))
    .replace(' ', 'T');
export function LeftoverForm({
  editing,
  cancel,
  submit,
  count,
}: {
  editing: Leftover | null;
  cancel: () => void;
  submit: (value: Leftover) => boolean;
  count: number;
}) {
  const [form, setForm] = useState(emptyForm),
    [error, setError] = useState('');
  useEffect(() => {
    setError('');
    setForm(
      editing
        ? {
            ...editing,
            quantity: String(editing.quantity),
            cookedAt: inputDate(editing.cookedAt),
            storedAt: inputDate(editing.storedAt),
          }
        : emptyForm(),
    );
  }, [editing]);
  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const cookedAt = new Date(form.cookedAt + ':00+07:00'),
      storedAt = new Date(form.storedAt + ':00+07:00');
    if (
      !form.name.trim() ||
      !Number.isFinite(Number(form.quantity)) ||
      Number(form.quantity) <= 0 ||
      Number(form.quantity) > 100000
    ) {
      setError('Nhập tên món và lượng còn lại lớn hơn 0, tối đa 100.000 đơn vị.');
      return;
    }
    if (
      !Number.isFinite(cookedAt.getTime()) ||
      !Number.isFinite(storedAt.getTime()) ||
      storedAt < cookedAt ||
      storedAt.getTime() > Date.now() ||
      cookedAt.getTime() > Date.now()
    ) {
      setError('Giờ lưu cần sau hoặc bằng giờ nấu; không chọn thời điểm trong tương lai.');
      return;
    }
    if (!editing && count >= 200) {
      setError('Tủ đã có 200 món. Xóa món đã dùng trước khi thêm.');
      return;
    }
    const item: Leftover = {
      ...form,
      id: editing?.id || crypto.randomUUID(),
      name: form.name.trim(),
      quantity: Number(form.quantity),
      cookedAt: cookedAt.toISOString(),
      storedAt: storedAt.toISOString(),
    };
    if (submit(item)) {
      setForm(emptyForm());
      cancel();
    } else setError('Chưa lưu được món. Kiểm tra quyền lưu trữ của trình duyệt.');
  }
  return (
    <form className="storage-leftover-form" onSubmit={save}>
      <div className="storage-form-grid">
        <label className="storage-name">
          Tên món
          <input
            required
            maxLength={100}
            placeholder="Ví dụ: Cơm nguội"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </label>
        <label>
          Lượng còn lại
          <div className="storage-quantity">
            <input
              required
              type="number"
              min="0.01"
              max="100000"
              step="any"
              value={form.quantity}
              onChange={(e) => update('quantity', e.target.value)}
            />
            <select
              aria-label="Đơn vị lượng còn lại"
              value={form.unit}
              onChange={(e) => update('unit', e.target.value as Leftover['unit'])}
            >
              {['g', 'kg', 'phần', 'hộp'].map((u) => (
                <option value={u} key={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </label>
        <label>
          Nhóm món
          <select value={form.group} onChange={(e) => update('group', e.target.value as Leftover['group'])}>
            {Object.entries(groups).map(([v, n]) => (
              <option key={v} value={v}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Nơi bảo quản
          <select
            value={form.environment}
            onChange={(e) => update('environment', e.target.value as Leftover['environment'])}
          >
            <option value="fridge">Ngăn mát ≤ 4°C</option>
            <option value="freezer">Ngăn đông ≤ −18°C</option>
          </select>
        </label>
      </div>
      <details className="storage-conditions">
        <summary>Thời điểm & điều kiện bảo quản</summary>
        <p>
          Giờ Việt Nam (GMT+7). Ghi lần đưa vào bảo quản lạnh đầu tiên; không đặt lại giờ nấu khi hâm lại.
        </p>
        <div className="storage-form-grid">
          <label>
            Ngày, giờ nấu / nhận món
            <input
              type="datetime-local"
              required
              value={form.cookedAt}
              onChange={(e) => update('cookedAt', e.target.value)}
            />
          </label>
          <label>
            Ngày, giờ đưa vào tủ
            <input
              type="datetime-local"
              required
              value={form.storedAt}
              onChange={(e) => update('storedAt', e.target.value)}
            />
          </label>
          <label>
            Nhiệt độ trước khi cất
            <select value={form.heat} onChange={(e) => update('heat', e.target.value as Leftover['heat'])}>
              <option value="unknown">Không rõ</option>
              <option value="normal">Không quá 32°C</option>
              <option value="hot">Trên 32°C</option>
            </select>
          </label>
          <label>
            Giữ lạnh liên tục đúng nhiệt độ?
            <select
              value={form.condition}
              onChange={(e) => update('condition', e.target.value as Leftover['condition'])}
            >
              <option value="unknown">Chưa rõ điều kiện</option>
              <option value="correct">Có, theo ghi nhận của tôi</option>
              <option value="broken">Không / đã gián đoạn</option>
            </select>
          </label>
        </div>
        {form.group === 'rice' && (
          <label className="storage-check">
            <input
              type="checkbox"
              checked={form.riceNotReheated}
              onChange={(e) => update('riceNotReheated', e.target.checked)}
            />
            Cơm này chưa được hâm lại
          </label>
        )}
      </details>
      {error && (
        <p className="tools-error" role="alert">
          {error}
        </p>
      )}
      <div className="storage-form-actions">
        <button type="submit" className="tools-primary">
          <Plus size={16} />
          {editing ? 'Lưu thay đổi' : 'Thêm món'}
        </button>
        {editing && (
          <button type="button" className="tools-outline" onClick={cancel}>
            <X size={15} />
            Hủy sửa
          </button>
        )}
      </div>
    </form>
  );
}
export function LeftoverList({
  items,
  now,
  edit,
  remove,
}: {
  items: Leftover[];
  now: number;
  edit: (item: Leftover) => void;
  remove: (id: string) => void;
}) {
  return (
    <div className="storage-leftover-list">
      {items.length ? (
        items.map((item) => {
          const status = leftoverStatus(item, now);
          return (
            <article key={item.id} className="storage-leftover-item">
              <span className="storage-leftover-icon">
                <CookingPot />
              </span>
              <div>
                <h3>{item.name}</h3>
                <p>
                  {item.quantity.toLocaleString('vi-VN')} {item.unit} ·{' '}
                  {item.environment === 'fridge' ? 'Ngăn mát' : 'Ngăn đông'}
                </p>
                <small>
                  Nấu: {storageDate(item.cookedAt)} · Lưu: {storageDate(item.storedAt)}
                </small>
                <span className={`storage-status ${status.kind}`}>
                  <Clock3 size={12} />
                  {status.label}
                </span>
                <small>
                  {status.deadline
                    ? `Mốc nhắc dùng: ${storageDate(new Date(status.deadline).toISOString())}. `
                    : ''}
                  {status.detail}
                </small>
              </div>
              <div className="storage-item-actions">
                <button aria-label={`Sửa ${item.name}`} onClick={() => edit(item)}>
                  <Pencil size={14} />
                </button>
                <button aria-label={`Xóa ${item.name}`} onClick={() => remove(item.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          );
        })
      ) : (
        <div className="storage-leftover-empty">
          <Refrigerator />
          <b>Tủ lạnh đang chờ món đầu tiên</b>
          <p>Thêm món còn dư, ghi thời điểm và điều kiện để nhận mốc nhắc dùng.</p>
        </div>
      )}
    </div>
  );
}
export function LeftoverRecipeSuggestions({ items, now }: { items: Leftover[]; now: number }) {
  const [open, setOpen] = useState(false);
  const ingredients = useQuery({
    queryKey: ['ingredients'],
    queryFn: () => request<Ingredient[]>('/ingredients'),
    enabled: open,
  });
  const eligible = items.filter((i) => leftoverStatus(i, now).eligible);
  const rice = eligible.filter((i) => i.group === 'rice');
  const id = ingredients.data?.data.find((i) => i.id === 'cooked-rice')?.id;
  const matches = useQuery({
    queryKey: ['leftover-matches', id, !!rice.length],
    queryFn: () =>
      request<MatchResult[]>('/recipes/match', {
        method: 'POST',
        body: { mode: 'identity', servings: 2, items: [{ ingredientId: id }] },
      }),
    enabled: open && !!id && rice.length > 0,
  });
  return (
    <section className="storage-suggestions">
      <button className="storage-suggestion-cta" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="tools-icon">
          <Sparkles />
        </span>
        <span>
          <b>Gợi ý món từ đồ thừa</b>
          <small>Tìm công thức tận dụng nguyên liệu đã ghi nhận.</small>
        </span>
        <ArrowRight size={19} />
      </button>
      {open && (
        <div className="storage-suggestion-results">
          {!items.length ? (
            <p>Thêm món vào tủ lạnh trước để bắt đầu.</p>
          ) : !eligible.length ? (
            <p>
              Chưa có món đủ thông tin và còn trong mốc tham khảo. Kiểm tra thời điểm, nhóm món và điều kiện
              bảo quản; không dùng lại món quá mốc hoặc bảo quản sai.
            </p>
          ) : ingredients.isPending ? (
            <Loading />
          ) : ingredients.isError ? (
            <ErrorState error={ingredients.error} retry={() => void ingredients.refetch()} />
          ) : !rice.length || !id ? (
            <p>
              Kho hiện chưa có nguyên liệu chín tương ứng với món bạn ghi nhận. Có thể đối chiếu cơm đã nấu;
              các món khác cần công thức chế biến lại phù hợp.
            </p>
          ) : matches.isPending ? (
            <Loading />
          ) : matches.isError ? (
            <ErrorState error={matches.error} retry={() => void matches.refetch()} />
          ) : matches.data?.data.length ? (
            <>
              <p>
                Đối chiếu cơm chín cho 2 người theo loại nguyên liệu, chưa xác nhận đủ lượng. Hâm nóng đều và
                chỉ hâm cơm một lần.
              </p>
              {matches.data.data.slice(0, 3).map((m) => (
                <Link
                  className="storage-suggestion-recipe"
                  key={m.recipe.id}
                  to={`/cong-thuc/${m.recipe.slug}`}
                >
                  <img src={matcherMedia(m.recipe).src} alt={m.recipe.title} />
                  <span>
                    <b>{m.recipe.title}</b>
                    <small>
                      {m.recipe.totalMinutes === null
                        ? 'Chưa có thời gian nấu'
                        : `~ ${m.recipe.totalMinutes} phút`}
                    </small>
                    <small>
                      Cần bổ sung:{' '}
                      {m.missing.length
                        ? m.missing.map((i) => i.name).join(', ')
                        : 'Kiểm tra định lượng trong công thức'}
                      {m.unknown.length ? ' · Một số lượng chưa rõ.' : ''}
                    </small>
                  </span>
                  <ArrowRight size={15} />
                </Link>
              ))}
            </>
          ) : (
            <p>
              Chưa có công thức phù hợp. <Link to="/cong-thuc">Khám phá công thức</Link>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
