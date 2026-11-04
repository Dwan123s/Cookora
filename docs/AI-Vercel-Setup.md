# Cấu hình AI trên Vercel — 03/11/2026

Theo yêu cầu người dùng, dùng lại Vertex AI Express đang cấu hình local; không tạo tài khoản AI hoặc chuyển nhà cung cấp. Người dùng đã xác nhận cho phép lưu key hiện có vào Vercel secrets và gửi yêu cầu tới Google. Không ghi key vào source, log hoặc frontend.

Các biến môi trường **production** đã được lưu dạng sensitive vào đúng project Cookora:

- `VERTEX_API_KEY`: key hiện có, giá trị được ẩn.
- `VERTEX_MODEL`: `gemini-3.7-flash`.
- `VERTEX_LOCATION`: `global`.

Script `scripts/configure-vercel-ai.mjs` kiểm tra project ID, thử sinh nội dung ngắn bằng key/model hiện có rồi gửi giá trị qua stdin của Vercel CLI. Script chỉ cập nhật ba biến AI, không thay database, OAuth hoặc CSRF secret. Không chạy lại script cấu hình môi trường tổng chỉ để đổi AI.

`vercel.json` bật Fluid Compute và tăng `maxDuration` từ 60 lên 180 giây để bao gồm bước đọc catalog và yêu cầu AI; luồng gợi ý món có thể gọi bổ sung một lần khi hướng dẫn chưa đủ chi tiết. Đây là giới hạn thời gian chạy, không phải cam kết AI trả lời trong 180 giây. [Cấu hình thời gian chạy Vercel](https://vercel.com/docs/functions/configuring-functions/duration).

Backend gọi global endpoint Google bằng header `x-goog-api-key`, không đặt key trong URL. [Tài liệu Express mode](https://docs.cloud.google.com/gemini-enterprise-agent-platform/reference/express-mode/api-reference).

Hai endpoint được cấu hình:

- `POST /api/v1/ai/suggest-recipes`: gợi ý từ nguyên liệu/hội thoại, chọn món trong catalog và sinh món mới có hướng dẫn.
- `POST /api/v1/ai/suggest-budget`: chọn món thật trong catalog, ước tính giá, tổng chi phí và danh sách đi chợ.

Các script cấu hình môi trường bên dưới thuộc lần thiết lập ban đầu. Các lần phát hành mã tiếp theo dùng [GitHub/Vercel Git Integration](Git-Deployment.md), không deploy từ CLI. Chỉ chạy lại cấu hình AI khi chủ động thay key hoặc model.

Kiểm tra sau thay đổi đã review:

```powershell
npm run check
node scripts/build-vercel.mjs
git push origin main
# Sau khi deployment của commit này trên Vercel đạt READY:
$env:VERCEL_AI_VERIFY='true'
node scripts/verify-vercel-ai.mjs
```

Acceptance gọi HTTPS public với cookie/CSRF như frontend, kiểm tra nội dung món mới, số bước, ID món thật, tổng tiền và danh sách đi chợ. Script không tạo hoặc sửa dữ liệu người dùng. Bằng chứng được lưu ở `.review/vercel-ai-configure.log`, `.review/vercel-ai-build.log`, `.review/vercel-ai-deploy.log` và `.review/vercel-ai-acceptance.log`.

Phạm vi phí và hạn mức thuộc tài khoản Google chứa key hiện tại; cấu hình này không tạo một gói AI miễn phí riêng hoặc thay đổi billing Google. Rate limit hiện có của API theo từng instance, không phải hạn mức chi tiêu toàn tài khoản. Khi nhà cung cấp trả 429, API hiển thị thông báo hết hạn mức/quá tải. Chi phí món ăn AI đưa ra là ước tính, không phải báo giá cửa hàng.

## Kết quả thực tế

`npm run build` thành công; frontend build hoàn tất trong 8.07 giây. Key Vertex không xuất hiện trong frontend JS/CSS/HTML/map sau build.

Deployment AI `dpl_5ajPbuEEUhM2HsSxxh8giXwx5ZZf` đã READY và alias về https://cookora-rose.vercel.app. Đây là deployment mới hơn bản xuất bản danh mục trước đó.

Output cấu hình:

```text
PASS: existing Vertex credentials and gemini-3.7-flash return generated text (HTTP 200).
Configured production VERTEX_API_KEY (value hidden).
Configured production VERTEX_MODEL (value hidden).
Configured production VERTEX_LOCATION (value hidden).
```

Output acceptance qua HTTPS public:

```text
PASS: public AI recipes HTTP 201, 1 generated dish(es) with >=5 detailed steps, 0 valid catalog selection(s), 24006ms.
PASS: public AI budget HTTP 201, complete meal, real catalog recipes, cost totals and aggregated shopping list, 11617ms.
PASS: Vercel → Vertex AI and Neon end to end. No user data was created or modified.
```

Lần gợi ý nguyên liệu này tạo một món mới và không chọn món catalog; luồng ngân sách đã xác minh các ID món được chọn tồn tại qua API thật. Thời gian trên là số đo của hai request kiểm tra, không phải cam kết độ trễ. Lần probe đầu giới hạn 64 output tokens không trả text; tăng lên 1024 cho probe đã trả text thành công, không đổi giới hạn token của hai endpoint ứng dụng.
