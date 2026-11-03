# Đưa Cookora lên mạng miễn phí: Vercel + Render + Azure SQL

> Cập nhật lựa chọn: người dùng chuyển sang phương án không cần thẻ Azure. Dùng [Neon Free](Deploy-Free-Neon.md) cho triển khai mới. `render.yaml` hiện cấu hình PostgreSQL/Neon, không dùng trực tiếp với hướng dẫn Azure bên dưới; nếu quay lại Azure phải đặt DATABASE_PROVIDER=sqlserver và cấu hình lại các biến SQL Server.

Cập nhật 03/11/2026. Theo lựa chọn của người dùng: dự án cá nhân, chưa kinh doanh, ưu tiên chi phí $0. Các gói được đối chiếu với tài liệu chính thức trong ngày; hạn mức và điều kiện có thể thay đổi. Đây là hướng dẫn và cấu hình đã chuẩn bị trong repository, chưa phải xác nhận đã deploy lên tài khoản cloud.

## 1. Chọn kiến trúc nào?

| Thành phần | Đặt ở đâu | Vai trò |
| --- | --- | --- |
| React/Vite và ảnh trong repository | Vercel Hobby | Trang web và địa chỉ HTTPS miễn phí `ten-du-an.vercel.app` |
| NestJS API | Render Free, Docker | Tài khoản, session, công thức, thực đơn, đi chợ |
| SQL Server | Azure SQL Database Free | Lưu dữ liệu bền vững ngoài container |
| Đăng nhập mới | Google OAuth | Tạo tài khoản bằng email Google đã xác minh |
| Vertex AI | Chưa cấu hình trên cloud | Không phát sinh chi phí AI trong phương án ban đầu |

Luồng yêu cầu:

```text
Trình duyệt → https://TEN-WEB.vercel.app
  ├─ trang, JS, CSS, ảnh → Vercel
  └─ /api/v1/... → Vercel rewrite → https://TEN-API.onrender.com/api/v1/...
                                              └─ TLS → Azure SQL / Cookora
```

Frontend hiện gọi đường dẫn tương đối `/api/v1`, cookie dùng cùng origin và CSRF kiểm tra APP_ORIGIN. Vì vậy cần rewrite API qua Vercel; chỉ deploy giao diện và để API localhost sẽ không hoạt động với khách truy cập. Không cần đổi sang Next.js hoặc PostgreSQL.

Vercel Hobby dành cho cá nhân, phi thương mại. Vercel hiện hỗ trợ cả NestJS dưới dạng Function; hướng dẫn này chọn Render cho backend vì giữ được mô hình Node container và firewall Azure theo dải IP Render. Static outbound IP của Vercel thuộc Pro/Enterprise, nên phương án NestJS trên Vercel + Azure SQL cần thiết kế kết nối riêng, chưa được chuẩn bị/kiểm chứng trong repo. [Vercel Hobby](https://vercel.com/docs/plans/hobby), [NestJS](https://vercel.com/docs/frameworks/backend/nestjs), [Static IPs](https://vercel.com/docs/networking/static-ips).

## 2. “Free” có những giới hạn gì?

- Render Free ngủ sau 15 phút không có truy cập; lần đánh thức có thể mất khoảng một phút. Workspace có 750 giờ instance miễn phí/tháng; băng thông và thời gian build cũng có hạn mức. Không có shell, one-off job hay ổ đĩa bền vững miễn phí. Đây là cấu hình thử nghiệm, không cam kết dịch vụ liên tục cho kinh doanh. [Render Free](https://render.com/docs/free).
- Azure SQL Free cấp mỗi database 100.000 vCore-giây, 32 GB dữ liệu và 32 GB backup mỗi tháng. Chọn **Auto-pause the database until next month** khi hết hạn mức. Database sẽ ngừng phục vụ đến kỳ tiếp theo thay vì tính phí vượt mức. [Azure SQL Free](https://learn.microsoft.com/en-us/azure/azure-sql/database/free-tier).
- Tài khoản Azure thường cần thẻ để xác minh. Free account 30 ngày và ưu đãi SQL Free là hai việc khác nhau; hết thời gian tài khoản thử có thể phải chuyển subscription sang Pay-as-you-go để tiếp tục dùng các hạn mức miễn phí. Chỉ giữ đúng tài nguyên free; không hiểu Pay-as-you-go là mọi tài nguyên đều miễn phí. [Tài khoản Azure](https://azure.microsoft.com/en-us/pricing/purchase-options/azure-account).
- Render có thể tính phí vượt hạn mức nếu đã thêm phương thức thanh toán. Nếu muốn giữ $0, chọn Free, không thêm thẻ nếu không cần và chấp nhận dịch vụ bị đình chỉ khi hết hạn mức; theo dõi Billing. Spending limit cho build không phải trần toàn bộ băng thông. [Render FAQ về billing](https://render.com/docs/faq).
- Không bật Vertex AI trong bản $0. API key đang dùng local không đi theo code lên cloud. Hosting free không làm dịch vụ AI thành miễn phí. Nhập nguyên liệu theo danh sách và các luồng công thức/thực đơn thông thường vẫn dùng được; các nút gọi trợ lý AI sẽ báo chưa cấu hình.

Không cần mua tên miền lúc đầu. Dùng địa chỉ HTTPS do Vercel cấp. Nếu yêu cầu không khai báo thẻ ở bất kỳ đâu, phương án Azure này có thể không đáp ứng; cần chọn database khác và đánh giá việc chuyển schema/migration, không thay SQL Server bằng một URL PostgreSQL.

## 3. Những việc phải biết trước khi phát hành

Code hiện tại có các quy tắc sau, cần xử lý đúng để tránh “deploy thành công nhưng web trống”:

1. `NODE_ENV=production` chỉ hiển thị Recipe có `contentStatus=APPROVED`. Bộ nguồn hiện có 419 công thức DRAFT; chưa tự chuyển thành bài đã duyệt. Cần chọn và duyệt các bài đủ chất lượng để phát hành.
2. Đăng ký email/mật khẩu đang bị chặn ở production vì chưa có xác minh/reset email. Google OAuth đã có luồng tạo USER; cần cấu hình client thật và kiểm tra end-to-end.
3. EDITOR/ADMIN bị chặn đăng nhập production khi chưa có MFA. Không phát hành khu biên tập như một chức năng đã hoàn thiện.
4. SQL production bắt buộc mã hóa và xác thực certificate. Đặt `DB_ENCRYPT=true`, `DB_TRUST_CERT=false`; không mang cấu hình certificate local lên cloud.
5. Session nằm trong SQL, không trong RAM hoặc filesystem Render. Ảnh hiện tại được build từ `frontend/public`, không cần upload ổ đĩa runtime.

Giai đoạn đầu nên mời một nhóm test, dùng Test users của Google. Trước khi mở rộng ra ngoài nhóm này, hoàn thiện nội dung công khai, thông tin liên hệ/chính sách riêng tư, yêu cầu Google OAuth và kiểm tra dữ liệu riêng giữa hai tài khoản. Không bật development trên web public để né các gate.

## 4. Chuẩn bị code và tài khoản

Cần GitHub, Vercel, Render và một Azure subscription đủ điều kiện SQL Free. Không cần gửi password, OAuth secret hoặc API key vào chat.

Trên Windows, mở PowerShell tại `C:\Cookara`:

```powershell
Set-Location C:\Cookara
npm ci
npm run db:generate
npm run check
```

Nếu `node_modules` đã đúng lockfile và check đã chạy thành công trên cùng mã nguồn, có thể bỏ bước cài lại. Dùng Node.js 24. Các test SQL end-to-end hiện có dành cho localhost, không đổi URL của test để chạy lên database người dùng thật.

Đưa mã nguồn lên một GitHub repository riêng tư, qua GitHub Desktop hoặc Git CLI. Trước khi commit, xem `git status` và kiểm tra danh sách file. Repository đang có nhiều thay đổi của dự án; commit đầy đủ mã cần dùng và ảnh `frontend/public/recipes/documents`, không bỏ các file source còn untracked. Không commit `.env`, `.env.azure-*`, `.review`, `node_modules` hoặc credentials. Các thư mục này đã có quy tắc ignore phù hợp; vẫn kiểm tra file từng được track từ trước.

Những file triển khai mới:

| File | Dùng để làm gì |
| --- | --- |
| `docker/Dockerfile.render` | Build React/Nest; runtime Node không chạy migration hoặc seed |
| `render.yaml` | Mẫu Render Free, không tạo database/job/disk trả phí |
| `docs/deployment/vercel.frontend.example.json` | Mẫu cấu hình Vercel và rewrite API |
| `docs/deployment/azure-users.sql` | Tạo app user và migration user riêng trong Azure database |
| `scripts/migrate-cloud.mjs` | Chỉ áp dụng migration đã commit vào Azure database đã tạo |
| `docs/deployment/azure-*.env.example` | Mẫu file biến local cho migration/import |

## 5. Tạo Azure SQL Database Free

Mở [Azure SQL hub](https://aka.ms/azuresqlhub), dùng **Start free**. Tạo resource group riêng, ví dụ `cookora-free`, một logical SQL server có tên duy nhất và database tên **Cookora**. Nếu UI thay đổi, đi theo [hướng dẫn tạo free tier chính thức](https://learn.microsoft.com/en-us/azure/azure-sql/database/free-tier).

Trước khi chọn Create, xác nhận phần free tier và estimated cost của database là $0; hành vi khi hết hạn mức là **Auto-pause the database until next month**. Không chọn gói SQL trả phí chỉ vì không tìm thấy ưu đãi. Nếu tài khoản/region không có free tier, dừng bước tạo để kiểm tra eligibility.

Với hướng dẫn SQL authentication này, logical server cần cho phép SQL authentication; không chọn Entra-only rồi điền SQL user/password. Tạo admin mạnh và lưu trong password manager. Admin chỉ dùng quản trị/provision, không đưa lên Render.

Ghi lại:

```text
Server: TEN-SERVER.database.windows.net
Database: Cookora
Port: 1433
```

Không tạo VM SQL Server, không chạy container SQL Developer trên Render, không chọn Managed Instance theo nhầm hướng dẫn. Database mới là cloud độc lập; database Docker trên máy vẫn được giữ.

### Mở kết nối quản trị tạm thời

Vào logical SQL server → Networking. Để dùng gói free với Render, bật public endpoint nhưng chỉ cho phép những IP cần thiết. Thêm **IP hiện tại của máy bạn** để chạy migration/import. Không đặt firewall `0.0.0.0–255.255.255.255`. Không dùng tùy chọn “Allow Azure services” như cách thay cho firewall Render; Render là nhà cung cấp khác. [Firewall Azure SQL](https://learn.microsoft.com/en-us/azure/azure-sql/database/firewall-configure).

Mở Query editor trong Azure Portal, hoặc MSSQL extension của VS Code/SSMS, kết nối **trực tiếp Cookora**, không phải master. Dùng admin Azure tạo hai contained users bằng file `docs/deployment/azure-users.sql`: sao chép nội dung vào query editor, thay hai placeholder bằng hai mật khẩu ngẫu nhiên khác nhau, tối thiểu 32 ký tự. Mật khẩu migrator không dùng dấu ngoặc nhọn hoặc xuống dòng do giới hạn wrapper đã chuẩn bị. Có thể dùng password manager sinh chuỗi chữ/số đủ dài. Không lưu bản SQL chứa mật khẩu trong Git.

- `cookora_app`: đọc/ghi dữ liệu ứng dụng.
- `cookora_migrator`: quyền DDL và đọc/ghi phục vụ Prisma migration.

Chỉ app user được đưa lên Render. Script dừng nếu user đã tồn tại để tránh ghi đè hoặc reset credential ngoài ý muốn. Với hệ thống lớn hơn cần thu hẹp quyền theo bảng và quy trình migration riêng. [Contained users và quyền Azure SQL](https://learn.microsoft.com/en-us/azure/azure-sql/database/logins-create-manage).

## 6. Tạo schema bằng Prisma từ máy của bạn

Không chạy `npm run db:migrate` local hiện tại vào Azure: wrapper đó dùng SA/master, tạo database/login cho SQL Server Docker. Azure dùng database đã tạo và contained user.

Sao chép mẫu:

```powershell
Copy-Item docs/deployment/azure-migrate.env.example .env.azure-migrate
notepad .env.azure-migrate
```

Điền file local:

```dotenv
MIGRATION_DB_HOST=TEN-SERVER.database.windows.net
MIGRATION_DB_NAME=Cookora
MIGRATION_DB_USER=cookora_migrator
MIGRATION_DB_PASSWORD=MAT_KHAU_MIGRATOR_THAT
```

Sau đó:

```powershell
node --env-file=.env.azure-migrate scripts/migrate-cloud.mjs
```

Wrapper dùng TLS có kiểm tra certificate, không tự tạo hoặc xóa database, không đưa password vào shell arguments, và không in raw output có thể chứa connection string. Nó gọi `prisma migrate deploy` với migration history trong repo, bao gồm GoogleIdentity. Không dùng `migrate dev`, `db push`, `migrate reset` hoặc sửa migration đã áp dụng trên cloud. [Prisma deploy migrations](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production).

Kiểm tra trong Query editor:

```sql
SELECT migration_name, finished_at, rolled_back_at
FROM dbo._prisma_migrations
ORDER BY started_at;

SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME;
```

Nếu kết nối lúc database ngủ bị timeout, đợi database khởi động lại rồi thử lại một lần; không đổi sang tắt TLS. Nếu lỗi migration đã chạy dở, kiểm tra history trước khi xử lý, không reset database có dữ liệu.

## 7. Đưa công thức lên cloud, giữ dữ liệu local

Cloud mới chưa có tài khoản hoặc công thức. Nhập **catalog nguồn JSON**, không sao chép password/session/yêu thích/thực đơn local. Hướng dẫn này không phải migrate toàn bộ dữ liệu người dùng hiện có.

```powershell
Copy-Item docs/deployment/azure-seed.env.example .env.azure-seed
notepad .env.azure-seed
```

Điền server Azure và mật khẩu `cookora_app`. File mẫu có `NODE_ENV=development` chỉ để cho phép **job nhập liệu offline trên máy bạn**; nó không cấu hình web Render. Không thay `.env` local hiện có.

Chạy một lần từ root:

```powershell
node --env-file=.env.azure-seed --import tsx backend/prisma/seed.ts
```

Script thêm công thức còn thiếu từ `database/seeds/document-recipes.json`, giữ các công thức có sẵn và trạng thái duyệt của chúng; không dùng script replace danh mục vì có thể dọn liên kết người dùng. Các ảnh đi theo frontend build, SQL lưu đường dẫn tương đối `/recipes/documents/...webp`.

Kiểm tra:

```sql
SELECT contentStatus, COUNT(*) AS recipeCount
FROM dbo.Recipe GROUP BY contentStatus;
SELECT TOP (20) id, title, slug, contentStatus
FROM dbo.Recipe ORDER BY title;
```

Với database mới và nguyên bộ nguồn hiện tại, dự kiến 419 DRAFT. Nếu khác, đối chiếu source/job trước khi nhập thêm. Nội dung SQL local từng được chỉnh sau khi seed không tự đi theo JSON; cần xuất/chuyển riêng nếu muốn giữ những chỉnh sửa đó.

### Phát hành những bài đã được duyệt

Kiểm tra món, lượng, các bước, nguồn/quyền sử dụng ảnh, khẩu phần và nhãn thời gian trước khi chọn bài phát hành. `APPROVED` là trạng thái biên tập, không tự chứng minh đã nấu thử; giữ `ESTIMATED` cho thời gian chưa đo.

Lấy ID thực từ query ở trên. Chỉ sau khi bạn đã duyệt đúng bài, cập nhật từng ID bằng truy vấn có điều kiện, ví dụ trong Query editor:

```sql
-- Thay placeholder bằng UUID THẬT của một bài đã duyệt; không chạy UPDATE toàn bộ.
DECLARE @recipeId uniqueidentifier = TRY_CONVERT(uniqueidentifier, N'REPLACE_REVIEWED_RECIPE_UUID');
IF @recipeId IS NULL THROW 50010, 'Choose a reviewed recipe UUID first.', 1;
UPDATE dbo.Recipe SET contentStatus = 'APPROVED'
WHERE id = @recipeId AND contentStatus = 'DRAFT';
SELECT id, title, contentStatus FROM dbo.Recipe WHERE id = @recipeId;
```

Không có bài APPROVED thì catalog public rỗng là đúng quy tắc hiện tại. Repo chưa có editor publish UI; thao tác này tạm thời là quản trị dữ liệu có chọn lọc. Cache catalog có thể mất khoảng 30 giây để cập nhật.

## 8. Tạo backend Render Free

Trong [Render Dashboard](https://dashboard.render.com), New → Web Service → kết nối GitHub repo. Chọn Docker, root của repo, Dockerfile path **docker/Dockerfile.render**, region gần database (Singapore nếu dùng khu vực phù hợp), instance type **Free**. Không chọn paid plan, PostgreSQL, persistent disk hoặc cron. Giữ Docker Command mặc định của image. Có thể dùng `render.yaml` qua Blueprint thay cho nhập tay; không tạo cả hai vì sẽ thành hai web service.

Đặt các biến môi trường:

| Biến | Giá trị |
| --- | --- |
| NODE_ENV | production |
| BIND_HOST | 0.0.0.0 |
| PORT | 10000 |
| SERVE_FRONTEND | true |
| TRUST_PROXY_HOPS | 1, cần kiểm tra đúng topology thực tế |
| NODE_OPTIONS | --max-old-space-size=256 |
| DB_HOST | TEN-SERVER.database.windows.net |
| DB_PORT | 1433 |
| DB_NAME | Cookora |
| DB_USER | cookora_app |
| DB_PASSWORD | Mật khẩu app user thật |
| DB_ENCRYPT | true |
| DB_TRUST_CERT | false |
| SEED_DEMO | false |
| CSRF_SECRET | Secret ngẫu nhiên riêng cloud, tối thiểu 32 ký tự |
| APP_ORIGIN | Tạm là HTTPS onrender.com được cấp; cuối cùng đổi sang URL Vercel ổn định |
| GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET | Điền ở bước Google phía dưới |

Không thêm MSSQL_SA_PASSWORD, MIGRATION_DB_PASSWORD, VERTEX_API_KEY, VERTEX_PROJECT_ID hoặc GOOGLE_APPLICATION_CREDENTIALS. Không upload file `.env` local. Dùng password manager tạo CSRF secret hoặc Blueprint `generateValue`; không xoay secret mỗi lần deploy. Không đưa secrets vào biến frontend `VITE_*`.

Đặt Health Check Path là **/api/v1/health/live**. `/ready` truy vấn SQL, chỉ kiểm tra thủ công khi cần. Poll SQL thường xuyên hoặc dùng uptime bot giữ thức sẽ tiêu hạn mức DB, không biến free tier thành dịch vụ luôn bật. [Azure SQL FAQ](https://learn.microsoft.com/en-us/azure/azure-sql/database/free-tier-faq).

Render cấp URL dạng `https://TEN-API.onrender.com`. Tên có thể được thêm hậu tố; dùng URL thật từ dashboard. Build đầu có thể chạy trước khi mở firewall, nhưng chưa xem deploy Live là đã kết nối database.

### Cho phép IP Render vào Azure SQL

Trong service Render → Connect → Outbound, lấy **tất cả dải IP** được hiển thị. Azure firewall dùng Start IP và End IP, nên chuyển từng CIDR thành khoảng tương ứng; ví dụ `203.0.113.0/24` là `.0` đến `.255` nhưng đây chỉ là ví dụ tài liệu, không phải IP của service bạn. Nhập đúng dải thật, không lấy IP inbound của tên miền Render. Các dải outbound dùng chung theo region, vẫn cần app password mạnh. [Render outbound IP](https://render.com/docs/outbound-ip-addresses).

Kiểm tra URL backend:

```text
https://TEN-API.onrender.com/api/v1/health/live
https://TEN-API.onrender.com/api/v1/health/ready
https://TEN-API.onrender.com/api/v1/recipes
```

`live` phải trả 200; `ready` trả database SQL Server; recipes có các bài APPROVED. Lần đầu sau khi database ngủ có thể cần đợi và thử lại. Log API không được chứa secret. Nếu API không bind được, kiểm tra BIND_HOST và PORT; không dùng Vite dev server làm web production.

## 9. Deploy giao diện lên Vercel Hobby

Sao chép cấu hình mẫu **một lần**, khi chưa có `vercel.json` riêng; nếu đã có file thì hợp nhất thủ công thay vì ghi đè:

```powershell
Copy-Item docs/deployment/vercel.frontend.example.json vercel.json
notepad vercel.json
```

Thay `https://REPLACE-BACKEND.onrender.com` bằng URL API Render thật. Giữ `/api/:path*` ở destination; backend đã có global prefix `/api/v1`. Ví dụ gọi `/api/v1/recipes` phải đi nguyên đường dẫn đó sang Render, không bị thành `/v1/recipes` hoặc `/api/api/v1/recipes`.

Commit file cấu hình không chứa secrets này rồi push. Trong [Vercel](https://vercel.com), Add New → Project → import repo. Dùng tài khoản Hobby của bạn, không chọn trial Pro. Cấu hình:

| Mục | Giá trị |
| --- | --- |
| Root Directory | Gốc repository, không phải frontend |
| Framework Preset | Vite |
| Install Command | npm ci |
| Build Command | npm run build -w frontend |
| Output Directory | frontend/dist |
| Node.js | 24.x |

`vercel.json` mẫu đã khai báo phần lớn các mục. Đây là frontend static, không chạy Docker Compose hoặc SQL Server trên Vercel. Không nhập DB_PASSWORD, CSRF_SECRET, Google secret hoặc Vertex key vào project frontend. [Vite trên Vercel](https://vercel.com/docs/frameworks/frontend/vite), [external rewrites](https://vercel.com/docs/rewrites).

Sau deploy, lấy **Production Domain ổn định**, ví dụ `https://cookora-reiko.vercel.app`, không lấy URL preview chứa mã deploy. Vào Render đổi:

```dotenv
APP_ORIGIN=https://TEN-WEB.vercel.app
GOOGLE_REDIRECT_URI=https://TEN-WEB.vercel.app/api/v1/auth/google/callback
```

Save/redeploy API. Không có dấu `/` ở cuối APP_ORIGIN. Cả URI callback và URL truy cập phải dùng đúng tên miền này. Preview domain không tự được cho phép để đăng nhập vào database production; cần môi trường staging riêng nếu muốn test auth trên preview.

Khi frontend ở Vercel, phần frontend cùng image Render chỉ là khả năng phục vụ dự phòng, không phải địa chỉ đăng nhập thứ hai. Có thể đổi SERVE_FRONTEND=false sau khi xác nhận Vercel hoạt động; không ảnh hưởng route API. Không đổi APP_ORIGIN qua lại khi người dùng đang dùng web.

### Kiểm tra rewrite và cookie

Mở trực tiếp trên **Vercel**:

```text
/co-gi-nau-nay
/cong-thuc
/api/v1/health/live
/api/v1/health/ready
/api/v1/recipes
```

F5 trên một trang con phải vẫn vào được SPA. `/api/v1/...` phải trả JSON, không phải HTML index. Trong Network, API request phải có host Vercel, không có localhost và không gọi Render trực tiếp từ frontend.

Sau đăng nhập, cookie `__Host-cookora_session` cần có Secure, HttpOnly, SameSite=Lax, Path=/ và không có Domain tường minh. Kiểm tra Set-Cookie đi qua rewrite, CSRF POST thành công, refresh vẫn đăng nhập và logout thu hồi phiên. Không cache API có cookie; mẫu cấu hình giữ `no-store`, không bật caching external origin.

TRUST_PROXY_HOPS=1 là điểm khởi đầu cho proxy liền trước API, không phải cam kết số hop đúng với mọi chuỗi Vercel/Render/Cloudflare. Xác minh req.ip thực tế bằng quan sát có kiểm soát, hai mạng truy cập và giới hạn request; không bật `trust proxy=true` hoặc tin mọi header do khách gửi. Nếu thêm proxy phải cấu hình lại theo topology. Rate limiter hiện trong RAM một instance, cần giải pháp dùng chung khi scale. [Express proxy guidance](https://expressjs.com/en/guide/behind-proxies/).

## 10. Đăng nhập Google trên domain Vercel

Tiếp tục theo [hướng dẫn OAuth của dự án](Google-Login-Setup.md), tạo client Web application riêng cho cloud. Authorized redirect URI:

```text
https://TEN-WEB.vercel.app/api/v1/auth/google/callback
```

Không đăng ký callback localhost hoặc URL Render nếu người dùng vào Vercel. Điền GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET **ở Render**, không frontend. GOOGLE_REDIRECT_URI cùng origin APP_ORIGIN. Endpoint `/api/v1/auth/google/status` trên Vercel phải báo enabled=true.

Để thử trước, Google Auth Platform → Audience → Testing và thêm email của bạn cùng những người thử vào Test users. Kiểm tra chọn tài khoản, hủy consent, quay về ứng dụng, tải lại, đăng xuất, đăng nhập lại và tài khoản thứ hai. Chỉ yêu cầu openid/email/profile như code hiện tại.

Muốn người ngoài Test users đăng nhập, hoàn tất Branding/Audience và yêu cầu policy/verification mà Google Console áp dụng, sau đó chuyển trạng thái phù hợp. Không coi bấm “Publish app” là đã được mọi yêu cầu Google chấp thuận; nếu Console đòi xác minh tên miền hoặc chính sách riêng tư, phải đáp ứng trước khi hứa mở public. [Google production readiness](https://developers.google.com/identity/protocols/oauth2/production-readiness/policy-compliance).

Nếu Google chưa cấu hình, production không có đường đăng ký mới qua mật khẩu để thay thế. Không tạo tài khoản mặc định chung hoặc hạ NODE_ENV để xử lý.

## 11. Kiểm tra trước khi gửi link cho người thử

1. Web production mở bằng điện thoại qua mạng di động; ảnh tải đúng, F5 trang con không 404.
2. API live/ready qua Vercel đều 200 khi DB sẵn sàng; catalog có ít nhất một bài đã duyệt và DRAFT không lộ ra.
3. Google login tạo USER, quay về đúng Vercel; session tồn tại sau refresh.
4. A lưu yêu thích/thực đơn/đi chợ rồi logout; B không đọc được dữ liệu A, kể cả thay ID trong URL/API.
5. Chỉnh khẩu phần và tổng lượng đi chợ đúng; reload giữ trạng thái đã mua.
6. POST thiếu CSRF bị từ chối; `/api/docs` và tài khoản biên tập không mở như local.
7. AI chưa cấu hình trả trạng thái rõ; không vô tình dùng key local trên cloud. Các chức năng không gọi AI vẫn dùng được.
8. Đợi Render/SQL ngủ rồi truy cập lại để biết thời gian chờ thực tế; không cam kết luôn bật.
9. Billing: Vercel Hobby, Render Free, Azure đúng free tier và auto-pause khi hết hạn mức. Không có tài nguyên phụ trả phí tự tạo.

Những mục này cần thực hiện trên tài khoản cloud thật. Local build hoặc YAML hợp lệ không chứng minh redirect/cookie/firewall/cloud deploy đã hoạt động.

## 12. Cập nhật, dữ liệu và khôi phục

Frontend: push thay đổi và kiểm tra Vercel build, giữ domain production ổn định. Backend: mẫu Render tắt auto deploy để bạn chủ động chạy migration trước thay đổi schema. Áp dụng migration qua wrapper local với credential riêng rồi Manual Deploy đúng commit. Không migration/seed ở mỗi cold start vì Render Free không có pre-deploy job miễn phí và API runtime không giữ quyền DDL. [Render deploys](https://render.com/docs/deploys).

Backup: giữ JSON nguồn và ảnh trong Git, giữ bản xuất database được mã hóa ở nơi riêng nếu có dữ liệu quan trọng. Không xem Git là backup dữ liệu user. Trước khi phụ thuộc vào khả năng khôi phục Azure, đọc giới hạn free tier: khôi phục/copy có thể yêu cầu đích trả phí; không tạo tài nguyên restore chỉ để thử khi ngân sách bằng 0. [Azure SQL free tier FAQ](https://learn.microsoft.com/en-us/azure/azure-sql/database/free-tier-faq).

Sau migration/import, đóng Query editor/SSMS để không giữ DB hoạt động; xóa rule IP quản trị tạm nếu không còn dùng. Giữ rule Render và password trong password manager. Free amount remaining trên Azure cần được theo dõi, không để monitoring truy vấn SQL liên tục. Budget alert chỉ báo, không tự cắt mọi tài nguyên hoặc mọi khoản phí. [Azure budgets](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets).

Rollback app không tự rollback schema hoặc dữ liệu; ưu tiên migration tương thích bản cũ và có phương án sửa tiến. Không `down -v`, reset hoặc chạy script replace catalog vào cloud để “làm lại” khi đã có người dùng.

## 13. Lỗi thường gặp

| Triệu chứng | Kiểm tra |
| --- | --- |
| Chỉ thấy giao diện, API 404/HTML | Rewrite /api phải đứng trước SPA; destination giữ nguyên /api; dùng đúng URL Render |
| CSRF_FAILED / login không giữ phiên | APP_ORIGIN đúng domain Vercel, không có slash cuối; cookie Secure, proxy Set-Cookie/Cookie; không cache API |
| DATABASE_UNAVAILABLE / P1001 | IP outbound Render trong Azure firewall; DB_HOST là FQDN; DB không hết quota; đợi cold resume |
| Login DB thất bại / P1000 | App contained user nằm trong Cookora; mật khẩu đúng; DB_NAME đúng; SQL authentication được bật |
| DATABASE_SCHEMA_OUTDATED / P2021 | Chưa áp dụng migration hoặc code đang trỏ sai database |
| Migration P3019 | Kiểm tra migration_lock hiện có; Prisma 7.10.1 repo dùng provider=mssql, không tự sửa lịch sử |
| Catalog rỗng ở cloud | Kiểm tra số APPROVED; DRAFT không hiển thị production |
| REGISTRATION_NOT_ENABLED | Gate production email/password; dùng Google đã cấu hình |
| redirect_uri_mismatch | URI Google Console trùng hoàn toàn Vercel callback, APP_ORIGIN và GOOGLE_REDIRECT_URI |
| Render build/port lỗi | Dockerfile.render, root repo, PORT=10000 và BIND_HOST=0.0.0.0; không chạy Compose |
| Render bị kill/restart | RAM/traffic/quota gói free; NODE_OPTIONS chỉ giới hạn JS heap, không bảo đảm cả process dưới 512 MB |
| Ảnh mất | Ảnh đã commit vào frontend/public chưa; không lưu ảnh upload mới trong filesystem Render |
| Người dùng phải chờ lâu | Cold start Render/SQL; đây là giới hạn free, không chữa bằng giữ thức liên tục |
| AI báo chưa cấu hình | Đúng với bản $0; muốn bật cần chọn nhà cung cấp/quota và bảo vệ chi phí riêng |

## 14. Phạm vi xác nhận

Đã chuẩn bị cấu hình build/hosting, mẫu Vercel/Render, SQL tạo user và wrapper migration. `npm run check` đạt 85 kết quả pass; Prisma schema/config hợp lệ. Image Render đã build và chạy smoke test production với mạng ngoài tắt: SPA, API live/404 và cookie CSRF Secure/HttpOnly đạt. Chưa tạo cloud resources, chưa nhập dữ liệu vào Azure, chưa duyệt recipe hoặc cấp quyền tài khoản thay bạn. Chưa có URL public, kết nối Azure, Google callback hoặc proxy Vercel được xác minh trong tác vụ này. Xem phần kiểm chứng ở [trạng thái triển khai](Implementation-Status.md).
