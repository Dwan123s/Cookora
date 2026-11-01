import { Controller, Get, Query, Req, UseGuards, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { EditorGuard, type AuthRequest } from './security';
import { ok, parse } from './http';
import { normalize } from './domain';
@ApiTags('Editorial backlog')
@Controller('editor')
@UseGuards(EditorGuard)
export class EditorController {
  private readonly backlog = JSON.parse(
    readFileSync(resolve(__dirname, '../../docs/Cookora-Recipe-Backlog-300.json'), 'utf8'),
  );
  @Get('backlog') list(@Req() req: AuthRequest, @Query() query: unknown) {
    const q = parse(
      z
        .object({
          q: z.string().max(100).default(''),
          cuisine: z.string().max(12).default(''),
          status: z.enum(['', 'IDEA', 'DRAFT']).default(''),
          page: z.coerce.number().int().positive().default(1),
        })
        .strict(),
      query,
    );
    const rows = this.backlog.items.filter(
      (r: any) =>
        (!q.q ||
          normalize(`${r.id} ${r.title_proposed} ${r.core_ingredients_proposed.join(' ')}`).includes(
            normalize(q.q),
          )) &&
        (!q.cuisine || r.cuisine_group === q.cuisine) &&
        (!q.status || r.status === q.status),
    );
    return ok(req, rows.slice((q.page - 1) * 20, q.page * 20), {
      pagination: { page: q.page, pageSize: 20, total: rows.length, totalPages: Math.ceil(rows.length / 20) },
      counts: this.backlog.counts,
    });
  }
}
