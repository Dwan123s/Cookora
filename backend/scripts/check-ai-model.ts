import '../src/config';

async function run() {
  const model = process.env.VERTEX_MODEL?.trim();
  const apiKey = process.env.VERTEX_API_KEY?.trim();
  if (!model || !apiKey) throw new Error('VERTEX_MODEL and VERTEX_API_KEY are required.');
  const started = Date.now();
  const response = await fetch(
    `https://aiplatform.googleapis.com/v1/publishers/google/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(60000),
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Reply with only OK.' }] }],
      generationConfig: { maxOutputTokens: 1024 },
      }),
    },
  );
  const data = await response.json();
  console.log(
    JSON.stringify({
      requestedModel: model,
      status: response.status,
      modelVersion: data.modelVersion,
      hasResponse: !!data.candidates?.[0]?.content?.parts?.some(
        (part: { text?: string; thought?: boolean }) => part.text && !part.thought,
      ),
      elapsedMs: Date.now() - started,
      errorStatus: data.error?.status,
    }),
  );
  if (!response.ok) process.exitCode = 1;
}
run().catch(() => {
  console.error('Model connectivity check failed.');
  process.exitCode = 1;
});
