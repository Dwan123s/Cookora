const fs = require('fs');

// 1. Update frontend/src/styles.css
let css = fs.readFileSync('frontend/src/styles.css', 'utf8');

const target = `button {
  border: 0;
  background: transparent;
}`;

const replacement = `/* High-contrast Filter Pills */
.filter-pill-active {
  background-color: #47735B !important;
  color: #FFFFFF !important;
  border: 1px solid #47735B !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 12px -2px rgba(71, 115, 91, 0.35) !important;
}

.filter-pill-active,
.filter-pill-active * {
  color: #FFFFFF !important;
}

.filter-pill-inactive {
  background-color: #FFFFFF !important;
  color: #273D32 !important;
  border: 1px solid #DFE5DD !important;
  font-weight: 500 !important;
}

.filter-pill-inactive:hover {
  background-color: #E8F1E9 !important;
  color: #273D32 !important;
  border-color: #47735B !important;
}`;

if (css.includes('background: transparent;')) {
  css = css.replace(/button\s*\{\s*border:\s*0;\s*background:\s*transparent;\s*\}/, replacement);
  fs.writeFileSync('frontend/src/styles.css', css, 'utf8');
  console.log('styles.css updated with filter pill classes!');
} else {
  console.log('button rule not found in styles.css');
}

// 2. Update frontend/src/pages/Discover.tsx
let disc = fs.readFileSync('frontend/src/pages/Discover.tsx', 'utf8');

// Update Cuisine tabs
disc = disc.replace(
  'className={`px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer ${\n                      isActive\n                        ? \'bg-[#47735B] text-white shadow-2xs\'\n                        : \'bg-white border border-[#DFE5DD] text-[#273D32] hover:bg-[#FAF9F6]\'\n                    }`}',
  `className={\`px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer \${
                      isActive ? 'filter-pill-active' : 'filter-pill-inactive'
                    }\`}`
);

// Update Category tabs
disc = disc.replace(
  'className={`px-3.5 py-1.5 rounded-full text-xs sm:text-[12.5px] font-medium transition flex items-center gap-1.5 cursor-pointer ${\n                    isSelected\n                      ? \'bg-[#47735B] text-white shadow-2xs\'\n                      : \'bg-white border border-[#DFE5DD] text-[#273D32] hover:bg-[#E8F1E9]\'\n                  }`}',
  `className={\`px-3.5 py-1.5 rounded-full text-xs sm:text-[12.5px] font-medium transition flex items-center gap-1.5 cursor-pointer \${
                    isSelected ? 'filter-pill-active' : 'filter-pill-inactive'
                  }\`}`
);

fs.writeFileSync('frontend/src/pages/Discover.tsx', disc, 'utf8');
console.log('Discover.tsx updated with filter-pill classes!');
