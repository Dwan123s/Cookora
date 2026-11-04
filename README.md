# Cookora – Bếp Nhà

Ứng dụng bằng **React 19 + TypeScript + Tailwind CSS + NestJS + Prisma 7**. Bản public chạy trên **Vercel + Neon PostgreSQL**; SQL Server 2022 + Docker vẫn được hỗ trợ cho local. Đây là bản MVP, chưa phải toàn bộ hệ thống trong Master Plan.

**Web public: https://cookora-rose.vercel.app** — đã xuất bản đủ 419 công thức theo yêu cầu ngày 03/11/2026, không gắn nhãn bản nháp. Xem [kết quả triển khai và kiểm tra thực tế](docs/Vercel-Deployment-Result.md).

AI trên public đã kết nối Vertex AI bằng key backend, kiểm tra thành công cả gợi ý món và thực đơn ngân sách. [Cấu hình và bằng chứng AI](docs/AI-Vercel-Setup.md).

**Quản lý phát hành bằng Git:** repo [Dwan123s/Cookora](https://github.com/Dwan123s/Cookora), nhánh production `main`, đã kết nối Vercel Git Integration. UI mới, runtime Vercel/Neon và thanh điều hướng dưới trên mobile đã được hợp nhất. Push lên `main` kích hoạt phát hành từ Git; không dùng lệnh deploy Vercel CLI. [Quy trình và trạng thái kết nối Git](docs/Git-Deployment.md).

## Chạy nhanh

Deployment hiện tại phục vụ cả frontend và NestJS API trên Vercel, kết nối Neon bằng app role hạn chế. Không cần Render trong cấu hình đang chạy. [Kết quả Vercel](docs/Vercel-Deployment-Result.md), [cấu hình Neon](docs/Neon-Setup-Result.md). Hướng dẫn Render/Azure cũ là phương án tham khảo.

Các lệnh SQL Server bên dưới dành cho môi trường local chọn `DATABASE_PROVIDER=sqlserver`. Nếu `.env` đã cấu hình Neon (`DATABASE_PROVIDER=postgresql`), dùng `npm run dev` để chạy frontend/API với database đó; không chạy migration SQL Server lên Neon. Dữ liệu SQL Server cũ vẫn được giữ.

Yêu cầu: Node.js 24, npm, Docker Desktop với Linux containers x86-64; SQL container cần khoảng 4GB RAM được cấp cho Docker.

Chạy từ thư mục gốc:

```powershell
npm ci
node scripts/setup-env.mjs
npm run db:generate
docker compose up -d sqlserver
# Đợi SQL ở trạng thái healthy: docker compose ps
npm run db:migrate
npm run db:seed
npm run dev
```

Mở **http://localhost:5173**. API ở http://localhost:3000/api/v1, Swagger local tại http://localhost:3000/api/docs. `.env` local được tạo bằng secrets ngẫu nhiên và gitignore; không ghi secrets vào source hoặc README. Không dùng giá trị CHANGE_ME.

Nếu Nest báo khởi động thành công nhưng `/health/ready` hoặc danh mục món bị lỗi, hãy kiểm tra Docker Desktop đang chạy và `docker compose ps` có SQL ở trạng thái healthy. Chạy `npm run db:up` để khởi động lại SQL với volume hiện có. Nest khởi động được không có nghĩa SQL đã kết nối được; trợ lý AI cũng cần đọc danh mục từ SQL trước khi gọi Vertex AI. Lỗi kết nối trả `DATABASE_UNAVAILABLE` (503), thiếu bảng/cột trả `DATABASE_SCHEMA_OUTDATED` (chạy `npm run db:migrate`). Log ghi mã chẩn đoán như `ESOCKET` hoặc `P2021`, không ghi câu SQL hay thông tin xác thực.

Đăng ký tài khoản bằng màn hình “Bếp của tôi” → “Đăng ký”, hỗ trợ cả local và public. Đăng ký thành công sẽ đăng nhập tự động. Không có mật khẩu/tài khoản mặc định. Chưa hỗ trợ xác minh email hoặc reset qua email.

## Các luồng đã triển khai

Đăng nhập Google: xem [hướng dẫn tạo OAuth client và cấu hình local](docs/Google-Login-Setup.md). Cần điền `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` trong `.env`, rồi chạy migration và khởi động lại API.

- Homepage, khám phá theo tên/nguyên liệu/nhóm ẩm thực, pagination và bộ lọc thời gian đã kiểm chứng.
- Chi tiết món, định lượng Decimal theo khẩu phần; dữ liệu tính được lấy từ API.
- Trang Ngân sách có “AI đề xuất thực đơn”: chọn ngân sách theo ngày/tổng kỳ, số người, 1–7 ngày, 1–4 bữa/ngày; có thể thêm nơi mua và sở thích. AI chọn công thức thật trong kho, ước tính chi phí từng món cho toàn bộ số người; API kiểm tra đủ bữa, ID hợp lệ, cộng tổng tiền và nguyên liệu bằng Decimal. Giá là ước tính AI, chưa phải báo giá thị trường; nếu vượt ngân sách sẽ hiển thị số tiền vượt. Bảng giá thủ công ở mục tùy chọn thu gọn. Endpoint `POST /api/v1/ai/suggest-budget` dùng cấu hình Vertex AI hiện có; proxy AI chờ tối đa 120 giây. Chưa lưu tự động thực đơn AI vào tài khoản.
- Cooking mode từng bước; giọng trình duyệt tiếng Việt nếu thiết bị có, fallback chữ; chưa tích hợp Azure TTS.
- Có gì nấu nấy: khớp danh tính hoặc lượng, quy đổi cùng dimension, trọng số và phần thiếu/unknown; không dùng LLM đoán số.
- Trang Có gì nấu nấy tự lưu nguyên liệu, khẩu phần và tối đa 10 lần gợi ý thành công, gồm toàn bộ cách nấu. Mở “Gợi ý đã lưu” để khôi phục; “Bắt đầu mới” giữ lại lịch sử. Dữ liệu lưu riêng theo tài khoản/khách trong trình duyệt, chưa đồng bộ nhiều thiết bị; xóa dữ liệu trình duyệt sẽ mất bản lưu này.
- Đăng ký/đăng nhập Argon2id, session opaque hash trong SQL, cookie HttpOnly, signed CSRF + Origin và giới hạn request một instance.
- Yêu thích riêng theo tài khoản; thực đơn tuần, thêm/xóa món, chọn ngày/bữa/khẩu phần, version conflict và client key chống thêm trùng khi retry.
- Danh sách đi chợ cộng lượng qua các món, chuẩn hóa g/kg và ml/l, lưu trạng thái đã mua. Tạo lại danh sách có mục đã mua bị chặn để kiểm tra, không xóa dấu đã mua âm thầm.
- Trang biên tập đọc/lọc/phân trang backlog 300 đề tài (150 món Việt, 150 món nước ngoài); endpoint kiểm tra quyền EDITOR/ADMIN, không hiển thị backlog như công thức đã phát hành.

## Dữ liệu nội dung

Danh mục hiện tại lấy công thức từ 6 tài liệu người dùng cung cấp: **419 công thức, 415 món có ảnh**. Cụ thể: viet.docx 169 món, han.docx 50, nhat.docx 37, Trung.docx 63, Thai.docx 50, Menu món.docx 50. Gồm 365 ảnh nhúng trong Word và 50 ảnh món Thái bổ sung từ PowerPoint ngày 04/11/2026; xem [nguồn và cách áp dụng ảnh](docs/Thai-Recipe-Images.md). Còn 4 món chưa có ảnh nguồn (2 món Hàn, 1 món Nhật và 1 món Menu); UI hiển thị ảnh giữ chỗ, không gán ảnh cũ của món khác.

Nguồn chuẩn là `database/seeds/document-recipes.json`, kèm SHA-256 của 6 tài liệu, vị trí ảnh nhúng, hash ảnh, nguyên liệu gốc và các đoạn văn nguồn. Ảnh được trích xuất và tối ưu WebP tại `frontend/public/recipes/documents/`. Script `scripts/prepare-document-catalog.py` đọc lại các tài liệu từ thư mục Downloads (hoặc `--source-dir`) và tạo bộ dữ liệu. Chạy bằng Python có Pillow.

107 công thức cũ đã được thay bằng bộ này theo yêu cầu. Bản sao lưu riêng trong `.review/catalog-backups/` giữ công thức/nguyên liệu/bước nấu và liên kết thực đơn, đi chợ trước khi thay; không chứa mật khẩu hay session. Xem trước bằng `npm exec -w backend -- tsx scripts/replace-document-catalog.ts`; thêm `--apply` sẽ thay toàn bộ danh mục trong một transaction, chỉ sau khi sao lưu đã được ghi và kiểm tra. Liên kết tới món cũ trong yêu thích, thực đơn và danh sách đi chợ được dọn; tài khoản đăng nhập được giữ.

`npm run db:seed` chỉ bổ sung các công thức trong bộ tài liệu mới còn thiếu, không khởi tạo lại 7 món mẫu hoặc bộ 50 món Thái cũ. Trang chủ, Khám phá, Eat Fit và các công cụ đều đọc danh mục API/SQL. Yêu thích đọc dữ liệu đã lưu của tài khoản, không hiển thị danh sách mẫu. Kiểm tra toàn bộ API, công thức và ảnh đang phục vụ bằng `node scripts/verify-live-catalog.mjs http://127.0.0.1:8080`.

Nội dung và định lượng giữ theo tài liệu; lượng dạng khoảng hoặc chưa rõ để null và giữ nguyên dòng nguồn. Khẩu phần không ghi được tạm tính 1 phần, có chú thích. Theo yêu cầu người dùng ngày 03/11/2026, đủ 419 công thức trên Neon production đã chuyển sang APPROVED và hiển thị công khai, không có nhãn bản nháp. Trạng thái thời gian ESTIMATED và dữ kiện nguồn được giữ nguyên; xuất bản không thay thế việc nấu thử. File seed nguồn vẫn giữ trạng thái nhập ban đầu và không ghi đè bài đã tồn tại. Backlog biên tập vẫn là kế hoạch nội dung riêng, không nhập thành công thức. SQL có volume bền vững; không dùng `docker compose down -v` nếu muốn giữ dữ liệu.

## Quyền biên tập local

Sau khi tự đăng ký, chạy từ root:

```powershell
npm run editor:grant -w backend -- your-email@example.com
```

Lệnh chỉ hỗ trợ non-production, không tạo account hoặc in mật khẩu. Đăng xuất/đăng nhập rồi mở `/bien-tap`. Khu vực này hiện read-only, chưa có workflow sửa/duyệt/xuất bản, audit hoặc admin MFA. Production chặn login role quản trị khi chưa cấu hình MFA.

## Kiểm thử

```powershell
npm run check
# Khi API và SQL đang chạy local:
npm exec -w backend -- tsx --test test/integration.ts
```

Unit tests kiểm tra Decimal, conversion, unknown, quantity score, duplicate ingredient và date. Integration test chạy với SQL thật: auth, CSRF, quyền A/B, favorite, scaling/search, plan retry/stale version, shopping aggregation/ownership/purchased state và logout. Test chỉ tạo tài khoản `@example.invalid` riêng, dọn đúng UUID được nó tạo; không xóa dữ liệu người dùng khác. Không chạy trên production.

## Chạy toàn bộ bằng container

```powershell
docker compose -f compose.yaml -f compose.app.yaml up --build -d
```

Mở http://localhost:8080. Thứ tự: SQL healthy → migration → demo seed → API healthy → Nginx/React. Không cần chạy npm dev ở chế độ này. Đây là stack **local development**, dùng Developer edition và chứng chỉ DB self-signed được tin cậy riêng local. Runtime API chỉ được cấp app login đọc/ghi; SA chỉ truyền vào job migration, không vào API.

Nginx phục vụ React và proxy `/api`, frontend/backend/SQL đều được container hóa. Các image/build recipes cần Docker truy cập registry. Kết quả kiểm chứng thực tế được ghi ở docs/Implementation-Status.md; không suy Compose hợp lệ đồng nghĩa mọi image đã build thành công.

## Những phần tiếp theo

Email verification/reset, MFA/admin audit, editor publish và version recipe bất biến; TTS cloud/worker; nutrient import/diary/Eat Fit; giá/ngân sách; upload/R2 ảnh có quyền; monitoring/backup/restore và production TLS/secrets. Chưa mở các tính năng này bằng dữ liệu giả.

Theo yêu cầu ngày 03/11/2026, tính năng Bảo quản thực phẩm và quản lý đồ thừa đã được gỡ khỏi ứng dụng, điều hướng và lộ trình sản phẩm.

Không deploy cấu hình local ra public. Production cần edition SQL hợp lệ (không Developer), certificate được xác thực, APP_ORIGIN HTTPS, secrets manager, email/MFA/audit, rate limiting dùng chung khi scale, content review và các gate trong Master Plan.

## Cấu trúc

Frontend đã áp dụng UI v2 “Nguyên liệu trước” trên toàn bộ các trang: sans-serif Plus Jakarta Sans tự host, animation hỗ trợ giảm chuyển động, responsive và ảnh món AI có chú thích. Xem [thiết kế đã triển khai, ảnh chụp và kiểm tra](docs/design/frontend-ui-v2-implementation.md).

`frontend/`: React UI; `backend/src/`: Nest API/domain; `backend/prisma/`: schema và migration history; `database/seeds/`: draft fixtures; `packages/contracts/`: DTO types; `docker/`: images/proxy; `docs/`: product/content plans và trạng thái triển khai.
