# Đề xuất thực đơn theo ngân sách

Trang `/ngan-sach` ưu tiên luồng AI. Người dùng chọn ngân sách, chế độ ngày/tổng kỳ, số ngày, số người và số bữa; thêm nơi mua và yêu cầu ăn uống nếu muốn. Khi bấm “AI đề xuất thực đơn”, backend gửi các thiết lập cùng tối đa 100 công thức ứng viên (ID, tên món, ẩm thực, nhóm, khẩu phần gốc và nguyên liệu) tới Vertex AI đã cấu hình. Không gửi thông tin tài khoản hoặc session trong payload này.

`POST /api/v1/ai/suggest-budget` kiểm tra input trước khi truy vấn. Công thức ứng viên được lấy luân phiên giữa các nhóm ẩm thực/loại món để không giới hạn vào một đoạn danh mục. Mô hình chỉ chọn recipeId có trong ứng viên. Backend từ chối lịch thiếu bữa, trùng ô, trùng món trong một bữa, ID không tồn tại hoặc chi phí không hợp lệ; không tạo kết quả mẫu thay lỗi AI.

Mỗi giá ước tính áp dụng cho món trong một bữa và toàn bộ số người. Tổng ngân sách chế độ ngày là ngân sách ngày nhân số ngày; chế độ tuần dùng số tiền tổng đã nhập. Backend cộng tổng tiền, tính dự phòng hoặc vượt hạn mức, không ép chi phí xuống cho vừa tiền. Đây là ước tính AI, không có nguồn giá thị trường trực tiếp. Thực đơn vẫn được hiển thị nếu vượt ngân sách, kèm số tiền vượt và gợi ý điều chỉnh.

Danh sách đi chợ được tính từ nguyên liệu công thức, tăng/giảm theo khẩu phần bằng Decimal và cộng giữa các bữa. Quy đổi kg về g, l về ml, giữ nguyên dimension và lượng chưa rõ; bỏ nguyên liệu tùy chọn. Người dùng đánh dấu nguyên liệu đã có; danh sách không tự giả định nguyên liệu miễn phí. Cập nhật thiết lập sau khi nhận đề xuất sẽ hiển thị nhắc tạo lại, không áp số liệu cũ vào thiết lập mới. Bảng giá nhập tay nằm trong phần thu gọn riêng.

Kiểm tra tự động bao gồm tổng tiền/ngân sách, scale/gộp nguyên liệu, chi phí vượt hạn mức, input sai, lịch thiếu/trùng, ID bịa, cấu hình thiếu, lỗi provider được làm sạch, DI dưới tsx và các trạng thái giao diện render trên server. Kiểm tra với Vertex AI thật cần được người dùng cho phép gửi payload nêu trên; không coi kết quả mock là kiểm tra provider thật.
