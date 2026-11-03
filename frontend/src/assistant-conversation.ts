import type { AiChatMessage, AiChefSuggestionResponse } from '@cookora/contracts';

export type AssistantExchange = {
  id: number;
  prompt: string;
  servings: number;
  response?: AiChefSuggestionResponse;
  error?: string;
};

export function assistantHistory(exchanges: readonly AssistantExchange[]): AiChatMessage[] {
  return exchanges
    .filter((exchange) => exchange.response)
    .slice(-4)
    .flatMap((exchange) => {
      const response = exchange.response!;
      const catalog = response.catalogDishes || [];
      const summary = [
        response.menuOverview,
        `Món trong kho: ${catalog.map(({ recipe }) => recipe.title).join(', ') || 'Chưa chọn món'}.`,
        `Món mới: ${response.dishes.map((dish) => dish.title).join(', ') || 'Chưa có'}.`,
        ...catalog.map(({ recipe, reason }) =>
          [
            recipe.title,
            reason,
            recipe.ingredients.map((line) => `${line.name}: ${line.quantity ?? ''} ${line.unit}`).join('; '),
            recipe.steps.map((step) => `${step.order}. ${step.instruction}`).join('\n'),
          ].join('\n'),
        ),
        ...response.dishes.map((dish) =>
          [
            dish.title,
            [...dish.usedIngredients, ...dish.pantryIngredientsNeeded]
              .map((line) => `${line.name}: ${line.quantity ?? ''} ${line.unit}`)
              .join('; '),
            dish.steps.map((step) => `${step.order}. ${step.instruction}`).join('\n'),
          ].join('\n'),
        ),
      ]
        .join('\n\n')
        .slice(0, 6000);
      return [
        { role: 'user', content: `${exchange.prompt}\nKhẩu phần: ${exchange.servings} người.` },
        { role: 'assistant', content: summary },
      ] satisfies AiChatMessage[];
    });
}
