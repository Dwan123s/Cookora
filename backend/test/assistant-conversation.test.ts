import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AiChefSuggestionResponse, Recipe } from '@cookora/contracts';
import { assistantHistory, type AssistantExchange } from '../../frontend/src/assistant-conversation';

const response: AiChefSuggestionResponse = {
  prompt: 'Trứng, cà chua',
  servings: 2,
  parsedIngredients: [],
  menuOverview: 'Có thể làm trứng hấp.',
  catalogDishes: [
    {
      reason: 'Có trứng',
      recipe: {
        title: 'Trứng xào cà chua',
        ingredients: [],
        steps: [{ id: 'step', order: 1, title: 'Xào', instruction: 'Xào cà chua trước.' }],
      } as unknown as Recipe,
    },
  ],
  dishes: [
    {
      id: 'new-dish',
      title: 'Trứng hấp',
      summary: '',
      cuisine: 'VN',
      category: 'Món hấp',
      servings: 2,
      prepMinutes: 5,
      cookMinutes: 10,
      totalMinutes: 15,
      difficulty: 'Dễ',
      usedIngredients: [{ name: 'Trứng', quantity: '2', unit: 'quả' }],
      pantryIngredientsNeeded: [],
      steps: [{ order: 1, title: 'Hấp', instruction: 'Hấp trứng trong 10 phút.' }],
    },
  ],
};

test('chat history keeps completed conversations with recipe details for follow-up questions', () => {
  const exchanges: AssistantExchange[] = [
    { id: 1, prompt: 'Tôi có trứng', servings: 3, response },
    { id: 2, prompt: 'Yêu cầu lỗi', servings: 2, error: 'Offline' },
    { id: 3, prompt: 'Đang chờ', servings: 2 },
  ];
  const history = assistantHistory(exchanges);
  assert.deepEqual(
    history.map((message) => message.role),
    ['user', 'assistant'],
  );
  assert.ok(history[0].content.includes('Tôi có trứng'));
  assert.ok(history[0].content.includes('3 người'));
  assert.ok(history[1].content.includes('Trứng xào cà chua'));
  assert.ok(history[1].content.includes('Xào cà chua trước.'));
  assert.ok(history[1].content.includes('Hấp trứng trong 10 phút.'));
});

test('chat history is bounded to four recent exchanges and 6000 characters per assistant turn', () => {
  const exchanges = Array.from({ length: 7 }, (_, id) => ({
    id,
    prompt: `Tin nhắn ${id}`,
    servings: 2,
    response: { ...response, menuOverview: 'a'.repeat(10000) },
  }));
  const history = assistantHistory(exchanges);
  assert.equal(history.length, 8);
  assert.ok(history[0].content.startsWith('Tin nhắn 3'));
  assert.ok(history[6].content.startsWith('Tin nhắn 6'));
  assert.ok(history.every((message) => message.content.length <= 6000));
  assert.deepEqual(assistantHistory([]), []);
});
