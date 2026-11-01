export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function addDays(value: string, count: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + count);
  return dateKey(date);
}
export function weekOf(value = dateKey(new Date())) {
  const d = new Date(`${value}T12:00:00`);
  return addDays(value, -(d.getDay() + 6) % 7);
}
export function dayLabel(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}
