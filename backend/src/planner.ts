import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Req,
  Query,
  UseGuards,
  Inject,
  NotFoundException,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { Database } from './db';
import { Catalog, recipeDto, recipeInclude } from './catalog';
import { AuthGuard, type AuthRequest } from './security';
import { ok, parse } from './http';
import { aggregate, validDate, withinWeek } from './domain';
const uuid = z.uuid();
const dateSchema = z.string().refine(validDate, 'Ngày không hợp lệ');
const conflict = () =>
  new HttpException(
    { code: 'STALE_VERSION', message: 'Thực đơn đã thay đổi ở nơi khác. Vui lòng tải lại.' },
    412,
  );
const planInclude = {
  entries: {
    include: { recipe: { include: recipeInclude } },
    orderBy: [{ date: 'asc' as const }, { id: 'asc' as const }],
  },
};
function planDto(p: any) {
  return { ...p, entries: p.entries.map((e: any) => ({ ...e, recipe: recipeDto(e.recipe) })) };
}
@ApiTags('Favorites & Meal Plans')
@Controller()
@UseGuards(AuthGuard)
export class PlannerController {
  constructor(
    @Inject(Database) private readonly db: Database,
    @Inject(Catalog) private readonly catalog: Catalog,
  ) {}
  private async plan(id: string, userId: string) {
    parse(uuid, id);
    const p = await this.db.mealPlan.findFirst({ where: { id, userId }, include: planInclude });
    if (!p) throw new NotFoundException('Không tìm thấy thực đơn.');
    return p;
  }
  @Get('favorites') async favorites(@Req() req: AuthRequest) {
    const list = await this.db.favorite.findMany({
      where: { userId: req.user!.id },
      include: { recipe: { include: recipeInclude } },
      orderBy: { createdAt: 'desc' },
    });
    return ok(
      req,
      list.map((f) => recipeDto(f.recipe)),
    );
  }
  @Put('favorites/:id') async favorite(@Req() req: AuthRequest, @Param('id') id: string) {
    parse(uuid, id);
    await this.catalog.find(id);
    await this.db.favorite.upsert({
      where: { userId_recipeId: { userId: req.user!.id, recipeId: id } },
      create: { userId: req.user!.id, recipeId: id },
      update: {},
    });
    return ok(req, { saved: true });
  }
  @Delete('favorites/:id') async unfavorite(@Req() req: AuthRequest, @Param('id') id: string) {
    parse(uuid, id);
    await this.db.favorite.deleteMany({ where: { userId: req.user!.id, recipeId: id } });
    return ok(req, { saved: false });
  }
  @Get('meal-plans') async week(@Req() req: AuthRequest, @Query('week') week: string) {
    parse(
      dateSchema.refine((d) => new Date(d).getUTCDay() === 1, 'Tuần bắt đầu vào thứ Hai'),
      week,
    );
    const p = await this.db.mealPlan.findUnique({
      where: { userId_weekStart: { userId: req.user!.id, weekStart: week } },
      include: planInclude,
    });
    return ok(req, p ? planDto(p) : null);
  }
  @Get('meal-plans/:id') async detail(@Req() req: AuthRequest, @Param('id') id: string) {
    return ok(req, planDto(await this.plan(id, req.user!.id)));
  }
  @Post('meal-plans') async create(@Req() req: AuthRequest, @Body() body: unknown) {
    const i = parse(
      z.object({ weekStart: dateSchema.refine((d) => new Date(d).getUTCDay() === 1) }).strict(),
      body,
    );
    const p = await this.db.mealPlan.upsert({
      where: { userId_weekStart: { userId: req.user!.id, weekStart: i.weekStart } },
      update: {},
      create: { userId: req.user!.id, weekStart: i.weekStart },
      include: planInclude,
    });
    return ok(req, planDto(p));
  }
  @Post('meal-plans/:id/entries') async add(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const i = parse(
      z
        .object({
          date: dateSchema,
          recipeId: uuid,
          servings: z.number().int().min(1).max(20),
          mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER']),
          version: z.number().int().positive(),
          clientKey: uuid,
        })
        .strict(),
      body,
    );
    const p = await this.plan(id, req.user!.id);
    parse(
      z.string().refine((d) => withinWeek(d, p.weekStart), 'Ngày nằm ngoài tuần này'),
      i.date,
    );
    await this.catalog.find(i.recipeId);
    const key = `${req.user!.id}:${i.clientKey}`;
    const prior = await this.db.mealEntry.findUnique({ where: { clientKey: key } });
    if (prior) {
      if (
        prior.planId !== id ||
        prior.recipeId !== i.recipeId ||
        prior.date !== i.date ||
        prior.mealType !== i.mealType ||
        prior.servings !== i.servings
      )
        throw new ConflictException('Khóa gửi lại không khớp nội dung.');
      return ok(req, planDto(await this.plan(id, req.user!.id)));
    }
    await this.db.$transaction(async (tx) => {
      const result = await tx.mealPlan.updateMany({
        where: { id, userId: req.user!.id, version: i.version },
        data: { version: { increment: 1 } },
      });
      if (!result.count) throw conflict();
      await tx.mealEntry.create({
        data: {
          planId: id,
          date: i.date,
          recipeId: i.recipeId,
          servings: i.servings,
          mealType: i.mealType,
          clientKey: key,
        },
      });
    });
    return ok(req, planDto(await this.plan(id, req.user!.id)));
  }
  @Delete('meal-plans/:id/entries/:entryId') async remove(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @Body() body: unknown,
  ) {
    const i = parse(z.object({ version: z.number().int().positive() }).strict(), body);
    parse(uuid, entryId);
    await this.plan(id, req.user!.id);
    await this.db.$transaction(async (tx) => {
      const r = await tx.mealPlan.updateMany({
        where: { id, userId: req.user!.id, version: i.version },
        data: { version: { increment: 1 } },
      });
      if (!r.count) throw conflict();
      const removed = await tx.mealEntry.deleteMany({ where: { id: entryId, planId: id } });
      if (!removed.count) throw new NotFoundException('Không tìm thấy món trong thực đơn.');
    });
    return ok(req, planDto(await this.plan(id, req.user!.id)));
  }
  @Get('meal-plans/:id/shopping') async shopping(@Req() req: AuthRequest, @Param('id') id: string) {
    const p = await this.plan(id, req.user!.id);
    const list = await this.db.shoppingList.findUnique({ where: { planId: id }, include: { items: true } });
    return ok(
      req,
      list
        ? {
            ...list,
            stale: list.planVersion !== p.version,
            items: list.items.map((x) => ({
              ...x,
              quantity: x.quantity?.toString() ?? null,
              sources: JSON.parse(x.sourcesText),
            })),
          }
        : null,
    );
  }
  @Post('meal-plans/:id/shopping') async generate(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const i = parse(z.object({ version: z.number().int().positive() }).strict(), body);
    await this.plan(id, req.user!.id);
    await this.db.$transaction(
      async (tx) => {
        const p = await tx.mealPlan.findFirst({ where: { id, userId: req.user!.id }, include: planInclude });
        if (!p) throw new NotFoundException();
        if (p.version !== i.version) throw conflict();
        const old = await tx.shoppingList.findUnique({ where: { planId: id }, include: { items: true } });
        if (old?.planVersion === p.version) return;
        if (old?.items.some((x) => x.purchased))
          throw new ConflictException({
            code: 'PURCHASE_REVIEW_REQUIRED',
            message:
              'Danh sách có món đã mua. Bỏ đánh dấu đã mua trước khi tạo lại để tránh mất dấu lượng đã mua.',
          });
        const merged = aggregate(
          p.entries.map((e) => ({ recipe: recipeDto(e.recipe), servings: e.servings })),
        );
        const ingredients = new Map((await tx.ingredient.findMany()).map((x) => [x.id, x]));
        if (old) await tx.shoppingItem.deleteMany({ where: { listId: old.id } });
        const list = old
          ? await tx.shoppingList.update({
              where: { id: old.id },
              data: { planVersion: p.version, version: { increment: 1 } },
            })
          : await tx.shoppingList.create({ data: { planId: id, planVersion: p.version } });
        for (const row of merged)
          await tx.shoppingItem.create({
            data: {
              listId: list.id,
              ingredientId: row.ingredientId,
              name: row.name,
              category: ingredients.get(row.ingredientId)?.category || 'Khác',
              unit: row.unit,
              quantity: row.quantity,
              sourcesText: JSON.stringify(row.sources),
            },
          });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return this.shopping(req, id);
  }
  @Patch('shopping-items/:id') async tick(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    parse(uuid, id);
    const i = parse(
      z.object({ purchased: z.boolean(), version: z.number().int().positive() }).strict(),
      body,
    );
    const item = await this.db.shoppingItem.findFirst({
      where: { id, list: { plan: { userId: req.user!.id } } },
      include: { list: true },
    });
    if (!item) throw new NotFoundException();
    await this.db.$transaction(async (tx) => {
      const updated = await tx.shoppingList.updateMany({
        where: { id: item.listId, version: i.version },
        data: { version: { increment: 1 } },
      });
      if (!updated.count) throw conflict();
      await tx.shoppingItem.update({ where: { id }, data: { purchased: i.purchased } });
    });
    return this.shopping(req, item.list.planId);
  }
}
