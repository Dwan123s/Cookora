# Kết quả cấu hình Neon thật — 03/11/2026

**Cập nhật sau triển khai Vercel:** 419 công thức đã xuất bản APPROVED theo yêu cầu mới nhất của người dùng, không còn nhãn bản nháp trên public. Các dòng DRAFT trong kết quả nhập ban đầu dưới đây là lịch sử. [Kết quả Vercel và acceptance 419 bài](Vercel-Deployment-Result.md).

Project `polished-bonus-47222343`, org `org-cool-glade-58846142`, branch `production` đã được liên kết bằng Neon CLI 8.17.1. PostgreSQL là dịch vụ duy nhất khai báo/sử dụng; không thêm Neon Auth, Functions, AI Gateway hoặc Storage.

## Các lệnh đã chạy

```text
npm i -g neon@latest
neon init -y --org-id org-cool-glade-58846142 --project-id polished-bonus-47222343 --branch production --services postgres
neon login
neon config plan
neon deploy
```

`init` ban đầu ghi link offline do CLI chưa có credential. Người dùng đã hoàn tất OAuth trên browser, sau đó plan/deploy xác minh đúng branch thật. Output deploy:

```text
Applying to branch production (br-lingering-grass-azrz8y4j)
No changes — branch production already matches the policy.
Utilized services: Postgres
Pulled 3 Neon variables into .env
  Postgres DATABASE_URL, DATABASE_URL_UNPOOLED
  Branch NEON_BRANCH
```

CLI tạo `neon.ts`, thêm @neon/config và @neon/env, cài plugin/skills Neon. Đã áp dụng [neon skill](C:/Users/reiko/.codex/plugins/cache/plugins-cli/neon-postgres/3.0.0/skills/neon/SKILL.md) và [neon-postgres skill](C:/Users/reiko/.codex/plugins/cache/plugins-cli/neon-postgres/3.0.0/skills/neon-postgres/SKILL.md): giữ ORM/driver hiện có, pooled URL cho ứng dụng, direct URL cho migration, kiểm tra migration ở nhánh tách trước production.

## Ứng dụng đã nối vào database

- Prisma + pg qua @prisma/adapter-pg; không đổi framework hoặc cơ chế tài khoản hiện có.
- Prisma config nhận DATABASE_URL_UNPOOLED do CLI pull, đồng thời vẫn hỗ trợ DIRECT_URL.
- Tài khoản runtime `cookora_app` chỉ đọc/ghi bảng ứng dụng, không có quyền CREATE trong schema public. URL riêng được lưu kín ở NEON_RUNTIME_DATABASE_URL; mã ưu tiên URL này thay cho owner DATABASE_URL do CLI quản lý. Vì vậy lần pull sau không vô tình nâng quyền API lên owner.
- DATABASE_PROVIDER trong .env đã chọn postgresql. .env.local được đọc trước .env nếu sau này CLI viết vào đó.
- Các biến khác trong .env trước init được giữ nguyên. Bản sao trước init nằm trong .review/neon-setup-backup, không đưa lên Git hoặc deployment.
- Đã áp dụng 2 migration PostgreSQL lên production và nhập 419 món DRAFT bằng seed thêm-mới, không tự duyệt. Không xóa/di chuyển dữ liệu SQL Server local, không tự chuyển tài khoản hay thực đơn local sang Neon.

## Bằng chứng chạy thật

Nhánh kiểm tra `cookora-setup-check-20261103` tách từ production: migration pass, 10 kết quả integration pass (gồm test cha), đăng ký/login/logout/CSRF, catalog, Google identity persistence (không gọi Google), portion scaling, matching, favorites, private planner, shopping persistence đều đạt. Chỉ các tài khoản fixture của test được dọn. Nhánh thử được xóa sau khi hoàn tất để không giữ compute phụ.

Build và unit/HTTP tests sau khi nối Neon:

```text
npm run check
tests 89
pass 89
fail 0
> @cookora/backend build
> tsc -p tsconfig.build.json
> @cookora/frontend build
> tsc --noEmit && vite build
✓ built in 7.49s
```

Sau khi khởi động ứng dụng và nối Neon production bằng app role, lệnh xác minh toàn tuyến:

```text
NEON_SETUP_VERIFY=true
npm exec -w backend -- tsx scripts/verify-neon-live.ts

PASS: running frontend → Vite /api proxy → NestJS → Neon production; 419 source recipes; app role has no DDL.
PASS: Neon-backed sessions, private favorites, meal entry, shopping persistence and logout through the running app.
Cleanup: only this verification run's fixture accounts/rows removed.
```

Script này có guard đúng linked project/branch và chỉ chạy với local development server; nó tạo hai fixture account @example.invalid, kiểm tra dữ liệu của riêng các account đó rồi dọn đúng ID. Không chạy test loopback cũ trực tiếp vào production cloud.

Log chi tiết nằm trong .review/neon-deploy.log, neon-cloud-e2e.log, neon-production-migrate.log, neon-runtime-setup.log, neon-production-seed.log, neon-production-live-e2e.log và neon-setup-final-check.log. Các file env/backup chứa secret không được đính kèm hoặc xuất bản.

## Những việc chưa xác nhận hoặc đã gặp

- Lần đầu chạy cloud integration bị hệ thống auto-review chặn do hết hạn mức xét duyệt, không phải phán định thao tác không an toàn. Sau khi người dùng yêu cầu tiếp tục, lần chạy lại được thực hiện và pass.
- Chưa gọi lại consent/callback Google thật trong kiểm thử này. Google OAuth domain public cần được đăng ký đúng khi có hosting.
- 419 công thức vẫn DRAFT; production lọc chỉ APPROVED. Không tự đổi gate để làm đầy catalog public.
- Neon deploy chỉ quản lý các dịch vụ khai báo trong neon.ts, ở đây là Postgres. Nó chưa tự host giao diện React/API NestJS. Yêu cầu triển khai Vercel tiếp theo được thực hiện riêng.
- Build có cảnh báo chunk frontend lớn hơn 500 kB; không phải lỗi build. Hai cảnh báo runtime audit moderate uuid/gaxios của nhánh Google auth đã tồn tại ở lần kiểm tra trước; chưa nâng major dependency chỉ để ép hết cảnh báo.
