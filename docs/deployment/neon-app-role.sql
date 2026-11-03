-- Run AFTER Prisma migration in the Neon SQL Editor, connected to neondb as its owner.
-- Replace password in the editor only. Do not save filled secrets to Git.
DO $block$
DECLARE app_password text := 'REPLACE_WITH_RANDOM_PASSWORD_32_CHARS_OR_MORE';
BEGIN
  IF length(app_password) < 32 OR app_password LIKE 'REPLACE_%' THEN
    RAISE EXCEPTION 'Set a random app password of at least 32 characters';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cookora_app') THEN
    RAISE EXCEPTION 'cookora_app already exists; rotate/manage it explicitly';
  END IF;
  EXECUTE format('CREATE ROLE cookora_app LOGIN PASSWORD %L', app_password);
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO cookora_app', current_database());
END $block$;
GRANT USAGE ON SCHEMA public TO cookora_app;
-- Deny creation by unprivileged roles; application reads/writes only its existing tables.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public."User", public."GoogleIdentity", public."Session", public."Ingredient",
  public."Recipe", public."RecipeLine", public."RecipeStep", public."Favorite",
  public."MealPlan", public."MealEntry", public."ShoppingList", public."ShoppingItem"
TO cookora_app;
-- New tables in future migrations need explicit runtime grants. _prisma_migrations is not granted.
