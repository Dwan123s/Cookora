const fs = require('fs');
let code = fs.readFileSync('backend/src/catalog.ts', 'utf8');

const target = `@Injectable()
export class Catalog {
  constructor(@Inject(Database) private readonly db: Database) {}`;

const replacement = `@Injectable()
export class Catalog {
  private cacheAll: { time: number; data: Recipe[] } | null = null;
  private cacheIngredients: { time: number; data: Ingredient[] } | null = null;

  constructor(@Inject(Database) private readonly db: Database) {}

  clearCache() {
    this.cacheAll = null;
    this.cacheIngredients = null;
  }`;

const targetAll = `  async all() {
    return (
      await this.db.recipe.findMany({
        where: visibleWhere(),
        include: recipeInclude,
        orderBy: { createdAt: 'asc' },
      })
    ).map(recipeDto);
  }`;

const repAll = `  async all(): Promise<Recipe[]> {
    const now = Date.now();
    if (this.cacheAll && now - this.cacheAll.time < 30000) {
      return this.cacheAll.data;
    }
    const recipes = (
      await this.db.recipe.findMany({
        where: visibleWhere(),
        include: recipeInclude,
        orderBy: { createdAt: 'asc' },
      })
    ).map(recipeDto);
    this.cacheAll = { time: now, data: recipes };
    return recipes;
  }`;

// normalize line endings for replace
code = code.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');
const normTargetAll = targetAll.replace(/\r\n/g, '\n');

if (code.includes(normTarget)) {
  code = code.replace(normTarget, replacement);
  code = code.replace(normTargetAll, repAll);
  fs.writeFileSync('backend/src/catalog.ts', code, 'utf8');
  console.log('Successfully optimized backend catalog cache!');
} else {
  console.log('Could not find target block in backend/src/catalog.ts');
}
