import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Request } from 'express';
import type { Recipe } from '@cookora/contracts';
import { canonicalDifficulty, recipeDifficulty } from '../src/recipe-difficulty';
import { Catalog, CatalogController, recipeDto } from '../src/catalog';
import { discoveryRecipe } from '../../frontend/src/recipe-catalog';

const totalOf = (result: { meta: unknown }) =>
  (result.meta as { pagination: { total: number } }).pagination.total;

test('difficulty names normalize to the three filter labels without overriding supplied ratings', () => {
  for (const [input, expected] of [
    ['Dễ', 'Dễ'],
    ['EASY', 'Dễ'],
    ['Trung bình', 'Vừa'],
    ['MEDIUM', 'Vừa'],
    ['Vừa', 'Vừa'],
    ['Khó', 'Nâng cao'],
    ['HARD', 'Nâng cao'],
    ['Nâng cao', 'Nâng cao'],
  ]) {
    assert.equal(canonicalDifficulty(input), expected);
    assert.deepEqual(recipeDifficulty({ difficulty: input, steps: [] }), {
      difficulty: expected,
      difficultyBasis: 'PROVIDED',
    });
  }
  assert.equal(canonicalDifficulty('Chưa đánh giá qua nấu thử'), undefined);
  assert.equal(recipeDifficulty({ steps: [] }).difficultyBasis, 'UNKNOWN');
});

test('estimates distinguish simple cooking, multiple stages, and precision techniques', () => {
  const rate = (instructions: string[], ingredients = 6, totalMinutes: number | null = 20) =>
    recipeDifficulty({
      steps: instructions.map((instruction) => ({ instruction })),
      ingredients: Array(ingredients),
      totalMinutes,
    });
  assert.equal(rate(['Đánh tan trứng với hành lá.', 'Chiên trứng đến khi chín.']).difficulty, 'Dễ');
  assert.equal(rate(['Chần rau muống.', 'Xào rau với tỏi cho chín tới.']).difficulty, 'Dễ');
  assert.equal(rate(['Hầm xương với củ cải ở lửa nhỏ trong 3 giờ.'], 5, 180).difficulty, 'Vừa');
  assert.equal(rate(['Trộn bột, ủ bột rồi chiên.']).difficulty, 'Vừa');
  assert.equal(
    rate(['Nhào bột cho mịn, cán mỏng rồi gói nhân.', 'Hấp bánh cho chín.']).difficulty,
    'Nâng cao',
  );
  assert.equal(
    rate(['Đánh bông lòng trắng trứng, trộn nhẹ vào bột.', 'Nướng cách thủy trong lò.']).difficulty,
    'Nâng cao',
  );
});

test('all document recipes receive usable estimated labels while source instructions stay unchanged', () => {
  const { recipes } = JSON.parse(
    readFileSync(resolve(__dirname, '../../database/seeds/document-recipes.json'), 'utf8'),
  );
  const before = JSON.stringify(recipes);
  const groups = new Set<string>();
  for (const recipe of recipes) {
    const info = recipeDifficulty(recipe);
    assert.ok(['Dễ', 'Vừa', 'Nâng cao'].includes(info.difficulty), recipe.slug);
    assert.equal(info.difficultyBasis, 'ESTIMATED');
    groups.add(info.difficulty);
  }
  assert.equal(groups.size, 3);
  assert.equal(JSON.stringify(recipes), before);
});

test('recipe DTO and discovery carry the same difficulty and estimate provenance', () => {
  const raw = {
    title: 'Rau xào tỏi',
    difficulty: 'Chưa đánh giá qua nấu thử',
    totalMinutes: 15,
    lines: [],
    steps: [{ instruction: 'Xào rau với tỏi ở lửa lớn.' }],
  };
  const dto = recipeDto(raw);
  assert.equal(dto.difficulty, 'Dễ');
  assert.equal(dto.difficultyBasis, 'ESTIMATED');
  assert.equal(discoveryRecipe(dto).difficulty, 'Dễ');
  assert.equal(discoveryRecipe(dto).difficultyBasis, 'ESTIMATED');
  assert.equal(raw.difficulty, 'Chưa đánh giá qua nấu thử');
});

test('catalog difficulty filtering supports all three levels, aliases, combinations and pagination', async () => {
  const recipes = [
    { id: 'a', title: 'Rau xào', difficulty: 'Dễ', cuisine: 'VN', category: 'Rau' },
    { id: 'b', title: 'Gà hầm', difficulty: 'Vừa', cuisine: 'VN', category: 'Thịt' },
    { id: 'c', title: 'Bánh', difficulty: 'Nâng cao', cuisine: 'JP', category: 'Bánh' },
    { id: 'd', title: 'Đậu xào', difficulty: 'Dễ', cuisine: 'VN', category: 'Rau' },
  ].map((recipe) => ({ ...recipe, ingredients: [] })) as unknown as Recipe[];
  const controller = new CatalogController({ all: async () => recipes } as Catalog);
  const req = { headers: {} } as Request;
  for (const [difficulty, expected] of [
    ['Dễ', 2],
    ['Vừa', 1],
    ['Nâng cao', 1],
    ['MEDIUM', 1],
    ['Khó', 1],
  ] as const) {
    const result = await controller.list(req, { difficulty });
    assert.equal(totalOf(result), expected);
    assert.ok(result.data.every((recipe) => recipe.difficulty === canonicalDifficulty(difficulty)));
  }
  const second = await controller.list(req, {
    difficulty: 'EASY',
    cuisine: 'VN',
    category: 'Rau',
    pageSize: 1,
    page: 2,
  });
  assert.equal(totalOf(second), 2);
  assert.equal(second.data[0].id, 'd');
  assert.equal(totalOf(await controller.list(req, {})), 4);
  await assert.rejects(
    controller.list(req, { difficulty: 'unknown-level' }),
    (error: any) => error.getStatus() === 400,
  );
});
