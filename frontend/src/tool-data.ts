import { useEffect, useState } from 'react';
import { loadRecipeCatalog } from './recipe-catalog';
import { useUser } from './shared';

export const money = (value: number) => `${Math.round(value).toLocaleString('vi-VN')} đ`;
export const normalizeFood = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();
export async function toolRecipes() {
  return loadRecipeCatalog();
}
// No price API exists yet. Device storage is explicitly scoped to the current account.
export function useToolStorage<T>(feature: string, fallback: T, validate: (value: unknown) => value is T) {
  const user = useUser();
  const key = `cookora.${feature}.v1.${user?.id || 'guest'}`;
  function read(): T {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(key) || 'null');
      return validate(value) ? value : fallback;
    } catch {
      return fallback;
    }
  }
  const [snapshot, setSnapshot] = useState(() => ({ key, value: read() }));
  const value = snapshot.key === key ? snapshot.value : read();
  useEffect(() => {
    if (snapshot.key !== key) setSnapshot({ key, value: read() });
  }, [key, snapshot.key]);
  function save(next: T) {
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setSnapshot({ key, value: next });
      return true;
    } catch {
      return false;
    }
  }
  return {
    value,
    save,
    scope: user
      ? 'Lưu trên thiết bị này, riêng cho tài khoản đang đăng nhập.'
      : 'Lưu trên thiết bị này ở chế độ khách.',
  };
}
