# Điều hướng dưới và chatbot trên điện thoại — 04/11/2026

Theo yêu cầu người dùng, giao diện dưới 768px dùng thanh cố định ở đáy màn hình thay cho header. Header trên tablet/desktop vẫn dùng component hiện có.

Thanh có năm mục: Trang chủ, Khám phá, Chat AI, Thực đơn, Thêm. Chat AI mở cùng cuộc trò chuyện Cookora hiện có dưới dạng popup phía trên thanh. Nút Chat AI, nút thu gọn và vùng ngoài popup cho phép đóng; tin nhắn đang có được giữ khi thu gọn. Chuyển route đóng popup. Mục Thêm mở dialog gồm Có gì nấu nấy, Eat Fit, Ước tính chi phí, Món yêu thích và đăng nhập/đăng xuất theo trạng thái tài khoản.

`App.tsx` quản lý trạng thái mở chat và chia sẻ trigger với `CookingAssistant`/`MobileBottomBar`; không tạo phiên chat thứ hai. CSS `mobile-navigation.css` được import sau CSS header. Safe area và padding cuối trang chừa chỗ cho thanh, toast nằm phía trên. Popup theo dõi visual viewport để điều chỉnh khi bàn phím ảo xuất hiện; mở popup trên mobile tập trung vào khung trò chuyện, không tự gọi bàn phím.

Trang đăng nhập giữ giao diện riêng, không thêm bottom bar hoặc chatbot.

Kiểm tra: TypeScript và `npm run build` đạt; frontend build hoàn tất trong 9.04 giây. Bằng chứng tại `.review/bottom-bar-typecheck.log`, `.review/bottom-bar-build.log`. Build còn cảnh báo chunk JavaScript lớn hơn 500 kB.

## Kết quả public

Deployment `dpl_6q4WjsAY6Hio8SHGyxZSfperbYGk` đã READY trên https://cookora-rose.vercel.app. JS/CSS được đối chiếu byte-for-byte với build local; bảy route chính trả 200, Neon ready và đủ 419 công thức APPROVED. Log: `.review/bottom-bar-deploy.log`, `.review/bottom-bar-public-verification.log`.

Quyền trình duyệt đã hoạt động ở lần kiểm tra ngày 04/11/2026. Đã kiểm tra trực tiếp bản public qua browser ở viewport 390×844 và 320×740: header ẩn, bottom bar đủ năm mục, popup nằm trên thanh, khung chat không tràn ngang. Ở 320px, document/body và bottom bar đều rộng 320px; popup có bounds x=12, width=296, top=24, bottom=652.

Đã bấm mở chat, nhập một câu hỏi mẹo bếp, thu gọn/mở lại để xác minh draft còn nguyên, gửi tin nhắn và nhận phản hồi thật từ Vertex AI. Mở mục Thêm đóng chat; chọn Eat Fit chuyển đúng route và đóng dialog. Hội thoại còn nguyên sau chuyển trang và mở lại. Đóng bằng nút thu gọn, vùng ngoài popup và Escape đều hoạt động. Ở viewport 768×1024, bottom bar ẩn, header và nút chat nổi hiển thị.

Ảnh bằng chứng: `.review/mobile-bottom-home.png` và `.review/mobile-bottom-chat.png`. Đây là kiểm tra browser với viewport giả lập; chưa thử bàn phím ảo trên thiết bị iOS/Android thật. Các dòng hạn chế browser bị tắt trong tài liệu mobile ngày trước là trạng thái lịch sử.
