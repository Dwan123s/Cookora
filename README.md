# Cookora – Bếp Nhà

Ứng dụng local bằng **React 19 + TypeScript + Tailwind CSS + NestJS + Prisma 7 + Microsoft SQL Server 2022 + Docker**. Đây là bản triển khai đầu tiên của luồng MVP, chưa phải toàn bộ hệ thống trong Master Plan.

## Chạy nhanh

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

Đăng ký tài khoản bằng màn hình “Bếp của tôi” → “Đăng ký”. Không có mật khẩu/tài khoản mặc định. Bản local chưa xác minh email hoặc reset qua email; không dùng dữ liệu nhạy cảm. Đăng ký public bị tắt ở NODE_ENV=production cho đến khi flow email được hoàn thiện.

## Các luồng đã triển khai

- Homepage, khám phá theo tên/nguyên liệu/nhóm ẩm thực, pagination và bộ lọc thời gian đã kiểm chứng.
- Chi tiết món, định lượng Decimal theo khẩu phần; dữ liệu tính được lấy từ API.
- Cooking mode từng bước; giọng trình duyệt tiếng Việt nếu thiết bị có, fallback chữ; chưa tích hợp Azure TTS.
- Có gì nấu nấy: khớp danh tính hoặc lượng, quy đổi cùng dimension, trọng số và phần thiếu/unknown; không dùng LLM đoán số.
- Đăng ký/đăng nhập Argon2id, session opaque hash trong SQL, cookie HttpOnly, signed CSRF + Origin và giới hạn request một instance.
- Yêu thích riêng theo tài khoản; thực đơn tuần, thêm/xóa món, chọn ngày/bữa/khẩu phần, version conflict và client key chống thêm trùng khi retry.
- Danh sách đi chợ cộng lượng qua các món, chuẩn hóa g/kg và ml/l, lưu trạng thái đã mua. Tạo lại danh sách có mục đã mua bị chặn để kiểm tra, không xóa dấu đã mua âm thầm.
- Trang biên tập đọc/lọc/phân trang backlog 300 đề tài (150 món Việt, 150 món nước ngoài); endpoint kiểm tra quyền EDITOR/ADMIN, không hiển thị backlog như công thức đã phát hành.

## Dữ liệu nội dung

7 công thức seed là **bản thảo chưa nấu thử** từ bộ nội dung dự án. UI gắn nhãn; ảnh remote Unsplash là ảnh minh họa, không là ảnh test của món. Thời gian `ESTIMATED` không được lọc như `VERIFIED`. Demo chỉ hiển thị khi NODE_ENV khác production và SEED_DEMO=true; production chỉ đọc recipe APPROVED. Không tự duyệt 7 mẫu hoặc import 300 ý tưởng thành published recipes.

Seed idempotent: recipe đã có được giữ nguyên, không ghi đè dữ liệu người dùng. SQL có volume bền vững; không dùng `docker compose down -v` nếu muốn giữ dữ liệu.

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

## Google Cloud Vertex AI bằng API key

Trong `.env` local, đặt `VERTEX_MODEL=gemini-3.8-flash`, `VERTEX_LOCATION=global` và tự điền `VERTEX_API_KEY`. Key được dùng riêng ở backend qua header `x-goog-api-key`, gọi Vertex AI Express tại `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-3.8-flash:generateContent`. Chế độ API key không cần `VERTEX_PROJECT_ID` hoặc `GOOGLE_APPLICATION_CREDENTIALS`; không còn cần cờ `VERTEX_USE_EXPRESS_URL`.

Compose truyền key vào riêng container API lúc chạy, không đóng gói `.env` vào image. Sau khi đổi key, tạo lại API bằng `docker compose -f compose.yaml -f compose.app.yaml up -d --no-deps api`. Sau khi đổi mã nguồn, build lại bằng `docker compose -f compose.yaml -f compose.app.yaml up -d --build --no-deps api`.

Key phải được Google Cloud cho phép dùng với `aiplatform.googleapis.com`, bao gồm chính sách gắn service account nếu có. Không gửi key vào chat, frontend hoặc Git. Lỗi quyền/hạn mức/model được báo bằng thông báo đã loại thông tin nhạy cảm; ứng dụng không thay lỗi bằng công thức demo. Bản local vẫn cần hoàn thiện xác thực và quota riêng cho route AI trước khi mở public.

Nguồn cấu hình: [Vertex AI Express API](https://docs.cloud.google.com/gemini-enterprise-agent-platform/reference/express-mode/api-reference), [Gemini 3.8 Flash](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/guides/gemini-3-8-flash), [migration](https://ai.google.dev/gemini-api/docs/latest-model).

## Những phần tiếp theo

Email verification/reset, MFA/admin audit, editor publish và version recipe bất biến; TTS cloud/worker; inventory/FEFO/nhắc bảo quản; nutrient import/diary/Eat Fit; giá/ngân sách; upload/R2 ảnh có quyền; monitoring/backup/restore và production TLS/secrets. Chưa mở các tính năng này bằng dữ liệu giả.

Không deploy cấu hình local ra public. Production cần edition SQL hợp lệ (không Developer), certificate được xác thực, APP_ORIGIN HTTPS, secrets manager, email/MFA/audit, rate limiting dùng chung khi scale, content review và các gate trong Master Plan.

## Cấu trúc

Frontend đã áp dụng UI v2 “Nguyên liệu trước” trên toàn bộ các trang: sans-serif Plus Jakarta Sans tự host, animation hỗ trợ giảm chuyển động, responsive và ảnh món AI có chú thích. Xem [thiết kế đã triển khai, ảnh chụp và kiểm tra](docs/design/frontend-ui-v2-implementation.md).

`frontend/`: React UI; `backend/src/`: Nest API/domain; `backend/prisma/`: schema và migration history; `database/seeds/`: draft fixtures; `packages/contracts/`: DTO types; `docker/`: images/proxy; `docs/`: product/content plans và trạng thái triển khai.
