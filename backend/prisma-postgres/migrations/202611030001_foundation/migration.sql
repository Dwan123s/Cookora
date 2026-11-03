-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "displayName" VARCHAR(100) NOT NULL,
    "passwordHash" VARCHAR(255),
    "role" VARCHAR(12) NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleIdentity" (
    "subject" VARCHAR(255) NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleIdentity_pkey" PRIMARY KEY ("subject")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" VARCHAR(80) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "aliasesText" VARCHAR(1000) NOT NULL,
    "unit" VARCHAR(16) NOT NULL,
    "category" VARCHAR(60) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "title" VARCHAR(180) NOT NULL,
    "summary" VARCHAR(1000) NOT NULL,
    "cuisine" VARCHAR(12) NOT NULL,
    "category" VARCHAR(60) NOT NULL,
    "image" VARCHAR(1000) NOT NULL,
    "imageCredit" VARCHAR(200) NOT NULL,
    "baseServings" INTEGER NOT NULL,
    "prepMinutes" INTEGER,
    "cookMinutes" INTEGER,
    "waitMinutes" INTEGER,
    "totalMinutes" INTEGER,
    "timingStatus" VARCHAR(16) NOT NULL DEFAULT 'ESTIMATED',
    "preconditions" VARCHAR(500) NOT NULL,
    "difficulty" VARCHAR(60) NOT NULL,
    "contentStatus" VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
    "sourceUrl" VARCHAR(2048) NOT NULL,
    "sourceName" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeLine" (
    "id" UUID NOT NULL,
    "recipeId" UUID NOT NULL,
    "ingredientId" VARCHAR(80) NOT NULL,
    "quantity" DECIMAL(18,6),
    "unit" VARCHAR(16) NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "role" VARCHAR(16) NOT NULL,
    "note" VARCHAR(300),
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "RecipeLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeStep" (
    "id" UUID NOT NULL,
    "recipeId" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "instruction" TEXT NOT NULL,

    CONSTRAINT "RecipeStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "userId" UUID NOT NULL,
    "recipeId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("userId","recipeId")
);

-- CreateTable
CREATE TABLE "MealPlan" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "weekStart" CHAR(10) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealEntry" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "recipeId" UUID NOT NULL,
    "date" CHAR(10) NOT NULL,
    "mealType" VARCHAR(16) NOT NULL,
    "servings" INTEGER NOT NULL,
    "clientKey" VARCHAR(100) NOT NULL,

    CONSTRAINT "MealEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingList" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "planVersion" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingItem" (
    "id" UUID NOT NULL,
    "listId" UUID NOT NULL,
    "ingredientId" VARCHAR(80) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "category" VARCHAR(60) NOT NULL,
    "unit" VARCHAR(16) NOT NULL,
    "quantity" DECIMAL(18,6),
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "sourcesText" TEXT NOT NULL,

    CONSTRAINT "ShoppingItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleIdentity_userId_key" ON "GoogleIdentity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_slug_key" ON "Recipe"("slug");

-- CreateIndex
CREATE INDEX "Recipe_cuisine_contentStatus_idx" ON "Recipe"("cuisine", "contentStatus");

-- CreateIndex
CREATE INDEX "RecipeLine_ingredientId_recipeId_idx" ON "RecipeLine"("ingredientId", "recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeLine_recipeId_sortOrder_key" ON "RecipeLine"("recipeId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeStep_recipeId_order_key" ON "RecipeStep"("recipeId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlan_userId_weekStart_key" ON "MealPlan"("userId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "MealEntry_clientKey_key" ON "MealEntry"("clientKey");

-- CreateIndex
CREATE INDEX "MealEntry_planId_date_idx" ON "MealEntry"("planId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingList_planId_key" ON "ShoppingList"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingItem_listId_ingredientId_unit_key" ON "ShoppingItem"("listId", "ingredientId", "unit");

-- AddForeignKey
ALTER TABLE "GoogleIdentity" ADD CONSTRAINT "GoogleIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RecipeLine" ADD CONSTRAINT "RecipeLine_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RecipeLine" ADD CONSTRAINT "RecipeLine_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RecipeStep" ADD CONSTRAINT "RecipeStep_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MealEntry" ADD CONSTRAINT "MealEntry_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MealPlan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MealEntry" ADD CONSTRAINT "MealEntry_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MealPlan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ShoppingItem" ADD CONSTRAINT "ShoppingItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "ShoppingList"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
