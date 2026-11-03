# Phân loại độ khó công thức

API dùng cùng ba nhãn với bộ lọc: Dễ, Vừa, Nâng cao. Các giá trị EASY/MEDIUM/HARD, Trung bình và Khó được chuẩn hóa về ba nhãn này.

Nếu công thức có đánh giá trong dữ liệu nguồn, API giữ mức đó và trả `difficultyBasis: PROVIDED`. Các tài liệu hiện tại chưa ghi độ khó; API bổ sung mức tham khảo với `difficultyBasis: ESTIMATED`, không sửa nội dung nguồn hay trạng thái duyệt công thức.

- Dễ: tối đa 6 công đoạn, 10 nguyên liệu, 2 nhóm kỹ thuật, thời gian tối đa 45 phút nếu có ghi; không có ủ men.
- Nâng cao: kéo mì, cán bột nhiều lớp, phối hợp nhào/cán bột với tạo hình, đánh bông lòng trắng rồi nướng; hoặc ít nhất 9 công đoạn với 3 nhóm kỹ thuật.
- Vừa: các công thức có hướng dẫn còn lại. Thời gian chờ dài không tự tạo mức Nâng cao.

Đây là quy tắc tham khảo theo hướng dẫn viết trong tài liệu, không phải kết quả nấu thử. Bộ lọc hoạt động trong giao diện và qua `GET /recipes?difficulty=...`, kết hợp với nhóm ẩm thực, loại món và phân trang. Lựa chọn trong giao diện được lưu trong URL; “Tất cả độ khó” và “Đặt lại” bỏ điều kiện độ khó.
