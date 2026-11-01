BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [email] NVARCHAR(254) NOT NULL,
    [displayName] NVARCHAR(100) NOT NULL,
    [passwordHash] VARCHAR(255) NOT NULL,
    [role] VARCHAR(12) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'USER',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Session] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [tokenHash] VARCHAR(64) NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Session_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Session_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Session_tokenHash_key] UNIQUE NONCLUSTERED ([tokenHash])
);

-- CreateTable
CREATE TABLE [dbo].[Ingredient] (
    [id] VARCHAR(80) NOT NULL,
    [name] NVARCHAR(160) NOT NULL,
    [aliasesText] NVARCHAR(1000) NOT NULL,
    [unit] VARCHAR(16) NOT NULL,
    [category] NVARCHAR(60) NOT NULL,
    CONSTRAINT [Ingredient_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Recipe] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [slug] VARCHAR(180) NOT NULL,
    [revision] INT NOT NULL CONSTRAINT [Recipe_revision_df] DEFAULT 1,
    [title] NVARCHAR(180) NOT NULL,
    [summary] NVARCHAR(1000) NOT NULL,
    [cuisine] VARCHAR(12) NOT NULL,
    [category] NVARCHAR(60) NOT NULL,
    [image] NVARCHAR(1000) NOT NULL,
    [imageCredit] NVARCHAR(200) NOT NULL,
    [baseServings] INT NOT NULL,
    [prepMinutes] INT,
    [cookMinutes] INT,
    [waitMinutes] INT,
    [totalMinutes] INT,
    [timingStatus] VARCHAR(16) NOT NULL CONSTRAINT [Recipe_timingStatus_df] DEFAULT 'ESTIMATED',
    [preconditions] NVARCHAR(500) NOT NULL,
    [difficulty] NVARCHAR(60) NOT NULL,
    [contentStatus] VARCHAR(16) NOT NULL CONSTRAINT [Recipe_contentStatus_df] DEFAULT 'DRAFT',
    [sourceUrl] NVARCHAR(2048) NOT NULL,
    [sourceName] NVARCHAR(200) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Recipe_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Recipe_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Recipe_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[RecipeLine] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [recipeId] UNIQUEIDENTIFIER NOT NULL,
    [ingredientId] VARCHAR(80) NOT NULL,
    [quantity] DECIMAL(18,6),
    [unit] VARCHAR(16) NOT NULL,
    [optional] BIT NOT NULL CONSTRAINT [RecipeLine_optional_df] DEFAULT 0,
    [role] VARCHAR(16) NOT NULL,
    [note] NVARCHAR(300),
    [sortOrder] INT NOT NULL,
    CONSTRAINT [RecipeLine_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RecipeLine_recipeId_sortOrder_key] UNIQUE NONCLUSTERED ([recipeId],[sortOrder])
);

-- CreateTable
CREATE TABLE [dbo].[RecipeStep] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [recipeId] UNIQUEIDENTIFIER NOT NULL,
    [order] INT NOT NULL,
    [title] NVARCHAR(120) NOT NULL,
    [instruction] NVARCHAR(max) NOT NULL,
    CONSTRAINT [RecipeStep_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RecipeStep_recipeId_order_key] UNIQUE NONCLUSTERED ([recipeId],[order])
);

-- CreateTable
CREATE TABLE [dbo].[Favorite] (
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [recipeId] UNIQUEIDENTIFIER NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Favorite_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Favorite_pkey] PRIMARY KEY CLUSTERED ([userId],[recipeId])
);

-- CreateTable
CREATE TABLE [dbo].[MealPlan] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [weekStart] CHAR(10) NOT NULL,
    [version] INT NOT NULL CONSTRAINT [MealPlan_version_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [MealPlan_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [MealPlan_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [MealPlan_userId_weekStart_key] UNIQUE NONCLUSTERED ([userId],[weekStart])
);

-- CreateTable
CREATE TABLE [dbo].[MealEntry] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [planId] UNIQUEIDENTIFIER NOT NULL,
    [recipeId] UNIQUEIDENTIFIER NOT NULL,
    [date] CHAR(10) NOT NULL,
    [mealType] VARCHAR(16) NOT NULL,
    [servings] INT NOT NULL,
    [clientKey] VARCHAR(100) NOT NULL,
    CONSTRAINT [MealEntry_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [MealEntry_clientKey_key] UNIQUE NONCLUSTERED ([clientKey])
);

-- CreateTable
CREATE TABLE [dbo].[ShoppingList] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [planId] UNIQUEIDENTIFIER NOT NULL,
    [planVersion] INT NOT NULL,
    [version] INT NOT NULL CONSTRAINT [ShoppingList_version_df] DEFAULT 1,
    CONSTRAINT [ShoppingList_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ShoppingList_planId_key] UNIQUE NONCLUSTERED ([planId])
);

-- CreateTable
CREATE TABLE [dbo].[ShoppingItem] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [listId] UNIQUEIDENTIFIER NOT NULL,
    [ingredientId] VARCHAR(80) NOT NULL,
    [name] NVARCHAR(160) NOT NULL,
    [category] NVARCHAR(60) NOT NULL,
    [unit] VARCHAR(16) NOT NULL,
    [quantity] DECIMAL(18,6),
    [purchased] BIT NOT NULL CONSTRAINT [ShoppingItem_purchased_df] DEFAULT 0,
    [sourcesText] NVARCHAR(max) NOT NULL,
    CONSTRAINT [ShoppingItem_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ShoppingItem_listId_ingredientId_unit_key] UNIQUE NONCLUSTERED ([listId],[ingredientId],[unit])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Session_userId_idx] ON [dbo].[Session]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Session_expiresAt_idx] ON [dbo].[Session]([expiresAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Recipe_cuisine_contentStatus_idx] ON [dbo].[Recipe]([cuisine], [contentStatus]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [RecipeLine_ingredientId_recipeId_idx] ON [dbo].[RecipeLine]([ingredientId], [recipeId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [MealEntry_planId_date_idx] ON [dbo].[MealEntry]([planId], [date]);

-- AddForeignKey
ALTER TABLE [dbo].[Session] ADD CONSTRAINT [Session_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RecipeLine] ADD CONSTRAINT [RecipeLine_recipeId_fkey] FOREIGN KEY ([recipeId]) REFERENCES [dbo].[Recipe]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RecipeLine] ADD CONSTRAINT [RecipeLine_ingredientId_fkey] FOREIGN KEY ([ingredientId]) REFERENCES [dbo].[Ingredient]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RecipeStep] ADD CONSTRAINT [RecipeStep_recipeId_fkey] FOREIGN KEY ([recipeId]) REFERENCES [dbo].[Recipe]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Favorite] ADD CONSTRAINT [Favorite_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Favorite] ADD CONSTRAINT [Favorite_recipeId_fkey] FOREIGN KEY ([recipeId]) REFERENCES [dbo].[Recipe]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MealPlan] ADD CONSTRAINT [MealPlan_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MealEntry] ADD CONSTRAINT [MealEntry_planId_fkey] FOREIGN KEY ([planId]) REFERENCES [dbo].[MealPlan]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MealEntry] ADD CONSTRAINT [MealEntry_recipeId_fkey] FOREIGN KEY ([recipeId]) REFERENCES [dbo].[Recipe]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ShoppingList] ADD CONSTRAINT [ShoppingList_planId_fkey] FOREIGN KEY ([planId]) REFERENCES [dbo].[MealPlan]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ShoppingItem] ADD CONSTRAINT [ShoppingItem_listId_fkey] FOREIGN KEY ([listId]) REFERENCES [dbo].[ShoppingList]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
