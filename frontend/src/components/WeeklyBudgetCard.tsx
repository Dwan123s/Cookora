import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Coins, LoaderCircle } from 'lucide-react';
import type { MealEntry, WeeklyBudgetEstimate } from '@cookora/contracts';
import { request } from '../api';
import { errorText } from '../shared';
import { weeklyBudgetContext } from '../weekly-budget';

const money = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount) + ' đ';

export function WeeklyBudgetCard({
  entries,
  week,
  userId,
  budget,
  onBudgetChange,
  disabled,
}: {
  entries: MealEntry[];
  week: string;
  userId?: string;
  budget: number;
  onBudgetChange(value: number): void;
  disabled: boolean;
}) {
  const [region, setRegion] = useState('Việt Nam');
  const context = useMemo(() => weeklyBudgetContext(entries), [entries]);
  const estimate = useQuery({
    queryKey: ['weekly-budget-ai', userId || 'guest', week, region.trim(), context],
    queryFn: ({ signal }) =>
      request<WeeklyBudgetEstimate>('/ai/estimate-week', {
        method: 'POST',
        body: {
          region: region.trim(),
          entries: context.map(({ recipeId, servings }) => ({ recipeId, servings })),
        },
        signal,
      }),
    enabled: false,
    retry: false,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });
  const result = estimate.data?.data;
  const total = result?.estimatedTotal;
  const overBudget = total !== undefined && budget > 0 && total > budget;
  const recipeNames = new Map(entries.map((entry) => [entry.recipe.id, entry.recipe.title]));

  return (
    <section
      className={`weekly-budget${overBudget ? ' is-over-budget' : ''}`}
      aria-label="Ngân sách dự kiến"
      aria-busy={estimate.isFetching}
    >
      <div>
        <Coins size={25} />
        <strong>Ngân sách dự kiến</strong>
        <b aria-live="polite">
          {total === undefined ? (entries.length ? 'Chưa ước tính' : 'Chưa có món') : '~ ' + money(total)}
        </b>
      </div>
      <div
        className="weekly-budget-track"
        role="progressbar"
        aria-label="Chi phí ước tính so với ngân sách tuần"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={total === undefined || !budget ? 0 : Math.min(100, Math.round((total / budget) * 100))}
      >
        <span
          style={{
            width: `${total !== undefined && budget > 0 ? Math.min(100, (total / budget) * 100) : 0}%`,
          }}
        />
      </div>
      <label>
        Ngân sách tuần
        <input
          type="number"
          aria-label="Ngân sách tuần"
          min={0}
          max={100000000}
          step={50000}
          value={budget}
          onChange={(event) => onBudgetChange(Math.min(100000000, Math.max(0, Number(event.target.value))))}
        />
        <span>đ</span>
      </label>
      <label className="weekly-budget-region">
        Nơi mua
        <input
          type="text"
          aria-label="Nơi mua nguyên liệu"
          maxLength={120}
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          placeholder="Tỉnh/thành hoặc khu vực"
        />
      </label>
      <button
        type="button"
        className="weekly-budget-ai"
        disabled={disabled || !entries.length || !region.trim() || estimate.isFetching}
        onClick={() => void estimate.refetch()}
      >
        {estimate.isFetching ? <LoaderCircle size={17} className="spin" /> : <Coins size={17} />}
        {estimate.isFetching
          ? 'AI đang tính chi phí…'
          : result
            ? 'AI tính lại ngân sách'
            : 'AI dự tính ngân sách'}
      </button>
      {estimate.isError && (
        <p className="weekly-budget-error" role="alert">
          {errorText(estimate.error)}
        </p>
      )}
      {!result && !estimate.isFetching && (
        <p>
          {entries.length
            ? 'AI ước tính chi phí theo các món và khẩu phần của tuần đang xem. Đổi món hoặc nơi mua thì tính lại.'
            : 'Thêm món vào thực đơn để AI dự tính ngân sách.'}
        </p>
      )}
      {result && (
        <>
          <p className="weekly-budget-balance" role="status">
            {budget > 0
              ? overBudget
                ? `Vượt ngân sách ${money(total! - budget)}.`
                : `Còn ${money(budget - total!)} so với ngân sách tuần.`
              : 'Nhập ngân sách tuần để so sánh chi phí.'}
          </p>
          <p>
            AI ước tính cho {entries.length} lượt món, theo khẩu phần đã chọn. Giá có thể thay đổi theo nơi
            mua.
          </p>
          <details className="weekly-budget-details">
            <summary>Xem chi phí từng món</summary>
            <ul>
              {result.dishes.map((dish) => (
                <li key={`${dish.recipeId}:${dish.servings}`}>
                  <span>
                    {recipeNames.get(dish.recipeId)} · {dish.servings} người
                    {dish.occurrences > 1 ? ` × ${dish.occurrences} bữa` : ''}
                  </span>
                  <b>{money(dish.subtotal)}</b>
                </li>
              ))}
            </ul>
            <p>{result.explanation}</p>
            {result.tips.length > 0 && (
              <ul className="weekly-budget-tips">
                {result.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            )}
            <p>{result.priceNote}</p>
          </details>
        </>
      )}
    </section>
  );
}
