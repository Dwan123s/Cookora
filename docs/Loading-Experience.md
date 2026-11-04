# Tải trang và hiệu ứng chờ

- Các trang được tách bằng React lazy/Suspense; header và điều hướng vẫn giữ khi tải trang. Lỗi tải trang có nút tải lại, tránh để màn hình trắng.
- Danh sách món, công thức và trang đăng nhập có khung chờ theo bố cục. Trạng thái chờ chung dùng biểu tượng nồi bốc hơi và chấm chuyển động nhẹ.
- Có gì nấu nấy hiển thị các thẻ món đang chờ trong lúc AI xử lý. Lịch sử gợi ý vẫn dùng cơ chế lưu hiện tại; hiệu ứng không giả phần trăm tiến độ.
- Ảnh công thức/danh sách có nền chờ, hiện nhẹ khi tải xong và dùng ảnh thay thế khi lỗi. Ảnh chính của trang công thức tải ưu tiên; ảnh ngoài màn hình tải lazy.
- Các hiệu ứng tắt khi người dùng bật prefers-reduced-motion. Khung chờ không nhận focus và có nhãn trạng thái cho công nghệ hỗ trợ.

Kiểm tra bằng `npm run build -w frontend`: đầu ra có các chunk Home, Discover, Recipe, Matcher, Auth và các trang công cụ riêng. Bản local Docker cập nhật riêng frontend, không cần thay đổi database.

Kiểm tra thủ công khi có trình duyệt: chọn mạng chậm trong DevTools để nhìn khung chờ, mở từng trang trực tiếp rồi chuyển trang, cuộn danh sách để kiểm tra ảnh, thử ảnh lỗi, và bật giảm chuyển động trong hệ điều hành. Kiểm tra dữ liệu gợi ý đã lưu sau khi chuyển khỏi trang AI rồi quay lại.
