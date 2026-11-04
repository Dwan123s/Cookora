# Cookora — đồng bộ Trang chủ và Header

Ngày kiểm tra: 03–04/11/2026. Chỉ thay đổi local, không push hoặc deploy.

## Kiểm kê Trang chủ trước và sau

Giữ nguyên 9 section và thứ tự:

1. Hero: tiêu đề, mô tả, hai CTA, carousel ba món, thẻ ghi chú, các giá trị nổi bật.
2. Bảy công cụ nhanh và đường dẫn hiện tại.
3. Gợi ý món ngon cho bạn: bốn công thức từ catalog thật.
4. Gợi ý món ngon lướt là thích: carousel vô hạn, tự động và điều khiển thủ công.
5. Khám phá ẩm thực theo quốc gia: bảy quốc gia/khu vực và số lượng thực.
6. Có gì nấu nấy và Lên thực đơn tuần: giữ nhập nguyên liệu, chip và lịch tuần.
7. Eat Fit và Ước tính chi phí.
8. Mẹo vào bếp: giữ bốn chủ đề hiện tại.
9. Hôm nay bạn muốn nấu món gì?: giữ CTA cuối trang.

Footer và chatbot gấu đầu bếp được giữ lại. Hai section số 4 và 9 vẫn có đầy đủ dù ảnh tham chiếu mới không hiển thị chúng.

## Giao diện Trang chủ

- Bám ảnh tham chiếu mới: cream ấm, forest green, sage nhẹ, điểm cam nhỏ; font Be Vietnam Pro và Plus Jakarta Sans cùng hệ đang dùng ở Khám phá.
- Giới hạn nội dung 1200px; hero hai cột, ảnh món thật, ghi chú màu giấy; chỉ giữ vài nét trang trí có chủ đích.
- Bảy công cụ với nền icon pastel, recipe card đồng bộ Khám phá, bảy thẻ quốc gia cùng hàng trên desktop, utility panel sage/cream và hàng tính năng gọn.
- Ảnh món lấy từ trường dữ liệu catalog hiện tại; không gán ảnh từ mockup vào Home.
- Mobile chuyển hero thành một cột; ghi chú nằm dưới mép ảnh để tránh che tên món và nút carousel.

## Nguyên nhân Header không đồng nhất

Project đã có một Header dùng chung. Nguyên nhân thực tế là nhiều stylesheet của từng trang ghi đè cùng Header bằng selector global và `body:has(...)`: chiều rộng container, logo, padding, menu, action và sticky positioning khác nhau. Header còn nằm trong nhánh layout điều kiện, khiến vòng đời không ổn định khi đổi sang layout xác thực. Quy tắc ẩn scrollbar toàn cục làm việc so sánh viewport khó ổn định.

Refactor chính component dùng chung, dùng namespace `cookora-*`, loại bỏ 184 selector Header cũ ở các stylesheet. Header nằm ngoài vùng transition theo route, giữ instance; không tạo Header riêng cho từng page. Font menu được preload; logo, icon và tài khoản có kích thước cố định. `scrollbar-gutter: stable` giữ chỗ scrollbar, không khóa scroll.

Header desktop cao 68px, max-width 1280px, pill radius 9999px, ba vùng có hai cột biên bằng nhau. Active pill dùng spring của Motion có sẵn. Khi cuộn, Header dịch lên 4px, nền kính thu nhẹ; nội dung và kích thước không thay đổi. Có xử lý reduced motion. Hành vi thu nhẹ được đối chiếu trực tiếp với [vuphamstudio.com](https://www.vuphamstudio.com/).

## Kiểm tra

Vòng route thực tế: `/` → `/cong-thuc` → `/co-gi-nau-nay` → `/thuc-don` → `/eat-fit` → `/`.

Tại viewport 1536px, cùng trạng thái chưa cuộn:

| Vùng | x | y | rộng | cao |
| --- | ---: | ---: | ---: | ---: |
| Header | 120.5 | 16 | 1280 | 68 |
| Logo | 140.5 | 28 | 154 | 44 |
| Navigation | 450.5 | 29 | 620 | 42 |
| Search | 1150.5 | 32 | 32 | 36 |
| Favorites | 1188.5 | 32 | 32 | 36 |
| Notifications | 1226.5 | 32 | 32 | 36 |
| Account | 1268.5 | 31 | 112 | 38 |

Sai lệch tối đa các vùng tương ứng qua sáu lần chuyển route: **0px**. Header instance giữ nguyên. Khi cuộn, y đổi từ 16 sang 12 như thiết kế; kích thước và vị trí ngang giữ nguyên.

Vòng route mobile 390px cũng có sai lệch **0px**. Header 351×68px tại x=12, y=12. Kiểm tra bố cục guest và account tên dài bằng fixture Header cô lập trên desktop/mobile; không đăng nhập giả hoặc thay session ứng dụng thật. Đây là kiểm tra trình bày hai trạng thái, không thay thế kiểm thử đăng nhập end-to-end.

Home kiểm tra tại 1536, 1280, 1024, 768, 390 và 320px: đủ 9 section, 7 công cụ, 32 thẻ DOM của reels vô hạn, không tràn ngang, không có ảnh tải lỗi trong bộ QA. Đã thao tác nút slide, nút lướt reels và quan sát tự động cuộn. Chatbot dùng nguyên component và mascot hiện tại, cố định góc phải dưới.

Đối chiếu TypeScript AST với Home gốc: giữ 52 text node, 11 binding đích điều hướng và 17 handler; phần khai báo dữ liệu/hook trước JSX không thay đổi. `CurvedReelsCarousel.tsx` không có diff.

`npm run build -w frontend` thành công (TypeScript và Vite). `git diff --check` không có lỗi whitespace. Vite còn cảnh báo bundle lớn hơn 500kB, không chặn build.

## Giới hạn kiểm tra dữ liệu

API catalog local từng gặp SQL timeout; kiểm tra đọc DMV thấy chờ `RESOURCE_SEMAPHORE` (bộ nhớ thực thi truy vấn), không phải layout frontend. Trong lúc chờ, đã kiểm tra hình ảnh bằng chính các component sản phẩm với catalog đọc trực tiếp, chỉ đọc từ SQL thật trong fixture tạm. Không tạo dữ liệu món giả, không thêm fallback hay đổi nguồn dữ liệu của ứng dụng. Fixture đã gỡ sau kiểm tra.

Kiểm tra cuối: reload trực tiếp `/` đã tải thành công catalog qua API thật, hiển thị đủ 9 section, không có ảnh lỗi hoặc tràn ngang. Đã thay toàn bộ ảnh Home đính kèm bằng ảnh chụp trực tiếp ứng dụng thật tại desktop 1536px, tablet 768px và mobile 320px. Lần tải API này vẫn chậm; chưa kết luận vấn đề hiệu năng SQL đã được giải quyết.

Có thay đổi backend xuất hiện đồng thời trong workspace từ công việc khác; không chỉnh sửa hoặc hoàn tác chúng trong nhiệm vụ giao diện này.

## File chính và bằng chứng

- `frontend/src/pages/Home.tsx`: class giao diện, aria label và chi tiết trang trí.
- `frontend/src/home-alignment.css`: giao diện Home và responsive.
- `frontend/src/cookora-tokens.css`: token thị giác dùng chung.
- `frontend/src/layout.tsx`, `frontend/src/island-header.css`, `frontend/src/App.tsx`, `frontend/index.html`: Header chung, vị trí layout và font.
- `frontend/src/main.tsx`: import các stylesheet.
- Các stylesheet page/reference: gỡ rule Header ghi đè; Khám phá và Có gì nấu nấy giữ giao diện đã đồng bộ.
- [Số đo chi tiết](header-navigation-metrics.json).
- [Desktop toàn trang](home-reference-desktop.jpg), [desktop phần đầu](home-reference-cover.jpg), [tablet](home-reference-tablet.jpg), [mobile 320px](home-reference-mobile.jpg).

Các ảnh Home cuối cùng là ảnh trực tiếp tại `http://127.0.0.1:5173/`. Production entry không import fixture.
