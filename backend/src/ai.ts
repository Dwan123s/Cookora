import {
  Controller,
  Post,
  Body,
  Req,
  Injectable,
  Inject,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { VertexAI } from '@google-cloud/vertexai';
import type { AiChefSuggestionResponse } from '@cookora/contracts';
import { parse, ok } from './http';

const SYSTEM_INSTRUCTION = `Bạn là trợ lý bếp trưởng của Cookora, am hiểu sâu sắc ẩm thực gia đình Việt Nam.
Nhiệm vụ của bạn là nhận danh sách nguyên liệu và khẩu phần từ người dùng (nhập bằng ngôn ngữ tự nhiên), phân tích và đề xuất thực đơn cùng công thức nấu ăn chi tiết.

QUY TẮC BẮT BUỘC VỀ NỘI DUNG VÀ ĐỊNH DẠNG:
1. Tuyệt đối KHÔNG sử dụng emoji, ký hiệu cảm xúc hoặc các biểu tượng trang trí trong bất kỳ trường nào (tiêu đề, tóm tắt, nguyên liệu, bước nấu).
2. Quy đổi chuẩn xác các đơn vị đo lường dân dã Việt Nam:
   - 1 lạng = 100g (ví dụ: 2 lạng = 200g, 3 lạng = 300g).
   - "bó", "quả", "trái", "củ", "nhánh", "thìa canh", "muỗng cà phê", "bát", "chén", "miếng", "bìa"...
3. Bếp gia đình Việt luôn ngầm hiểu có sẵn các gia vị cơ bản: dầu ăn, nước mắm, muối, đường, hạt nêm, tiêu, hành tím, tỏi, ớt. Đưa các gia vị cần dùng thêm vào danh sách "pantryIngredientsNeeded".
4. Phân bổ các nguyên liệu người dùng đưa vào một cách thực tế để tạo thành một bữa ăn hài hòa (ví dụ: món mặn xào/kho + món canh/luộc) hoặc các món nấu riêng biệt hợp lý. Không bịa ra các món kỳ dị, không thực tế.
5. Các bước nấu (steps) phải tuần tự, rõ ràng, thực tế cho việc vào bếp, không viết văn sáo rỗng hoặc quảng cáo.
6. Trả về đúng định dạng JSON thuần túy (valid JSON) theo cấu trúc sau, không kèm bất kỳ markdown code block nào:
{
  "parsedIngredients": [
    { "name": "Tên nguyên liệu chuẩn hóa", "quantity": "số lượng đã quy đổi", "unit": "đơn vị (g, kg, ml, l, bó, quả...)", "original": "chuỗi gốc trong prompt" }
  ],
  "menuOverview": "Tóm tắt ngắn gọn ý tưởng kết hợp bữa ăn",
  "dishes": [
    {
      "id": "chuỗi định danh ngắn duy nhất",
      "title": "Tên món ăn",
      "summary": "Tóm tắt ngắn gọn hương vị và đặc điểm món",
      "cuisine": "VIETNAMESE",
      "category": "Món xào | Món canh | Món luộc | Món kho | Món rán | Món hấp",
      "servings": 2,
      "prepMinutes": 15,
      "cookMinutes": 15,
      "totalMinutes": 30,
      "difficulty": "Dễ | Trung bình | Khó",
      "usedIngredients": [
        { "name": "Tên nguyên liệu đã có", "quantity": "định lượng dùng cho món này", "unit": "đơn vị", "note": "ghi chú sơ chế nếu có" }
      ],
      "pantryIngredientsNeeded": [
        { "name": "Gia vị bếp cần thêm", "quantity": "định lượng", "unit": "đơn vị", "note": "ghi chú sơ chế nếu có" }
      ],
      "steps": [
        { "order": 1, "title": "Tên bước", "instruction": "Hướng dẫn cụ thể, súc tích" }
      ]
    }
  ]
}`;

class VertexRequestError extends Error {
  constructor(readonly status: number) {
    super('Vertex AI request failed');
  }
}

@Injectable()
export class AiChefService {
  async suggestRecipes(prompt: string, servings = 2): Promise<AiChefSuggestionResponse> {
    const projectId = process.env.VERTEX_PROJECT_ID?.trim() || process.env.GOOGLE_CLOUD_PROJECT?.trim();
    const location = process.env.VERTEX_LOCATION?.trim() || 'global';
    const modelName = process.env.VERTEX_MODEL?.trim() || 'gemini-3.8-flash';
    const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const apiKey = process.env.VERTEX_API_KEY?.trim();

    // Check if user has configured Vertex AI project or API key
    if (!projectId && !apiKey) {
      throw new BadRequestException({
        code: 'VERTEX_AI_NOT_CONFIGURED',
        message:
          'Chưa cấu hình Google Cloud Vertex AI. Vui lòng thiết lập VERTEX_PROJECT_ID (hoặc VERTEX_API_KEY) trong file .env.',
      });
    }

    try {
      let rawJsonText = '';

      if (apiKey) {
        // Vertex AI Express uses a global endpoint without project or location segments.
        const endpoint = `https://aiplatform.googleapis.com/v1/publishers/google/models/${encodeURIComponent(modelName)}:generateContent`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          signal: AbortSignal.timeout(60000),
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `Khẩu phần: ${servings} người ăn.\nNguyên liệu hiện có: ${prompt}` }],
              },
            ],
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }],
            },
            generationConfig: {
              responseMimeType: 'application/json',
              maxOutputTokens: 8192,
            },
          }),
        });

        if (!response.ok) {
          await response.body?.cancel();
          throw new VertexRequestError(response.status);
        }

        const data = await response.json();
        rawJsonText = (data.candidates?.[0]?.content?.parts || [])
          .filter(
            (part: { text?: string; thought?: boolean }) => !part.thought && typeof part.text === 'string',
          )
          .map((part: { text: string }) => part.text)
          .join('');
      } else if (projectId) {
        // Vertex AI SDK with Project ID and Google Auth
        const vertexAI = new VertexAI({
          project: projectId,
          location,
          apiEndpoint: location === 'global' ? 'aiplatform.googleapis.com' : undefined,
          googleAuthOptions: keyFilename ? { keyFilename } : undefined,
        });

        const generativeModel = vertexAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: 8192,
          },
          systemInstruction: {
            role: 'system',
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
        });

        const result = await generativeModel.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: `Khẩu phần: ${servings} người ăn.\nNguyên liệu hiện có: ${prompt}` }],
            },
          ],
        });

        rawJsonText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }

      if (!rawJsonText) {
        throw new Error('Mô hình không trả về nội dung công thức.');
      }

      // Clean markdown code blocks if model wrapped it in ```json ... ```
      const cleanedText = rawJsonText
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      const parsed = JSON.parse(cleanedText);

      return {
        prompt,
        servings,
        parsedIngredients: Array.isArray(parsed.parsedIngredients) ? parsed.parsedIngredients : [],
        menuOverview: parsed.menuOverview || 'Đề xuất công thức từ nguyên liệu đã nhập.',
        dishes: Array.isArray(parsed.dishes)
          ? parsed.dishes.map((d: Record<string, unknown>, idx: number) => ({
              id: String(d.id || `dish-${idx + 1}-${randomUUID().slice(0, 8)}`),
              title: String(d.title || 'Món ăn gia đình'),
              summary: String(d.summary || ''),
              cuisine: String(d.cuisine || 'VIETNAMESE'),
              category: String(d.category || 'Món chính'),
              servings: Number(d.servings || servings),
              prepMinutes: Number(d.prepMinutes || 15),
              cookMinutes: Number(d.cookMinutes || 15),
              totalMinutes: Number(d.totalMinutes || 30),
              difficulty: String(d.difficulty || 'Dễ'),
              usedIngredients: Array.isArray(d.usedIngredients) ? d.usedIngredients : [],
              pantryIngredientsNeeded: Array.isArray(d.pantryIngredientsNeeded)
                ? d.pantryIngredientsNeeded
                : [],
              steps: Array.isArray(d.steps)
                ? d.steps.map((s: Record<string, unknown>, sIdx: number) => ({
                    order: Number(s.order || sIdx + 1),
                    title: String(s.title || `Bước ${sIdx + 1}`),
                    instruction: String(s.instruction || ''),
                  }))
                : [],
            }))
          : [],
      };
    } catch (error) {
      const status = error instanceof VertexRequestError ? error.status : undefined;
      console.error(JSON.stringify({ event: 'VERTEX_AI_ERROR', status }));
      throw new ServiceUnavailableException({
        code: 'VERTEX_AI_ERROR',
        message:
          status === 401 || status === 403
            ? 'Vertex AI từ chối xác thực. Kiểm tra API key, quyền và chính sách Google Cloud.'
            : status === 404
              ? 'Không tìm thấy model trên Vertex AI. Kiểm tra VERTEX_MODEL và quyền truy cập model.'
              : status === 429
                ? 'Vertex AI đang hết hạn mức hoặc quá tải. Vui lòng thử lại sau.'
                : 'Không thể lấy gợi ý từ Vertex AI. Vui lòng thử lại sau.',
      });
    }
  }
}

const SuggestionInputSchema = z.object({
  prompt: z.string().trim().min(2, 'Vui lòng nhập danh sách nguyên liệu.').max(1000),
  servings: z.coerce.number().int().min(1).max(20).default(2),
});

@Controller('ai')
export class AiController {
  constructor(@Inject(AiChefService) private readonly aiService: AiChefService) {}

  @Post('suggest-recipes')
  async suggest(@Req() req: Request, @Body() body: unknown) {
    const input = parse(SuggestionInputSchema, body);
    const result = await this.aiService.suggestRecipes(input.prompt, input.servings);
    return ok(req, result);
  }
}
