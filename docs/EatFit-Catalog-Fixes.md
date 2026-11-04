# Eat Fit và bộ lọc công thức — 04/11/2026

- Eat Fit không dùng sáu món đầu catalog làm thực đơn mặc định. Người dùng tạo đề xuất từ hồ sơ; sau đó đổi mục tiêu hoặc thông số hợp lệ sẽ tự cập nhật sau 400ms. Trong lúc cập nhật, không mở món của đề xuất cũ. Nút đề xuất tiếp tục chọn món khác và tránh lặp bộ trước, kể cả khi đổi mục tiêu.
- Seed xếp hạng dùng mục tiêu, hồ sơ và lượt đề xuất; ưu tiên món chưa xem trước khi bắt đầu vòng mới. Thẻ, popup và liên kết công thức dùng cùng slug, nguyên liệu và bước nấu từ catalog. Liên kết xem bộ sưu tập giữ `collection=eat-fit` thay vì mở danh sách công thức chung.
- API và giao diện thống nhất phân loại đọt bí/rau muống xào vào Rau củ; đậu phộng da cá là Gỏi & món ăn nhẹ. Tên gọi “da cá” không được suy ra là nguyên liệu cá. Không chuyển món rau có thịt thật hoặc gỏi sang Rau củ chỉ vì tên chứa rau.
- Nhóm món được đếm theo quốc gia đang chọn. Nhóm không có món được làm mờ và vô hiệu hóa; đổi quốc gia xóa bộ lọc nhóm cũ. Dữ liệu chưa tải xong hoặc tải lỗi không tự xóa lựa chọn. Gợi ý hôm nay cũng lấy món đúng quốc gia.

Các sửa đổi phân loại áp dụng khi đọc catalog, không thay tài khoản, lịch ăn, trạng thái công bố hoặc dữ liệu nguồn. Eat Fit xếp hạng theo nguyên liệu và mục tiêu; không khẳng định đã xác minh kcal/macro của từng công thức.

Kiểm tra hồi quy gồm đổi mục tiêu/hồ sơ, tránh lặp thực đơn, giữ đúng danh tính/cách làm của món, nhóm rau và đậu phộng, nhóm tráng miệng Hàn Quốc. Đã đối chiếu 419 công thức public và 50 món trong bộ sưu tập Eat Fit. Trình duyệt tự động đang tắt, chưa kiểm tra thao tác trực quan của lần sửa này.
