# Cookora UI v2 — bản đã triển khai

Ngày: 31/10/2026. Áp dụng concept “Nguyên liệu trước” vào frontend hiện có, không tạo một landing page tách rời ứng dụng.

## Thiết kế và hành vi

- Sans-serif Plus Jakarta Sans Variable, có subset tiếng Việt, Latin và Latin Extended; tự phục vụ từ `/fonts/`, không gọi Google Fonts. Kèm giấy phép OFL.
- Nền porcelain, chữ olive, CTA cam đỏ, điểm nhấn lime. Heading lớn, thẻ món bất đối xứng ở homepage, khoảng trắng và phân cấp rõ ràng.
- Homepage nhập/chọn nguyên liệu thật, thay khẩu phần và chuyển sang matcher với query string; tab tìm kiếm chuyển đến thư viện công thức thật. Gọi AI là thao tác riêng, có trạng thái chờ/lỗi/thử lại.
- Đồng bộ khám phá, matching/AI, chi tiết, cooking mode, yêu thích, đăng nhập/đăng ký, thực đơn, đi chợ, biên tập, roadmap và trạng thái rỗng/lỗi/loading.
- Motion được tải phần animation riêng qua LazyMotion; chuyển trang, reveal nhẹ, phản hồi khi bấm. Native View Transitions giữa thẻ món và chi tiết trên trình duyệt hỗ trợ. Tôn trọng `prefers-reduced-motion`; nội dung không phụ thuộc animation mới nhìn thấy.
- Header responsive và menu có nhãn; bottom navigation trên mobile. Focus ring, skip link, nhãn form/dialog, nút hiện mật khẩu, bảng biên tập cuộn bằng bàn phím, style in danh sách đi chợ.
- Đánh dấu đã mua phản hồi ngay; nếu API lỗi khôi phục cache và tải lại trạng thái thật. Không thay đổi kiểm tra owner/version phía server.

## Ảnh và dữ liệu

Bảy ảnh món ăn gốc được tạo bằng built-in image_gen và lưu tại `frontend/public/images/`. Xem [asset và prompt](frontend-ui-v2-assets.md). Hero có WebP 640/1200px và srcset. Các ảnh thẻ khác là WebP 900px, lazy load, khai báo kích thước.

Ảnh AI chỉ thay ảnh của đúng bảy fixture DRAFT revision 1 còn nguyên credit seed. Công thức sửa/duyệt dùng ảnh và credit từ server. UI ghi rõ ảnh AI minh họa, bản thảo chưa nấu thử. Không biến backlog 300 đề tài thành 300 công thức hoàn chỉnh; giữ phân bổ 150 món Việt/150 món nước ngoài.

## Kiểm tra thực tế

- `npm run check`: typecheck cả hai workspace, build backend/frontend, 21 kết quả test thành công, gồm test cha.
- Sau sửa tương phản cuối: frontend TypeScript và production build thành công. CSS 79.31 kB / 16.70 kB gzip; JS chính 409.73 kB / 129.18 kB gzip; motion features riêng 47.03 kB / 18.34 kB gzip. Đây là kích thước build, chưa phải điểm Lighthouse hoặc Core Web Vitals thực địa.
- 11 kiểm tra E2E qua Edge headless với API/SQL thật: nguyên liệu/khẩu phần, tìm món, đăng ký/hiện mật khẩu, yêu thích, scale/add meal, shopping/purchased persistence, quyền editor/backlog 300, mobile menu, lỗi AI/thử lại, font/reduced motion, layout đăng nhập ở 320/375/768/1440px. Tài khoản test UUID riêng đã được dọn đúng ID.
- Axe WCAG 2A/2AA/2.1AA: tám trạng thái công khai sau chỉnh sửa và tám trạng thái homepage/favorites/dialog/planner/shopping/editor trước lượt chỉnh màu cuối không còn violation tự động. Đây không phải chứng nhận đầy đủ khả năng tiếp cận.
- Gọi AI thật từ form UI trả HTTP 201, hiển thị thẻ món và bước nấu. Kiểm tra kết nối/hình dạng dữ liệu, không xác nhận chất lượng món.
- Docker frontend đã build và cập nhật, không khởi động lại SQL/API. Kết quả kiểm tra bản phục vụ cổng 8080, ảnh local và responsive trong [báo cáo](frontend-ui-v2-checks.json).

Ảnh chụp bản chạy thật: [desktop](homepage-v2-desktop-implemented.png), [mobile](homepage-v2-mobile-implemented.png).

## Tệp chính

`frontend/src/redesign.css`, `pages/Home.tsx`, `motion.tsx`, `motion-features.ts`, `recipe-media.ts`, `App.tsx`, `layout.tsx`, `shared.tsx`, các page hiện có, `frontend/public/fonts/`, `frontend/public/images/`, `frontend/index.html`.

Nguồn kỹ thuật: [Motion LazyMotion](https://motion.dev/docs/react-lazy-motion), [Motion accessibility](https://motion.dev/docs/react-accessibility), [Fontsource Plus Jakarta Sans](https://fontsource.org/fonts/plus-jakarta-sans), [tối ưu web fonts](https://web.dev/articles/font-best-practices). Nghiên cứu đối thủ và định hướng trong [research v2](competitive-research-and-homepage-v2.md).
