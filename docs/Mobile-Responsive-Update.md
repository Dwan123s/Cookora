# Cập nhật mobile — 03/11/2026

Phạm vi: điều hướng dùng chung, thư viện công thức, chi tiết món, thực đơn tuần, form và khung AI. Giữ hệ thống React/Vercel/Neon và dữ liệu người dùng hiện có.

- Header chuyển sang menu thu gọn dưới 1280px để tablet không phải chứa cả navigation desktop và toàn bộ icon. Dưới 640px dùng nút đăng nhập biểu tượng, đưa yêu thích và tên tài khoản vào menu; ẩn avatar trên thanh đầu trang để vẫn đủ chỗ khi đã đăng nhập. Menu có trạng thái mở/đóng, đóng sau chọn link, phím Escape trả focus về nút menu và giới hạn chiều cao theo viewport.
- Khám phá: ô tìm kiếm/nút submit xếp dọc trên điện thoại, flex item được co đúng; bộ lọc thu gọn dưới 1024px, hiển thị số bộ lọc đang chọn và giữ state khi đóng.
- Thực đơn: dưới 680px chọn ngày và xem đủ ba bữa của ngày đó, dùng nguyên cùng dữ liệu và thao tác sửa món. Desktop vẫn xem cả tuần. Dưới 400px các nút ngày xếp thành hai hàng.
- Chi tiết: tab cuộn ngang trong vùng riêng, breadcrumb xuống dòng, heading nguyên liệu/khẩu phần xuống dòng khi thiếu chỗ.
- Form mobile dùng font 16px; tăng vùng bấm cho các nút dùng chung/khẩu phần/yêu thích và điều khiển AI. Modal và chat giới hạn chiều cao theo `dvh`, có khoảng trống safe area; phần chat dài cuộn trong khung.
- Hero pantry/planner có vùng riêng cho ảnh trên màn hình nhỏ, phần mô tả được đọc toàn chiều rộng.
- Nhãn “Bản thảo” trước đây bị ghi cố định ở ô gợi ý Khám phá đã đổi sang phụ thuộc `isDraft`; 419 bài APPROVED không còn nhãn đó.

CSS bổ sung nằm trong `frontend/src/mobile.css`, import cuối các stylesheet trong entry để áp dụng nhất quán với CSS từng trang. Không dùng cách che overflow toàn trang để xử lý các flex item bị tràn.

## Kiểm tra

`npm run typecheck` và `npm run build` đã thành công. Vite vẫn cảnh báo bundle JavaScript lớn hơn 500 kB; không phải lỗi build. Bằng chứng trong `.review/mobile-typecheck.log` và `.review/mobile-build.log`.

Sau deploy, kiểm tra HTML/JS/CSS public khớp đúng build cuối, các route ứng dụng trả 200, Neon ready và catalog vẫn đủ 419 bài APPROVED. Bằng chứng: `.review/mobile-deploy-final.log`, `.review/mobile-public-verification.log`.

Deployment cuối `dpl_H4FPMek4LZnWyTBRMSBNrP6HE5pn` đã READY trên https://cookora-rose.vercel.app. Build cuối hoàn tất trong 8.72 giây. Output kiểm tra public:

```text
PASS: public HTML viewport and JS/CSS assets match the final mobile build byte for byte.
PASS: 7 app routes HTTP 200; Neon readiness and 419 published recipes unchanged.
LIMITATION: no rendered viewport or touch interaction was tested; local browser control is disabled.
```

Chưa xác minh bằng ảnh chụp viewport hoặc thao tác chạm thực tế: công cụ trả `Local browser use is disabled in Work settings`. Không coi typecheck/build hay HTTP kiểm tra asset là bằng chứng giao diện đã render đúng ở mọi thiết bị. Khi bật quyền trình duyệt, cần kiểm tra trực quan các chiều rộng 320/375/390/768/1024/1280px, menu khi đăng nhập, chọn cả 7 ngày và mở form/chat khi bàn phím ảo hiện.
