-- Connect directly to the new Cookora database as its Azure SQL admin.
-- Replace both password placeholders before execution; do not commit the filled file.
-- Generate different random >=32-character passwords in a password manager.
SET NOCOUNT ON;
SET XACT_ABORT ON;
IF DB_NAME() <> N'Cookora'
    THROW 50001, 'Connect to Cookora, not master.', 1;

DECLARE @appPassword nvarchar(128) = N'REPLACE_APP_PASSWORD';
DECLARE @migrationPassword nvarchar(128) = N'REPLACE_MIGRATION_PASSWORD';
IF LEN(@appPassword) < 32 OR LEN(@migrationPassword) < 32
    OR @appPassword LIKE N'%REPLACE_%' OR @migrationPassword LIKE N'%REPLACE_%'
    OR @appPassword = @migrationPassword
    THROW 50002, 'Set distinct strong passwords first.', 1;
IF USER_ID(N'cookora_app') IS NOT NULL OR USER_ID(N'cookora_migrator') IS NOT NULL
    THROW 50003, 'Users already exist; manage or rotate them explicitly.', 1;

BEGIN TRANSACTION;
DECLARE @query nvarchar(max);
SET @query = N'CREATE USER [cookora_app] WITH PASSWORD = N'''
    + REPLACE(@appPassword, N'''', N'''''') + N''', DEFAULT_SCHEMA = [dbo];';
EXEC sys.sp_executesql @query;
SET @query = N'CREATE USER [cookora_migrator] WITH PASSWORD = N'''
    + REPLACE(@migrationPassword, N'''', N'''''') + N''', DEFAULT_SCHEMA = [dbo];';
EXEC sys.sp_executesql @query;
ALTER ROLE [db_datareader] ADD MEMBER [cookora_app];
ALTER ROLE [db_datawriter] ADD MEMBER [cookora_app];
ALTER ROLE [db_ddladmin] ADD MEMBER [cookora_migrator];
ALTER ROLE [db_datareader] ADD MEMBER [cookora_migrator];
ALTER ROLE [db_datawriter] ADD MEMBER [cookora_migrator];
COMMIT;
-- Keep admin/migrator credentials off Render. Runtime app has no DDL role.
