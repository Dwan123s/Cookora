import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveCategory as backendCategory } from '../src/catalog';
import { cuisineCategoryCounts, resolveCategory as frontendCategory } from '../../frontend/src/recipe-catalog';

test('vegetable dishes and crispy peanuts are classified consistently without false meat matches', () => {
  const cases = [
    ['Đọt bí xào tỏi', 'Thịt & hải sản', 'Rau củ'],
    ['Rau muống xào tỏi', 'Thịt & hải sản', 'Rau củ'],
    ['Đậu phộng da cá', 'Thịt & hải sản', 'Gỏi & món ăn nhẹ'],
    ['Đậu phộng da cá', 'Gỏi & món ăn nhẹ', 'Gỏi & món ăn nhẹ'],
    ['Nấm đùi gà xào tỏi', 'Thịt & hải sản', 'Rau củ'],
    ['Cà tím xào tỏi', 'Thịt & hải sản', 'Rau củ'],
    ['Rau muống xào thịt bò', 'Thịt & hải sản', 'Thịt & hải sản'],
    ['Cá hồi áp chảo', 'Thịt & hải sản', 'Thịt & hải sản'],
    ['Gỏi rau củ', 'Gỏi & món ăn nhẹ', 'Gỏi & món ăn nhẹ'],
    ['Chè đậu đỏ', 'Tráng miệng & món ngọt', 'Tráng miệng & món ngọt'],
  ];
  for (const [title, before, expected] of cases) {
    assert.equal(backendCategory(title, before), expected, `API: ${title}`);
    assert.equal(frontendCategory(title, before), expected, `UI: ${title}`);
    assert.equal(frontendCategory(title, expected), expected, `Repeated mapping: ${title}`);
  }
});

test('cuisine categories do not borrow desserts from other cuisines and retain vegetable corrections', () => {
  const recipes = [
    { title: 'Kimchi', category: 'Rau củ', cuisine: 'KR' },
    { title: 'Bulgogi', category: 'Thịt & hải sản', cuisine: 'KR' },
    { title: 'Chè đậu đỏ', category: 'Tráng miệng & món ngọt', cuisine: 'VN' },
    { title: 'Đọt bí xào tỏi', category: 'Thịt & hải sản', cuisine: 'VN' },
    { title: 'Tiramisu', category: 'Tráng miệng & món ngọt', cuisine: 'IT' },
  ];
  const korean = cuisineCategoryCounts(recipes, 'KR');
  assert.equal(korean.get('Tráng miệng & món ngọt') || 0, 0);
  assert.equal(korean.get('Thịt & hải sản'), 1);
  assert.equal(cuisineCategoryCounts(recipes, 'VN').get('Rau củ'), 1);
  assert.equal(cuisineCategoryCounts(recipes, 'WE').get('Tráng miệng & món ngọt'), 1);
});
