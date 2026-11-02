const fs = require('fs');

// 1. Update layout.tsx
let layout = fs.readFileSync('frontend/src/layout.tsx', 'utf8');
const navTarget = '<NavLink to="/thuc-don">Thực đơn tuần</NavLink>';
const navReplacement = `<NavLink to="/thuc-don">Thực đơn tuần</NavLink>
            <NavLink to="/eat-fit">Eat Fit</NavLink>
            <NavLink to="/ngan-sach">Ví ăn uống</NavLink>
            <NavLink to="/bao-quan">Bảo quản</NavLink>
            <NavLink to="/dinh-duong">Dinh dưỡng</NavLink>`;

if (layout.includes(navTarget) && !layout.includes('/eat-fit')) {
  layout = layout.replace(navTarget, navReplacement);
  fs.writeFileSync('frontend/src/layout.tsx', layout, 'utf8');
  console.log('Updated layout.tsx navigation');
}

// 2. Update App.tsx
let app = fs.readFileSync('frontend/src/App.tsx', 'utf8');
const importTarget = "import { Roadmap } from './pages/Roadmap';";
const importReplacement = `import { Roadmap } from './pages/Roadmap';
import { EatFit } from './pages/EatFit';
import { MealCost } from './pages/MealCost';
import { FoodStorage } from './pages/FoodStorage';
import { Nutrition } from './pages/Nutrition';`;

const routeTarget = '<Route path="/thuc-don" element={auth.isPending ? <Loading /> : <Planner />} />';
const routeReplacement = `<Route path="/thuc-don" element={auth.isPending ? <Loading /> : <Planner />} />
            <Route path="/eat-fit" element={<EatFit />} />
            <Route path="/ngan-sach" element={<MealCost />} />
            <Route path="/bao-quan" element={<FoodStorage />} />
            <Route path="/dinh-duong" element={<Nutrition />} />`;

if (app.includes(importTarget) && !app.includes('EatFit')) {
  app = app.replace(importTarget, importReplacement);
  app = app.replace(routeTarget, routeReplacement);
  fs.writeFileSync('frontend/src/App.tsx', app, 'utf8');
  console.log('Updated App.tsx routes');
}

// 3. Update RecipeCard in shared.tsx
let shared = fs.readFileSync('frontend/src/shared.tsx', 'utf8');
const cardTarget = `<div className="card-kicker">
          <span>{c.name}</span>
          <span className="draft-dot">{recipe.contentStatus === 'DRAFT' ? 'Bản thảo' : 'Đã duyệt'}</span>
        </div>`;

const cardReplacement = `<div className="card-kicker">
          <span className="flex items-center gap-1 font-bold">{c.flag} {c.name}</span>
          <span className="draft-dot text-xs px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-900 font-bold">~25.000đ</span>
        </div>`;

if (shared.includes(cardTarget)) {
  shared = shared.replace(cardTarget, cardReplacement);
  fs.writeFileSync('frontend/src/shared.tsx', shared, 'utf8');
  console.log('Updated shared.tsx RecipeCard');
}
