# Cookora miễn phí: Vercel + Neon

> **Đã deploy thật:** https://cookora-rose.vercel.app — cả frontend và NestJS API trên Vercel, database Neon production, 419 công thức đã xuất bản. Xem [kết quả, bằng chứng và cách deploy tiếp](Vercel-Deployment-Result.md). CLI pull DATABASE_URL và DATABASE_URL_UNPOOLED; ứng dụng local ưu tiên NEON_RUNTIME_DATABASE_URL của app role. Vercel nhận URL app role trong DATABASE_URL. Phần Render bên dưới là hướng dẫn phương án cũ; không cần tạo Render để vận hành deployment hiện tại.

Cập nhật 03/11/2026. Các phần so sánh và hướng dẫn Render dưới đây được viết trước lần triển khai Vercel thực tế. Các thông số free tier được kiểm tra khi viết hướng dẫn và có thể thay đổi.

## Lựa chọn cho Cookora

| Phương án | Đánh giá theo hệ thống hiện tại |
| --- | --- |
| **Neon Free — chọn** | PostgreSQL, không cần thẻ; pooled connection; phù hợp giữ NestJS, Prisma, Google OAuth và SQL session hiện có |
| Supabase Free | Hợp lý khi muốn dùng Auth/Storage/Realtime của Supabase; Cookora chưa cần thay các luồng này. Chuyển sang PostgreSQL vẫn cần cùng mức công migration |
| Azure SQL Free | Ít công đổi SQL Server hơn, nhưng bước đăng ký thẻ không phù hợp với yêu cầu hiện tại |

Neon Free hiện có 1 GB database/project, 100 CU-hours compute và 5 GB network transfer/project/tháng, không cần thẻ. Compute ngủ khi idle và tự hoạt động lại khi có truy vấn; hết compute/network quota có thể bị suspend đến kỳ sau. Không xem free tier là dịch vụ luôn bật không giới hạn. [Neon pricing](https://neon.com/pricing).

Supabase Free hiện có 500 MB database, 1 GB file storage và có thể pause project sau một tuần không hoạt động. Lợi thế Auth/Storage có ích nếu sau này chủ động chọn tích hợp; nó không tự thay hệ thống tài khoản/session Cookora hiện có. [Supabase pricing](https://supabase.com/pricing).

Đây là lựa chọn phù hợp cho ngân sách $0 và mã hiện tại, không phải kết luận Neon nhanh hơn mọi dịch vụ. Chưa có benchmark tải trên cloud. Khi lượng truy cập tăng, cần đo latency, dung lượng và compute thực tế trước khi chọn gói khác.

## Kiến trúc

```text
Người dùng → Vercel Hobby (React, CSS, ảnh, HTTPS)
              └─ /api/v1/... rewrite → Render Free (NestJS)
                                         └─ TLS → Neon Free PostgreSQL
```

Vercel Hobby phù hợp mục đích cá nhân phi thương mại người dùng đã xác nhận. [Điều kiện Hobby](https://vercel.com/docs/plans/hobby).

Render giữ backend Node container, nhưng Free có thể ngủ sau 15 phút không nhận traffic và mất khoảng một phút để khởi động lại. File runtime không bền vững; database nằm ngoài Render, ảnh hiện tại nằm trong frontend build. Không dùng Render Postgres Free cho dữ liệu cần giữ lâu vì database free đó hết hạn sau 30 ngày. [Render Free](https://render.com/docs/free).

Ảnh các món hiện được phục vụ từ Vercel; không cần dịch vụ upload mới. Google login tiếp tục dùng backend, không chuyển sang Neon Auth. Vertex AI không được cấu hình trên cloud trong phương án $0; các công cụ gọi AI sẽ báo chưa cấu hình, còn catalog/khớp nguyên liệu/thực đơn/đi chợ thông thường vẫn dùng được.

## Đã sửa trong mã

- `DATABASE_PROVIDER=sqlserver` vẫn là mặc định, dùng database local và migration cũ.
- `DATABASE_PROVIDER=postgresql` chọn Prisma client PostgreSQL riêng và `@prisma/adapter-pg`.
- Schema/migration PostgreSQL ở `backend/prisma-postgres/`; không sửa lịch sử migration SQL Server.
- `npm run db:generate` sinh cả hai clients. Model API giống nhau; UUID, Decimal(18,6), constraints và foreign keys được giữ theo mapping PostgreSQL.
- Cloud runtime yêu cầu TLS, kiểm tra certificate, pool tối đa 3 connection. Direct URL để migration; pooled URL để API.
- `render.yaml` hiện trỏ PostgreSQL/Neon, không còn yêu cầu DB_HOST/SA của Azure.
- Wrapper `backend/scripts/neon-database.ts` hỗ trợ migrate/seed/status và chỉ chấp nhận endpoint Neon cho các tác vụ cloud. Không tự log connection string hoặc credential.

Việc này thêm đường chạy cloud mới. SQL Server, tài khoản, session và dữ liệu người dùng đang có trên máy chưa được chuyển/xóa. Hướng dẫn dưới nhập catalog nguồn vào database cloud mới, không tự sao chép tài khoản hoặc thực đơn local. Nếu cần giữ dữ liệu cá nhân local trên cloud phải làm đợt chuyển dữ liệu riêng có backup và kiểm tra tham chiếu.

## 1. Tạo Neon Free

1. Mở [Neon Console](https://console.neon.tech), đăng ký/đăng nhập bằng GitHub hoặc email.
2. Giữ plan **Free**. Không chọn nâng cấp, không nhập thẻ.
3. Tạo project `cookora`, chọn PostgreSQL **17** nếu có lựa chọn. Chọn region gần backend Render, ưu tiên Singapore nếu được cung cấp; nếu không, chọn vùng gần nhất có sẵn.
4. Dùng database mới `neondb` và branch chính của project. Chưa bật thêm Data API/Auth/Functions hoặc tạo nhiều branch.
5. Mở **Connect**, sao chép URL kết nối vào password manager, không gửi URL chứa password vào chat.

Cần hai loại connection sau:

| Dùng cho | User | Endpoint |
| --- | --- | --- |
| Migration local | Owner do Neon cấp, ví dụ neondb_owner | **Direct**, không có `-pooler` |
| Backend Render | cookora_app, tạo ở bước 3 | **Pooled**, thường có `-pooler` |

Giữ nguyên hostname và database từ Connect; không tự ghép region hoặc endpoint. Neon dùng PgBouncer transaction pooling; direct connection được dùng cho migration/backup cần session ổn định. [Neon pooling](https://neon.com/docs/connect/connection-pooling), [Prisma và Neon](https://neon.com/docs/guides/prisma).

## 2. Tạo bảng từ máy bạn

Mở PowerShell tại `C:\Cookara`, dùng Node 24:

```powershell
Set-Location C:\Cookara
npm install
npm run db:generate
```

Trong các lần deploy sau, dùng `npm ci` khi cài sạch đúng lockfile. Chỉ cài lại khi dependency chưa có hoặc lockfile thay đổi.

Nếu file `.env.neon-migrate` chưa tồn tại:

```powershell
Copy-Item docs/deployment/neon-migrate.env.example .env.neon-migrate
notepad .env.neon-migrate
```

Điền:

```dotenv
NODE_ENV=production
DATABASE_PROVIDER=postgresql
DIRECT_URL="postgresql://OWNER:PASSWORD@DIRECT_HOST.neon.tech/neondb?sslmode=verify-full"
```

Thay toàn bộ URL bằng direct connection thật lấy từ Neon. Nếu URL đang có `sslmode=require`, đổi giá trị đó thành `verify-full`, giữ nguyên các thành phần khác như `channel_binding=require` nếu có. Password có ký tự đặc biệt phải được URL-encode; copy URL do Connect cung cấp để tránh sai. Không dùng dấu `<...>` làm giá trị thật.

Không sửa `.env` local đang phục vụ SQL Server. File `.env.neon-*` đã được Git ignore. Nếu file đã có, mở sửa chứ không copy đè.

Chạy từ root:

```powershell
npm exec -w backend -- tsx --env-file=../.env.neon-migrate scripts/neon-database.ts migrate
```

Kết quả thành công: `PostgreSQL migrations applied...`. Có hai migration PostgreSQL, gồm 12 model và các CHECK constraints. Không chạy `npm run db:migrate` vào Neon: lệnh đó vẫn dành cho SQL Server local. Không chạy `db push`, reset hay migration SQL Server lên PostgreSQL.

Trong Neon SQL Editor, kiểm tra:

```sql
SELECT migration_name, finished_at, rolled_back_at
FROM public._prisma_migrations ORDER BY started_at;
```

## 3. Tạo app user hạn chế quyền

Mở [docs/deployment/neon-app-role.sql](deployment/neon-app-role.sql) và sao chép nội dung vào Neon SQL Editor, chọn đúng database `neondb` và branch của dự án.

Thay `REPLACE_WITH_RANDOM_PASSWORD_32_CHARS_OR_MORE` bằng mật khẩu riêng cho `cookora_app`, tối thiểu 32 ký tự ngẫu nhiên. Có thể dùng password manager sinh chuỗi chữ/số dài để dễ đưa vào URL. Thay trong SQL Editor, không commit bản chứa secret.

Chạy script. Nó tạo `cookora_app`, cho CONNECT/USAGE và đọc/ghi 12 bảng ứng dụng; không cấp DDL hoặc quyền đọc `_prisma_migrations`. Không cấp quyền Neon owner cho API. Nếu user đã có, script dừng để bạn quản lý/rotate riêng, không tự đổi password.

Tạo pooled app URL: lấy URL pooled từ Connect, giữ đúng hostname/database; thay username bằng `cookora_app`, thay password bằng app password đã URL-encode. Không giữ `neondb_owner` ở URL API. Nếu dropdown có role cookora_app thì chọn trực tiếp và kiểm tra lại user trong URL.

## 4. Nhập catalog và kiểm tra kết nối

Tạo file local riêng nếu chưa có:

```powershell
Copy-Item docs/deployment/neon-app.env.example .env.neon-app
notepad .env.neon-app
```

Điền:

```dotenv
NODE_ENV=production
DATABASE_PROVIDER=postgresql
DATABASE_URL="postgresql://cookora_app:APP_PASSWORD@POOLED_HOST-pooler.neon.tech/neondb?sslmode=verify-full"
ALLOW_CATALOG_IMPORT=true
```

Chạy:

```powershell
npm exec -w backend -- tsx --env-file=../.env.neon-app scripts/neon-database.ts seed
npm exec -w backend -- tsx --env-file=../.env.neon-app scripts/neon-database.ts status
```

`seed` chỉ thêm các món nguồn còn thiếu, không xóa/ghi đè catalog đã có và không chuyển tài khoản/session local. Với database mới, dự kiến 419 món DRAFT. Chạy seed lại báo 0 tạo mới, 419 giữ nguyên. Không tự gọi seed mỗi cold start của web.

`status` trả tổng công thức và số APPROVED, không trả credentials. Cloud production không hiển thị DRAFT, nên trang sẽ chưa có món cho đến khi bạn duyệt ít nhất một bài. Không dùng NODE_ENV=development trên web public để né kiểm duyệt. ALLOW_CATALOG_IMPORT chỉ nằm trong file local cho job nhập, không đặt trên Render.

### Duyệt bài trước phát hành

Trong Neon SQL Editor:

```sql
SELECT id, title, slug, "contentStatus"
FROM public."Recipe" ORDER BY title LIMIT 30;
```

Sau khi kiểm tra nội dung, quyền dùng ảnh, định lượng, khẩu phần và hướng dẫn của từng bài, chỉ cập nhật đúng ID đã duyệt:

```sql
-- Thay UUID placeholder bằng ID THẬT của bài bạn đã duyệt.
UPDATE public."Recipe" SET "contentStatus" = 'APPROVED'
WHERE id = 'REPLACE_REVIEWED_RECIPE_UUID'::uuid AND "contentStatus" = 'DRAFT'
RETURNING id, title, "contentStatus";
```

Giữ timingStatus ESTIMATED nếu chưa đo thời gian thực tế. APPROVED là trạng thái biên tập, không tự chứng minh món đã nấu thử. Không UPDATE toàn bộ catalog để lấp trang. Giao diện editor publish vẫn chưa triển khai.

## 5. Deploy API lên Render Free

Push source và ảnh của repo lên GitHub riêng tư, kiểm tra không commit `.env*`, `.review`, credentials hoặc generated clients. Tạo Web Service trên [Render](https://dashboard.render.com), dùng `docker/Dockerfile.render`, root repo và instance **Free**. Hoặc import Blueprint `render.yaml`, chỉ dùng một cách để tránh tạo trùng service.

| Biến Render | Giá trị |
| --- | --- |
| NODE_ENV | production |
| DATABASE_PROVIDER | postgresql |
| DATABASE_URL | Pooled URL cookora_app thật, sslmode=verify-full |
| BIND_HOST / PORT | 0.0.0.0 / 10000 |
| APP_ORIGIN | HTTPS domain Vercel production ổn định, cập nhật khi đã có |
| CSRF_SECRET | Secret riêng cloud dài ít nhất 32 ký tự; Blueprint có generateValue |
| TRUST_PROXY_HOPS | 1 ban đầu, xác minh đúng topology thực tế |
| NODE_OPTIONS | --max-old-space-size=256 |
| SERVE_FRONTEND | true nếu muốn image phục vụ cả UI; false khi chỉ dùng Vercel |
| SEED_DEMO | false |
| GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET | OAuth Web client thật, riêng cho cloud |
| GOOGLE_REDIRECT_URI | APP_ORIGIN + /api/v1/auth/google/callback |

Không đưa DIRECT_URL/owner password, ALLOW_CATALOG_IMPORT, MSSQL_SA_PASSWORD, Vertex API key hoặc credentials local lên Render. Không cần các biến DB_HOST/DB_USER/DB_PASSWORD cho PostgreSQL. `DATABASE_PROVIDER` chọn rõ để không vô tình dùng nhầm database.

Health check path: `/api/v1/health/live`. Không dùng `/ready` để poll SQL liên tục làm tiêu compute miễn phí. Sau deploy, mở `/api/v1/health/ready` thủ công để xác nhận `database=PostgreSQL`. Kết quả Live của Render chỉ chứng minh process đang chạy, không chứng minh DB/catalog đã đúng.

Mỗi lần đổi schema, chạy migration từ máy với owner credential trước khi deploy code tương ứng; runtime không có quyền tạo bảng. Nếu thêm bảng phải cấp quyền runtime phù hợp bằng owner. Không reset cloud database khi đã có người dùng.

## 6. Deploy UI lên Vercel

Dùng mẫu `docs/deployment/vercel.frontend.example.json`: copy sang `vercel.json` nếu chưa có, thay URL backend placeholder bằng HTTPS Render thật. Nếu đã có file, sửa/hợp nhất thủ công, không ghi đè.

| Vercel setting | Giá trị |
| --- | --- |
| Root directory | Gốc repo |
| Framework | Vite |
| Node.js | 24.x |
| Install | npm ci |
| Build | npm run build -w frontend |
| Output | frontend/dist |

Rewrite `/api/:path*` sang `https://TEN-API.onrender.com/api/:path*` phải đứng trước SPA fallback `/index.html`. Giữ nguyên /api để backend nhận /api/v1/... đúng. API không cache. Frontend không chứa DATABASE_URL, CSRF_SECRET hoặc OAuth secret. [Vercel rewrites](https://vercel.com/docs/routing/rewrites).

Lấy domain Production ổn định, ví dụ `https://TEN-WEB.vercel.app`. Cập nhật APP_ORIGIN trên Render, không slash cuối, và GOOGLE_REDIRECT_URI cùng domain đó. Không dùng preview URL mỗi deploy làm OAuth callback.

Google Cloud Console: tạo client Web application, thêm callback `https://TEN-WEB.vercel.app/api/v1/auth/google/callback`, điền secrets ở Render. Ban đầu thêm email người thử vào Test users; trước mở cho người ngoài, đáp ứng các điều kiện Branding/Audience/verification mà Google Console yêu cầu. Xem [Google login của Cookora](Google-Login-Setup.md).

Đăng ký mật khẩu production vẫn bị chặn khi chưa có xác minh/reset email; Google là luồng tạo tài khoản USER đã triển khai. EDITOR/ADMIN production vẫn yêu cầu MFA chưa hoàn thiện.

## 7. Kiểm tra trước khi gửi link

- Vercel mở được trang và ảnh bằng mạng di động; F5 tại `/co-gi-nau-nay` và `/cong-thuc` không 404.
- `/api/v1/health/ready` qua Vercel trả PostgreSQL; API không trả HTML index hoặc chứa localhost.
- Có món APPROVED, DRAFT không xuất hiện trên production. Kiểm tra ảnh đúng từng món.
- Google login/cancel/logout qua đúng domain Vercel; refresh giữ session, logout thu hồi phiên.
- Cookie __Host-cookora_session có Secure/HttpOnly, không Domain; rewrite giữ Cookie/Set-Cookie, không cache API cá nhân.
- Hai tài khoản không đọc được yêu thích/thực đơn/đi chợ của nhau, kể cả thay ID trong request.
- Đổi khẩu phần, thêm món, retry và tích đã mua tồn tại qua reload; request thiếu CSRF bị từ chối.
- Đợi service ngủ rồi truy cập lại để biết độ trễ thực. Không dùng uptime bot để giữ DB thức và vượt quota.
- Tài khoản dịch vụ ở Free, không mở trial trả phí; xem Usage của Neon/Render/Vercel. Để trống Vertex key trong bản $0.

Nếu bạn chỉ nhập catalog, tài khoản/thực đơn SQL Server local không tự xuất hiện trên cloud; đó là hành vi đã chọn. Không dùng chung một account mặc định cho người thử.

## Kết quả kiểm tra và giới hạn

PostgreSQL 17 tạm, tách khỏi SQL Server, đã áp dụng migration và nhập 419 công thức; seed lại không ghi đè. Database khoảng 10 MB ở lần kiểm tra (gồm metadata/index, không chứa ảnh). Đây là số đo fixture hiện tại, không phải bảo đảm dung lượng khi tăng dữ liệu người dùng.

Integration suite kiểm tra catalog, CHECK constraints, CSRF, đăng ký/login/logout, Google identity persistence, Decimal/khớp nguyên liệu, yêu thích và thực đơn/đi chợ riêng theo tài khoản. Google identity test không gọi dịch vụ Google thật. TLS/URL và model contracts có unit tests riêng.

Kiểm tra cuối: 88 kết quả unit/HTTP test pass, 10 kết quả PostgreSQL integration pass (gồm test cha), build backend/frontend và image cloud thành công. Container image giới hạn 512 MB đã phục vụ catalog PostgreSQL và SPA bằng app role; chưa đo tải đồng thời. Runtime audit còn 2 cảnh báo moderate trong uuid/gaxios của nhánh Google auth, không có high/critical ở lần kiểm tra; cần xử lý dependency phù hợp trước khi coi là đã hoàn tất mọi gate bảo mật production.

Chưa có kết nối Neon cloud thật, migration vào tài khoản Neon, Google callback thật, cookie qua Vercel rewrite hoặc benchmark tải. Backup free có hạn; phải giữ source catalog/ảnh trong Git và có bản xuất database riêng nếu dữ liệu người dùng trở nên quan trọng. App rollback không tự rollback schema/data.

Các hướng dẫn Azure trước đây vẫn giữ để tham khảo, nhưng `render.yaml` mặc định đã chuyển Neon theo lựa chọn mới. Không kết hợp biến Azure với cấu hình Neon. Bằng chứng và trạng thái mới nhất ở [Implementation Status](Implementation-Status.md).
