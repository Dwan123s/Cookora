export function paginationSlots(page: number, total: number): (number | 'gap' | null)[] {
  if (total <= 7) {
    const count = Math.max(0, total);
    const start = Math.floor((7 - count) / 2);
    return Array.from({ length: 7 }, (_, index) => index >= start && index < start + count ? index - start + 1 : null);
  }
  if (page <= 4) return [1, 2, 3, 4, 5, 'gap', total];
  if (page >= total - 3) return [1, 'gap', total - 4, total - 3, total - 2, total - 1, total];
  return [1, 'gap', page - 1, page, page + 1, 'gap', total];
}
