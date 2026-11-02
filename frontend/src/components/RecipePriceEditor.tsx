import { useState } from 'react';
import type { Recipe } from '@cookora/contracts';
import { money } from '../tool-data';
import { recipeCost, type PriceBook } from '../meal-cost';
import { Modal } from '../shared';

type Draft = Record<string, { quantity: string; unit: string; price: string }>;
export function RecipePriceEditor({
  recipe,
  people,
  prices,
  save,
  onClose,
}: {
  recipe: Recipe;
  people: number;
  prices: PriceBook;
  save: (next: PriceBook) => boolean;
  onClose: () => void;
}) {
  const cost = recipeCost(recipe, people, prices);
  const unique = [...new Map(cost.lines.map((l) => [l.ingredientId, l])).values()];
  const [draft, setDraft] = useState<Draft>(() =>
    Object.fromEntries(
      unique.map((l) => {
        const p = prices.find((p) => p.ingredientId === l.ingredientId);
        return [
          l.ingredientId,
          {
            quantity: String(p?.quantity || (l.unit === 'piece' ? 1 : 1000)),
            unit: p?.unit || l.unit,
            price: p ? String(p.price) : '',
          },
        ];
      }),
    ),
  );
  const [error, setError] = useState('');
  function update(id: string, field: string, value: string) {
    setDraft((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = prices.filter((p) => !unique.some((l) => l.ingredientId === p.ingredientId));
    for (const l of unique) {
      const d = draft[l.ingredientId];
      if (d.price.trim() === '') continue;
      const price = Number(d.price),
        quantity = Number(d.quantity);
      if (
        !Number.isFinite(price) ||
        price < 0 ||
        price > 100000000 ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        quantity > 10000000
      ) {
        setError('Giá phải từ 0–100 triệu đồng, lượng mua phải lớn hơn 0 và không quá 10 triệu đơn vị.');
        return;
      }
      next.push({
        ingredientId: l.ingredientId,
        quantity,
        unit: d.unit,
        price,
        updatedAt: new Date().toISOString(),
      });
    }
    if (save(next)) onClose();
    else setError('Chưa lưu được giá. Kiểm tra quyền lưu trữ của trình duyệt.');
  }
  return (
    <Modal title={`Giá nguyên liệu · ${recipe.title}`} onClose={onClose}>
      <form className="tools-price-editor" onSubmit={submit}>
        <p>
          Nhập giá bạn mua theo một gói hoặc lượng cân. Bỏ trống giá để giữ trạng thái chưa biết; 0 đ chỉ dùng
          khi thực sự không phát sinh chi phí.
        </p>
        <div className="tools-price-head">
          <span>Nguyên liệu cần dùng</span>
          <span>Lượng mua / gói</span>
          <span>Giá / gói (đ)</span>
        </div>
        {unique.map((l) => (
          <div className="tools-price-row" key={l.ingredientId}>
            <div>
              <b>{l.name}</b>
              <small>
                {l.quantity === null
                  ? 'Công thức chưa rõ định lượng'
                  : `${Number(l.quantity.toFixed(2)).toLocaleString('vi-VN')} ${l.unit === 'piece' ? 'cái' : l.unit} / ${people} người`}
              </small>
            </div>
            <div>
              <input
                aria-label={`Lượng mua ${l.name}`}
                type="number"
                min="0.001"
                step="any"
                value={draft[l.ingredientId].quantity}
                onChange={(e) => update(l.ingredientId, 'quantity', e.target.value)}
              />
              <select
                aria-label={`Đơn vị ${l.name}`}
                value={draft[l.ingredientId].unit}
                onChange={(e) => update(l.ingredientId, 'unit', e.target.value)}
              >
                {(l.unit === 'g' ? ['g', 'kg'] : l.unit === 'ml' ? ['ml', 'l'] : ['piece']).map((u) => (
                  <option key={u} value={u}>
                    {u === 'piece' ? 'cái' : u}
                  </option>
                ))}
              </select>
            </div>
            <input
              aria-label={`Giá ${l.name}`}
              placeholder="Chưa có giá"
              type="number"
              min="0"
              max="100000000"
              step="any"
              value={draft[l.ingredientId].price}
              onChange={(e) => update(l.ingredientId, 'price', e.target.value)}
            />
          </div>
        ))}
        {error && (
          <p role="alert" className="tools-error">
            {error}
          </p>
        )}
        <p>
          Giá do bạn cung cấp, có thể khác theo nơi mua. Món có định lượng chưa rõ sẽ chưa được xác nhận phù
          hợp ngân sách.
        </p>
        <button className="tools-primary" type="submit">
          Lưu giá tham khảo
        </button>
      </form>
    </Modal>
  );
}
