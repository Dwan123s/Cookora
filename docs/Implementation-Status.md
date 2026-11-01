# Trạng thái triển khai Cookora

Cập nhật: 31/10/2026. Bản MVP local đầu tiên, theo phạm vi người dùng đã yêu cầu tiếp tục xây dựng hệ thống. Đây là trạng thái mã và kiểm tra thực tế, bổ sung cho Master Plan.

## Đã chạy được

React 19, TypeScript, Tailwind CSS; NestJS 12; Prisma 7 với SQL Server 2022. Có thể chạy API/frontend bằng Node hoặc toàn bộ stack bằng Docker Compose. SQL dùng volume bền vững; migration chạy bằng tài khoản riêng, runtime dùng app login đọc/ghi.

| Luồng | Trạng thái |
| --- | --- |
| Khám phá món | Tìm tên và alias nguyên liệu, nhóm ẩm thực, phân trang; lọc thời gian chỉ dùng dữ liệu VERIFIED |
| Chi tiết và cooking mode | Đổi khẩu phần bằng Decimal; từng bước; giọng Việt nếu trình duyệt có sẵn |
| Có gì nấu nấy | Khớp nguyên liệu hoặc lượng, quy đổi g/kg và ml/l; phân biệt thiếu và chưa rõ lượng |
| AI từ nguyên liệu nhập tự do | Vertex AI Express với `gemini-3.8-flash`; API key chỉ ở backend, gửi qua header; gợi ý AI chưa qua biên tập/nấu thử |
| Tài khoản | Đăng ký/đăng nhập local, Argon2id, session trong SQL, cookie HttpOnly, CSRF và Origin |
| Yêu thích | Dữ liệu riêng cho từng tài khoản |
| Thực đơn tuần | Chọn ngày/bữa/khẩu phần; thêm/xóa; kiểm tra owner, version và request retry |
| Danh sách đi chợ | Cộng nguyên liệu, đánh dấu đã mua; kiểm tra owner/version; chặn tạo lại khi cần xử lý dấu đã mua |
| Biên tập | Chỉ đọc, tìm/lọc/phân trang backlog 300 đề tài; phân quyền EDITOR/ADMIN |

## Nội dung

Có 7 công thức DRAFT trong cơ sở dữ liệu demo và backlog 300 đề tài riêng. Các công thức demo chưa nấu thử; ảnh là ảnh minh họa. Không xem backlog là 300 công thức hoàn chỉnh. Chế độ production không hiển thị DRAFT, không tự duyệt nội dung.

Theo yêu cầu phân bổ lại, backlog hiện gồm 300 mục M0–M2: 293 IDEA và 7 DRAFT. Phân bổ Việt Nam/Hàn/Nhật/Trung/Thái/Ý/Âu Mỹ khác là 150/25/25/25/25/25/25. Toàn bộ 100 mã ban đầu và 7 bản thảo được giữ nguyên; M0–M1 giữ nguyên; M2 thêm 60 món Việt VN91–VN150 từ M3 cũ và đưa 60 món nước ngoài ra ngoài phạm vi. Tổng 700 mục cũ nằm ngoài kế hoạch hiện tại. Xem [backlog 300](Cookora-Recipe-Backlog-300.md) và [JSON](Cookora-Recipe-Backlog-300.json).

## Bằng chứng kiểm tra

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

## Mở ứng dụng

- Node dev: http://localhost:5173
- Docker đầy đủ: http://localhost:8080
- Hướng dẫn khởi động, tài khoản và quyền biên tập: [README](../README.md).

Đây là stack local development dùng SQL Server Developer edition. Các gate production trong Master Plan vẫn cần hoàn thiện trước khi mở public.
