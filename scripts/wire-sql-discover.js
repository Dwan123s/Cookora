const fs = require('fs');

let disc = fs.readFileSync('frontend/src/pages/Discover.tsx', 'utf8');

// 1. Add useQuery and request imports
disc = disc.replace(
  "import { useState, useMemo } from 'react';",
  "import { useState, useMemo } from 'react';\nimport { useQuery } from '@tanstack/react-query';\nimport { request } from '../api';\nimport type { Recipe } from '@cookora/contracts';"
);

// 2. Add live query from SQL Server
const queryHook = `  // Query live from SQL Server database via backend API with optimal 5-min caching
  const recipesQuery = useQuery({
    queryKey: ['recipes', 'all'],
    queryFn: () => request<Recipe[]>('/recipes?pageSize=100'),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Convert SQL Server recipes dynamically
  const allRecipes: RecipeItem[] = useMemo(() => {
    if (recipesQuery.data?.data && recipesQuery.data.data.length > 0) {
      return recipesQuery.data.data.map((r: any) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        category: r.category || 'Món ngon',
        cuisine: r.cuisine,
        cuisineName:
          r.cuisine === 'VN' ? 'Món Việt' :
          r.cuisine === 'KR' ? 'Hàn Quốc' :
          r.cuisine === 'JP' ? 'Nhật Bản' :
          r.cuisine === 'CN' ? 'Trung Quốc' :
          r.cuisine === 'TH' ? 'Thái Lan' :
          r.cuisine === 'IT' ? 'Ý' :
          r.cuisine === 'WE' ? 'Âu & Mỹ' :
          r.cuisine === 'FR' ? 'Pháp' : (r.cuisine || 'Món ngon'),
        image: r.image || r.imageUrl || '/images/hero/hero.jpg',
        time: r.totalMinutes || 25,
        servings: r.baseServings || 2,
        difficulty: r.difficulty || 'Dễ',
        summary: r.summary || '',
      }));
    }
    return ALL_RECIPES_57;
  }, [recipesQuery.data]);`;

disc = disc.replace(
  '  const currentCuisine = params.get(\'cuisine\') || \'\';',
  queryHook + '\n\n  const currentCuisine = params.get(\'cuisine\') || \'\';'
);

// 3. Replace ALL_RECIPES_57.filter with allRecipes.filter
disc = disc.replace(
  'return ALL_RECIPES_57.filter((recipe) => {',
  'return allRecipes.filter((recipe) => {'
);

fs.writeFileSync('frontend/src/pages/Discover.tsx', disc, 'utf8');
console.log('Discover.tsx now queries live SQL Server with optimal caching!');
