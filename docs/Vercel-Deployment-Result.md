# Cookora trên Vercel + Neon — 03/11/2026

Web public: **https://cookora-rose.vercel.app**.

Frontend React, ảnh và NestJS API đều được phục vụ trên Vercel. API kết nối Neon PostgreSQL branch production bằng app role `cookora_app`, pool giới hạn 3 connections, kiểm tra certificate TLS. Owner connection chỉ dùng migration local. Không tạo dịch vụ Render. Sau lần triển khai nội dung, người dùng yêu cầu và xác nhận cho phép cấu hình key Vertex AI hiện có lên Vercel; xem [cấu hình AI](AI-Vercel-Setup.md).

## Kết quả xuất bản nội dung

Theo yêu cầu rõ ràng của người dùng “full luôn không nháp gì hết”, script `backend/scripts/publish-document-catalog.ts` đã đối chiếu đủ 419 slug và nguồn tài liệu, sao lưu trạng thái trong `.review/catalog-publication-*.json`, rồi chuyển DRAFT → APPROVED trong một transaction. Không sửa dữ kiện, nguyên liệu, thời gian hoặc dữ liệu tài khoản. Không bật cơ chế hiển thị bài DRAFT trên production.

Output thực tế trong `.review/neon-publish-catalog.log`:

```text
{"changed":419,"published":419,"scope":"419 source-document recipes","factsAndTimingUnchanged":true}
```

Có 365 ảnh nguồn và 54 món dùng ảnh giữ chỗ. Trạng thái xuất bản không khẳng định tất cả công thức đã được nấu thử; thông tin thời gian ước tính vẫn giữ đúng dữ liệu nguồn.

## Cấu hình triển khai

- Project Vercel `cookora`, scope `dwans-projects-53613816`, Node.js 24, region Singapore `sin1`.
- `vercel.json` build cả frontend/backend và bundle NestJS cho serverless; `/api/*` chuyển tới `api/index.js`, các route React về `index.html`.
- `backend/src/vercel.ts` khởi tạo và tái sử dụng Nest app; `vercel-request.ts` loại metadata rewrite khỏi query trước validation.
- `scripts/build-vercel.mjs` bundle NestJS ESM thành handler CJS để tương thích loader Vercel; Prisma client được generate khi build.
- Secrets được cấu hình trong Vercel production environment. `.env`, `.neon`, `.review` và credentials không đưa vào deployment source.
- `APP_ORIGIN=https://cookora-rose.vercel.app`; CSRF secret riêng cho cloud, cookie production Secure/HttpOnly, session lưu trong Neon. Đăng ký mật khẩu public vẫn tắt cho đến khi hoàn tất xác minh email.

Deploy tiếp từ project root đã link đúng tài khoản:

```powershell
npm run check
npx vercel@latest deploy --prod --scope dwans-projects-53613816
```

Migration database là bước riêng, không tự chạy khi mỗi Vercel function khởi động. Các thay đổi dữ liệu đã xuất bản được API đọc từ Neon; không cần redeploy frontend chỉ để đổi trạng thái bài.

## Bằng chứng kiểm tra

`npm run check` trong `.review/vercel-final-check.log`:

```text
ℹ tests 91
ℹ pass 91
ℹ fail 0
```

`npm run build` hoàn tất backend/frontend, `.review/vercel-last-build.log`:

```text
✓ built in 8.36s
```

CLI deployment trong `.review/vercel-deploy-acceptance-fix.log`:

```text
readyState: READY
Production URL: https://cookora-rose.vercel.app
```

Deployment ID: `dpl_DPDYY8QqHmyb5RHJ7iQLfpZp1AkZ`.

Acceptance được chạy qua HTTPS public, không chỉ localhost:

```powershell
$env:VERCEL_SETUP_VERIFY='true'
npm exec -w backend -- tsx scripts/verify-vercel-live.ts
```

Output trong `.review/vercel-public-acceptance.log`:

```text
PASS: 419 unique published recipes across all pages, recipe detail/search and sampled source images.
PASS: Vercel HTTPS pages/assets, API routing, Neon readiness, secure CSRF and production content gate (419 approved recipes).
PASS: published recipe favorite, meal entry, aggregated shopping list and purchased state on Vercel/Neon.
PASS: public Google OAuth start uses the Vercel callback and PKCE.
PASS: Vercel cookie sessions → Neon, CSRF-protected plan write/read, cross-account denial and logout; Google config enabled=true.
Google interactive consent/callback is not tested by fixture sessions.
Cleanup: removed only this run's Vercel acceptance fixture accounts/sessions/plans.
```

Script tạo account/session kiểm thử trực tiếp trong Neon, chỉ để kiểm tra cookie và dữ liệu riêng tư; không dùng fixture để tuyên bố đã kiểm tra Google consent thật. Account/session/plan/favorite/shopping fixture đã được dọn.

## Phần cần lưu ý

Google Cloud Console → OAuth client → **Authorized redirect URIs** phải có chính xác:

```text
https://cookora-rose.vercel.app/api/v1/auth/google/callback
```

Nếu consent screen ở Testing, thêm email người thử vào Test users. Cấu hình backend và bước OAuth start đã đạt; chưa thao tác/kiểm tra consent và callback bằng Google thật. Không gửi client secret hoặc mã đăng nhập vào chat.

`cookora.vercel.app` đang gắn với project khác và tài khoản này không có quyền quản lý. Không thể nhận địa chỉ đó; domain của deployment hiện tại là `cookora-rose.vercel.app`.

Các lỗi triển khai ban đầu đã sửa: route API catch-all 404, NestJS ESM loader và query metadata gây 400. Các kiểm tra public phía trên đã pass sau sửa.

Chưa kiểm tra giao diện qua trình duyệt tự động vì quyền điều khiển trình duyệt local đang tắt. Build còn cảnh báo chunk frontend lớn hơn 500 kB; dependency audit gần nhất còn 2 moderate trong uuid/gaxios của Google auth, không có high/critical. Chưa benchmark tải; rate limit hiện theo instance. AI đã được cấu hình riêng theo yêu cầu tiếp theo của người dùng; phí/hạn mức Google không được thay đổi bởi bước cấu hình này.
