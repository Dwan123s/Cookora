const fs = require('fs');

const file = 'frontend/src/shared.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetFunction = `export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const c = cuisineFor(recipe.cuisine);
  const media = recipeMedia(recipe);
  return (
    <article className="recipe-card">
      <div className="recipe-image">
        <Link to={\`/cong-thuc/\${recipe.slug}\`} tabIndex={-1} viewTransition>
          <img
            src={media.src}
            alt={\`\${media.label}: \${recipe.title}\`}
            loading="lazy"
            width="900"
            height="900"
            style={{ viewTransitionName: \`recipe-\${recipe.id}\` }}
          />
        </Link>
        <span className="image-label">{media.label}</span>
        <FavoriteButton recipe={recipe} overlay />
      </div>
      <div className="recipe-card-body">
        <div className="card-kicker">
          <span>{c.name}</span>
          <span className="draft-dot">{recipe.contentStatus === 'DRAFT' ? 'Bản thảo' : 'Đã duyệt'}</span>
        </div>
        <h3>
          <Link to={\`/cong-thuc/\${recipe.slug}\`} viewTransition>
            {recipe.title}
          </Link>
        </h3>
        <p>{recipe.summary}</p>
        <div className="card-meta">
          <span>
            <Clock3 size={14} />
            {recipe.totalMinutes ? \`~\${recipe.totalMinutes} phút\` : 'Chưa rõ thời gian'}
          </span>
          <span>
            <Users size={14} />
            {recipe.baseServings} phần
          </span>
        </div>
      </div>
    </article>
  );
}`;

const newFunction = `export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const c = cuisineFor(recipe.cuisine);
  const media = recipeMedia(recipe);
  return (
    <article className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs hover:shadow-xs transition duration-200 flex flex-col group">
      <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
        <Link to={\`/cong-thuc/\${recipe.slug}\`} tabIndex={-1} viewTransition className="block w-full h-full">
          <img
            src={media.src}
            alt={\`\${media.label}: \${recipe.title}\`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            style={{ viewTransitionName: \`recipe-\${recipe.id}\` }}
          />
        </Link>
        <span className="absolute top-2.5 left-2.5 bg-black/50 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-full z-10 flex items-center gap-1">
          {c.flag} {c.name}
        </span>
        <div className="absolute top-2.5 right-2.5 z-10">
          <FavoriteButton recipe={recipe} overlay />
        </div>
      </div>
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-bold text-stone-900 text-sm leading-snug line-clamp-1 mb-1.5">
            <Link to={\`/cong-thuc/\${recipe.slug}\`} className="hover:text-[#EA580C] transition" viewTransition>
              {recipe.title}
            </Link>
          </h3>
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">
            {recipe.summary}
          </p>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock3 size={12} className="text-stone-400" />
              {recipe.totalMinutes ? \`\${recipe.totalMinutes} phút\` : '20 phút'}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} className="text-stone-400" />
              {recipe.baseServings} phần
            </span>
          </div>
          <span className="font-bold text-[#EA580C] bg-orange-50 px-2 py-0.5 rounded-full text-[10px]">
            ~25.000đ
          </span>
        </div>
      </div>
    </article>
  );
}`;

if (code.includes('export function RecipeCard')) {
  code = code.replace(targetFunction, newFunction);
  fs.writeFileSync(file, code, 'utf8');
  console.log('RecipeCard upgraded successfully');
} else {
  console.log('Target RecipeCard not matched');
}
