import {
  Inject,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { z } from 'zod';
import { Database } from './db';
import { demoEnabled } from './config';
import { ok, parse } from './http';
import { match, normalize, scale } from './domain';
import type { Ingredient, Recipe } from '@cookora/contracts';
export const cuisines = [
  { code: 'VN', name: 'Việt Nam', flag: '🇻🇳' },
  { code: 'KR', name: 'Hàn Quốc', flag: '🇰🇷' },
  { code: 'JP', name: 'Nhật Bản', flag: '🇯🇵' },
  { code: 'CN', name: 'Trung Quốc', flag: '🇨🇳' },
  { code: 'TH', name: 'Thái Lan', flag: '🇹🇭' },
  { code: 'IT', name: 'Ý', flag: '🇮🇹' },
  { code: 'WE', name: 'Âu & Mỹ', flag: '🌍' },
];
export const recipeInclude = {
  lines: { include: { ingredient: true }, orderBy: { sortOrder: 'asc' as const } },
  steps: { orderBy: { order: 'asc' as const } },
};
export function recipeDto(r: any): Recipe {
  return {
    ...r,
    ingredients: r.lines.map((l: any) => ({
      id: l.id,
      ingredientId: l.ingredientId,
      name: l.ingredient.name,
      quantity: l.quantity?.toString() ?? null,
      unit: l.unit,
      optional: l.optional,
      role: l.role,
      note: l.note || undefined,
    })),
    lines: undefined,
  } as Recipe;
}
export const visibleWhere = () => (demoEnabled ? {} : { contentStatus: 'APPROVED' });
const servingsSchema = z.number().int().min(1).max(20);
export const quantitySchema = z
  .string()
  .regex(/^\d{1,8}(\.\d{1,6})?$/)
  .refine((s) => Number(s) > 0, 'Lượng cần lớn hơn 0');
@Injectable()
export class Catalog {
  constructor(@Inject(Database) private readonly db: Database) {}
  async all() {
    return (
      await this.db.recipe.findMany({
        where: visibleWhere(),
        include: recipeInclude,
        orderBy: { createdAt: 'asc' },
      })
    ).map(recipeDto);
  }
  async find(ref: string) {
    const recipe = await this.db.recipe.findFirst({
      where: {
        ...visibleWhere(),
        OR: [{ slug: ref }, ...(/^[0-9a-f-]{36}$/i.test(ref) ? [{ id: ref }] : [])],
      },
      include: recipeInclude,
    });
    if (!recipe) throw new NotFoundException('Không tìm thấy công thức.');
    return recipeDto(recipe);
  }
  async ingredients(): Promise<Ingredient[]> {
    return (await this.db.ingredient.findMany({ orderBy: { name: 'asc' } })).map((r) => ({
      ...r,
      aliases: JSON.parse(r.aliasesText),
    }));
  }
}
@ApiTags('Recipes & Ingredients')
@Controller()
export class CatalogController {
  constructor(@Inject(Catalog) private readonly catalog: Catalog) {}
  @Get('cuisines') cuisines(@Req() req: Request) {
    return ok(req, cuisines);
  }
  @Get('ingredients') async ingredients(@Req() req: Request, @Query('q') q = '') {
    if (q.length > 100) parse(z.string().max(100), q);
    return ok(
      req,
      (await this.catalog.ingredients()).filter(
        (i) => !q || normalize([i.name, ...i.aliases].join(' ')).includes(normalize(q)),
      ),
    );
  }
  @Get('recipes') async list(@Req() req: Request, @Query() query: unknown) {
    const q = parse(
      z
        .object({
          q: z.string().max(100).optional(),
          cuisine: z.string().max(12).optional(),
          category: z.string().max(60).optional(),
          maxMinutes: z.coerce.number().int().min(1).max(1440).optional(),
          page: z.coerce.number().int().min(1).default(1),
          pageSize: z.coerce.number().int().min(1).max(50).default(12),
          ingredientIds: z.string().max(2000).optional(),
        })
        .strict(),
      query,
    );
    const ingredientIds = q.ingredientIds?.split(',').filter(Boolean) || [];
    const matchingIngredients = q.q
      ? new Set(
          (await this.catalog.ingredients())
            .filter((i) => normalize([i.name, ...i.aliases].join(' ')).includes(normalize(q.q!)))
            .map((i) => i.id),
        )
      : new Set<string>();
    const all = (await this.catalog.all()).filter(
      (r) =>
        (!q.q ||
          normalize(`${r.title} ${r.ingredients.map((i) => i.name).join(' ')}`).includes(normalize(q.q)) ||
          r.ingredients.some((i) => matchingIngredients.has(i.ingredientId))) &&
        (!q.cuisine || r.cuisine === q.cuisine) &&
        (!q.category || r.category === q.category) &&
        (!q.maxMinutes ||
          (r.timingStatus === 'VERIFIED' && r.totalMinutes !== null && r.totalMinutes <= q.maxMinutes)) &&
        ingredientIds.every((id) => r.ingredients.some((i) => i.ingredientId === id)),
    );
    return ok(req, all.slice((q.page - 1) * q.pageSize, q.page * q.pageSize), {
      pagination: {
        page: q.page,
        pageSize: q.pageSize,
        total: all.length,
        totalPages: Math.ceil(all.length / q.pageSize),
      },
      demo: demoEnabled,
    });
  }
  @Post('recipes/match') async match(@Req() req: Request, @Body() body: unknown) {
    const input = parse(
      z
        .object({
          mode: z.enum(['identity', 'quantity']).default('identity'),
          servings: servingsSchema.default(2),
          items: z
            .array(
              z
                .object({
                  ingredientId: z.string().min(1).max(80),
                  quantity: quantitySchema.optional(),
                  unit: z.enum(['g', 'kg', 'ml', 'l', 'piece']).optional(),
                })
                .strict()
                .refine((i) => i.quantity === undefined || !!i.unit, 'Cần chọn đơn vị'),
            )
            .min(1)
            .max(50),
        })
        .strict(),
      body,
    );
    const known = new Set((await this.catalog.ingredients()).map((i) => i.id));
    parse(
      z.array(z.string().refine((s) => known.has(s), 'Nguyên liệu không tồn tại')),
      input.items.map((i) => i.ingredientId),
    );
    return ok(
      req,
      (await this.catalog.all())
        .filter((r) => r.ingredients.some((l) => input.items.some((i) => i.ingredientId === l.ingredientId)))
        .map((r) => match(r, input.items, input.servings, input.mode))
        .sort(
          (a, b) =>
            b.score - a.score ||
            a.missing.length - b.missing.length ||
            a.recipe.id.localeCompare(b.recipe.id),
        ),
    );
  }
  @Get('recipes/:ref') async detail(@Req() req: Request, @Param('ref') ref: string) {
    return ok(req, await this.catalog.find(ref));
  }
  @Post('recipes/:ref/scale') async scale(
    @Req() req: Request,
    @Param('ref') ref: string,
    @Body() body: unknown,
  ) {
    const input = parse(z.object({ servings: servingsSchema }).strict(), body);
    return ok(req, scale(await this.catalog.find(ref), input.servings));
  }
}
