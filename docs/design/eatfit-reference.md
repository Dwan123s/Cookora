# Eat Fit reference implementation

Implemented `/eat-fit` from the supplied screenshot: cream/emerald styling, balanced metrics/result cards, macro donut, six photo recipes, four meal budgets, tips, honest empty progress state, and responsive layouts.

The existing Mifflin–St Jeor calculation and ±400 kcal illustration are retained without the former unsupported safety guarantee. Inputs accept incomplete editing and validate adult measurement ranges before showing an estimate. Macro allocation is 30/40/30; meal budgets 25/40/25/10 sum exactly to the daily target after rounding. These are illustrative allocations, not validated individual nutrition prescriptions. Adult scope reference: [NIDDK Body Weight Planner](https://www.niddk.nih.gov/health-information/weight-management/body-weight-planner).

Six recipes and instructions come from the user's menu documents via `docs/recipe-images/manifest.json`; generated photos reuse the previously recorded prompts there. Individual recipe calorie/protein values are omitted because the catalog does not contain verified nutrition. Recipe saves are local to this device and labeled accordingly. Progress starts empty; no invented user history is displayed.

Verification: frontend production build, three calculator tests (default/goal updates, invalid measurements, exact meal totals); desktop 1536×1024 and mobile 390×844 browser checks; changing goal, clearing/restoring age, recipe dialog, saving/unsaving, images, and horizontal overflow. Proof images: `eatfit-desktop.jpg`, `eatfit-mobile.jpg`.
