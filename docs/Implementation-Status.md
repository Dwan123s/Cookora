# Trạng thái triển khai Cookora

Cập nhật: 03/11/2026. Bản MVP đã public trên Vercel + Neon, theo phạm vi người dùng đã yêu cầu tiếp tục xây dựng hệ thống. Đây là trạng thái mã và kiểm tra thực tế, bổ sung cho Master Plan.

## Hiện tại: Vercel + Neon, 419 công thức đã xuất bản

**04/11/2026 — bottom bar mobile:** dưới 768px thay header bằng Trang chủ/Khám phá/Chat AI/Thực đơn/Thêm. Chat AI mở popup, giữ hội thoại khi thu gọn; công cụ và tài khoản trong Thêm. Đã deploy và kiểm tra trực tiếp browser 320px/390px, phản hồi AI thật, đóng/mở popup, chuyển route và breakpoint 768px. [Bằng chứng](Mobile-Bottom-Bar.md).

**Cập nhật mobile:** header thu gọn cho điện thoại/tablet, bộ lọc Khám phá mở/đóng, thực đơn chọn từng ngày dưới 680px, tab chi tiết cuộn trong vùng riêng, form và chat AI theo viewport nhỏ. TypeScript/build đạt; chưa kiểm tra trực quan vì quyền trình duyệt local đang tắt. [Phạm vi và bằng chứng](Mobile-Responsive-Update.md).

**AI đã hoạt động trên public:** cấu hình Vertex key/model/location vào Vercel secrets theo xác nhận của người dùng, deploy mới READY. Hai endpoint gợi ý công thức và ngân sách đều HTTP 201 qua HTTPS public; kiểm tra hướng dẫn món mới, ID món thật, tổng tiền và danh sách đi chợ đạt. Key không nằm trong frontend bundle. [Chi tiết và log](AI-Vercel-Setup.md).

**https://cookora-rose.vercel.app** đã READY. Frontend và NestJS API cùng chạy trên Vercel; database là Neon PostgreSQL production, dùng app role hạn chế. Không dùng Render trong deployment này. Theo yêu cầu mới nhất của người dùng, 419 công thức nguồn đã chuyển DRAFT → APPROVED trong transaction có sao lưu trạng thái; public hiển thị đủ 419 bài, không có nhãn bản nháp. Dữ kiện và trạng thái thời gian không bị sửa.

`npm run check`: 91 kiểm thử đạt, 0 lỗi; `npm run build` thành công. Acceptance qua HTTPS public đã kiểm tra 419 ID duy nhất trên tất cả trang, chi tiết/tìm kiếm/ảnh mẫu, readiness Neon, CSRF/cookie, yêu thích, thực đơn, danh sách đi chợ/trạng thái đã mua, từ chối truy cập chéo tài khoản và logout. Fixture được dọn đúng phạm vi. Google OAuth start dùng đúng callback public và PKCE; chưa xác nhận consent/callback bằng tài khoản Google thật. [Bằng chứng và vận hành](Vercel-Deployment-Result.md).

Các mục phía dưới ghi lại quá trình local/Neon trước lần public này; số lượng DRAFT và các dòng chưa có URL public trong các mốc cũ không mô tả trạng thái hiện tại.

## Phương án cloud mới: Neon PostgreSQL (03/11/2026)

**Cập nhật sau khi người dùng đăng nhập Neon:** project polished-bonus-47222343 / branch production đã deploy policy thật, pull env, migrate và nhập 419 DRAFT. API đang dùng app role PostgreSQL hạn chế. Kiểm tra nhánh Neon tách đạt 10/10; unit/HTTP tests đạt 89/89 và build thành công; kiểm tra frontend→API→Neon production gồm session, favorites, planner, shopping và cleanup fixture đã pass. [Kết quả và command output](Neon-Setup-Result.md). Các dòng “chưa có kết nối Neon” phía dưới là trạng thái lịch sử trước bước đăng nhập này.

Người dùng chọn dịch vụ khác thay Azure vì yêu cầu thẻ. Phương án hướng dẫn ban đầu là **Vercel Hobby + Render Free + Neon Free**; triển khai thực tế sau đó dùng **Vercel + Neon**, giữ NestJS/Prisma/Google OAuth đã có. [Hướng dẫn cũ và liên kết kết quả mới](Deploy-Free-Neon.md). Hướng dẫn và bằng chứng Azure/SQL Server phía dưới là lịch sử.

Đã thêm PostgreSQL client/schema/migration riêng, adapter-pg và chọn provider bằng DATABASE_PROVIDER. Không đổi schema/migration/volume SQL Server hiện có; không chuyển tài khoản hoặc session local sang cloud. Cloud dùng pooled URL của app role, owner direct URL chỉ dùng migration. Runtime PostgreSQL kiểm tra certificate TLS và giới hạn pool 3 connections.

Đã áp dụng 2 migration trên PostgreSQL 17 tạm, nhập 419 công thức nguồn và xác minh seed idempotent. Catalog fixture chiếm khoảng 10 MB cả metadata/index, ảnh không nằm trong DB. Integration suite 10 kết quả pass (gồm test cha) với PostgreSQL thật: catalog/CHECK constraints/CSRF/register/login/logout/Google identity persistence/Decimal/matching/private favorites/planner version+retry/shopping. Chạy lại cùng suite bằng app role hạn chế vẫn pass 10/10; CREATE TABLE bị từ chối đúng như dự kiến. Google identity test không gọi Google OAuth thật. Bằng chứng trong `.review/postgres-migrate-check.log`, `.review/postgres-integration.log`, `.review/postgres-app-role-integration.log`.

Unit/HTTP test mặc định đã đạt 88 kết quả pass, gồm kiểm tra URL/TLS và model contracts của hai provider. Dependency runtime audit hiện còn 2 cảnh báo moderate ở uuid/gaxios trong nhánh Google auth; không có high/critical ở lần kiểm tra này. `npm audit fix` không giải quyết hết trong dependency bounds hiện tại; không ép major upgrade hoặc override chưa kiểm chứng. Không coi bản này là đã vượt mọi gate bảo mật production.

Chưa có tài khoản/project Neon được tạo hoặc kết nối cloud thật; chưa chạy migration vào Neon, Google callback/Set-Cookie qua Vercel thật hoặc benchmark tải. 419 bài vẫn DRAFT, đăng ký mật khẩu production vẫn chặn; cần duyệt bài và cấu hình OAuth trước khi mời người thử. SQL Server local giữ nguyên dữ liệu. Không có URL public mới được xác minh.

Kiểm tra cuối: `npm run check` pass 88/88 và build backend/frontend thành công. Image `cookora-neon-free:check` build thành công; chạy container giới hạn 512 MB, dùng app role và PostgreSQL thật tạm: readiness trả PostgreSQL, catalog 419 món và SPA trả 200. Đây là smoke test, không phải benchmark tải/RAM của người dùng thật. API dev localhost:3000 đã được kiểm tra lại và trả ready/SQL Server, frontend localhost:5173 trả 200. Container/API PostgreSQL kiểm thử được dọn, không xóa volume SQL Server. Build log: `.review/neon-image-build.log`; check log: `.review/neon-final-check.log`.

## Đã chạy được

Danh mục hiện tại (thay thế theo yêu cầu ngày 03/11/2026): 419 công thức từ 6 tài liệu Word, 365 ảnh trích xuất đúng vị trí trong tài liệu; 54 món thiếu ảnh hiển thị ảnh giữ chỗ. 107 món cũ, 21 mục thực đơn tham chiếu món cũ và 1 danh sách đi chợ đã được dọn sau khi sao lưu đầy đủ trong `.review/catalog-backups/`; giữ tài khoản đăng nhập. Seed mới chạy lại báo 0 tạo mới, 419 giữ nguyên. Trang chủ, Khám phá, Eat Fit, Yêu thích và công cụ không dùng danh sách món mẫu cũ. Thông tin 107 món và ảnh AI trong các mốc kiểm tra bên dưới là lịch sử trước lần thay thế này. Chi tiết nguồn và vận hành ở README.

React 19, TypeScript, Tailwind CSS; NestJS 12; Prisma 7 với SQL Server 2022. Có thể chạy API/frontend bằng Node hoặc toàn bộ stack bằng Docker Compose. SQL dùng volume bền vững; migration chạy bằng tài khoản riêng, runtime dùng app login đọc/ghi.

| Luồng | Trạng thái |
| --- | --- |
| Khám phá món | Tìm tên và alias nguyên liệu, nhóm ẩm thực, phân trang; lọc thời gian chỉ dùng dữ liệu VERIFIED |
| Chi tiết và cooking mode | Đổi khẩu phần bằng Decimal; từng bước; giọng Việt nếu trình duyệt có sẵn |
| Có gì nấu nấy | Khớp nguyên liệu hoặc lượng, quy đổi g/kg và ml/l; phân biệt thiếu và chưa rõ lượng |
| AI từ nguyên liệu nhập tự do | Vertex AI Express với `gemini-3.7-flash`; một lần gọi AI ưu tiên chọn công thức thật trong kho và đồng thời đề xuất món mới; backend xác thực ID, giao diện ghi nhãn nguồn; API key chỉ ở backend, gửi qua header; món AI tạo chưa qua biên tập/nấu thử |
| Tài khoản | Đăng ký/đăng nhập local, Argon2id, session trong SQL, cookie HttpOnly, CSRF và Origin |
| Yêu thích | Dữ liệu riêng cho từng tài khoản |
| Thực đơn tuần | Chọn ngày/bữa/khẩu phần; thêm/xóa; kiểm tra owner, version và request retry |
| Danh sách đi chợ | Cộng nguyên liệu, đánh dấu đã mua; kiểm tra owner/version; chặn tạo lại khi cần xử lý dấu đã mua |
| Biên tập | Chỉ đọc, tìm/lọc/phân trang backlog 300 đề tài; phân quyền EDITOR/ADMIN |

## Nội dung

Có 107 công thức DRAFT trong cơ sở dữ liệu local: 7 món cũ, 50 món Thái và 50 món theo danh sách chuẩn Menu món.docx. Backlog 300 đề tài vẫn riêng. Các công thức chưa nấu thử; ảnh là ảnh minh họa. Không xem backlog là 300 công thức hoàn chỉnh. Chế độ production không hiển thị DRAFT, không tự duyệt nội dung.

Theo yêu cầu phân bổ lại, backlog hiện gồm 300 mục M0–M2: 293 IDEA và 7 DRAFT. Phân bổ Việt Nam/Hàn/Nhật/Trung/Thái/Ý/Âu Mỹ khác là 150/25/25/25/25/25/25. Toàn bộ 100 mã ban đầu và 7 bản thảo được giữ nguyên; M0–M1 giữ nguyên; M2 thêm 60 món Việt VN91–VN150 từ M3 cũ và đưa 60 món nước ngoài ra ngoài phạm vi. Tổng 700 mục cũ nằm ngoài kế hoạch hiện tại. Xem [backlog 300](Cookora-Recipe-Backlog-300.md) và [JSON](Cookora-Recipe-Backlog-300.json).

## Bằng chứng kiểm tra

- Danh mục ngày 03/11/2026: sửa Discover chỉ dùng SQL, tải đủ các trang và cập nhật bộ lọc sau khi API trả về; bỏ fallback tĩnh gây lúc 1/lúc 50 món Thái. Nhập đủ 50 món Thái và 50 món từ Menu món.docx, giữ nguyên 7 món cũ; sau nhập đối chiếu hướng dẫn và dữ liệu cũ thành công. `npm run check` đạt; 43 kiểm thử đạt. Docker API/frontend đã build và tạo lại. Kiểm tra qua Nginx cổng 8080: 107 ID riêng qua 3 trang; 50 món từ tài liệu khớp hướng dẫn; 5 lần tải liên tiếp đều 51 món Thái (50 mới + 1 cũ). Bằng chứng `.review/live-catalog-verification.json`; [chi tiết nguồn và lỗi](design/catalog-source-fix.md).
- Menu Công cụ được rút gọn theo yêu cầu ngày 03/11/2026: chỉ còn Ước tính chi phí trên desktop/mobile; trạng thái đang chọn chỉ theo route `/ngan-sach`. Đã đồng bộ các script tạo header để không thêm lại các mục cũ.
- Cập nhật 03/11/2026: gỡ tính năng Bảo quản thực phẩm khỏi route, menu desktop/mobile, trang chủ và roadmap; xóa trang, form đồ thừa, logic tham khảo và CSS riêng. Các công cụ ngân sách, khẩu phần và dinh dưỡng tiếp tục dùng các thành phần chung hiện có. Route cũ hiển thị trang không tìm thấy; không thêm redirect ngầm sang tính năng khác.
- Kiểm tra gỡ bảo quản: `npm run check` đạt 36 kiểm thử và build; ba utility tests còn lại về giá/ngân sách đạt. Docker frontend đã build và tạo lại; kiểm tra bundle không còn route/nhãn/CSS của tính năng đã gỡ.
- Cấu hình model ngày 03/11/2026 chuyển sang `gemini-3.7-flash` theo yêu cầu người dùng: `.env` local, `.env.example`, default backend, Docker Compose và kiểm thử endpoint được đồng bộ; key giữ nguyên. Độ trễ thực tế tùy độ dài yêu cầu, câu trả lời và số lần bổ sung hướng dẫn, chưa coi thay model là bằng chứng nhanh hơn.
- Kiểm tra kết nối 3.7 Flash: yêu cầu nhỏ trả HTTP 200, `modelVersion=gemini-3.7-flash` và có nội dung; container API đã tạo lại với biến môi trường mới. Backend typecheck/build và 36 kiểm thử đều đạt. Tài liệu Google xác nhận model ID tại https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-7-flash.
- Cập nhật 03/11/2026: đã mở rộng toàn bộ 7 công thức thực tế trong kho SQL local từ 4 bước lên 7–8 bước riêng cho từng món; có định lượng, sơ chế, mức lửa, thời gian tham khảo và dấu hiệu kiểm tra. Cập nhật trong một transaction, tăng revision lên 2, giữ nguyên ID món/bước cũ, nguyên liệu, khẩu phần và trạng thái DRAFT; bản trước cập nhật lưu trong `.review/recipe-instructions-backup-*.json`. API Docker được kiểm tra lại và trả đúng 7 món với hướng dẫn mới. `npm run check` đạt 36 kiểm thử, TypeScript và build; chưa xác nhận qua nấu thử.
- TypeScript kiểm tra thành công ở backend và frontend; cả hai build thành công.
- 11 unit tests kiểm tra lượng Decimal, đơn vị, matching, unknown và ngày.
- Cập nhật Vertex AI: `npm run check` pass 20 kết quả (gồm test cha), kiểm tra model/endpoint/header, loại tham số sampling cũ, xử lý lỗi và không lộ key trong log/response. `.env` và `.env.example` dùng `VERTEX_LOCATION=global`, `VERTEX_MODEL=gemini-3.8-flash`; key local được giữ nguyên. Docker API đã build và cập nhật.
- Kiểm tra cloud thật: request nhỏ tới Gemini 3.8 Flash trả HTTP 200. Luồng AI qua Nginx cổng 8080, có CSRF, trả HTTP 201 và một món với cấu trúc steps hợp lệ. Đây là kiểm tra kết nối/cấu trúc dữ liệu, không xác nhận nội dung AI đã được nấu thử hoặc duyệt.
- 14 kết quả pass trong integration suite với SQL Server thật (gồm test cha): auth/CSRF, phân quyền tài khoản A/B, tìm món/scale/match, yêu thích, thực đơn, retry/version, đi chợ, quyền biên tập và thu hồi session. Tài khoản test tạm được dọn đúng ID.
- Sau khi giảm scope: `npm run check` thành công; Docker API/frontend đã build và cập nhật local. Integration suite qua Nginx cổng 8080 tiếp tục pass 14/14, gồm kiểm tra backlog 300 mục, số đếm 293 IDEA/7 DRAFT, 15 trang, lọc và loại các mục ngoài phạm vi.
- Sau khi phân bổ lại 150 món Việt/150 món nước ngoài: `npm run check` và 14/14 integration tests thành công trên bản Docker local đã cập nhật. API xác nhận 150 mục VN, 25 mục mỗi nhóm KR/JP/CN/TH/IT/WE, 149 IDEA Việt, có VN150 thuộc M2 và không có VN151.
- SQL, API và Nginx/React đã build và khởi động qua Docker; migration và seed job hoàn tất. Trang chủ và readiness endpoint qua Nginx trả HTTP 200.
- `npm audit --omit=dev` báo 0 lỗ hổng tại thời điểm kiểm tra; đây là kết quả dependency audit, không thay thế kiểm thử bảo mật.
- UI v2 đã áp dụng trên toàn bộ frontend: font Plus Jakarta Sans tự host, palette porcelain/olive/cam/lime, homepage nhập nguyên liệu thật, animation có reduced-motion và responsive 320–1440px. Đã kiểm tra ảnh chụp, 11 luồng E2E với API/SQL thật, kiểm tra Axe các trang/trạng thái chính và gọi AI từ UI trả HTTP 201. `npm run check` thành công với 21 kết quả test; Docker frontend đã cập nhật. Chi tiết và bằng chứng trong [UI v2](design/frontend-ui-v2-implementation.md).

## Chưa triển khai

Email verification/reset, admin MFA/audit, workflow sửa/duyệt/xuất bản và phiên bản recipe bất biến; Azure TTS/worker; kho nguyên liệu/FEFO/nhắc bảo quản; Eat Fit/dinh dưỡng; giá/ngân sách; upload ảnh; monitoring, backup/restore và cấu hình production. Swagger local có các route, chưa phải hợp đồng OpenAPI đầy đủ cho mọi body/error. Chưa kiểm chứng tải thư viện 10.000 công thức hoặc đa instance.

## Chuẩn bị deploy miễn phí ngày 03/11/2026

Theo lựa chọn dự án cá nhân của người dùng, đã thêm [hướng dẫn Vercel + Render + Azure SQL Free](Deploy-Free-Vercel-AzureSQL.md), mẫu `render.yaml`, Dockerfile runtime riêng, mẫu rewrite Vercel, SQL tạo contained users và wrapper cloud migration. Backend có tùy chọn phục vụ React cùng origin và cấu hình số proxy hop; production bắt buộc SQL TLS được xác thực. Không đổi Compose local hoặc duyệt nội dung tự động.

`npm run check` thành công với 85 kết quả test pass, gồm HTTP test SPA/API/asset và chống trả index cho API không tồn tại. Lần chạy đầu bị sandbox chặn localhost (EACCES); chạy lại với quyền thực thi phù hợp đã thành công. Đây là kiểm tra local, chưa phải kiểm tra Vercel/Render/Azure thật. Không có cloud resource hoặc URL public mới được tạo trong tác vụ này. Chưa xác minh cloud firewall, cookie qua rewrite, Google callback trên domain thật hoặc migration vào Azure. Các bài DRAFT vẫn cần duyệt, đăng ký mật khẩu production vẫn bị chặn và AI cloud mặc định không cấu hình để giữ ngân sách $0.

Image `cookora-render-free:check` đã build thành công bằng Dockerfile mới. Smoke test chạy NODE_ENV=production, credential giả, container không có mạng ngoài: SPA `/`, `/co-gi-nau-nay`, `/cong-thuc` trả HTML 200; API live trả JSON với demo=false; API không tồn tại trả JSON 404; cookie CSRF có tiền tố __Host-, Secure và HttpOnly. Kiểm tra này không kết nối SQL và không xác nhận cookie qua proxy Vercel. Đã sửa việc chép dependency NestJS nằm trong backend/node_modules; container thử nghiệm được dọn sau kiểm tra. Prisma schema/config được validate thành công. Bằng chứng build/check trong `.review/render-image-build.log` và `.review/deploy-free-check.log`.

## Mở ứng dụng

- Node dev: http://localhost:5173
- Docker đầy đủ: http://localhost:8080
- Hướng dẫn khởi động, tài khoản và quyền biên tập: [README](../README.md).

Đây là stack local development dùng SQL Server Developer edition. Các gate production trong Master Plan vẫn cần hoàn thiện trước khi mở public.
