import { BadRequestException } from '@nestjs/common';
import { VertexAI } from '@google-cloud/vertexai';

export class BudgetProviderError extends Error {
  constructor(readonly status: number) {
    super('Budget AI provider failed');
  }
}

export function budgetProviderConfig() {
  const project = process.env.VERTEX_PROJECT_ID?.trim() || process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const apiKey = process.env.VERTEX_API_KEY?.trim();
  if (!project && !apiKey)
    throw new BadRequestException({ code: 'AI_NOT_CONFIGURED', message: 'Chưa cấu hình dịch vụ AI.' });
  return { project, apiKey, model: process.env.VERTEX_MODEL?.trim() || 'gemini-3.7-flash' };
}

export async function generateBudgetJson(
  system: string,
  userText: string,
  maxOutputTokens = 12000,
): Promise<unknown> {
  const { project, apiKey, model } = budgetProviderConfig();
  let text = '';
  if (apiKey) {
    const response = await fetch(
      `https://aiplatform.googleapis.com/v1/publishers/google/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        signal: AbortSignal.timeout(90000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: userText }] }],
          generationConfig: { responseMimeType: 'application/json', maxOutputTokens },
        }),
      },
    );
    if (!response.ok) {
      await response.body?.cancel();
      throw new BudgetProviderError(response.status);
    }
    const data = await response.json();
    text = (data.candidates?.[0]?.content?.parts || [])
      .filter((part: { text?: string; thought?: boolean }) => !part.thought && typeof part.text === 'string')
      .map((part: { text: string }) => part.text)
      .join('');
  } else {
    const location = process.env.VERTEX_LOCATION?.trim() || 'global';
    const client = new VertexAI({
      project: project!,
      location,
      apiEndpoint: location === 'global' ? 'aiplatform.googleapis.com' : undefined,
      googleAuthOptions: process.env.GOOGLE_APPLICATION_CREDENTIALS
        ? { keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS }
        : undefined,
    });
    const result = await client
      .getGenerativeModel(
        {
          model,
          systemInstruction: { role: 'system', parts: [{ text: system }] },
          generationConfig: { responseMimeType: 'application/json', maxOutputTokens },
        },
        { timeout: 90000 },
      )
      .generateContent({ contents: [{ role: 'user', parts: [{ text: userText }] }] });
    text = (result.response.candidates?.[0]?.content?.parts || []).map((part) => part.text || '').join('');
  }
  return JSON.parse(
    text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/, ''),
  );
}
